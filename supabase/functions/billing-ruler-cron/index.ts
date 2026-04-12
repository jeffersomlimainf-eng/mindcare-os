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

        // 1. Obter data de hoje em BRT (UTC-3) via offset fixo
        const today = new Date(Date.now() - 3 * 60 * 60 * 1000)
        const todayStr = today.toISOString().split('T')[0]

        console.log(`[Cron] Iniciando processamento para ${todayStr}...`)

        // 2. Buscar Profissionais (Profiles)
        const { data: professionals, error: profError } = await supabase
            .from('profiles')
            .select('id, full_name, email, clinic_name, configurations')
            .not('configurations', 'is', null)

        if (profError) throw profError

        const allEmailsToBatch: any[] = []
        const updatesToFinance: any[] = []
        const results = []

        for (const prof of professionals) {
            const configs = typeof prof.configurations === 'string' ? JSON.parse(prof.configurations) : (prof.configurations || {})
            console.log(`[Cron] Verificando configs para ${prof.email}:`, configs)
            
            let profSentCount = 0

            // 3. Buscar débitos pendentes apenas se o profissional habilitou os lembretes
            if (configs.debt_reminders_enabled) {
                const stages = configs.debt_reminder_stages || { day0: true, day1: true, day3: true, recurring: true }

                const { data: debts, error: debtsError } = await supabase
                    .from('finance')
                    .select('*, patients(name, email)')
                    .eq('user_id', prof.id)
                    .ilike('status', 'Pendente')
                    .ilike('type', 'receita')
                    .lt('reminder_count', 5)

                if (debtsError) {
                    console.error(`Erro ao buscar débitos de ${prof.email}:`, debtsError)
                } else {
                    for (const debt of debts) {
                        const dueDate = new Date(debt.due_date + 'T00:00:00')
                        const diffTime = today.getTime() - dueDate.getTime()
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

                        let stage = ""
                        if (diffDays === 0 && stages.day0) stage = "today"
                        else if (diffDays === 1 && stages.day1) stage = "overdue"
                        else if (diffDays === 3 && stages.day3) stage = "overdue"
                        else if (diffDays > 3 && (diffDays - 3) % 3 === 0 && stages.recurring) stage = "recurring"

                        // Catch-up: Se nunca foi enviado e já passou do prazo, envia como 'overdue'
                        if (!stage && (debt.reminder_count || 0) === 0 && diffDays > 0) {
                            if (stages.day1 || stages.day3) stage = "overdue"
                        }

                        if (stage && debt.patients?.email) {
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

                            allEmailsToBatch.push({
                                from: `Psiquê (Assistente) <${fromEmail}>`,
                                to: [debt.patients.email],
                                subject: stage === 'overdue' ? '⚠️ Pagamento em Atraso 🧠' : 'Lembrete de Pagamento 🧠',
                                html: html
                            })

                            updatesToFinance.push({
                                id: debt.id,
                                user_id: debt.user_id,
                                type: debt.type,
                                reminder_count: (debt.reminder_count || 0) + 1,
                                last_reminder_at: new Date().toISOString()
                            })

                            profSentCount++
                        }
                    }
                }
            } else {
                console.log(`[Cron] debt_reminders_enabled é falso/undefined para ${prof.email}`)
            }

            // 4. Buscar Agenda do Dia para o Resumo
            const { data: appointments } = await supabase
                .from('appointments')
                .select('patient_name, time_start')
                .eq('user_id', prof.id)
                .eq('data', todayStr)
                .order('time_start', { ascending: true })

            let appListHtml = ""
            if (appointments && appointments.length > 0) {
                appListHtml = appointments.map(a => `
                    <div style="padding: 12px 20px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-weight: bold; color: #1e293b;">${a.patient_name}</span>
                        <span style="color: #64748b; font-size: 13px;">${Math.floor(a.time_start)}:${String(Math.round((a.time_start % 1) * 60)).padStart(2, '0')}</span>
                    </div>
                `).join('')
            }

            // Preparar e-mail de resumo (enviado individualmente ao profissional)
            const summaryHtml = dailySummaryTemplate({
                professionalName: prof.full_name || 'Doutor(a)',
                remindersSent: profSentCount,
                appointmentsToday: appointments?.length || 0,
                appointmentListHtml: appListHtml
            })

            allEmailsToBatch.push({
                from: `Psiquê <${fromEmail}>`,
                to: [prof.email],
                subject: `☀️ Resumo de Hoje: ${appointments?.length || 0} sessões confirmadas`,
                html: summaryHtml
            })

            results.push({ prof: prof.email, sent: profSentCount, apps: appointments?.length || 0 })
        }

        // 5. Envio em Lote (Batch) via Resend
        console.log(`[Cron] Enviando total de ${allEmailsToBatch.length} e-mails em lotes...`)
        
        const batchErrors: any[] = []
        for (let i = 0; i < allEmailsToBatch.length; i += 100) {
            const batch = allEmailsToBatch.slice(i, i + 100)
            const response = await fetch('https://api.resend.com/emails/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
                body: JSON.stringify(batch)
            })
            if (!response.ok) {
                const errData = await response.json()
                console.error(`[Cron] Falha no lote ${i/100 + 1}:`, errData)
                batchErrors.push(errData)
            }
        }

        // 6. Atualizar Banco de Dados (Finance) - apenas se todos os lotes foram enviados com sucesso
        let dbUpdateError = null
        if (updatesToFinance.length > 0) {
            if (batchErrors.length > 0) {
                console.warn(`[Cron] Pulando atualização do financeiro: ${batchErrors.length} lote(s) falharam. Registros serão retentados no próximo ciclo.`)
                dbUpdateError = { message: 'Email batch failed, finance not updated to allow retry' }
            } else {
                console.log(`[Cron] Atualizando ${updatesToFinance.length} registros financeiros...`)
                const { error: updateError } = await supabase
                    .from('finance')
                    .upsert(updatesToFinance)

                if (updateError) {
                    console.error("[Cron] Erro ao atualizar financeiro:", updateError)
                    dbUpdateError = updateError
                }
            }
        }

        return new Response(JSON.stringify({ 
            success: batchErrors.length === 0, 
            processedCount: results.length, 
            totalEmails: allEmailsToBatch.length,
            errors: batchErrors,
            dbUpdateError
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error: any) {
        console.error("[Cron-Billing] Erro crítico:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})

