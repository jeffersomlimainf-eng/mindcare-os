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

// ─── Constantes ──────────────────────────────────────────────
const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const DIAS_CAL = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const SLOT_H = 72; // px por hora


const STATUS_CFG = {
    confirmado: { label: 'Confirmado', bg: 'bg-blue-50/90 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', icon: 'check_circle', glow: 'shadow-blue-200/40', accent: 'bg-blue-500', badge: 'bg-blue-500 text-white' },
    aguardando: { label: 'Aguardando', bg: 'bg-amber-50/90 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', icon: 'schedule', glow: 'shadow-amber-200/40', accent: 'bg-amber-500', badge: 'bg-amber-500 text-white' },
    em_sessao: { label: 'Em Sessão', bg: 'bg-emerald-50/90 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', icon: 'play_circle', glow: 'shadow-emerald-200/40', accent: 'bg-emerald-500', badge: 'bg-emerald-500 text-white' },
    concluido: { label: 'Concluído', bg: 'bg-slate-50/90 dark:bg-slate-900/20', border: 'border-slate-300 dark:border-slate-700', text: 'text-slate-600 dark:text-slate-400', icon: 'task_alt', glow: 'shadow-slate-200/40', accent: 'bg-slate-400', badge: 'bg-slate-100/80 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
    cancelado: { label: 'Cancelado', bg: 'bg-red-50/90 dark:bg-red-950/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-400', icon: 'cancel', glow: 'shadow-red-200/40', accent: 'bg-red-500', badge: 'bg-red-500 text-white' },
    faltou: { label: 'Faltou', bg: 'bg-rose-50/90 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-300', icon: 'error', glow: 'shadow-rose-200/40', accent: 'bg-rose-500', badge: 'bg-rose-500 text-white' },
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
            if (t.status === 'Pendente' && t.tipo === 'Receita') {
                // Se a descrição contiver o nome do paciente ou se tivermos pacienteId na transação (futuro)
                // Por enquanto, vamos usar o nome do paciente na descrição para cruzar
                const nomePaciente = t.desc.split(' — ')[1];
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

    // Fechar modais locais da Agenda com Esc
    useGlobalShortcuts({
        isModalOpen: modalAberto || settingsModalAberto || filaModalAberto || cadastroModalAberto,
        closeModal: () => {
            if (modalAberto) { setModalAberto(false); setConsultaEditando(null); setNomePreCadastro(''); setPacienteParaAgenda(null); }
            if (settingsModalAberto) setSettingsModalAberto(false);
            if (filaModalAberto) setFilaModalAberto(false);
            if (cadastroModalAberto) { setCadastroModalAberto(false); setNomePreCadastro(''); }
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
    const gridRef = useRef(null);

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
    const mostrarLinha = format(agora) === format(dataBase) && visao !== 'mes' && horaAtual >= H_INICIO && horaAtual <= H_FIM + 1;

    function format(d) { return formatDateLocal(d); }

    const getConsultasDoDia = (diaDate) => {
        if (!diaDate) return [];
        const diaISO = formatDateLocal(diaDate);
        return appointments.filter(c => c.data === diaISO);
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
            const jaExiste = transactions.some(t => t.description === desc || t.desc === desc);
            
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
                        pacienteNome: c.paciente || c.patient_name
                    });
                    showToast('Lançamento no financeiro criado!', 'success');
                } catch (err) {
                    console.error('[Agenda] Erro ao lançar financeiro:', err);
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
        };

        if (consultaEditando) {
            updateAppointment(consultaEditando.id, payload);
            showToast(`Consulta de ${dados.paciente} atualizada!`, 'success');
            
            if (payload.status === 'concluido') {
                gerarFinanceiroConcluido(payload, dados.pacienteId);
            }
        } else {
            const qtd = dados.qtdReplicar || 1;
            const promises = [];

            for (let i = 0; i < qtd; i++) {
                const dLoop = new Date(dados.ano, dados.mes, dados.dia);
                if (dados.recorrencia === 'semanal') {
                    dLoop.setDate(dLoop.getDate() + (i * 7));
                } else if (dados.recorrencia === 'quinzenal') {
                    dLoop.setDate(dLoop.getDate() + (i * 14));
                } else if (dados.recorrencia === 'mensal') {
                    dLoop.setMonth(dLoop.getMonth() + i);
                }

                const payloadLoop = {
                    ...payload,
                    data: formatDateLocal(dLoop)
                };
                
                // silent=true para i > 0 (silencia banners repetidos)
                promises.push(addAppointment(payloadLoop, i > 0));
            }

            Promise.all(promises)
                .then(() => {
                    if (qtd > 1) showToast(`${qtd} consultas agendadas com sucesso!`, 'success');
                })
                .catch(err => {
                    console.error('[Agenda] Erro ao replicar:', err);
                    showToast('Algumas consultas não puderam ser agendadas.', 'error');
                });
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
        setConsultaEditando({
            paciente: item.nome,
            duracao: parseInt(item.duracao) || 50,
            status: 'confirmado',
        });
        setDiaPreSel(new Date());
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
            const c = appointments.find(ap => ap.id === id);
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
            const c = appointments.find(ap => ap.id === id);
            if (c) {
                gerarFinanceiroConcluido(c, c.pacienteId);
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

        const appt = appointments.find(a => a.id === Number(id));
        if (!appt) return;

        const horaNum = horaDrop 
            ? parseInt(horaDrop.split(':')[0]) + parseInt(horaDrop.split(':')[1]) / 60
            : appt.timeStart;
            
        const dataISO = formatDateLocal(dataDrop);

        updateAppointment(Number(id), {
            data: dataISO,
            timeStart: horaNum
        });
        showToast('Agendamento movido!', 'success');
    };

    const dataHojeISO = formatDateLocal(hoje);
    const consultasHoje = appointments.filter(c => c.data === dataHojeISO);
    const totalHoje = consultasHoje.length;
    const emSessao = consultasHoje.filter(c => c.status === 'em_sessao');
    const aguardando = consultasHoje.filter(c => c.status === 'aguardando');

    const celsMini = buildCalMini(calAno, calMes);
    const diaSelecionadoIdx = visao === 'dia' ? 0 : -1;

    return (
        <>
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
                                    <p className="text-[10px] text-slate-500">{p.preferencia} Â· {p.duracao}</p>
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
                        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">{labelTopo()}</h2>
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
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                {['mes', 'semana', 'dia'].map(v => (
                                    <button key={v} onClick={() => setVisao(v)} className={`px-4 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${visao === v ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{v === 'mes' ? 'Mês' : v === 'semana' ? 'Semana' : 'Dia'}</button>
                                ))}
                            </div>
                            <button onClick={() => setSettingsModalAberto(true)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Configurações da Agenda">
                                <span className="material-symbols-outlined text-sm">settings</span>
                            </button>
                        </div>
                    </div>

                    {/* Barra de Legenda */}
                    <div className="flex flex-wrap items-center gap-4 px-4 lg:px-6 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                        <div className="flex items-center gap-4 border-r border-slate-200 dark:border-slate-700 pr-4">
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-slate-400">person</span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Presencial</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-emerald-500">videocam</span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Online</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { status: 'confirmado', label: 'Confirmado' },
                                { status: 'aguardando', label: 'Aguardando' },
                                { status: 'em_sessao', label: 'Em Sessão' },
                                { status: 'concluido', label: 'Concluído' }
                            ].map((l, i) => {
                                const s = STATUS_CFG[l.status];
                                return (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <div className={`size-2 rounded-full ${s.bg.split(' ')[0]} border ${s.border}`} />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{l.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div ref={gridRef} className="flex-1 overflow-auto no-scrollbar">
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
                                            className={`min-h-[110px] p-2 border-r border-b border-slate-100 dark:border-slate-800 transition-colors group relative ${!cell.curr ? 'opacity-30 bg-slate-50/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer'}`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-xs font-bold ${isHoje ? 'bg-primary text-white size-6 flex items-center justify-center rounded-full shadow-md shadow-primary/30' : 'text-slate-500 font-bold group-hover:text-primary transition-colors'}`}>{cell.d}</span>
                                                {diaConsultas.length > 0 && <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{diaConsultas.length}</span>}
                                            </div>
                                            <div className="space-y-1">
                                                {diaConsultas.slice(0, 4).map(c => {
                                                    const s = STATUS_CFG[c.status] || STATUS_CFG.confirmado;
                                                    const t = TYPE_CFG[c.tipo?.toLowerCase()] || TYPE_CFG.presencial;
                                                    return (
                                                        <div key={c.id} 
                                                            draggable="true"
                                                            onDragStart={(e) => handleDragStart(e, c.id)}
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
                                            <div key={i} className={`py-3 text-center border-l border-slate-100 dark:border-slate-800 transition-colors ${isHoje ? 'bg-primary/5 dark:bg-primary/10 border-b-2 border-b-primary' : ''}`}>
                                                <p className={`text-[10px] font-bold uppercase ${isHoje ? 'text-primary' : 'text-slate-400'}`}>{DIAS_SEMANA[d.getDay() === 0 ? 6 : d.getDay() - 1]}</p>
                                                <p className={`text-lg font-bold mt-0.5 ${isHoje ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>{d.getDate()}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="relative" style={{ minWidth: 'fit-content' }}>
                                    {mostrarLinha && <div className="absolute left-0 right-0 z-20 border-t-2 border-red-500 pointer-events-none" style={{ top: `${linhaAgoraTop}px` }} />}
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
                                                            className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-primary/5 cursor-pointer transition-colors" 
                                                            style={{ height: SLOT_H }} 
                                                        />
                                                    ))}
                                                    {getConsultasDoDia(dia).map((c, idx) => {
                                                    const sCfg = STATUS_CFG[c.status] || STATUS_CFG.confirmado;
                                                    const tCfg = TYPE_CFG[c.type?.toLowerCase()] || TYPE_CFG[c.tipo?.toLowerCase()] || TYPE_CFG.presencial;
                                                    
                                                    return (
                                                        <div 
                                                            key={c.id} 
                                                            draggable="true"
                                                            onDragStart={(e) => handleDragStart(e, c.id)}
                                                            onClick={(e) => { e.stopPropagation(); abrirEdicao(c); }} 
                                                            className={`absolute left-1.5 right-1.5 rounded-2xl border p-3 border-transparent shadow-sm hover:z-30 cursor-pointer overflow-hidden transition-all hover:scale-[1.02] hover:shadow-md group ${tCfg.bg} ${tCfg.text} ${sCfg.glow}`} 
                                                            style={{ top: (c.timeStart - H_INICIO) * SLOT_H + 2, height: (c.duracao / 60) * SLOT_H - 4, animationDelay: `${idx * 30}ms` }}
                                                        >
                                                            {/* Barra de Status Lateral */}
                                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${sCfg.accent}`} />
                                                            
                                                            {/* Botões de Ação Rápida */}
                                                            <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-20">
                                                                {c.status === 'confirmado' && (
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); mudarStatusConsulta(c.id, 'aguardando'); }}
                                                                        className="size-6 flex items-center justify-center bg-white/95 hover:bg-white rounded-lg shadow-sm text-amber-500 hover:scale-105 hover:shadow-md transition-all font-bold"
                                                                        title="Chegou / Aguardando"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">hail</span>
                                                                    </button>
                                                                )}
                                                                {c.status === 'aguardando' && (
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); mudarStatusConsulta(c.id, 'em_sessao'); }}
                                                                        className="size-6 flex items-center justify-center bg-white/95 hover:bg-white rounded-lg shadow-sm text-emerald-500 hover:scale-105 hover:shadow-md transition-all font-bold"
                                                                        title="Iniciar Sessão"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className="flex justify-between items-start mb-0.5">
                                                                <p className="text-[11px] font-bold uppercase truncate leading-tight flex-1 flex items-center gap-1">
                                                                    {safeRender(c.paciente)}
                                                                    {debitosPacientes[c.paciente] && (
                                                                        <span className="material-symbols-outlined text-[12px] text-red-500 animate-pulse" title="Paciênte com débito pendente">payments</span>
                                                                    )}
                                                                </p>
                                                                <span className="material-symbols-outlined text-sm opacity-50">{tCfg.icon}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${sCfg.badge} shadow-sm shadow-${sCfg.bg.split('-')[1]}/20`}>
                                                                    {sCfg.label}
                                                                </span>
                                                                <p className="text-[10px] opacity-80 font-bold ml-1">
                                                                    {String(Math.floor(c.timeStart)).padStart(2, '0')}:{String(Math.round((c.timeStart % 1) * 60)).padStart(2, '0')}
                                                                </p>
                                                            </div>
                                                         </div>
                                                    )})}
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
                    <div className="glass dark:bg-slate-800/50 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Recepção</p>
                        <div className="space-y-3">
                            {emSessao.map(c => (
                                <div key={c.id} className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                    <div className="size-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{(c.paciente || c.pacienteNome || '?').split(' ')[0]?.[0]}</div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase truncate">{safeRender(c.paciente)}</p>
                                        <span className="text-[9px] font-bold text-emerald-600 uppercase">Em Atendimento</span>
                                    </div>
                                </div>
                            ))}
                            {aguardando.map(c => (
                                <div key={c.id} className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="size-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold shrink-0">{(c.paciente || c.pacienteNome || '?').split(' ')[0]?.[0]}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase truncate">{safeRender(c.paciente)}</p>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Aguardando</span>
                                    </div>
                                    <button onClick={() => mudarStatusConsulta(c.id, 'em_sessao')} className="size-7 flex items-center justify-center rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"><span className="material-symbols-outlined text-sm">play_arrow</span></button>
                                </div>
                            ))}
                            {emSessao.length === 0 && aguardando.length === 0 && <p className="text-center text-[10px] text-slate-400 font-bold uppercase py-4">Recepção Livre</p>}
                        </div>
                    </div>

                    <div className="glass dark:bg-slate-800/50 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Eficiência</p>
                        <div className="grid grid-cols-3 gap-2 text-center mb-4">
                            {[
                                { val: totalHoje, label: 'Hoje', col: 'text-primary' },
                                { val: emSessao.length, label: 'Agora', col: 'text-emerald-500' },
                                { val: waitingList.length, label: 'Fila', col: 'text-amber-500' },
                            ].map((s, i) => (
                                <div key={i} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <p className={`text-lg font-bold ${s.col}`}>{s.val}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">{s.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all" style={{ width: totalHoje > 0 ? `${(appointments.filter(c => c.status === 'concluido').length / totalHoje) * 100}%` : '0%' }} />
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
};

export default Agenda;
