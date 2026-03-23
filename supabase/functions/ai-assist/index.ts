import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Tratar requisições CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, systemPrompt, temperature } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY não configurada no Supabase.")
    }

    // Fazer a chamada para a OpenAI de forma segura (backend)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          ...messages
        ],
        temperature: temperature ?? 0.7
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Erro OpenAI: ${errorData}`)
    }

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      status: 200,   // Return 200 so the frontend can read the JSON payload
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
