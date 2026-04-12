import { useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { usePatients } from '../contexts/PatientContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { useFinance } from '../contexts/FinanceContext';
import { useEvolutions } from '../contexts/EvolutionContext';
import { useUser } from '../contexts/UserContext';

/**
 * Motor de Notificações Inteligentes V2
 * Analisa os dados e sincroniza em lote para evitar redundância.
 */
const SmartNotificationsEngine = () => {
    const { syncSmartNotifications } = useNotifications();
    const { patients } = usePatients();
    const { appointments } = useAppointments();
    const { transactions } = useFinance();
    const { evolutions } = useEvolutions();
    const { user } = useUser();
    const executedRef = useRef(false);

    useEffect(() => {
        // Aguarda dados mínimos
        if (!patients || !appointments || !user?.id) return;

        // Evita re-processamento desnecessário na mesma sessão/minuto
        const now = new Date();
        const sessionKey = `smart_notif_sync_${user.id}_${now.getHours()}`; 
        if (sessionStorage.getItem(sessionKey)) return;

        sessionStorage.setItem(sessionKey, 'true');
        
        const hoje = new Date();
        const hojeStr = hoje.toISOString().split('T')[0];
        const novasNotif = [];

        // ─────────────────────────────────────────────
        // 1. SAUDAÇÃO CONTEXTUAL
        // ─────────────────────────────────────────────
        const hora = hoje.getHours();
        let saudacao = 'Olá';
        if (hora < 12) saudacao = 'Bom dia';
        else if (hora < 18) saudacao = 'Boa tarde';
        else saudacao = 'Boa noite';

        const nomePsi = user?.nome?.split(' ')[0] || 'Psicólogo(a)';
        const pacientesAtivos = patients.filter(p => (p.status || '').toLowerCase() === 'ativo');
        const sessoesHoje = appointments.filter(a => a.data === hojeStr && a.status !== 'cancelado');

        novasNotif.push({
            id: 'greeting',
            title: `✨ ${saudacao}, Dr(a). ${nomePsi}!`,
            message: `Hoje você tem ${sessoesHoje.length} sessão(ões) e ${pacientesAtivos.length} paciente(s) ativos.`,
            type: 'info',
            icon: 'auto_awesome',
            category: 'GERAL',
            priority: 0
        });

        // ─────────────────────────────────────────────
        // 2. SESSÕES DE HOJE (DETALHE)
        // ─────────────────────────────────────────────
        if (sessoesHoje.length > 0) {
            const primeira = sessoesHoje.sort((a, b) => (a.timeStart || 0) - (b.timeStart || 0))[0];
            novasNotif.push({
                id: 'today-sessions',
                title: '📅 Próximo Atendimento',
                message: `Sua primeira sessão é com ${primeira.pacienteNome || 'um paciente'} às ${formatHora(primeira.timeStart)}.`,
                type: 'info',
                icon: 'event_available',
                category: 'CLINICO',
                path: '/agenda',
                priority: 1
            });
        }

        // ─────────────────────────────────────────────
        // 3. FINANCEIRO (RECEITAS EM ATRASO)
        // ─────────────────────────────────────────────
        if (transactions) {
            const vencidas = transactions.filter(t => {
                if (t.tipo !== 'receita' && t.category !== 'receita') return false;
                const status = (t.status || t.situacao || '').toLowerCase();
                if (status === 'recebido' || status === 'pago') return false;
                const venc = new Date(t.dataVencimento || t.data_vencimento);
                return venc < hoje;
            });

            if (vencidas.length > 0) {
                const total = vencidas.reduce((acc, t) => acc + (parseFloat(t.valor) || 0), 0);
                novasNotif.push({
                    id: 'overdue-finance',
                    title: '💸 Pendência Financeira',
                    message: `Você tem ${vencidas.length} recebimento(s) em atraso, totalizando ${formatBRL(total)}.`,
                    type: 'warning',
                    icon: 'account_balance_wallet',
                    category: 'FINANCEIRO',
                    path: '/financeiro',
                    priority: 2
                });
            }
        }

        // ─────────────────────────────────────────────
        // 4. CLÍNICO (PRONTUÁRIOS SEM EVOLUÇÃO)
        // ─────────────────────────────────────────────
        if (evolutions) {
            const limite7dias = new Date(hoje);
            limite7dias.setDate(limite7dias.getDate() - 7);
            const sessoesRecentes = appointments.filter(a => {
                const data = new Date(a.data);
                return a.status !== 'cancelado' && data >= limite7dias && data <= hoje;
            });
            const sessoesComEvolucao = new Set(evolutions.map(e => e.agendamentoId || e.appointmentId));
            const semEvolucao = sessoesRecentes.filter(a => !sessoesComEvolucao.has(a.id));

            if (semEvolucao.length > 0) {
                novasNotif.push({
                    id: 'pending-evolutions',
                    title: '📝 Prontuários Pendentes',
                    message: `Existem ${semEvolucao.length} sessão(ões) recente(s) sem evolução registrada.`,
                    type: 'tip',
                    icon: 'edit_note',
                    category: 'CLINICO',
                    path: '/agenda',
                    priority: 3
                });
            }
        }

        // ─────────────────────────────────────────────
        // 5. PACIENTES INATIVOS / AUSENTES
        // ─────────────────────────────────────────────
        const limite30dias = new Date(hoje);
        limite30dias.setDate(limite30dias.getDate() - 30);
        const sumidos = pacientesAtivos.filter(p => {
            const ultima = appointments
                .filter(a => a.pacienteId === p.id && a.status !== 'cancelado')
                .sort((a, b) => new Date(b.data) - new Date(a.data))[0];
            return !ultima || new Date(ultima.data) < limite30dias;
        });

        if (sumidos.length > 0) {
            novasNotif.push({
                id: 'absent-patients',
                title: '😴 Reativação de Pacientes',
                message: `${sumidos.length} paciente(s) estão sem sessões há mais de 30 dias.`,
                type: 'warning',
                icon: 'campaign',
                category: 'GERAL',
                path: '/pacientes',
                priority: 4
            });
        }

        // Sincroniza o lote final
        syncSmartNotifications(novasNotif);

    }, [patients, appointments, transactions, evolutions, user?.id]);

    return null;
};

function formatHora(timeStart) {
    if (timeStart == null) return '--:--';
    const h = Math.floor(timeStart);
    const m = Math.round((timeStart - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatBRL(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export default SmartNotificationsEngine;
