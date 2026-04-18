import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';

import { logger } from '../utils/logger';
/**
 * Hook de Engenharia para Controle de Primeira Visita / Tours (Sincronizado com Nuvem)
 * @param {string} tourKey - Identificador único do tour (ex: 'agenda', 'pacientes')
 * @param {number} delayMs - Atraso para disparar o tour
 */
const useFirstVisit = (tourKey, delayMs = 1500) => {
    const { user, updateConfigs } = useUser();
    const storageKey = `psi_tour_v1_${tourKey}`;
    
    // 1. Verifica no banco de dados (nuvem) e no localStorage (local)
    const isAlreadyCompleted = useCallback(() => {
        // Verifica se está marcado no banco (nuvem)
        const completedInCloud = user?.configuracoes?.completed_tours?.[tourKey] === true;
        // Verifica se está marcado localmente
        const completedLocally = localStorage.getItem(storageKey) === 'completed';
        
        return completedInCloud || completedLocally;
    }, [user, tourKey, storageKey]);

    const [shouldTrigger, setShouldTrigger] = useState(false);

    // Função para marcar como concluído permanentemente (Local + Nuvem)
    const markAsCompleted = useCallback(async () => {
        logger.info(`[TourAudit] Persistindo conclusão do tour '${tourKey}' na nuvem e localmente.`);
        
        // 1. Salva localmente para resposta imediata
        localStorage.setItem(storageKey, 'completed');
        
        // 2. Salva na nuvem (Supabase) para "toda a vida"
        if (user?.id) {
            const currentTours = user.configuracoes?.completed_tours || {};
            await updateConfigs({
                completed_tours: {
                    ...currentTours,
                    [tourKey]: true
                }
            });
        }
        
        setShouldTrigger(false);
    }, [tourKey, user, updateConfigs, storageKey]);

    useEffect(() => {
        // Se o usuário ainda está carregando, esperamos
        if (!user?.id) return;

        // Se já completou em qualquer lugar, não dispara
        if (isAlreadyCompleted()) {
            return;
        }

        // Se o usuário desativou tudo globalmente
        if (user.configuracoes?.disable_all_tours === true) return;

        const timer = setTimeout(() => {
            setShouldTrigger(true);
        }, delayMs);

        return () => clearTimeout(timer);
    }, [user, tourKey, delayMs, isAlreadyCompleted]);

    return { shouldTrigger, markAsCompleted };
};

export default useFirstVisit;

