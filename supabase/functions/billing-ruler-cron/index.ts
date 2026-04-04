// supabase/functions/billing-ruler-cron/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { invoiceReminderTemplate, dailySummaryTemplate } from "../shared/templates.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
        const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ""
        const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || "onboarding@resend.dev"
        const appUrl = Deno.env.get('APP_URL') || "https://meusistemapsi.com.br"

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Obter data de hoje em BRT (UTC-3)
        const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
        const todayStr = today.toISOString().split('T')[0]

        console.log(`[Cron] Iniciando processamento para ${todayStr}...`)

        // 2. Buscar Profissionais (Profiles) para saber quem tem a automação ativa
        const { data: professionals, error: profError } = await supabase
            .from('profiles')
            .select('id, full_name, email, clinic_name, configurations')
            .not('configurations', 'is', null)

        if (profError) throw profError

        const results = []

        for (const prof of professionals) {
            const configs = prof.configurations || {}
            if (!configs.debt_reminders_enabled) continue

            const stages = configs.debt_reminder_stages || { day0: true, day1: true, day3: true, recurring: true }
            let sentCount = 0

            // 3. Buscar débitos pendentes deste profissional
            const { data: debts, error: debtsError } = await supabase
                .from('finance')
                .select('*, patients(name, email)')
                .eq('user_id', prof.id)
                .eq('status', 'Pendente')
                .eq('type', 'receita')
                .lt('reminder_count', 5) // Limite de 5 lembretes

            if (debtsError) {
                console.error(`Erro ao buscar débitos de ${prof.email}:`, debtsError)
                continue
            }

            for (const debt of debts) {
                const dueDate = new Date(debt.due_date + 'T00:00:00')
                const diffTime = today.getTime() - dueDate.getTime()
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

                let stage = ""
                if (diffDays === 0 && stages.day0) stage = "today"
                else if (diffDays === 3 && stages.day3) stage = "overdue"
                else if (diffDays > 3 && (diffDays - 3) % 3 === 0 && stages.recurring) stage = "recurring"

                if (stage && debt.patients?.email) {
                    // Enviar E-mail de Cobrança
                    const paymentLink = `${appUrl}/pagamento/${debt.id}`
                    const html = invoiceReminderTemplate({
                        patientName: debt.patients.name,
                        description: debt.description,
                        value: debt.value,
                        dueDate: new Date(debt.due_date).toLocaleDateString('pt-BR'),
                        paymentLink: paymentLink,
                        stage: stage,
                        professionalName: prof.clinic_name || prof.full_name
                    })

                    await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
                        body: JSON.stringify({
                            from: `${prof.clinic_name || prof.full_name || 'Meu Sistema PSI'} <${fromEmail}>`,
                            to: [debt.patients.email],
                            subject: stage === 'overdue' ? '⚠️ Pagamento em Atraso' : 'Lembrete de Pagamento',
                            html: html
                        })
                    })

                    // Atualizar contador de lembretes
                    await supabase
                        .from('finance')
                        .update({ 
                            reminder_count: (debt.reminder_count || 0) + 1,
                            last_reminder_at: new Date().toISOString()
                        })
                        .eq('id', debt.id)

                    sentCount++
                }
            }

            // 4. Buscar Agenda do Dia para o Profissional
            const { data: appointments, error: appError } = await supabase
                .from('appointments')
                .select('patient_name, time_start')
                .eq('user_id', prof.id)
                .eq('data', todayStr)
                .order('time_start', { ascending: true })

            // Montar HTML da lista de consultas
            let appListHtml = ""
            if (appointments && appointments.length > 0) {
                appListHtml = appointments.map(a => `
                    <div style="padding: 12px 20px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-weight: bold; color: #1e293b;">${a.patient_name}</span>
                        <span style="color: #64748b; font-size: 13px;">${Math.floor(a.time_start)}:${String((a.time_start % 1) * 60).padStart(2, '0')}</span>
                    </div>
                `).join('')
            }

            // 5. Enviar Relatório de Bom Dia para o Profissional
            const summaryHtml = dailySummaryTemplate({
                professionalName: prof.full_name || 'Doutor(a)',
                remindersSent: sentCount,
                appointmentsToday: appointments?.length || 0,
                appointmentListHtml: appListHtml
            })

            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
                body: JSON.stringify({
                    from: `Meu Sistema PSI <${fromEmail}>`,
                    to: [prof.email],
                    subject: `☀️ Resumo do Dia: ${appointments?.length || 0} consultas hoje`,
                    html: summaryHtml
                })
            })

            results.push({ prof: prof.email, sent: sentCount, apps: appointments?.length || 0 })
        }

        return new Response(JSON.stringify({ success: true, processed: results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error: any) {
        console.error("[Cron-Billing] Erro:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
