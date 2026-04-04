import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { referralSuccessTemplate } from "../shared/templates.ts"

/**
 * Meu Sistema PSI - Eduzz Webhook Postback Handler
 * --------------------------------------------------
 * Mapeamento de produtos Eduzz para Planos do Sistema.
 */
const PLAN_MAPPING: Record<number, string> = {
    2986355: 'essencial',
    2986358: 'profissional',
    2986359: 'premium'
}

serve(async (req: Request) => {
    const method = req.method;

    if (method === 'GET') {
        return new Response("Webhook Eduzz ativo!", { status: 200 });
    }

    try {
        if (method !== 'POST') {
            return new Response("Método não suportado", { status: 405 });
        }

        const body = await req.json();
        console.log("[Eduzz Webhook] IP de Origem:", req.headers.get("x-real-ip"));
        console.log("[Eduzz Webhook] Payload recebido:", JSON.stringify(body, null, 2));

        const trans_items = body.trans_items || [];
        const item = trans_items[0];
        
        if (!item) {
            console.error("[Eduzz Webhook] Nenhum item encontrado na transação.");
            // Retornamos 200 para passar no teste de validação da Eduzz
            return new Response(JSON.stringify({ message: "Webhook ativo (Teste)" }), { status: 200 });
        }

        const itemId = Number(item.item_id);
        const planId = PLAN_MAPPING[itemId];
        const cusEmail = body.cus_email;
        const transStatusName = body.trans_status_name; // Ex: "Paga", "Aprovada"

        console.log(`[Eduzz Webhook] Processando: ItemID=${itemId} | Plan=${planId} | Email=${cusEmail} | Status=${transStatusName}`);

        if (!cusEmail) {
            console.error("[Eduzz Webhook] E-mail do cliente (cus_email) não informado.");
            // Retornamos 200 para passar no teste de validação da Eduzz
            return new Response(JSON.stringify({ message: "Webhook ativo (Teste)" }), { status: 200 });
        }

        if (!planId) {
            console.warn(`[Eduzz Webhook] Item ID [${itemId}] não está mapeado para nenhum plano.`);
            return new Response(JSON.stringify({ message: "Item não mapeado", itemId }), { status: 200 });
        }

        // 1. Inicializar Supabase Client com Service Role para bypassar RLS
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 2. Regra de Negócio: Mapear Status da Transação para Status do Plano
        const statusLower = transStatusName ? transStatusName.toLowerCase() : '';
        let planStatus = 'Ativo';
        let shouldProcess = false;

        if (statusLower === 'paga' || statusLower === 'aprovada') {
            planStatus = 'Ativo';
            shouldProcess = true;
        } else if (statusLower === 'cancelada' || statusLower === 'reembolsada' || statusLower === 'estornada') {
            planStatus = 'Suspenso';
            shouldProcess = true;
        } else if (statusLower === 'atrasada' || statusLower === 'inadimplente' || statusLower === 'expirada' || statusLower === 'em atraso' || statusLower === 'aguardando reembolso') {
            planStatus = 'Inadimplente';
            shouldProcess = true;
        }

        if (!shouldProcess) {
            console.log(`[Eduzz Webhook] Transação de status [${transStatusName}] ignorada.`);
            return new Response(JSON.stringify({ message: "Status ignorado", status: transStatusName }), { status: 200 });
        }

        // 3. Verificar se o profile já existe pelo e-mail
        const { data: existingProfile, error: getError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', cusEmail)
            .maybeSingle();

        if (getError) {
            console.error("[Eduzz Webhook] Erro ao buscar perfil:", getError.message);
            throw getError;
        }

        let userId = existingProfile?.id;

        // Se o usuário não existir no banco, criamos apenas se estiver Ativo (Pagamento OK)
        if (!existingProfile) {
            if (planStatus !== 'Ativo') {
                 console.log(`[Eduzz Webhook] Transação [${transStatusName}] recebida para cliente inexistente. Abortando criação.`);
                 return new Response(JSON.stringify({ message: "Cancelamento ignorado para usuário inexistente", status: transStatusName }), { status: 200 });
            }

            const cusName = body.cus_name || body.cus_fullname || 'Novo Cliente Eduzz';
            console.log(`[Eduzz Webhook] Criando novo usuário para: ${cusEmail} (${cusName})`);

            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: cusEmail,
                password: 'Meu Sistema PSI@123', // Senha padrão de acesso inicial
                email_confirm: true,
                user_metadata: { full_name: cusName }
            });

            if (authError) {
                console.error("[Eduzz Webhook] Erro ao criar Auth User:", authError.message);
                throw authError;
            }

            userId = authData.user.id;
            console.log(`[Eduzz Webhook] Auth User criado com sucesso! ID: ${userId}`);
        }

        // 4. Inserir ou Atualizar (Upsert) na tabela profiles
        const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
                id: userId, // Obrigatório para o upsert saber quem é
                email: cusEmail,
                full_name: body.cus_name || body.cus_fullname || existingProfile?.full_name || 'Novo Cliente Eduzz',
                plan_id: planId,
                plan_status: planStatus, // Dinâmico de acordo com o status recebido
                plan_start_date: new Date().toISOString(),
                role: 'psicologo', 
                updated_at: new Date().toISOString()
            });

        if (upsertError) {
            console.error("[Eduzz Webhook] Erro ao salvar profile com upsert:", upsertError.message);
            throw upsertError;
        }

        console.log(`[Eduzz Webhook] Sucesso! Plano [${planId}] atualizado para [${planStatus}] para [${cusEmail}].`);

        // 5. BÔNUS: Verificar se o cliente veio por indicação
        if (planStatus === 'Ativo') {
            const { data: referral, error: refError } = await supabase
                .from('referrals')
                .select('*, profiles:referrer_id(*)')
                .eq('referral_contact', cusEmail)
                .eq('status', 'Cadastrado')
                .maybeSingle();

            if (referral && !refError) {
                console.log(`[Eduzz Webhook] Conversão Detectada! Indicado: ${cusEmail} | Padrinho: ${referral.profiles?.email}`);
                
                // Atualizar status da indicação
                await supabase
                    .from('referrals')
                    .update({ status: 'Assinou' })
                    .eq('id', referral.id);

                // Notificar o Padrinho
                if (referral.profiles?.email) {
                    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? "";
                    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || "onboarding@resend.dev";
                    
                    const html = referralSuccessTemplate({
                        referralName: body.cus_name || body.cus_fullname || 'Um novo colega',
                        professionalName: referral.profiles.full_name || 'Doutor(a)'
                    });

                    await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
                        body: JSON.stringify({
                            from: `Meu Sistema PSI <${fromEmail}>`,
                            to: [referral.profiles.email],
                            subject: `🎁 Parabéns! Você ganhou +1 Mês Grátis!`,
                            html: html
                        })
                    });
                }
            }
        }

        return new Response(JSON.stringify({ success: true, message: `Plano ${planId} atualizado para ${planStatus}`, email: cusEmail }), { status: 200 });

    } catch (err: any) {
        console.error("[Eduzz Webhook] Erro crítico de execução:", err.message);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
});

