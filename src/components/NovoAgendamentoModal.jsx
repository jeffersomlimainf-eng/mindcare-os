import { useState, useEffect, useRef, useMemo } from 'react';
import Modal from './Modal';
import { showToast } from './Toast';
import { usePatients } from '../contexts/PatientContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';

// HORAS estáticas removidas (agora dinâmicas via contexto)

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function buildCalendar(ano, mes) {
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const diasMesAnterior = new Date(ano, mes, 0).getDate();
    const cells = [];
    // dias do mês anterior (cinza)
    for (let i = primeiroDia - 1; i >= 0; i--) {
        cells.push({ dia: diasMesAnterior - i, currentMonth: false });
    }
    // dias do mês atual
    for (let d = 1; d <= diasNoMes; d++) {
        cells.push({ dia: d, currentMonth: true });
    }
    // completar até grid de 42
    let prox = 1;
    while (cells.length < 42) {
        cells.push({ dia: prox++, currentMonth: false });
    }
    return cells;
}

const NovoAgendamentoModal = ({ isOpen, onClose, onSave, dataPreSelecionada, consultaEditando, pacientePreSelecionado, onRegister }) => {
    const { patients } = usePatients();
    const { agendaSettings, removeFromWaitingList, deleteAppointment } = useAppointments();
    const { user } = useUser();

    const HORAS_DINAMICAS = useMemo(() => {
        const h = [];
        const ini = agendaSettings?.hInicio !== undefined ? agendaSettings.hInicio : 7;
        const fim = agendaSettings?.hFim !== undefined ? agendaSettings.hFim : 19;
        for (let i = ini; i <= fim; i++) {
            h.push(`${String(i).padStart(2, '0')}:00`);
            h.push(`${String(i).padStart(2, '0')}:30`);
        }
        return h;
    }, [agendaSettings]);

    const hoje = new Date();
    const [pacienteBusca, setPacienteBusca] = useState('');
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    const [showSugestoes, setShowSugestoes] = useState(false);
    const [tipo, setTipo] = useState('presencial');
    const [hora, setHora] = useState('09:00');
    const [customHora, setCustomHora] = useState('');
    const [duracao, setDuracao] = useState('50');
    const [customDuracao, setCustomDuracao] = useState('');
    const [recorrencia, setRecorrencia] = useState('unica');
    const [qtdReplicar, setQtdReplicar] = useState(4);
    const [status, setStatus] = useState('confirmado');
    const [obs, setObs] = useState('');
    const [calAno, setCalAno] = useState(hoje.getFullYear());
    const [calMes, setCalMes] = useState(hoje.getMonth());
    const [diaSel, setDiaSel] = useState(hoje.getDate());
    const [sucesso, setSucesso] = useState(false);
    const [enviandoEmail, setEnviandoEmail] = useState(false);
    const inputRef = useRef(null);

    // Sugestões filtradas (usando pacientes reais do contexto)
    const sugestoesFiltradas = useMemo(() => {
        if (!pacienteBusca) return [];
        return patients.filter(p =>
            (p.nome || '').toLowerCase().includes(pacienteBusca.toLowerCase()) ||
            String(p.id || '').toLowerCase().includes(pacienteBusca.toLowerCase())
        );
    }, [pacienteBusca, patients]);

    // Preenche campos ao abrir em modo edição ou com paciente pré-selecionado
    useEffect(() => {
        if (!isOpen) {
            setSucesso(false);
            return;
        }

        if (consultaEditando) {
            setPacienteBusca(consultaEditando.paciente || '');
            
            // Tentar restaurar o objeto do paciente selecionado se tivermos o ID
            if (consultaEditando.pacienteId) {
                const p = patients.find(item => item.id === consultaEditando.pacienteId);
                if (p) setPacienteSelecionado(p);
                else setPacienteSelecionado(null);
            } else {
                setPacienteSelecionado(null);
            }
            
            setTipo(consultaEditando.tipo || 'presencial');

            // Garantir que timeStart seja válido
            const hInicio = consultaEditando.timeStart || 9;
            const h = Math.floor(hInicio);
            const m = Math.round((hInicio % 1) * 60);
            const horaStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            
            if (HORAS_DINAMICAS.includes(horaStr)) {
                setHora(horaStr);
                setCustomHora('');
            } else {
                setHora('custom');
                setCustomHora(horaStr);
            }

            const duracaoVal = String(consultaEditando.duracao || 50);
            if (['30', '50', '60', '90', '120'].includes(duracaoVal)) {
                setDuracao(duracaoVal);
                setCustomDuracao('');
            } else {
                setDuracao('custom');
                setCustomDuracao(duracaoVal);
            }
            setRecorrencia(consultaEditando.recorrencia || 'unica');
            setStatus(consultaEditando.status || 'confirmado');
            setObs(consultaEditando.obs || '');

            // Corrigir: Inicializar calendário com a data da consulta
            if (consultaEditando.data) {
                const [ano, mes, dia] = consultaEditando.data.split('-').map(Number);
                if (!isNaN(ano) && !isNaN(mes) && !isNaN(dia)) {
                    setCalAno(ano);
                    setCalMes(mes - 1); // JS usa meses 0-11
                    setDiaSel(dia);
                }
            }
        } else if (pacientePreSelecionado) {
            setPacienteBusca(pacientePreSelecionado.nome);
            setPacienteSelecionado(pacientePreSelecionado);
            setTipo('presencial');
            setHora('09:00');
            setDuracao('50');
            setRecorrencia('unica');
            setObs('');
            const dSel = dataPreSelecionada?.data || dataPreSelecionada;
            if (dSel instanceof Date) {
                setDiaSel(dSel.getDate());
                setCalMes(dSel.getMonth());
                setCalAno(dSel.getFullYear());
                if (dataPreSelecionada?.hora) setHora(dataPreSelecionada.hora);
            }
        } else {
            // Reset total para novo agendamento limpo
            setPacienteBusca('');
            setPacienteSelecionado(null);
            setTipo('presencial');
            setHora('09:00');
            setDuracao('50');
            setRecorrencia('unica');
            setObs('');
            const dSel = dataPreSelecionada?.data || dataPreSelecionada;
            if (dSel instanceof Date) {
                setDiaSel(dSel.getDate());
                setCalMes(dSel.getMonth());
                setCalAno(dSel.getFullYear());
                if (dataPreSelecionada?.hora) setHora(dataPreSelecionada.hora);
            }
        }
    }, [isOpen, consultaEditando, pacientePreSelecionado, dataPreSelecionada]);

    useEffect(() => {
        const dSel = dataPreSelecionada?.data || dataPreSelecionada;
        if (dSel instanceof Date && !consultaEditando && !pacientePreSelecionado) {
            setDiaSel(dSel.getDate());
            setCalMes(dSel.getMonth());
            setCalAno(dSel.getFullYear());
            if (dataPreSelecionada?.hora) setHora(dataPreSelecionada.hora);
        }
    }, [dataPreSelecionada]);

    const selecionarPaciente = (p) => {
        setPacienteSelecionado(p);
        setPacienteBusca(p.nome);
        setShowSugestoes(false);
    };

    const handleSalvar = () => {
        if (!pacienteBusca) {
            showToast('Informe o paciente', 'warning');
            return;
        }
        const dataSelecionada = new Date(calAno, calMes, diaSel);
        const dataFormatada = dataSelecionada.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
        const diaSemana = dataSelecionada.toLocaleDateString('pt-BR', { weekday: 'long' });

        onSave && onSave({
            paciente: pacienteSelecionado?.nome || pacienteBusca,
            pacienteId: pacienteSelecionado?.id,
            tipo,
            hora: hora === 'custom' ? customHora : hora,
            duracao: duracao === 'custom' ? Math.max(1, parseInt(customDuracao) || 1) : parseInt(duracao),
            recorrencia,
            qtdReplicar: recorrencia !== 'unica' ? qtdReplicar : 1,
            status: consultaEditando ? status : 'confirmado',
            obs,
            data: dataFormatada,
            diaSemana,
            dia: diaSel,
            mes: calMes,
            ano: calAno,
        });

        if (!consultaEditando) {
            showToast(`Consulta agendada para ${dataFormatada} às ${hora === 'custom' ? customHora : hora}!`, 'success');
            setSucesso(true);
        } else {
            // Se veio da fila de espera, remove dela
            if (consultaEditando?.filaId) {
                removeFromWaitingList(consultaEditando.filaId);
            }
            onClose();
        }
    };

    const cells = buildCalendar(calAno, calMes);
    const diaHoje = hoje.getDate();
    const mesHoje = hoje.getMonth();
    const anoHoje = hoje.getFullYear();
    const diaSemanaAtual = new Date(calAno, calMes, diaSel).toLocaleDateString('pt-BR', { weekday: 'long' });

    const mesAnterior = () => {
        if (calMes === 0) { setCalMes(11); setCalAno(a => a - 1); }
        else setCalMes(m => m - 1);
        setDiaSel(1);
    };
    const proximoMes = () => {
        if (calMes === 11) { setCalMes(0); setCalAno(a => a + 1); }
        else setCalMes(m => m + 1);
        setDiaSel(1);
    };

    const handleWhatsAppManual = () => {
        if (!pacienteSelecionado?.telefone) {
            showToast('Paciente sem telefone cadastrado.', 'warning');
            return;
        }
        const foneLimpo = pacienteSelecionado.telefone.replace(/\D/g, '');
        const dataFormatadaShort = `${String(diaSel).padStart(2, '0')}/${String(calMes + 1).padStart(2, '0')}`;
        const horaStr = hora === 'custom' ? customHora : hora;
        const nomeProf = user?.clinic_name || user?.nome || 'Seu Psicólogo';
        const msg = `Olá, ${pacienteSelecionado.nome.split(' ')[0]}!\n\nPassando para confirmar nossa consulta:\n\n📅 *Data:* ${dataFormatadaShort}\n⏰ *Horário:* ${horaStr}\n📍 *Local:* ${tipo === 'presencial' ? 'Consultório' : 'Teleconsulta (Videochamada)'}\n\nAtenciosamente,\n*${nomeProf}*`;
        window.open(`https://wa.me/55${foneLimpo}?text=${encodeURIComponent(msg)}`, '_blank');
        onClose();
    };

    const handleEmailManual = async () => {
        if (!pacienteSelecionado?.email) {
            showToast('Paciente sem e-mail cadastrado.', 'warning');
            return;
        }
        setEnviandoEmail(true);
        const dataSelecionada = new Date(calAno, calMes, diaSel);
        const dataFormatadaShort = `${String(diaSel).padStart(2, '0')}/${String(calMes + 1).padStart(2, '0')}/${calAno}`;
        const horaStr = hora === 'custom' ? customHora : hora;
        
        const nomeProf = user?.clinic_name || user?.nome || 'Seu Psicólogo';
        const crp = user?.configuracoes?.crp || '';
        const telefoneProf = user?.telefone || '';

        try {
            const { error } = await supabase.functions.invoke('send-invoice-email', {
                body: {
                    to: pacienteSelecionado.email,
                    subject: `Consulta Confirmada - ${nomeProf}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <h2 style="color: #4f46e5; margin: 0; font-size: 22px; font-weight: 800;">Consulta Agendada!</h2>
                                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Olá, <strong>${pacienteSelecionado.nome}</strong>.</p>
                            </div>
                            
                            <p style="font-size: 15px; line-height: 1.6;">Sua próxima sessão está confirmada. Seguem os detalhes para que você possa se organizar:</p>
                            
                            <div style="background-color: #f8fafc; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #f1f5f9;">
                                <p style="margin: 0 0 8px 0; font-size: 14px;">📅 <strong>Data:</strong> ${dataFormatadaShort}</p>
                                <p style="margin: 0 0 8px 0; font-size: 14px;">⏰ <strong>Horário:</strong> ${horaStr}</p>
                                <p style="margin: 0; font-size: 14px;">📍 <strong>Tipo:</strong> ${tipo === 'presencial' ? 'Presencial (No Consultório)' : 'Teleconsulta (Videochamada)'}</p>
                            </div>

                            ${tipo === 'teleconsulta' 
                                ? `<p style="font-size: 14px; background-color: #eff6ff; color: #1d4ed8; padding: 12px; border-radius: 8px; font-weight: 500;">
                                    💻 O link da videochamada será enviado pelo seu profissional minutos antes do horário ou estará disponível no painel.
                                   </p>` 
                                : ''
                            }
                            
                            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
                                <p style="margin: 0 0 4px 0; font-weight: 700; color: #334155; font-size: 14px;">${nomeProf}</p>
                                ${crp ? `<p style="margin: 0 0 4px 0;">CRP: ${crp}</p>` : ''}
                                ${telefoneProf ? `<p style="margin: 0 0 4px 0;">📞 Contato: ${telefoneProf}</p>` : ''}
                            </div>
                            
                            <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #94a3b8;">
                                E-mail automático enviado pelo seu profissional de saúde.
                            </div>
                        </div>
                    `,
                    fromName: nomeProf
                }
            });

            if (error) throw error;
            showToast('E-mail enviado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            showToast('Erro ao enviar e-mail.', 'error');
        } finally {
            setEnviandoEmail(false);
        }
    };

    if (sucesso) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Agendamento Confirmado" icon="check_circle">
                <div className="p-4 md:p-8 flex flex-col items-center justify-center text-center">
                    <div className="size-16 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl">check</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900 mb-1">Consulta Agendada!</p>
                    <p className="text-sm text-slate-500 mb-6">Como deseja avisar o paciente sobre o agendamento?</p>
                    
                    <div className="flex flex-col gap-2 w-full">
                        {pacienteSelecionado?.telefone && (
                            <button 
                                onClick={handleWhatsAppManual}
                                className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <span className="material-symbols-outlined text-lg">chat_bubble</span>
                                Enviar Aviso por WhatsApp
                            </button>
                        )}
                        {pacienteSelecionado?.email && (
                            <button 
                                onClick={handleEmailManual}
                                disabled={enviandoEmail}
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-lg">{enviandoEmail ? 'hourglass_empty' : 'mail'}</span>
                                {enviandoEmail ? 'Enviando...' : 'Enviar Aviso por E-mail'}
                            </button>
                        )}
                        <button 
                            onClick={onClose}
                            className="w-full py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all mt-2"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}
            title={consultaEditando ? `Editando: ${consultaEditando.paciente || consultaEditando.pacienteNome || 'Consulta'}` : 'Nova Consulta'}
            icon={consultaEditando ? 'edit_calendar' : 'event_upcoming'}
            maxWidth="max-w-3xl"
        >
            <div className="p-7 space-y-6">

                {/* Busca de Paciente */}
                <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paciente</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">search</span>
                        <input
                            ref={inputRef}
                            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm transition-all"
                            placeholder="Buscar por nome ou código..."
                            value={pacienteBusca}
                            onChange={e => { setPacienteBusca(e.target.value); setPacienteSelecionado(null); setShowSugestoes(true); }}
                            onFocus={() => setShowSugestoes(true)}
                            onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
                        />
                        {pacienteSelecionado && (
                            <button
                                onClick={() => { setPacienteSelecionado(null); setPacienteBusca(''); inputRef.current?.focus(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        )}
                    </div>

                    {/* Dropdown de sugestões */}
                    {showSugestoes && pacienteBusca && (
                        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                            {sugestoesFiltradas.length > 0 ? (
                                <>
                                    {sugestoesFiltradas.map(p => (
                                        <button
                                            key={p.id}
                                            onMouseDown={() => selecionarPaciente(p)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left border-b border-slate-50 last:border-0"
                                        >
                                            <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                                                {p.nome.split(' ').slice(0, 2).map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{p.nome}</p>
                                                <p className="text-xs text-slate-400">{p.id} · Última: {p.ultimaConsulta}</p>
                                            </div>
                                            <span className="material-symbols-outlined text-primary text-sm">add_circle</span>
                                        </button>
                                    ))}
                                    <div className="p-2 bg-slate-50 border-t border-slate-100">
                                        <button 
                                            onMouseDown={() => onRegister?.(pacienteBusca)}
                                            className="w-full py-2 px-3 rounded-lg border border-dashed border-primary/30 text-primary text-xs font-bold hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">person_add</span>
                                            Não é nenhum destes? Cadastrar "{pacienteBusca}"
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 text-center">
                                    <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                        <span className="material-symbols-outlined text-slate-400">person_search</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-600 mb-1">Nenhum paciente encontrado</p>
                                    <p className="text-xs text-slate-400 mb-4">Deseja cadastrar "{pacienteBusca}" agora?</p>
                                    <button 
                                        onMouseDown={() => onRegister?.(pacienteBusca)}
                                        className="w-full py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-base">person_add</span>
                                        Cadastrar Novo Paciente
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Chip do paciente selecionado */}
                    {pacienteSelecionado && (
                        <div className="mt-2 flex items-center gap-2 p-2.5 bg-primary/5 border border-primary/20 rounded-xl">
                            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                {pacienteSelecionado.nome.split(' ').slice(0, 2).map(n => n[0]).join('')}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{pacienteSelecionado.nome}</p>
                                <p className="text-xs text-slate-400">{pacienteSelecionado.id} · {pacienteSelecionado.telefone}</p>
                            </div>
                            <span className="material-symbols-outlined text-primary ml-auto">check_circle</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    {/* Calendário */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data</label>
                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                            {/* Nav Mês */}
                            <div className="flex items-center justify-between mb-3">
                                <button onClick={mesAnterior} className="p-1.5 rounded-full hover:bg-white transition-colors text-slate-500">
                                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                                </button>
                                <p className="font-bold text-sm text-slate-900">
                                    {MESES[calMes]} {calAno}
                                </p>
                                <button onClick={proximoMes} className="p-1.5 rounded-full hover:bg-white transition-colors text-slate-500">
                                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                                </button>
                            </div>

                            {/* Dias da semana */}
                            <div className="grid grid-cols-7 text-center mb-1">
                                {DIAS_SEMANA.map((d, i) => (
                                    <div key={i} className="text-[10px] font-bold uppercase text-slate-400 py-1">{d}</div>
                                ))}
                            </div>

                            {/* Células do calendário */}
                            <div className="grid grid-cols-7 gap-0.5">
                                {cells.map((cell, idx) => {
                                    const isHoje = cell.currentMonth && cell.dia === diaHoje && calMes === mesHoje && calAno === anoHoje;
                                    const isSel = cell.currentMonth && cell.dia === diaSel;
                                    return (
                                        <button
                                            key={idx}
                                            disabled={!cell.currentMonth}
                                            onClick={() => cell.currentMonth && setDiaSel(cell.dia)}
                                            className={`
                        h-9 w-full flex items-center justify-center rounded-full text-sm font-medium transition-all
                        ${!cell.currentMonth ? 'text-slate-300 cursor-default' : ''}
                        ${cell.currentMonth && !isSel && !isHoje ? 'text-slate-700 hover:bg-primary/10 cursor-pointer' : ''}
                        ${isHoje && !isSel ? 'ring-2 ring-primary text-primary font-bold' : ''}
                        ${isSel ? 'bg-primary text-white font-bold shadow-md shadow-primary/30 scale-110' : ''}
                      `}
                                        >
                                            {cell.dia}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Hora e Duração */}
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="relative">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Horário</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">schedule</span>
                                    <select
                                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none"
                                        value={hora}
                                        onChange={e => setHora(e.target.value)}
                                    >
                                        {HORAS_DINAMICAS.map(h => <option key={h}>{h}</option>)}
                                        <option value="custom">Outro...</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duração</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">hourglass_empty</span>
                                    <select
                                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none"
                                        value={duracao}
                                        onChange={e => setDuracao(e.target.value)}
                                    >
                                        <option value="30">30 min</option>
                                        <option value="50">50 min</option>
                                        <option value="60">1 hora</option>
                                        <option value="90">1h 30min</option>
                                        <option value="120">2 horas</option>
                                        <option value="custom">Outro...</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Customizados Inputs */}
                        {(hora === 'custom' || duracao === 'custom') && (
                            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col gap-2">
                                {hora === 'custom' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500">Horário Manual:</span>
                                        <input 
                                            type="time" 
                                            value={customHora} 
                                            onChange={e => setCustomHora(e.target.value)} 
                                            className="px-2 py-1 text-sm font-bold border border-slate-200 rounded-lg text-primary outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                )}
                                {duracao === 'custom' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500">Duração (Minutos):</span>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            placeholder="Ex: 75" 
                                            value={customDuracao} 
                                            onChange={e => setCustomDuracao(e.target.value)} 
                                            className="w-20 px-2 py-1 text-sm font-bold border border-slate-200 rounded-lg text-primary outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                        <span className="text-[10px] text-slate-400">({Math.floor(parseInt(customDuracao || 0)/60)}h {parseInt(customDuracao || 0)%60}m)</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Data resumo */}
                        {diaSel && (
                            <div className="mt-3 flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                                <span className="material-symbols-outlined text-primary text-sm">event</span>
                                <span className="text-xs font-bold text-primary capitalize">
                                    {diaSemanaAtual}, {diaSel} de {MESES[calMes]} de {calAno} · {hora === 'custom' ? customHora : hora}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Tipo + Recorrência */}
                    <div className="space-y-5">
                        {/* Tipo de Atendimento */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tipo de Atendimento</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'presencial', label: 'Presencial', icon: 'person', desc: 'No consultório', active: 'border-primary bg-primary text-white shadow-lg shadow-primary/25', hover: 'hover:border-primary/40' },
                                    { value: 'teleconsulta', label: 'Teleconsulta', icon: 'videocam', desc: 'Videochamada', active: 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/25', hover: 'hover:border-emerald-500/40' },
                                ].map(t => (
                                    <button
                                        key={t.value}
                                        onClick={() => setTipo(t.value)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${tipo === t.value
                                            ? t.active
                                            : `border-slate-200 bg-white text-slate-500 ${t.hover}`
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-2xl`}>{t.icon}</span>
                                        <div className="text-center">
                                            <p className="text-sm font-bold">{t.label}</p>
                                            <p className={`text-[10px] ${tipo === t.value ? 'text-white/70' : 'text-slate-400'}`}>{t.desc}</p>
                                        </div>
                                    </button>
                                )) /* JSX Closed */}
                            </div>
                        </div>

                        {/* Recorrência */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recorrência</label>
                            <div className="space-y-2">
                                {[
                                    { value: 'unica', label: 'Sessão Única', desc: 'Agendamento pontual', icon: 'event' },
                                    { value: 'semanal', label: 'Semanal', desc: `Toda ${diaSemanaAtual}`, icon: 'event_repeat' },
                                    { value: 'quinzenal', label: 'Quinzenal', desc: 'A cada 15 dias', icon: 'calendar_view_week' },
                                    { value: 'mensal', label: 'Mensal', desc: `Todo dia ${diaSel}`, icon: 'calendar_month' },
                                ].map(r => (
                                    <label
                                        key={r.value}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${recorrencia === r.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-slate-200 bg-slate-50 hover:border-primary/30'
                                            }`}
                                    >
                                        <input className="sr-only" type="radio" name="recorrencia" value={r.value} checked={recorrencia === r.value} onChange={e => setRecorrencia(e.target.value)} />
                                        <span className={`material-symbols-outlined text-lg ${recorrencia === r.value ? 'text-primary' : 'text-slate-400'}`}>{r.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold ${recorrencia === r.value ? 'text-primary' : 'text-slate-700'}`}>{r.label}</p>
                                            <p className="text-[11px] text-slate-400 capitalize">{r.desc}</p>
                                        </div>
                                        <div className={`size-4 rounded-full border-2 transition-all shrink-0 ${recorrencia === r.value ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                                            {recorrencia === r.value && <div className="size-2 bg-white rounded-full m-auto" style={{ marginTop: 2 }} />}
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {recorrencia !== 'unica' && (
                                <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-primary">repeat</span>
                                        <span className="text-xs font-bold text-slate-700">Replicar esta consulta por:</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="52" 
                                            value={qtdReplicar} 
                                            onChange={e => setQtdReplicar(Math.max(1, Math.min(52, parseInt(e.target.value) || 1)))}
                                            className="w-16 h-8 text-center bg-white border border-slate-200 rounded-lg text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                        <span className="text-xs text-slate-500 font-medium">
                                            {recorrencia === 'semanal' ? 'semanas' : recorrencia === 'quinzenal' ? 'quinzenas' : 'meses'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status (Apenas na edição) */}
                        {consultaEditando && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status do Agendamento</label>
                                <select
                                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm transition-all"
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                >
                                    <option value="confirmado">Confirmado</option>
                                    <option value="aguardando">Aguardando</option>
                                    <option value="em_sessao">Em Sessão</option>
                                    <option value="concluido">Concluído</option>
                                    <option value="cancelado">Cancelado</option>
                                    <option value="faltou">Faltou</option>
                                </select>
                            </div>
                        )}

                        {/* Observações */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Observações</label>
                            <textarea
                                className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm p-3 resize-none transition-all"
                                rows={3}
                                placeholder="Primeira consulta, urgência, mobilidade reduzida..."
                                value={obs}
                                onChange={e => setObs(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-7 py-5 border-t border-slate-100 bg-slate-50 shrink-0">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="material-symbols-outlined text-sm">info</span>
                    <span>O paciente será notificado por e-mail e WhatsApp</span>
                </div>
                <div className="flex gap-3">
                    {consultaEditando && (
                        <button 
                            onClick={() => {
                                if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
                                    deleteAppointment(consultaEditando.id);
                                    showToast('Agendamento excluído com sucesso', 'info');
                                    onClose();
                                }
                            }}
                            className="px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            Excluir
                        </button>
                    )}
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSalvar}
                        className="flex items-center gap-2 px-7 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-base">{consultaEditando ? 'save' : 'check_circle'}</span>
                        {consultaEditando ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default NovoAgendamentoModal;
