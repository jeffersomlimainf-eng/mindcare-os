import { showToast } from '../components/Toast';

/**
 * Middleware simulado para proteção de rotas e funcionalidades de IA.
 * Em um ambiente express/backend real, isso seria um middleware de rota.
 */
export const checkAIAccess = (user) => {
    // 1. Verificação de Plano (Case-insensitive)
    const planosComIA = ['profissional', 'premium'];
    const currentPlan = (user.plan_id || '').toLowerCase();

    if (!planosComIA.includes(currentPlan)) {
        return {
            allowed: false,
            reason: `Seu plano atual (${user.plan_id || 'Essencial'}) não inclui recursos de Inteligência Artificial.`,
            code: 'PLAN_RESTRICTION'
        };
    }

    // 2. Verificação de Status da Conta (Novo sistema SuperAdmin)
    if (user.plan_status === 'Suspenso' || user.plan_status === 'Inadimplente' || user.isInadimplente) {
        return {
            allowed: false,
            reason: 'Sua conta possui uma pendência ou restrição. Regularize para reativar os recursos de IA.',
            code: 'PAYMENT_REQUIRED'
        };
    }

    // 3. Verificação de Limite de Tokens (Controle de Custo)
    const consumo = user.consumoIA || { tokensTotal: 0, limiteMensal: 500000 };
    if (consumo.tokensTotal >= consumo.limiteMensal) {
        return {
            allowed: false,
            reason: 'Você atingiu o limite de uso de IA para este mês. Faça upgrade ou aguarde a renovação.',
            code: 'USAGE_QUOTA_EXCEEDED'
        };
    }

    return { allowed: true };
};

/**
 * Função simulada para registrar o consumo de tokens após uma chamada à API.
 */
export const trackAIConsumption = (tokensUsed, user, updateUser) => {
    const novoConsumo = {
        ...user.consumoIA,
        tokensTotal: (user.consumoIA?.tokensTotal || 0) + tokensUsed,
        requisicoes: (user.consumoIA?.requisicoes || 0) + 1
    };

    updateUser({ consumoIA: novoConsumo });
    
    // BUG-12 FIX: usar fallback para evitar NaN quando limiteMensal é undefined
    const limiteSeguro = user.consumoIA?.limiteMensal ?? 500000;
    if (novoConsumo.tokensTotal > (limiteSeguro * 0.8)) {
        showToast('Você atingiu 80% do seu limite mensal de IA.', 'warning');
    }
};


