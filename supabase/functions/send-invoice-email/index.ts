import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // 1. Manusear CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { to, subject, html, replyTo, fromName } = await req.json()

        const resendApiKey = Deno.env.get('RESEND_API_KEY')
        if (!resendApiKey) {
            throw new Error("RESEND_API_KEY não configurada no Supabase.")
        }

        // Se você não tem domínio verificado no Resend, use 'onboarding@resend.dev'
        // Mas o ideal para produção é usar 'cobrancas@seudominio.com'
        const FROM_EMAIL = "onboarding@resend.dev"; // Padrão de teste do Resend

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
                from: `${fromName || 'Notificação'} <${FROM_EMAIL}>`,
                to: Array.isArray(to) ? to : [to],
                reply_to: replyTo,
                subject: subject,
                html: html
            })
        })

        const resData = await response.json()

        if (!response.ok) {
            console.error("[Send-Invoice-Email] Erro Resend:", resData)
            return new Response(JSON.stringify({ success: false, error: resData }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }


        return new Response(JSON.stringify({ success: true, id: resData.id }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error: any) {
        console.error("[Send-Invoice-Email] Erro Crítico:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
