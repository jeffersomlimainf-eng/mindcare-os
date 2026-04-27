import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev'

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // PRECISÃO SUIÇA: Forçando fuso horário America/Sao_Paulo para cálculo de minutos
    const now = new Date();
    const brTimeString = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    
    // Extraindo manualmente para evitar qualquer desvio do objeto Date
    const [datePart, timePart] = brTimeString.split(', ');
    const [day, month, year] = datePart.split('/');
    const [hour, minute] = timePart.split(':');
    
    const todayStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const nowMinutes = parseInt(hour) * 60 + parseInt(minute);

    console.log(`[Send-Reminders] Hora local: ${hour}:${minute} | Total Minutos: ${nowMinutes} | Data: ${todayStr}`);

    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        id, patient_name, data, time_start, reminder_sent, reminder_enabled,
        profiles (
          full_name, email, configurations, clinic_name, specialty, crp, plan_status
        ),
        patients(email)
      `)
      .eq('data', todayStr)
      .eq('reminder_sent', false)
      .eq('reminder_enabled', true)

    if (fetchError) throw fetchError

    const emailsToBatch: any[] = []
    const appointmentsToUpdate: string[] = []

    for (const app of (appointments as any[])) {
      const prof = app.profiles || {}
      const configs = prof.configurations || {}
      const patientEmail = app.patients?.email
      
      if (!configs.reminders_enabled || !patientEmail || prof.plan_status !== 'Ativo') continue

      const reminderBefore = configs.reminders_before_minutes || 60
      const appTimeMinutes = Math.round(app.time_start * 60)
      const diff = appTimeMinutes - nowMinutes

      // Lógica de Janela de Disparo (Precision Window)
      if (diff > 0 && diff <= reminderBefore) {
        const timeStr = `${Math.floor(app.time_start)}:${String(Math.round((app.time_start % 1) * 60)).padStart(2, '0')}`
        const professionalName = prof.clinic_name || prof.full_name;
        
        const html = `
          <html><body style="background:#f8fafc; color:#1e293b; font-family:sans-serif; padding:40px; margin:0;">
            <div style="background:#ffffff; padding:48px; border-radius:32px; max-width:500px; margin:auto; border:1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
              <div style="text-align:center; margin-bottom:32px;">
                <div style="width:48px; height:4px; background:#14b8a6; border-radius:10px; margin:0 auto 24px auto; opacity:0.2;"></div>
                <h1 style="color:#1e293b; font-weight:800; margin:0; font-size:24px; letter-spacing:-0.03em;">Lembrete de Atendimento 🧠</h1>
              </div>
              <p style="color:#64748b; line-height:1.6; font-size:16px;">Olá, <b>${app.patient_name}</b>!</p>
              <p style="color:#1e293b; line-height:1.6; font-size:16px; margin-bottom:10px;">Aqui é a <b>Psiquê</b>, a assistente virtual do consultório de <b>${professionalName}</b>.</p>
              <p style="color:#1e293b; line-height:1.6; font-size:16px; margin-bottom:40px;">Passando rapidinho para lembrar da nossa sessão marcada para hoje. Preparei tudo por aqui.</p>
              <div style="background:#f1f5f9; padding:32px; border-radius:24px; margin:32px 0; border:1px solid #e2e8f0; text-align:center;">
                <p style="margin:0; font-size:11px; color:#14b8a6; font-weight:800; text-transform:uppercase; letter-spacing:0.2em;">Horário da Sessão</p>
                <p style="margin:8px 0 0 0; font-size:36px; font-weight:900; color:#1e293b;">Hoje às <span style="color:#14b8a6;">${timeStr}</span></p>
              </div>
              <p style="color:#64748b; line-height:1.6; font-size:14px; text-align:center;">Qualquer imprevisto, é só avisar por aqui. Até lá!</p>
              <div style="text-align:center; margin-top:48px; padding-top:32px; border-top:1px solid #f1f5f9;">
                <p style="font-size:15px; color:#1e293b; font-weight:800; margin-bottom:4px;">${professionalName}</p>
                <p style="font-size:12px; color:#94a3b8; margin:0;">${prof.specialty || 'Psicologia Clínica'}</p>
              </div>
            </div>
          </body></html>`;

        emailsToBatch.push({
          from: `Psiquê (Assistente) <${fromEmail}>`,
          to: [patientEmail],
          subject: `Lembrete da sua sessão hoje às ${timeStr} 🧠`,
          html: html
        })

        appointmentsToUpdate.push(app.id)
      }
    }

    // Processamento em lote (Batch) de e-mails via Resend
    let batchFailed = false
    if (emailsToBatch.length > 0) {
      console.log(`[Send-Reminders] Enviando ${emailsToBatch.length} e-mails em lote...`)

      for (let i = 0; i < emailsToBatch.length; i += 100) {
        const batch = emailsToBatch.slice(i, i + 100)
        const emailRes = await fetch('https://api.resend.com/emails/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
          body: JSON.stringify(batch)
        })

        if (!emailRes.ok) {
          const err = await emailRes.json();
          console.error(`[Send-Reminders] Falha no envio do lote ${i/100 + 1}:`, err);
          batchFailed = true
        }
      }
    }

    // Atualização em lote no Supabase — apenas se todos os e-mails foram enviados com sucesso
    if (appointmentsToUpdate.length > 0) {
      if (batchFailed) {
        console.warn(`[Send-Reminders] Pulando atualização do DB: lote falhou. Agendamentos serão retentados no próximo ciclo.`)
      } else {
        console.log(`[Send-Reminders] Atualizando status de ${appointmentsToUpdate.length} agendamentos...`)

        const { error: updateError } = await supabase
          .from('appointments')
          .update({ reminder_sent: true })
          .in('id', appointmentsToUpdate)

        if (updateError) {
          console.error(`[Send-Reminders] Falha ao atualizar appointments:`, updateError)
        } else {
          console.log(`[Send-Reminders] Status de lembretes atualizado com sucesso.`)
        }
      }
    } else {
      console.log(`[Send-Reminders] Nenhum lembrete para enviar neste minuto.`)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      nowMinutes, 
      todayStr, 
      emailsSent: emailsToBatch.length 
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error: any) {
    console.error(`[Send-Reminders] Erro crítico:`, error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
