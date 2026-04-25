import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, patient_id } = await req.json()

    if (!email || !patient_id) {
      throw new Error('email e patient_id são obrigatórios')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Verificar se já existe um usuário com esse email
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const existingUser = listData?.users?.find((u: { email: string }) => u.email === email)

    let patientAuthId: string

    if (existingUser) {
      patientAuthId = existingUser.id
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: '123456',
        email_confirm: true,
        user_metadata: { role: 'paciente' },
      })
      if (createError) throw createError
      patientAuthId = newUser.user.id
    }

    // Criar ou atualizar o perfil com role = 'paciente'
    await supabaseAdmin.from('profiles').upsert(
      { id: patientAuthId, email, role: 'paciente' },
      { onConflict: 'id', ignoreDuplicates: false }
    )

    // Vincular o auth user ao registro de paciente
    await supabaseAdmin
      .from('patients')
      .update({ patient_profile_id: patientAuthId })
      .eq('id', patient_id)

    return new Response(
      JSON.stringify({ success: true, patient_auth_id: patientAuthId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
