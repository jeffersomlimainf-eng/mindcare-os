import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { event_name, event_id, event_source_url, user_data, custom_data } = await req.json()
    
    // Configurações do Facebook
    const PIXEL_ID = Deno.env.get('FB_PIXEL_ID') || '1900939117451123';
    const ACCESS_TOKEN = Deno.env.get('FB_ACCESS_TOKEN');

    if (!ACCESS_TOKEN) {
      throw new Error("FB_ACCESS_TOKEN não configurado nas Secrets do Supabase.");
    }

    const payload = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_id, // Para deduplicação com o Browser Pixel
          event_source_url,
          user_data: {
            client_ip_address: req.headers.get('x-forwarded-for') || '0.0.0.0',
            client_user_agent: req.headers.get('user-agent'),
            ...user_data
          },
          custom_data
        }
      ]
    };

    const fbResponse = await fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        access_token: ACCESS_TOKEN
      })
    });

    const result = await fbResponse.json();

    return new Response(JSON.stringify(result), {
      status: fbResponse.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
