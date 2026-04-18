import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { logger } from '../utils/logger';
/**
 * Hook para gerenciar atalhos globais de teclado no sistema.
 * @param {Object} options - Configurações de estado de modais abertos.
 */
export const useGlobalShortcuts = (options = {}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isModalOpen, closeModal, priority = 0 } = options;

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                // 1. Se houver um modal aberto neste nível, fecha e para a propagação
                if (isModalOpen && typeof closeModal === 'function') {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    closeModal();
                    return;
                }

                // 2. Se for o nível de navegação (priority 0) e nada foi fechado antes
                if (priority === 0) {
                    const editRoutes = ['/laudos/', '/declaracoes/', '/atestados/', '/anamneses/', '/encaminhamentos/', '/prontuarios/evolucao/'];
                    const isEditPage = editRoutes.some(route => location.pathname.includes(route));

                    if (isEditPage) {
                        const confirmBack = window.confirm('Você pode ter alterações não salvas. Deseja realmente sair desta página?');
                        if (confirmBack) {
                            navigate(-1);
                        }
                    } else {
                        if (location.pathname !== '/dashboard' && location.pathname !== '/login') {
                            navigate(-1);
                        }
                    }
                }
            }
        };

        // Listeners com prioridade > 0 usam a fase de captura para disparar antes
        const useCapture = priority > 0;
        window.addEventListener('keydown', handleKeyDown, useCapture);
        return () => window.removeEventListener('keydown', handleKeyDown, useCapture);
    }, [navigate, location, isModalOpen, closeModal, priority]);
};



