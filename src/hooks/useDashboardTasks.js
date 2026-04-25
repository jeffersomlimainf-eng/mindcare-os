import { useState, useEffect, useMemo } from 'react';
import { formatDateLocal } from '../utils/date';
import { messages } from '../utils/whatsapp';
import { logger } from '../utils/logger';

export function useDashboardTasks({
  atendimentosHoje,
  evolutions,
  getContasVencidas,
  patients,
  tcles,
  proximaSessao,
  appointments,
  user
}) {
  const [tarefasManuais, setTarefasManuais] = useState(() => {
    try {
      const salvas = localStorage.getItem('tarefasManuais');
      return salvas ? JSON.parse(salvas) : [];
    } catch (e) { return []; }
  });

  const [completadas, setCompletadas] = useState(() => {
    try {
      const salvas = localStorage.getItem('tarefasCompletadas');
      return salvas ? JSON.parse(salvas) : {};
    } catch (e) { return {}; }
  });

  const hojeISO = useMemo(() => formatDateLocal(new Date()), []);

  useEffect(() => {
    localStorage.setItem('tarefasManuais', JSON.stringify(tarefasManuais));
  }, [tarefasManuais]);

  useEffect(() => {
    localStorage.setItem('tarefasCompletadas', JSON.stringify(completadas));
  }, [completadas]);

  const pendenciasDinamicas = useMemo(() => {
    const automaticas = [];
    
    // 1. Verificar Evoluções faltantes
    atendimentosHoje.forEach(a => {
      if (a.status === 'finalizado') {
        const temEvolucao = (evolutions || []).some(ev => 
          ev.pacienteId === a.pacienteId && 
          ev.criadoEm && ev.criadoEm.startsWith(hojeISO)
        );
        if (!temEvolucao) {
          automaticas.push({
            id: `ev-${a.id}`,
            text: `Escrever evolução de ${a.paciente}`,
            type: 'evolucao',
            rota: '/prontuarios/evolucao/novo',
            state: { pacienteId: a.pacienteId }
          });
        }
      }
    });

    // 2. Contas a Receber Vencidas
    try {
      const vencidas = getContasVencidas();
      vencidas.filter(v => v.tipo === 'receita').forEach(v => {
        const p = patients.find(pat => pat.id === (v.patient_id || v.pacienteId));
        const paymentLink = `${window.location.origin}/cobranca/${v.id}?desc=${encodeURIComponent(v.descricao || 'Sessão')}&valor=${Math.abs(v.valor).toFixed(2)}&venc=${v.dataVencimento || ''}`;
        
        automaticas.push({
          id: `fin-${v.id}`,
          text: `Cobrar ${v.descricao || 'Paciente'} (R$ ${Math.abs(v.valor)})`,
          type: 'financeiro',
          rota: '/financeiro',
          patientPhone: p?.phone || p?.telefone,
          waMessage: messages.billing(
            p?.nome || 'paciente',
            formatDateLocal(new Date(v.dataVencimento)),
            Math.abs(v.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            user?.configuracoes?.chavePix,
            paymentLink
          )
        });
      });
    } catch (e) {
      logger.error('[useDashboardTasks] Erro ao processar contas vencidas:', e);
    }

    // 3. Aniversariantes
    (patients || []).forEach(p => {
      if (p.dataNascimento) {
        const [, mes, dia] = p.dataNascimento.split('-');
        const hoje = new Date();
        if (parseInt(mes) === hoje.getMonth() + 1 && parseInt(dia) === hoje.getDate()) {
          automaticas.push({
            id: `niver-${p.id}`,
            text: `Parabéns para ${p.nome} 🎂`,
            type: 'niver',
            patientPhone: p.phone || p.telefone,
            waMessage: `Parabéns, ${p.nome}! \u{1F382} Desejo muita saúde, paz e um ciclo maravilhoso. Feliz aniversário! \u{1F389}`
          });
        }
      }
    });

    // 4. Falta TCLE
    (patients || []).filter(p => {
      const criado = new Date(p.criadoEm || Date.now());
      const diffDias = (new Date() - criado) / (1000 * 60 * 60 * 24);
      return diffDias <= 7;
    }).forEach(p => {
      const temTcle = (tcles || []).some(t => t.pacienteId === p.id);
      if (!temTcle) {
        automaticas.push({
          id: `tcle-${p.id}`,
          text: `Emitir TCLE para ${p.nome}`,
          type: 'tcle',
          rota: '/tcles/novo',
          state: { pacienteId: p.id }
        });
      }
    });

    // 5. Alerta de Burnout
    if (atendimentosHoje.length >= 6) {
      automaticas.unshift({
        id: 'burnout-alert',
        text: `⚠️ Alerta: Agenda Cheia hoje (${atendimentosHoje.length} sessões). Lembre-se de respirar!`,
        type: 'alerta'
      });
    }

    // 6. Preparação
    if (proximaSessao) {
      automaticas.push({
        id: `warmup-${proximaSessao.id}`,
        text: `Revisar notas da sessão de ${proximaSessao.paciente} 📖`,
        type: 'warmup',
        rota: `/prontuarios/paciente/${proximaSessao.pacienteId || proximaSessao.paciente}`
      });
    }

    // 7. Prevenção de Abandono
    try {
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
      const hojeDate = new Date();

      const appointmentMap = new Map();
      (appointments || []).forEach(a => {
        const key = a.pacienteId || a.paciente;
        if (!appointmentMap.has(key)) appointmentMap.set(key, []);
        appointmentMap.get(key).push(a);
      });

      (patients || []).forEach(p => {
        const consultasPaciente = appointmentMap.get(p.id) || appointmentMap.get(p.nome) || [];
        const passadas = consultasPaciente.filter(a => new Date(a.data) < hojeDate);
        const futuras = consultasPaciente.filter(a => new Date(a.data) >= hojeDate);

        if (passadas.length > 0 && futuras.length === 0) {
          const maiorData = Math.max(...passadas.map(a => new Date(a.data).getTime()));
          if (maiorData && new Date(maiorData) >= trintaDiasAtras) {
            automaticas.push({
              id: `churn-${p.id}`,
              text: `Remarcar ${p.nome} (Sem sessões futuras)`,
              type: 'churn',
              rota: `/prontuarios/paciente/${p.id}`,
              patientPhone: p.phone || p.telefone,
              waMessage: `Olá, ${p.nome}! Tudo bem? Notei que não temos mais sessões agendadas. Gostaria de reservar um novo horário? \u{1F60A} \u{1F98B}`
            });
          }
        }
      });
    } catch (e) {
      logger.error('[useDashboardTasks] Erro ao processar prevenção de abandono:', e);
    }

    return automaticas;
  }, [atendimentosHoje, evolutions, hojeISO, getContasVencidas, patients, tcles, proximaSessao, appointments, user]);

  const todasPendencias = useMemo(() => {
    const ordem = { alerta: 1, warmup: 2, niver: 3, evolucao: 4, financeiro: 5, tcle: 6, churn: 7, manual: 8 };
    return [
      ...pendenciasDinamicas.map(p => ({ ...p, completed: completadas[p.id] || false })),
      ...tarefasManuais.map(p => ({ ...p, completed: completadas[p.id] || false }))
    ].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (ordem[a.type] || 99) - (ordem[b.type] || 99);
    });
  }, [pendenciasDinamicas, tarefasManuais, completadas]);

  const toggleTarefa = (id) => {
    setCompletadas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addTarefaManual = (texto) => {
    if (!texto.trim()) return;
    const nova = {
      id: `manual-${Date.now()}`,
      text: texto,
      type: 'manual',
      completed: false
    };
    setTarefasManuais(prev => [nova, ...prev]);
  };

  const removeTarefaManual = (id) => {
    setTarefasManuais(prev => prev.filter(t => t.id !== id));
    setCompletadas(prev => {
      const nova = { ...prev };
      delete nova[id];
      return nova;
    });
  };

  return {
    tarefasManuais,
    todasPendencias,
    toggleTarefa,
    addTarefaManual,
    removeTarefaManual
  };
}
