import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import NovoAgendamentoModal from '../components/NovoAgendamentoModal';
import AgendaSettingsModal from '../components/AgendaSettingsModal';
import NovoNaFilaModal from '../components/NovoNaFilaModal';
import CadastroPacienteModal from '../components/CadastroPacienteModal';
import { showToast } from '../components/Toast';
import { useAppointments } from '../contexts/AppointmentContext';
import { useFinance } from '../contexts/FinanceContext';
import { usePatients } from '../contexts/PatientContext';
import { formatDateLocal } from '../utils/date';
import { safeRender } from '../utils/render';
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts';
import HelpModal from '../components/HelpModal';
import { HELP_CONTENT } from '../constants/helpContent';
import FeatureTour from '../components/FeatureTour';
import useFirstVisit from '../hooks/useFirstVisit';
import useDismissible from '../hooks/useDismissible';
import { generateWhatsAppLink, messages } from '../utils/whatsapp';

import { logger } from '../utils/logger';
// ─── Constantes ──────────────────────────────────────────────
const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const DIAS_CAL = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const SLOT_H = 72; // px por hora


const STATUS_CFG = {
    confirmado: {
        label: 'Confirmado', icon: 'check_circle',
        // month view / badge (Tailwind)
        bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', glow: 'shadow-emerald-100', accent: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700',
        // week/day card (inline)
        cardBg: 'linear-gradient(135deg,rgba(184,230,204,.48),rgba(184,230,204,.26))', cardBorder: 'rgba(31,138,77,.22)', cardColor: '#184e35',
        dotColor: '#1f8a4d',
    },
    aguardando: {
        label: 'Aguardando', icon: 'schedule',
        bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', glow: 'shadow-amber-100', accent: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700',
        cardBg: 'linear-gradient(135deg,rgba(246,198,107,.38),rgba(246,198,107,.20))', cardBorder: 'rgba(182,133,21,.25)', cardColor: '#6a4a0a',
        dotColor: '#b68515',
    },
    em_sessao: {
        label: 'Em Sessão', icon: 'play_circle',
        bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800', glow: 'shadow-pink-100', accent: 'bg-pink-500', badge: 'bg-pink-100 text-pink-700',
        cardBg: 'linear-gradient(135deg,rgba(255,102,194,.28),rgba(134,89,232,.24))', cardBorder: 'rgba(255,102,194,.45)', cardColor: '#c940a8',
        dotColor: '#ff66c2', pulse: true,
    },
    concluido: {
        label: 'Concluído', icon: 'task_alt',
        bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-500', glow: 'shadow-slate-100', accent: 'bg-slate-400', badge: 'bg-slate-100 text-slate-500',
        cardBg: 'rgba(134,89,232,.08)', cardBorder: 'rgba(134,89,232,.18)', cardColor: '#8659e8',
        dotColor: '#8659e8', strikethrough: true,
    },
    cancelado: {
        label: 'Cancelado', icon: 'cancel',
        bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', glow: 'shadow-red-100', accent: 'bg-red-500', badge: 'bg-red-100 text-red-700',
        cardBg: 'rgba(239,68,68,.08)', cardBorder: 'rgba(239,68,68,.25)', cardColor: '#b91c1c',
        dotColor: '#ef4444',
    },
    faltou: {
        label: 'Faltou', icon: 'error',
        bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', glow: 'shadow-rose-100', accent: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700',
        cardBg: 'rgba(244,63,94,.08)', cardBorder: 'rgba(244,63,94,.25)', cardColor: '#be123c',
        dotColor: '#f43f5e',
    },
};

const TYPE_CFG = {
    presencial: { label: 'Presencial', icon: 'person', bg: 'bg-blue-100/90', border: 'border-blue-400', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-800' },
    teleconsulta: { label: 'Online', icon: 'videocam', bg: 'bg-emerald-100/90', border: 'border-emerald-400', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800' },
    online: { label: 'Online', icon: 'videocam', bg: 'bg-emerald-100/90', border: 'border-emerald-400', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800' },
};

const ATIVIDADES = [
    { tempo: '5 min', texto: 'Sofia Marques confirmou presença.', icone: 'check_circle', cor: 'text-emerald-500' },
    { tempo: '1h', texto: 'Sessão de Jorge Paulo finalizada.', icone: 'save', cor: 'text-primary' },
    { tempo: '2h', texto: "Felipe D'Avila chegou.", icone: 'person_pin_circle', cor: 'text-amber-500' },
];

function buildCalMini(ano, mes) {
    const prim = new Date(ano, mes, 1).getDay(); // 0(Dom) a 6(Sáb)
    const total = new Date(ano, mes + 1, 0).getDate();
    const prev = new Date(ano, mes, 0).getDate();
    const cells = [];
    
    // Ajuste para começar na segunda-feira (se desejar domingo, remova o ajuste)
    // Se domingo = 0, segunda = 1. Para começar na segunda:
    const startOffset = prim === 0 ? 6 : prim - 1;

    for (let i = startOffset - 1; i >= 0; i--) cells.push({ d: prev - i, curr: false });
    for (let d = 1; d <= total; d++) cells.push({ d, curr: true });
    
    let nextD = 1;
    while (cells.length < 42) cells.push({ d: nextD++, curr: false });
    return cells;
}

const Agenda = () => {
    const { patients, addPatient } = usePatients();
    const {
        appointments, addAppointment, updateAppointment, deleteAppointment,
        waitingList, removeFromWaitingList,
        agendaSettings
    } = useAppointments();
    const { transactions, addTransaction } = useFinance();
    const navigate = useNavigate();

    // Jarvis Mode: Mapear débitos por paciente
    const debitosPacientes = useMemo(() => {
        const mapa = {};
        transactions.forEach(t => {
            const tipoLower = (t.tipo || t.type || '').toLowerCase();
            if ((t.status || '').toLowerCase() === 'pendente' && tipoLower === 'receita') {
                // Se a descrição contiver o nome do paciente ou se tivermos pacienteId na transação (futuro)
                // Por enquanto, vamos usar o nome do paciente na descrição para cruzar
                const nomePaciente = t.desc?.split(' — ')[1];
                if (nomePaciente) mapa[nomePaciente] = true;
            }
        });
        return mapa;
    }, [transactions]);

    const { hInicio: H_INICIO, hFim: H_FIM } = agendaSettings;

    const HORAS = useMemo(() => {
        const h = [];
        for (let i = H_INICIO; i <= H_FIM; i++) {
            h.push(`${String(i).padStart(2, '0')}:00`);
        }
        return h;
    }, [H_INICIO, H_FIM]);
    const hoje = new Date();
    const [dataBase, setDataBase] = useState(new Date());
    const [visao, setVisao] = useState('semana');
    const [modalAberto, setModalAberto] = useState(false);
    const [settingsModalAberto, setSettingsModalAberto] = useState(false);
    const [filaModalAberto, setFilaModalAberto] = useState(false);
    const [cadastroModalAberto, setCadastroModalAberto] = useState(false);
    const [nomePreCadastro, setNomePreCadastro] = useState('');
    const [consultaEditando, setConsultaEditando] = useState(null); 
    const [pacienteParaAgenda, setPacienteParaAgenda] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [showTour, setShowTour] = useState(false);
    const { shouldTrigger: agendaFirstVisit, markAsCompleted: markAgendaTourCompleted } = useFirstVisit('agenda');
    const [agendaBannerDismissed, dismissAgendaBanner] = useDismissible('agenda_sync');
    useEffect(() => {
        if (agendaFirstVisit) setShowTour(true);
    }, [agendaFirstVisit]);
    const [filtroStatus, setFiltroStatus] = useState('todos');

    // Fechar modais locais da Agenda com Esc
    useGlobalShortcuts({
        isModalOpen: modalAberto || settingsModalAberto || filaModalAberto || cadastroModalAberto || showHelp,
        closeModal: () => {
            if (modalAberto) { setModalAberto(false); setConsultaEditando(null); setNomePreCadastro(''); setPacienteParaAgenda(null); }
            if (settingsModalAberto) setSettingsModalAberto(false);
            if (filaModalAberto) setFilaModalAberto(false);
            if (cadastroModalAberto) { setCadastroModalAberto(false); setNomePreCadastro(''); }
            if (showHelp) setShowHelp(false);
        },
        priority: 1
    });
    const [diaPreSel, setDiaPreSel] = useState(null);
    const [calAno, setCalAno] = useState(hoje.getFullYear());

    // Objeto estável para o modal de cadastro
    const pacienteParaCadastro = useMemo(() => 
        nomePreCadastro ? { nome: nomePreCadastro } : null
    , [nomePreCadastro]);
    const [calMes, setCalMes] = useState(hoje.getMonth());
    const gridRef     = useRef(null);
    const touchDragRef = useRef(null);   // estado do drag touch em andamento
    const _apptsRef    = useRef(appointments);
    useEffect(() => { _apptsRef.current = appointments; }, [appointments]);

    const diaSemanaDaBase = dataBase.getDay();
    const segunda = new Date(dataBase);
    segunda.setDate(dataBase.getDate() - (diaSemanaDaBase === 0 ? 6 : diaSemanaDaBase - 1));

    const diasSemana = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(segunda);
        d.setDate(segunda.getDate() + i);
        return d;
    });

    // Helper para mudar a data e garantir sincronia
    const selecionarData = (novaData) => {
        const d = new Date(novaData);
        setDataBase(d);
        setCalMes(d.getMonth());
        setCalAno(d.getFullYear());
    };

    const labelTopo = () => {
        if (visao === 'mes') return `${MESES[calMes]}, ${calAno}`;
        const ini = diasSemana[0];
        const fim = diasSemana[6];
        return `${ini.getDate()} ${MESES[ini.getMonth()].slice(0, 3)} - ${fim.getDate()} ${MESES[fim.getMonth()].slice(0, 3)} ${fim.getFullYear()}`;
    };

    const [agora, setAgora] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setAgora(new Date()), 30000);
        return () => clearInterval(t);
    }, []);
    const horaAtual = agora.getHours() + agora.getMinutes() / 60;
    const linhaAgoraTop = (horaAtual - H_INICIO) * SLOT_H;
    const mostrarLinha = visao !== 'mes'
        && (visao === 'dia'
            ? format(agora) === format(dataBase)
            : diasSemana.some(d => format(d) === format(agora)))
        && horaAtual >= H_INICIO && horaAtual <= H_FIM + 1;

    function format(d) { return formatDateLocal(d); }

    // Filtragem de agendamentos por status
    const filteredAppointments = useMemo(() => {
        if (filtroStatus === 'todos') return appointments;
        return appointments.filter(c => c.status === filtroStatus);
    }, [appointments, filtroStatus]);

    const getConsultasDoDia = (diaDate) => {
        if (!diaDate) return [];
        const diaISO = formatDateLocal(diaDate);
        return filteredAppointments.filter(c => c.data === diaISO);
    };
    const gerarFinanceiroConcluido = async (c, patientId) => {
        const p = patients.find(item => item.id === patientId);
        if (!p) return;

        // Limpa R$, espaços e converte , para .
        const valorSessao = p.price_per_session 
            ? parseFloat(String(p.price_per_session).replace(/[^\d.,]/g, '').replace(',', '.')) 
            : 0;

        if (valorSessao > 0) {
            const dataBR = c.data ? c.data.split('-').reverse().join('/') : '';
            const dataCurta = dataBR ? dataBR.substring(0, 5) : '';
            const desc = `Sessão — ${c.paciente || c.patient_name || 'Sem Nome'} (Ref. ${dataCurta})`;
            
            // BLINDAGEM: Verifica duplicidade primeiro pelo ID do agendamento (perfeito) e depois pela descrição (backup)
            const jaExiste = transactions.some(t => 
                (t.appointmentId === c.id) || 
                (t.description === desc || t.desc === desc)
            );
            
            if (!jaExiste) {
                try {
                    await addTransaction({
                        tipo: 'Receita',
                        desc: desc,
                        valor: valorSessao,
                        data: c.data,
                        dataVencimento: c.data,
                        status: 'Pendente',
                        categoria: 'clinica',
                        subcategoria: 'sessao',
                        pacienteId: patientId,
                        pacienteNome: c.paciente || c.patient_name,
                        appointmentId: c.id // Vincular no banco via group_id
                    });
                    showToast('Lançamento no financeiro criado!', 'success');
                } catch (err) {
                    logger.error('[Agenda] Erro ao lançar financeiro:', err);
                }
            }
        }
    };

    const handleSalvarNovaConsulta = (dados) => {
        const horaNum = parseInt(dados.hora.split(':')[0]) + parseInt(dados.hora.split(':')[1]) / 60;
        const d = new Date(dados.ano, dados.mes, dados.dia);
        const dataISO = formatDateLocal(d);

        const payload = {
            paciente: dados.paciente,
            pacienteId: dados.pacienteId,
            tipo: dados.tipo,
            timeStart: horaNum,
            duracao: parseInt(dados.duracao),
            data: dataISO,
            obs: dados.obs,
            recorrencia: dados.recorrencia,
            status: dados.status || 'confirmado',
            reminderEnabled: dados.reminderEnabled !== false,
        };

        const qtd = parseInt(dados.qtdReplicar) || 1;

        if (consultaEditando && consultaEditando.id) {
            // 1. Atualiza a consulta atual
            updateAppointment(consultaEditando.id, payload);
            showToast(`Consulta de ${dados.paciente} atualizada!`, 'success');

            // 2. Se mudou para recorrente na edição, cria as PRÓXIMAS (N-1)
            if (qtd > 1 && dados.recorrencia !== 'unica') {
                const loteExtra = [];
                for (let i = 1; i < qtd; i++) { // Começa em 1 pois a 0 é a que acabamos de atualizar
                    const dLoop = new Date(dados.ano, dados.mes, dados.dia);
                    if (dados.recorrencia === 'semanal') dLoop.setDate(dLoop.getDate() + (i * 7));
                    else if (dados.recorrencia === 'quinzenal') dLoop.setDate(dLoop.getDate() + (i * 14));
                    else if (dados.recorrencia === 'mensal') dLoop.setMonth(dLoop.getMonth() + i);

                    loteExtra.push({
                        ...payload,
                        data: formatDateLocal(dLoop)
                    });
                }
                if (loteExtra.length > 0) {
                    addAppointment(loteExtra, true);
                    showToast(`Mais ${loteExtra.length} sessões geradas!`, 'success');
                }
            }
            
            if (payload.status === 'concluido') {
                gerarFinanceiroConcluido({ ...payload, id: consultaEditando.id }, dados.pacienteId);
            }
        } else {
            // Criação de Nova Consulta
            if (qtd <= 1 || dados.recorrencia === 'unica') {
                addAppointment(payload).then(() => {
                    showToast(`Consulta agendada para ${dados.data}!`, 'success');
                });
            } else {
                const lote = [];
                for (let i = 0; i < qtd; i++) {
                    const dLoop = new Date(dados.ano, dados.mes, dados.dia);
                    if (dados.recorrencia === 'semanal') dLoop.setDate(dLoop.getDate() + (i * 7));
                    else if (dados.recorrencia === 'quinzenal') dLoop.setDate(dLoop.getDate() + (i * 14));
                    else if (dados.recorrencia === 'mensal') dLoop.setMonth(dLoop.getMonth() + i);

                    lote.push({
                        ...payload,
                        data: formatDateLocal(dLoop)
                    });
                }

                addAppointment(lote)
                    .then(() => showToast(`${qtd} consultas agendadas com sucesso!`, 'success'))
                    .catch(err => {
                        logger.error('[Agenda] Erro no agendamento em lote:', err);
                        showToast('Erro ao criar sessões recorrentes.', 'error');
                    });
            }
        }
        setConsultaEditando(null);
    };


    const abrirNovaConsulta = (diaOffset, hora = null) => {
        setConsultaEditando(null);
        let dataAgendamento = dataBase;
        if (diaOffset !== null && diaOffset !== undefined) {
            dataAgendamento = new Date(diasSemana[diaOffset]);
        }
        setDiaPreSel({ data: dataAgendamento, hora });
        setModalAberto(true);
    };

    const agendarDaFila = (item) => {
        setConsultaEditando(null);
        setPacienteParaAgenda({ nome: item.nome, duracao: parseInt(item.duracao) || 50 });
        setDiaPreSel({ data: new Date(), hora: null });
        setModalAberto(true);
    };

    const abrirEdicao = (c) => {
        setConsultaEditando(c);
        setModalAberto(true);
    };

    const excluirConsulta = (id) => {
        if (window.confirm('Excluir este agendamento?')) {
            deleteAppointment(id);
            showToast('Removido.', 'success');
        }
    };

    const mudarStatusConsulta = async (id, novoStatus) => {
        updateAppointment(id, { status: novoStatus });
        
        if (novoStatus === 'em_sessao') {
            const c = filteredAppointments.find(ap => ap.id === id);
            if (c) {
                if (confirm(`Deseja abrir a ficha de Evolução para ${c.paciente}? Dados do agendamento serão pré-preenchidos.`)) {
                    navigate('/prontuarios/evolucao/novo', { 
                        state: { 
                            pacienteId: c.pacienteId,
                            tipoAtendimento: c.tipo,
                            duracaoSessao: c.duracao,
                            agendamentoId: c.id
                        } 
                    });
                }
            }
        }

        if (novoStatus === 'concluido') {
            const c = filteredAppointments.find(ap => ap.id === id);
            if (c) {
                // Garantir que temos o ID do paciente, mesmo que o objeto venha com chaves diferentes
                const pId = c.pacienteId || c.patient_id || c.patientId;
                gerarFinanceiroConcluido(c, pId);
            }
        }
    };

    // ─── Drag and Drop Handlers ──────────────────────────────
    const handleDragStart = (e, appointmentId) => {
        e.dataTransfer.setData('appointmentId', appointmentId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dataDrop, horaDrop) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('appointmentId');
        if (!id) return;

        const appt = filteredAppointments.find(a => String(a.id) === String(id));
        if (!appt) return;

        const horaNum = horaDrop 
            ? parseInt(horaDrop.split(':')[0]) + parseInt(horaDrop.split(':')[1]) / 60
            : appt.timeStart;
            
        const dataISO = formatDateLocal(dataDrop);

        updateAppointment(appt.id, {
            data: dataISO,
            timeStart: horaNum
        });
        showToast('Agendamento movido!', 'success');
    };

    const handleTouchStart = (e, appointmentId) => {
        if (e.target.closest('button, a')) return;
        e.stopPropagation();
        const touch = e.touches[0];
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const ghost = card.cloneNode(true);
        Object.assign(ghost.style, {
            position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`,
            width: `${rect.width}px`, height: `${rect.height}px`,
            opacity: '0.85', zIndex: '9999', pointerEvents: 'none',
            transform: 'scale(1.05)', boxShadow: '0 14px 40px rgba(0,0,0,0.3)',
            transition: 'none', borderRadius: '10px',
        });
        document.body.appendChild(ghost);
        card.style.opacity = '0.35';
        touchDragRef.current = { id: appointmentId, ghost, card, offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top };
    };

    useEffect(() => {
        const onMove = (e) => {
            if (!touchDragRef.current) return;
            e.preventDefault();
            const { ghost, offsetX, offsetY } = touchDragRef.current;
            const t = e.touches[0];
            ghost.style.left = `${t.clientX - offsetX}px`;
            ghost.style.top  = `${t.clientY - offsetY}px`;
        };
        const onEnd = (e) => {
            if (!touchDragRef.current) return;
            const { id, ghost, card } = touchDragRef.current;
            const t = e.changedTouches[0];
            ghost.remove();
            card.style.opacity = '';
            touchDragRef.current = null;
            const under = document.elementFromPoint(t.clientX, t.clientY);
            const slot = under?.closest('[data-slot]');
            if (!slot) return;
            const dataDrop = slot.getAttribute('data-date');
            const hourDrop = slot.getAttribute('data-hour');
            const appt = _apptsRef.current.find(a => a.id === id || a.id === Number(id));
            if (!appt || !dataDrop) return;
            const horaNum = hourDrop
                ? parseInt(hourDrop.split(':')[0]) + parseInt(hourDrop.split(':')[1]) / 60
                : appt.timeStart;
            if (dataDrop === appt.data && horaNum === appt.timeStart) return;
            updateAppointment(appt.id, { data: dataDrop, timeStart: horaNum });
            showToast('Agendamento movido!', 'success');
        };
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
        return () => {
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
        };
    }, [updateAppointment]);

    const dataHojeISO = formatDateLocal(hoje);
    const consultasHoje = filteredAppointments.filter(c => c.data === dataHojeISO);
    const totalHoje = consultasHoje.length;
    const emSessao = consultasHoje.filter(c => c.status === 'em_sessao');
    const aguardando = consultasHoje.filter(c => c.status === 'aguardando');

    const weekNumber = useMemo(() => {
        const d = new Date(Date.UTC(diasSemana[0].getFullYear(), diasSemana[0].getMonth(), diasSemana[0].getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }, [diasSemana]);

    const celsMini = buildCalMini(calAno, calMes);
    const diaSelecionadoIdx = visao === 'dia' ? 0 : -1;

    return (
        <>
            <HelpModal 
                isOpen={showHelp} 
                onClose={() => setShowHelp(false)} 
                content={HELP_CONTENT.agenda}
                onStartTour={() => setShowTour(true)}
            />
            <NovoAgendamentoModal
                isOpen={modalAberto}
                onClose={() => { setModalAberto(false); setConsultaEditando(null); setNomePreCadastro(''); setPacienteParaAgenda(null); }}
                onSave={handleSalvarNovaConsulta}
                dataPreSelecionada={diaPreSel}
                consultaEditando={consultaEditando}
                pacientePreSelecionado={pacienteParaAgenda}
                onRegister={(nome) => {
                    setModalAberto(false);
                    setNomePreCadastro(nome);
                    setTimeout(() => setCadastroModalAberto(true), 100);
                }}
            />
            <CadastroPacienteModal 
                isOpen={cadastroModalAberto} 
                onClose={() => { setCadastroModalAberto(false); setNomePreCadastro(''); }} 
                onSave={(novoPaciente) => {
                    setCadastroModalAberto(false);
                    setNomePreCadastro('');
                    setTimeout(() => {
                        setPacienteParaAgenda(novoPaciente);
                        setModalAberto(true);
                    }, 500);
                } }
                paciente={pacienteParaCadastro}
            />
            <AgendaSettingsModal isOpen={settingsModalAberto} onClose={() => setSettingsModalAberto(false)} />
            <NovoNaFilaModal isOpen={filaModalAberto} onClose={() => setFilaModalAberto(false)} />

            <div className="flex flex-col xl:flex-row gap-4 h-auto xl:h-[calc(100vh-8.5rem)]">
                {/* Sidebar */}
                <aside className="w-full xl:w-56 shrink-0 flex flex-col gap-4 overflow-visible xl:overflow-y-auto">
                    <button
                        onClick={() => abrirNovaConsulta(null)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Novo Agendamento
                    </button>

                    <div className="glass dark:bg-slate-800/50 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                            <button onClick={() => { if (calMes === 0) { setCalMes(11); setCalAno(y => y - 1); } else setCalMes(m => m - 1); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">{MESES[calMes].slice(0, 3)} {calAno}</p>
                            <button onClick={() => { if (calMes === 11) { setCalMes(0); setCalAno(y => y + 1); } else setCalMes(m => m + 1); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {celsMini.map((cell, idx) => {
                                const dObj = cell.curr ? new Date(calAno, calMes, cell.d) : null;
                                const isHoje = cell.curr && format(dObj) === format(hoje);
                                const isSel = cell.curr && format(dObj) === format(dataBase);
                                return (
                                    <button key={idx} disabled={!cell.curr}
                                        onClick={() => { if (cell.curr) { selecionarData(dObj); setVisao('dia'); } }}
                                        className={`h-7 w-full flex items-center justify-center rounded-lg text-xs transition-all relative group
                                            ${!cell.curr ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300 hover:bg-primary/10'}
                                            ${isHoje && !isSel ? 'border border-primary text-primary font-bold' : ''}
                                            ${isSel ? 'bg-primary text-white font-bold' : ''}
                                        `}
                                    >
                                        {cell.d}
                                        {cell.curr && getConsultasDoDia(dObj).length > 0 && (
                                            <div className={`absolute bottom-1 size-1 rounded-full ${isSel ? 'bg-white' : 'bg-primary animate-pulse'}`} />
                                        )}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
                                            <div className="size-full rounded-lg ring-1 ring-primary/30" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass dark:bg-slate-800/50 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex-1 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fila de Espera</p>
                            <button onClick={() => setFilaModalAberto(true)} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-primary transition-colors">
                                <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                        </div>
                        <div className="space-y-2 overflow-y-auto no-scrollbar">
                            {waitingList.map((p) => (
                                <div key={p.id} className="p-3 glass dark:bg-slate-900 border-l-4 rounded-xl hover:border-primary/50 transition-all cursor-pointer group" style={{ borderLeftColor: p.bgBadge?.replace('bg-', '') || '#1392ec' }}>
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase truncate">{p.nome}</p>
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black text-white ${p.bgBadge || 'bg-primary'}`}>{p.prioridade}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500">{p.preferencia} · {p.duracao}</p>
                                    <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => agendarDaFila(p)} className="flex-1 py-1 text-[9px] font-bold bg-primary text-white rounded-md">Agendar</button>
                                        <button onClick={() => removeFromWaitingList(p.id)} className="px-2 py-1 text-[9px] font-bold text-slate-400 hover:text-red-500">Excluir</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Grade */}
                <main className="flex-1 glass dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col min-h-[500px] xl:min-h-0 overflow-hidden animate-settle">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 lg:px-6 py-4 border-b border-slate-100 dark:border-slate-800 gap-4">
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 400, letterSpacing: '-0.01em', color: '#1a1428', lineHeight: 1.3 }}>
                            {visao === 'mes' ? labelTopo() : (
                                <>{labelTopo()} · <em style={{ fontStyle: 'italic', color: '#c940a8', fontWeight: 300 }}>semana {weekNumber}</em></>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                                <button onClick={() => {
                                    const d = new Date(dataBase);
                                    if (visao === 'mes') { if (calMes === 0) { setCalMes(11); setCalAno(y => y - 1); } else setCalMes(m => m - 1); }
                                    else { d.setDate(d.getDate() - (visao === 'semana' ? 7 : 1)); selecionarData(d); }
                                }} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"><span className="material-symbols-outlined text-base">chevron_left</span></button>
                                <button onClick={() => selecionarData(hoje)} className="px-3 py-1 text-[10px] font-bold uppercase hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors">Hoje</button>
                                <button onClick={() => {
                                    const d = new Date(dataBase);
                                    if (visao === 'mes') { if (calMes === 11) { setCalMes(0); setCalAno(y => y + 1); } else setCalMes(m => m + 1); }
                                    else { d.setDate(d.getDate() + (visao === 'semana' ? 7 : 1)); selecionarData(d); }
                                }} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"><span className="material-symbols-outlined text-base">chevron_right</span></button>
                            </div>

                            <button 
                                onClick={() => setShowHelp(true)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-all border border-primary/10"
                            >
                                <span className="material-symbols-outlined text-lg">help_outline</span>
                                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Como funciona?</span>
                            </button>

                            <div id="tour-agenda-filter" className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                {['mes', 'semana', 'dia'].map(v => (
                                    <button key={v} onClick={() => setVisao(v)} className={`px-4 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${visao === v ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{v === 'mes' ? 'Mês' : v === 'semana' ? 'Semana' : 'Dia'}</button>
                                ))}
                            </div>
                            <button onClick={() => setSettingsModalAberto(true)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Configurações da Agenda">
                                <span className="material-symbols-outlined text-sm">settings</span>
                            </button>
                        </div>
                    </div>

                    {/* Chips de filtro */}
                    <div style={{ display: 'flex', gap: 8, padding: '12px 20px', borderBottom: '1px solid rgba(26,20,40,0.06)', overflowX: 'auto', flexShrink: 0 }}>
                        {[
                            { key: 'todos',      label: 'Todos',      dot: 'linear-gradient(135deg,#ff66c2,#8659e8)' },
                            { key: 'confirmado', label: 'Confirmado', dot: '#1f8a4d' },
                            { key: 'aguardando', label: 'Aguardando', dot: '#b68515' },
                            { key: 'em_sessao',  label: 'Em Sessão',  dot: '#ff66c2', pulse: true },
                            { key: 'concluido',  label: 'Concluído',  dot: '#8659e8' },
                        ].map(chip => {
                            const isActive = filtroStatus === chip.key;
                            const count = chip.key === 'todos'
                                ? appointments.length
                                : appointments.filter(a => a.status === chip.key).length;
                            return (
                                <button
                                    key={chip.key}
                                    onClick={() => setFiltroStatus(isActive && chip.key !== 'todos' ? 'todos' : chip.key)}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 7,
                                        padding: '6px 13px', borderRadius: 99, cursor: 'pointer',
                                        background: isActive ? 'linear-gradient(135deg,rgba(255,102,194,.12),rgba(134,89,232,.12))' : 'rgba(26,20,40,0.03)',
                                        border: `1px solid ${isActive ? 'rgba(255,102,194,.28)' : 'transparent'}`,
                                        color: isActive ? '#1a1428' : '#6b7280',
                                        fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                                        transition: 'all .15s',
                                    }}
                                >
                                    <span style={{
                                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                        background: chip.dot, display: 'inline-block',
                                        animation: chip.pulse && isActive ? 'pulseDot 1.4s infinite' : 'none',
                                    }} />
                                    {chip.label}
                                    <span style={{
                                        fontSize: 10, padding: '1px 7px', borderRadius: 99, fontWeight: 700,
                                        background: isActive ? 'rgba(255,255,255,.65)' : 'rgba(26,20,40,.06)',
                                        color: isActive ? '#c940a8' : '#6b7280',
                                    }}>{count}</span>
                                </button>
                            );
                        })}
                        <style>{`@keyframes pulseDot{50%{opacity:.35}}`}</style>
                    </div>

                    <div id="tour-calendar" ref={gridRef} className="flex-1 overflow-auto no-scrollbar">
                        {visao === 'mes' ? (
                            <div className="grid grid-cols-7 h-full min-w-[700px] xl:min-w-0">
                                {DIAS_CAL.map((d, i) => <div key={i} className="py-2 text-center text-[10px] font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 uppercase border-b border-slate-100 dark:border-slate-800">{d}</div>)}
                                {buildCalMini(calAno, calMes).map((cell, idx) => {
                                    const dateObj = new Date(calAno, calMes, cell.d);
                                    if (!cell.curr) {
                                        // Ajuste para dias do mês anterior/próximo
                                        if (cell.d > 20) dateObj.setMonth(calMes - 1);
                                        else dateObj.setMonth(calMes + 1);
                                    }
                                    const dateISO = formatDateLocal(dateObj);
                                    const diaConsultas = appointments.filter(c => c.data === dateISO);
                                    const isHoje = format(dateObj) === format(hoje);
                                    return (
                                        <div key={idx}
                                            onClick={() => { if (cell.curr) { selecionarData(dateObj); setVisao('dia'); } }}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, dateObj, null)}
                                            data-slot=""
                                            data-date={dateISO}
                                            className={`min-h-[110px] p-2 border-r border-b border-slate-100 dark:border-slate-800 transition-colors group relative ${!cell.curr ? 'opacity-30 bg-slate-50/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer'}`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-xs font-bold ${isHoje ? 'bg-primary text-white size-6 flex items-center justify-center rounded-full shadow-md shadow-primary/30' : 'text-slate-500 font-bold group-hover:text-primary transition-colors'}`}>{cell.d}</span>
                                                {diaConsultas.length > 0 && <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{diaConsultas.length}</span>}
                                            </div>
                                            <div className="space-y-1">
                                                {filteredAppointments.filter(c => c.data === dateISO).slice(0, 4).map(c => {
                                                    const s = STATUS_CFG[c.status] || STATUS_CFG.confirmado;
                                                    const t = TYPE_CFG[c.tipo?.toLowerCase()] || TYPE_CFG.presencial;
                                                    return (
                                                        <div key={c.id}
                                                            draggable="true"
                                                            onDragStart={(e) => handleDragStart(e, c.id)}
                                                            onTouchStart={(e) => handleTouchStart(e, c.id)}
                                                            className={`px-2 py-1 rounded-lg text-[10px] font-bold truncate uppercase flex items-center gap-1.5 shadow-sm border transition-all hover:scale-[1.02] ${t.bg} ${t.text} ${s.border}`}>
                                                            <span className="material-symbols-outlined text-[10px] opacity-70">{t.icon}</span>
                                                            <span className="truncate flex-1">{safeRender(c.paciente).split(' ')[0]}</span>
                                                        </div>
                                                    );
                                                })}
                                                {diaConsultas.length > 4 && <p className="text-[9px] text-slate-400 font-black text-center mt-1 uppercase tracking-tighter bg-slate-100 dark:bg-slate-800/50 py-0.5 rounded">+{diaConsultas.length - 4} AGENDAMENTOS</p>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="min-w-max">
                                <div className="grid sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800" style={{ gridTemplateColumns: `60px repeat(${visao === 'semana' ? 7 : 1}, 200px)` }}>
                                    <div className="p-2" />
                                    {(visao === 'semana' ? diasSemana : [dataBase]).map((d, i) => {
                                        const isHoje = format(d) === format(hoje);
                                        return (
                                            <div key={i} style={{
                                                padding: '12px 8px', textAlign: 'center',
                                                borderLeft: '1px solid rgba(26,20,40,0.06)',
                                                borderBottom: isHoje ? 'none' : undefined,
                                                background: isHoje ? 'linear-gradient(180deg,rgba(255,102,194,0.06) 0%,transparent 100%)' : undefined,
                                                position: 'relative',
                                            }}>
                                                {isHoje && (
                                                    <span style={{
                                                        position: 'absolute', bottom: -1, left: '12%', right: '12%',
                                                        height: 2, background: 'linear-gradient(90deg,#ff66c2,#8659e8)',
                                                        borderRadius: 2, display: 'block',
                                                    }} />
                                                )}
                                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: isHoje ? '#c940a8' : '#9ca3af' }}>
                                                    {DIAS_SEMANA[d.getDay() === 0 ? 6 : d.getDay() - 1]}
                                                </p>
                                                <p style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-0.01em', marginTop: 4, color: isHoje ? '#c940a8' : '#374151' }}>
                                                    {d.getDate()}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="relative" style={{ minWidth: 'fit-content' }}>
                                    {mostrarLinha && (
                                        <div style={{
                                            position: 'absolute', left: 60, right: 0, top: linhaAgoraTop,
                                            height: 0, borderTop: '2px solid #ff66c2', zIndex: 20, pointerEvents: 'none',
                                        }}>
                                            <span style={{
                                                position: 'absolute', left: -6, top: -6,
                                                width: 10, height: 10, borderRadius: '50%',
                                                background: '#ff66c2',
                                                boxShadow: '0 0 0 4px rgba(255,102,194,0.2)',
                                                display: 'block',
                                            }} />
                                        </div>
                                    )}
                                    <div className="grid" style={{ gridTemplateColumns: `60px repeat(${visao === 'semana' ? 7 : 1}, 200px)` }}>
                                        <div className="border-r border-slate-100 dark:border-slate-800">
                                            {HORAS.map((h, i) => <div key={i} className="px-2 pt-1 text-[10px] font-bold text-slate-300 text-right" style={{ height: SLOT_H }}>{h}</div>)}
                                        </div>
                                        {(visao === 'semana' ? diasSemana : [dataBase]).map((dia, dIdx) => {
                                            const isHoje = format(dia) === format(hoje);
                                            return (
                                                <div key={dIdx} className={`relative border-l border-slate-100 dark:border-slate-800 ${isHoje ? 'bg-primary/[0.03] dark:bg-primary/10' : ''}`}>
                                                    {HORAS.map((h, hIdx) => (
                                                        <div
                                                            key={hIdx}
                                                            onClick={() => abrirNovaConsulta(visao === 'semana' ? dIdx : null, h)}
                                                            onDragOver={handleDragOver}
                                                            onDrop={(e) => handleDrop(e, dia, h)}
                                                            data-slot=""
                                                            data-date={formatDateLocal(dia)}
                                                            data-hour={h}
                                                            className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-primary/5 cursor-pointer transition-colors"
                                                            style={{ height: SLOT_H }}
                                                        />
                                                    ))}
                                                    {getConsultasDoDia(dia).map((c, idx) => {
                                                        const sCfg = STATUS_CFG[c.status] || STATUS_CFG.confirmado;
                                                        const isOnline = c.tipo === 'teleconsulta' || c.tipo === 'online' || c.type === 'teleconsulta';
                                                        const hh = String(Math.floor(c.timeStart)).padStart(2,'0');
                                                        const mm = String(Math.round((c.timeStart % 1) * 60)).padStart(2,'0');

                                                        return (
                                                            <div
                                                                key={c.id}
                                                                draggable="true"
                                                                onDragStart={(e) => handleDragStart(e, c.id)}
                                                                onTouchStart={(e) => handleTouchStart(e, c.id)}
                                                                onClick={(e) => { e.stopPropagation(); abrirEdicao(c); }}
                                                                className="group"
                                                                style={{
                                                                    position: 'absolute', left: 4, right: 4,
                                                                    top: (c.timeStart - H_INICIO) * SLOT_H + 2,
                                                                    height: (c.duracao / 60) * SLOT_H - 4,
                                                                    padding: '5px 8px',
                                                                    borderRadius: 10,
                                                                    border: `1px solid ${sCfg.cardBorder}`,
                                                                    background: sCfg.cardBg,
                                                                    color: sCfg.cardColor,
                                                                    overflow: 'hidden',
                                                                    cursor: 'pointer',
                                                                    zIndex: 1,
                                                                    transition: 'transform .15s, box-shadow .15s',
                                                                }}
                                                                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 14px -6px rgba(0,0,0,0.14)'; e.currentTarget.style.zIndex=30; }}
                                                                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; e.currentTarget.style.zIndex=1; }}
                                                            >
                                                                {/* Online badge */}
                                                                {isOnline && (
                                                                    <span style={{
                                                                        position: 'absolute', top: 5, right: 5,
                                                                        width: 14, height: 14, borderRadius: '50%',
                                                                        background: 'rgba(59,130,246,0.16)', color: '#3b82f6',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9,
                                                                    }}>
                                                                        <span className="material-symbols-outlined" style={{ fontSize: 10 }}>videocam</span>
                                                                    </span>
                                                                )}

                                                                {/* Ações rápidas (hover) */}
                                                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-20" style={{ top: isOnline ? 20 : 4 }}>
                                                                    {c.status === 'confirmado' && (
                                                                        <button onClick={(e) => { e.stopPropagation(); mudarStatusConsulta(c.id, 'aguardando'); }}
                                                                            className="size-5 flex items-center justify-center bg-white/95 rounded-md shadow-sm text-amber-500 hover:scale-110 transition-all" title="Chegou">
                                                                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>hail</span>
                                                                        </button>
                                                                    )}
                                                                    {c.status === 'aguardando' && (
                                                                        <button onClick={(e) => { e.stopPropagation(); mudarStatusConsulta(c.id, 'em_sessao'); }}
                                                                            className="size-5 flex items-center justify-center bg-white/95 rounded-md shadow-sm text-emerald-500 hover:scale-110 transition-all" title="Iniciar">
                                                                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>play_arrow</span>
                                                                        </button>
                                                                    )}
                                                                    {(c.status === 'em_sessao' || c.status === 'confirmado' || c.status === 'aguardando') && (
                                                                        <button onClick={(e) => { e.stopPropagation(); mudarStatusConsulta(c.id, 'concluido'); }}
                                                                            className="size-5 flex items-center justify-center bg-white/95 rounded-md shadow-sm text-emerald-600 hover:scale-110 transition-all" title="Concluir (gera receita)">
                                                                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check</span>
                                                                        </button>
                                                                    )}
                                                                    {(() => {
                                                                        const p = patients.find(pat => pat.id === c.pacienteId);
                                                                        if (!p?.phone) return null;
                                                                        const link = generateWhatsAppLink(p.phone, messages.reminder(p.nome, `${hh}:${mm}`));
                                                                        return (
                                                                            <a href={link} target="_blank" rel="noopener noreferrer"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="size-5 flex items-center justify-center bg-[#25D366] text-white rounded-md shadow-sm hover:scale-110 transition-all" title="WhatsApp">
                                                                                <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, fill: '#fff' }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                                                            </a>
                                                                        );
                                                                    })()}
                                                                </div>

                                                                {/* Hora */}
                                                                <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.04em', opacity: 0.8, marginBottom: 1 }}>
                                                                    {c.status === 'em_sessao' && (
                                                                        <span style={{ marginRight: 4, animation: 'pulseDot 1.2s infinite' }}>● REC</span>
                                                                    )}
                                                                    {hh}:{mm}
                                                                </div>

                                                                {/* Nome */}
                                                                <div style={{
                                                                    fontWeight: 600, fontSize: 11, lineHeight: 1.2,
                                                                    textDecoration: sCfg.strikethrough ? 'line-through' : 'none',
                                                                    textDecorationColor: 'rgba(134,89,232,0.4)',
                                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                                    display: 'flex', alignItems: 'center', gap: 3,
                                                                }}>
                                                                    {safeRender(c.paciente)}
                                                                    {debitosPacientes[c.paciente] && (
                                                                        <span className="material-symbols-outlined" style={{ fontSize: 11, color: '#ef4444' }} title="Débito pendente">payments</span>
                                                                    )}
                                                                </div>

                                                                {/* Meta */}
                                                                <div style={{ fontSize: 10, opacity: 0.72, marginTop: 1 }}>
                                                                    {isOnline ? 'Online' : 'Presencial'} · {c.duracao} min
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Sidebar Direita */}
                <aside className="w-full xl:w-64 shrink-0 flex flex-col gap-4 overflow-visible xl:overflow-y-auto">
                    {/* Recepção agora */}
                    <div style={{ background: '#fff', border: '1px solid rgba(26,20,40,0.08)', borderRadius: 20, padding: 18, boxShadow: '0 2px 10px rgba(90,30,120,0.04)' }}>
                        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7a9e', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#c940a8' }}>schedule</span>
                            Recepção agora
                        </p>
                        {emSessao.length === 0 && aguardando.length === 0 ? (
                            <>
                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', color: '#1a1428', lineHeight: 1 }}>Livre</div>
                                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Nenhum paciente aguardando no check-in.</div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {emSessao.map(c => (
                                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(31,138,77,0.08)', border: '1px solid rgba(31,138,77,0.15)' }}>
                                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1f8a4d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{(c.paciente || '?').split(' ')[0]?.[0]}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 12, fontWeight: 600, color: '#1a1428', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{safeRender(c.paciente)}</p>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: '#1f8a4d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Em Atendimento</span>
                                        </div>
                                    </div>
                                ))}
                                {aguardando.map(c => (
                                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: '#fff', border: '1px solid rgba(26,20,40,0.08)' }}>
                                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(246,198,107,0.25)', color: '#b68515', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{(c.paciente || '?').split(' ')[0]?.[0]}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 12, fontWeight: 600, color: '#1a1428', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{safeRender(c.paciente)}</p>
                                            <span style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Aguardando</span>
                                        </div>
                                        <button onClick={() => mudarStatusConsulta(c.id, 'em_sessao')} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: '#1f8a4d', color: '#fff', border: 0, cursor: 'pointer' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>play_arrow</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Eficiência do dia */}
                    <div id="tour-agenda-stats" style={{ background: '#fff', border: '1px solid rgba(26,20,40,0.08)', borderRadius: 20, padding: 18, boxShadow: '0 2px 10px rgba(90,30,120,0.04)' }}>
                        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7a9e', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#c940a8' }}>bolt</span>
                            Eficiência do dia
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                            {[
                                { val: totalHoje, label: 'Hoje', ok: true },
                                { val: emSessao.length, label: 'Agora' },
                                { val: waitingList.length, label: 'Fila' },
                            ].map((s, i) => (
                                <div key={i} style={{ textAlign: 'center', padding: '12px 8px', background: 'rgba(251,247,255,1)', borderRadius: 14 }}>
                                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1, color: s.ok ? '#1f8a4d' : '#1a1428' }}>{s.val}</div>
                                    <div style={{ fontSize: 10, color: '#8b7a9e', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ height: 4, background: 'rgba(26,20,40,0.06)', borderRadius: 99, overflow: 'hidden', marginTop: 14 }}>
                            <div style={{ height: '100%', background: 'linear-gradient(90deg,#ff66c2,#8659e8)', borderRadius: 99, transition: 'width .4s', width: totalHoje > 0 ? `${(filteredAppointments.filter(c => c.data === dataHojeISO && c.status === 'concluido').length / totalHoje) * 100}%` : '0%' }} />
                        </div>
                    </div>

                    {!agendaBannerDismissed && (
                    <div style={{ background: 'linear-gradient(165deg, #1a1428 0%, #2e1e47 100%)', border: '1px solid transparent', borderRadius: 20, padding: 18, boxShadow: '0 2px 10px rgba(90,30,120,0.12)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                        {/* Pink glow blob */}
                        <div style={{ position: 'absolute', right: -40, top: -40, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,102,194,0.4), transparent 70%)', filter: 'blur(4px)', pointerEvents: 'none' }} />

                        <button onClick={dismissAgendaBanner} style={{ position: 'absolute', top: 14, right: 14, width: 22, height: 22, borderRadius: 7, background: 'rgba(255,255,255,0.08)', border: 0, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Dispensar">
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                        </button>

                        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ffb8e0', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#ffb8e0' }}>wifi</span>
                            Sincronização ativa
                        </p>

                        <p style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)', position: 'relative', marginBottom: 14 }}>
                            Seus pacientes recebem <strong style={{ color: '#ffb8e0', fontWeight: 500 }}>lembretes automáticos</strong> via WhatsApp e e-mail assim que são agendados, aumentando sua taxa de presença.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, position: 'relative' }}>
                            <button style={{ padding: '9px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 11, fontSize: 11.5, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#25d366' }}>chat</span> WhatsApp
                            </button>
                            <button style={{ padding: '9px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 11, fontSize: 11.5, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#b18bff' }}>mail</span> E-mail
                            </button>
                        </div>

                        <button
                            onClick={() => navigate('/configuracoes')}
                            style={{ marginTop: 10, width: '100%', padding: 11, background: 'linear-gradient(180deg,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0.06) 100%)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative' }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>settings</span>
                            Configurar mensagens
                        </button>
                    </div>
                    )}
                </aside>
            </div>

            <FeatureTour 
                isOpen={showTour} 
                steps={HELP_CONTENT.agenda.tourSteps} 
                onClose={() => {
                    setShowTour(false);
                    markAgendaTourCompleted();
                }}
                onComplete={() => {
                    setShowTour(false);
                    markAgendaTourCompleted();
                    alert("Agenda configurada! Seu tempo agora está sob seu comando. ⏳");
                }}
            />
        </>
    );
};

export default Agenda;



