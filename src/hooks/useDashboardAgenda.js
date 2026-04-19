import { useMemo } from 'react';
import { formatDateLocal } from '../utils/date';
import { logger } from '../utils/logger';

export function useDashboardAgenda({ appointments, agendaSettings }) {
  const hojeISO = useMemo(() => formatDateLocal(new Date()), []);

  const dataHojeFormatada = useMemo(() => {
    const d = new Date();
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    return `${String(d.getDate()).padStart(2, '0')} ${meses[d.getMonth()]}`;
  }, []);

  const atendimentosHoje = useMemo(() => {
    return (appointments || [])
      .filter(a => a.data === hojeISO)
      .sort((a, b) => a.timeStart - b.timeStart);
  }, [appointments, hojeISO]);

  const proximaSessao = useMemo(() => {
    try {
      const agora = new Date();
      const horaAtual = agora.getHours() + agora.getMinutes() / 60;
      const proxima = atendimentosHoje.find(a => a.timeStart + a.duracao/60 > horaAtual && a.status !== 'cancelado') || atendimentosHoje[0];
      
      if (!proxima) {
        logger.log('[Dashboard] Nenhuma próxima sessão identificada para hoje.');
      }
      return proxima;
    } catch (error) {
      logger.error('[Dashboard] Erro ao calcular próxima sessão:', error);
      return null;
    }
  }, [atendimentosHoje]);

  const tempoRestante = useMemo(() => {
    try {
      if (!proximaSessao) return null;
      const agora = new Date();
      const horaAtual = agora.getHours() + agora.getMinutes() / 60;
      const diff = (proximaSessao.timeStart - horaAtual) * 60;
      if (diff < 0) {
        const fimSessao = proximaSessao.timeStart + proximaSessao.duracao/60;
        if (horaAtual < fimSessao) return 'Em andamento';
        return 'Sessão encerrada';
      }
      if (diff > 60) {
        const horas = Math.floor(diff / 60);
        const mins = Math.round(diff % 60);
        return `${horas}h ${mins}min`;
      }
      return `${Math.round(diff)} min`;
    } catch (error) {
      logger.error('[Dashboard] Erro ao calcular tempo restante:', error);
      return 'Erro no cálculo';
    }
  }, [proximaSessao]);

  const insightsAgenda = useMemo(() => {
    const hInicio = agendaSettings?.hInicio || 8;
    const hFim = agendaSettings?.hFim || 18;
    const horasDia = hFim - hInicio;
    const totalVagasSemana = horasDia * 5;

    const hojeDate = new Date();
    const diaSemana = hojeDate.getDay();
    const diffSegunda = hojeDate.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1);
    const segunda = new Date(hojeDate);
    segunda.setDate(diffSegunda);
    segunda.setHours(0, 0, 0, 0);

    const sexta = new Date(segunda);
    sexta.setDate(segunda.getDate() + 4);
    sexta.setHours(23, 59, 59, 999);

    const ocupados = (appointments || []).filter(a => {
      if (a.status === 'cancelado' || a.status === 'faltou') return false;
      const d = new Date(a.data);
      return d >= segunda && d <= sexta;
    }).length;

    const vagasSemana = Math.max(0, totalVagasSemana - ocupados);
    const percentualOcupado = totalVagasSemana > 0 ? Math.round((ocupados / totalVagasSemana) * 100) : 0;

    return {
      vagasSemana,
      percentualOcupado,
      horasExpediente: `${hInicio}h-${hFim}h`
    };
  }, [appointments, agendaSettings]);

  return {
    atendimentosHoje,
    proximaSessao,
    tempoRestante,
    insightsAgenda,
    dataHojeFormatada
  };
}
