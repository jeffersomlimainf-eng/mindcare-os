import { useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { usePatients } from '../contexts/PatientContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { useFinance } from '../contexts/FinanceContext';
import { useEvolutions } from '../contexts/EvolutionContext';
import { useUser } from '../contexts/UserContext';

/**
 * Motor de Notificações Inteligentes
 * Analisa os dados reais da clínica e injeta notificações contextuais.
 * Roda uma vez por sessão (controlado via sessionStorage).
 */
const SmartNotificationsEngine = () => {
    const { addNotification, clearAll } = useNotifications();
    const { patients } = usePatients();
    const { appointments } = useAppointments();
    const { transactions } = useFinance();
    const { evolutions } = useEvolutions();
    const { user } = useUser();
    const executedRef = useRef(false);

    useEffect(() => {
        // Aguarda dados carregarem e evita execução dupla
        if (executedRef.current) return;
        if (!patients || !appointments || !user?.id) return;

        // Chave única por usuário/dia para não reinjectar as mesmas notificações
        const sessionKey = `smart_notif_${user.id}_${new Date().toDateString()}`;
        if (sessionStorage.getItem(sessionKey)) return;

        executedRef.current = true;
        sessionStorage.setItem(sessionKey, '1');

        // Limpa notificações estáticas antigas (boas-vindas, dicas hardcoded)
        clearAll();

        const hoje = new Date();
        const hojeStr = hoje.toISOString().split('T')[0];
        const notificacoes = [];

        // ─────────────────────────────────────────────
        // 1. SESSÕES DE HOJE
        // ─────────────────────────────────────────────
        const sessoesHoje = appointments.filter(a => a.data === hojeStr && a.status !== 'cancelado');
        if (sessoesHoje.length > 0) {
            const primeira = sessoesHoje.sort((a, b) => (a.timeStart || 0) - (b.timeStart || 0))[0];
            const nomeprimeiro = primeira.pacienteNome || 'paciente';
            notificacoes.push({
                title: `📅 ${sessoesHoje.length} sessão(ões) hoje`,
                message: `Primeira sessão: ${nomeximo(nomeprimeiroaux(primeira))} às ${formatHora(primeira.timeStart)}`,
                type: 'info',
                icon: 'today',
                priority: 1
            });
        }

        // ─────────────────────────────────────────────
        // 2. PAGAMENTOS VENCIDOS (Receitas Pendentes)
        // ─────────────────────────────────────────────
        if (transactions) {
            const vencidas = transactions.filter(t => {
                if (t.tipo !== 'receita' && t.category !== 'receita') return false;
                const status = (t.status || t.situacao || '').toLowerCase();
                if (status === 'recebido' || status === 'pago') return false;
                if (!t.dataVencimento && !t.data_vencimento) return false;
                const venc = new Date(t.dataVencimento || t.data_vencimento);
                return venc < hoje;
            });

            if (vencidas.length > 0) {
                const totalDevido = vencidas.reduce((acc, t) => acc + (parseFloat(t.valor) || 0), 0);
                notificacoes.push({
                    title: `💸 ${vencidas.length} recebimento(s) em atraso`,
                    message: `Total pendente: ${formatBRL(totalDevido)}. Acesse o Financeiro para cobrar.`,
                    type: 'warning',
                    icon: 'payments',
                    priority: 2
                });
            }
        }

        // ─────────────────────────────────────────────
        // 3. PACIENTES SEM ATIVIDADE (30+ dias)
        // ─────────────────────────────────────────────
        const pacientesAtivos = patients.filter(p => (p.status || '').toLowerCase() === 'ativo');
        const limite30dias = new Date(hoje);
        limite30dias.setDate(limite30dias.getDate() - 30);

        const pacientesSumidos = pacientesAtivos.filter(p => {
            const ultimaSessao = appointments
                .filter(a => a.pacienteId === p.id && a.status !== 'cancelado')
                .sort((a, b) => new Date(b.data) - new Date(a.data))[0];

            if (!ultimaSessao) return true;
            return new Date(ultimaSessao.data) < limite30dias;
        });

        if (pacientesSumidos.length > 0) {
            notificacoes.push({
                title: `😴 ${pacientesSumidos.length} paciente(s) ausente(s)`,
                message: `${pacientesSumidos[0]?.nome || 'Paciente'} e outros não têm sessão há mais de 30 dias.`,
                type: 'warning',
                icon: 'person_off',
                priority: 3
            });
        }

        // ─────────────────────────────────────────────
        // 4. SESSÕES SEM EVOLUÇÃO REGISTRADA
        // ─────────────────────────────────────────────
        if (evolutions) {
            const limite7dias = new Date(hoje);
            limite7dias.setDate(limite7dias.getDate() - 7);

            const sessoesRecentes = appointments.filter(a => {
                if (a.status === 'cancelado') return false;
                const data = new Date(a.data);
                return data >= limite7dias && data <= hoje;
            });

            const sessoesComEvolucao = new Set(evolutions.map(e => e.agendamentoId || e.appointmentId));

            const semEvolucao = sessoesRecentes.filter(a =>
                !sessoesComEvolucao.has(a.id)
            );

            if (semEvolucao.length > 0) {
                notificacoes.push({
                    title: `📝 ${semEvolucao.length} sessão(ões) sem evolução`,
                    message: `Você tem sessões dos últimos 7 dias sem evolução clínica registrada.`,
                    type: 'tip',
                    icon: 'clinical_notes',
                    priority: 4
                });
            }
        }

        // ─────────────────────────────────────────────
        // 5. SESSÕES AMANHÃ (Lembrete Antecipado)
        // ─────────────────────────────────────────────
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        const amanhaStr = amanha.toISOString().split('T')[0];
        const sessoesAmanha = appointments.filter(a => a.data === amanhaStr && a.status !== 'cancelado');

        if (sessoesAmanha.length > 0) {
            notificacoes.push({
                title: `📆 ${sessoesAmanha.length} sessão(ões) amanhã`,
                message: `Você tem atendimentos agendados para amanhã. Confira sua agenda.`,
                type: 'info',
                icon: 'event_upcoming',
                priority: 5
            });
        }

        // ─────────────────────────────────────────────
        // 6. NOVO PACIENTE (últimos 7 dias)
        // ─────────────────────────────────────────────
        const limite7dias = new Date(hoje);
        limite7dias.setDate(limite7dias.getDate() - 7);
        const novos = patients.filter(p => {
            const criado = p.criadoEm || p.created_at;
            return criado && new Date(criado) >= limite7dias;
        });

        if (novos.length > 0) {
            notificacoes.push({
                title: `🎉 ${novos.length} novo(s) paciente(s)`,
                message: `${novos[0]?.nome || 'Paciente'} foi adicionado(a) recentemente. Verifique o prontuário.`,
                type: 'success',
                icon: 'person_add',
                priority: 6
            });
        }

        // ─────────────────────────────────────────────
        // 7. RESUMO DIÁRIO (sempre presente)
        // ─────────────────────────────────────────────
        const nomePsi = user?.nome?.split(' ')[0] || 'Psicólogo(a)';
        notificacoes.push({
            title: `☀️ Bom dia, Dr(a). ${nomePsi}!`,
            message: `Você tem ${pacientesAtivos.length} paciente(s) ativo(s) e ${sessoesHoje.length} sessão(ões) hoje.`,
            type: 'info',
            icon: 'waving_hand',
            priority: 99
        });

        // Injeta em ordem de prioridade (mais importantes primeiro)
        notificacoes
            .sort((a, b) => a.priority - b.priority)
            .forEach(n => addNotification(n));

    }, [patients, appointments, transactions, evolutions, user?.id]);

    return null;
};

// ─── Helpers ───────────────────────────────────────────
function formatHora(timeStart) {
    if (timeStart == null) return '--:--';
    const h = Math.floor(timeStart);
    const m = Math.round((timeStart - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatBRL(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function nomeximo(nome) {
    return nome?.split(' ')[0] || 'paciente';
}

function nomeprimeiroaux(sessao) {
    return sessao?.pacienteNome || sessao?.nome || 'paciente';
}

export default SmartNotificationsEngine;
