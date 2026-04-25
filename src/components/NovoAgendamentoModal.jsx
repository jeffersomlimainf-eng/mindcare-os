import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import { showToast } from './Toast';
import { usePatients } from '../contexts/PatientContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import Toggle from './Toggle';
import { appointmentReminderTemplate } from '../constants/emailTemplates';

import TimeWheelPicker from './ui/TimeWheelPicker';
import DurationWheelPicker from './ui/DurationWheelPicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema } from '../schemas/appointmentSchema';
import { formatDateLocal } from '../utils/date';
import { logger } from '../utils/logger';


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
    const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            pacienteId: '',
            paciente: '',
            data: '',
            hora: '09:00',
            duracao: 50,
            tipo: 'presencial',
            recorrencia: 'unica',
            qtdReplicar: 4,
            status: 'confirmado',
            obs: '',
            dia: hoje.getDate(),
            mes: hoje.getMonth(),
            ano: hoje.getFullYear(),
            diaSemana: '',
            reminderEnabled: true
        }
    });

    const [pacienteBusca, setPacienteBusca] = useState('');
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    const [showSugestoes, setShowSugestoes] = useState(false);
    const [customHora, setCustomHora] = useState('');
    const [customDuracao, setCustomDuracao] = useState('');
    const [calAno, setCalAno] = useState(hoje.getFullYear());
    const [calMes, setCalMes] = useState(hoje.getMonth());
    const [diaSel, setDiaSel] = useState(hoje.getDate());
    const [sucesso, setSucesso] = useState(false);
    const [enviandoEmail, setEnviandoEmail] = useState(false);
    const [erroPaciente, setErroPaciente] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [isDurationPickerOpen, setIsDurationPickerOpen] = useState(false);
    const timePickerRef = useRef(null);
    const durationPickerRef = useRef(null);

    // Fechar ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
                setIsTimePickerOpen(false);
            }
            if (durationPickerRef.current && !durationPickerRef.current.contains(event.target)) {
                setIsDurationPickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);



    // Watchers para lógica condicional na UI
    const formValues = watch();
    const { tipo, hora, duracao, recorrencia, status, obs, reminderEnabled: lembreteAtivo } = formValues;

    // Helper para atualizar campos do form que dependem do estado interno da UI (calendário/paciente)
    useEffect(() => {
        const d = new Date(calAno, calMes, diaSel);
        const options = { shouldValidate: true, shouldDirty: true };
        setValue('dia', diaSel, options);
        setValue('mes', calMes, options);
        setValue('ano', calAno, options);
        setValue('data', formatDateLocal(d), options);
        setValue('diaSemana', d.toLocaleDateString('pt-BR', { weekday: 'long' }), options);
    }, [diaSel, calMes, calAno, setValue]);






    useEffect(() => {
        const options = { shouldValidate: true, shouldDirty: true };
        if (pacienteSelecionado) {
            setValue('pacienteId', pacienteSelecionado.id, options);
            setValue('paciente', pacienteSelecionado.nome, options);
        } else {
            setValue('pacienteId', '', options);
            setValue('paciente', pacienteBusca, options);
        }
    }, [pacienteSelecionado, pacienteBusca, setValue]);


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
            setErroPaciente(false);
            setPacienteBusca('');
            setPacienteSelecionado(null);
            reset();
            return;
        }

        if (consultaEditando) {
            const hInicio = consultaEditando.timeStart || 9;
            const h = Math.floor(hInicio);
            const m = Math.round((hInicio % 1) * 60);
            const horaStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            
            const finalDuracao = parseInt(consultaEditando.duracao) || 50;


            const [ano, mes, dia] = (consultaEditando.data || '').split('-').map(Number);

            if (!isNaN(ano)) {
                setCalAno(ano);
                setCalMes(mes - 1);
                setDiaSel(dia);
            }

            reset({
                pacienteId: consultaEditando.pacienteId || consultaEditando.patient_id || '',
                paciente: consultaEditando.paciente || '',
                tipo: consultaEditando.tipo || 'presencial',
                duracao: finalDuracao,
                recorrencia: consultaEditando.recorrencia || 'unica',
                qtdReplicar: 1,
                status: consultaEditando.status || 'confirmado',
                hora: (consultaEditando.hora === 'custom' ? '08:00' : (consultaEditando.hora || horaStr)) || '08:00',

                reminderEnabled: consultaEditando.reminderEnabled !== false,
                dia: dia,
                mes: mes - 1,
                ano: ano,
                data: consultaEditando.data,
                obs: consultaEditando.obs || '',
                diaSemana: new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', { weekday: 'long' })
            });


            setPacienteBusca(consultaEditando.paciente || '');
            if (consultaEditando.pacienteId) {
                const p = patients.find(item => item.id === consultaEditando.pacienteId);
                setPacienteSelecionado(p || null);
            }
        } else if (pacientePreSelecionado) {
            setPacienteBusca(pacientePreSelecionado.nome);
            setPacienteSelecionado(pacientePreSelecionado);
            
            const dSel = dataPreSelecionada?.data || dataPreSelecionada;
            if (dSel instanceof Date) {
                setDiaSel(dSel.getDate());
                setCalMes(dSel.getMonth());
                setCalAno(dSel.getFullYear());
            }

            reset({
                pacienteId: pacientePreSelecionado.id,
                paciente: pacientePreSelecionado.nome,
                tipo: 'presencial',
                hora: dataPreSelecionada?.hora || '09:00',
                duracao: 50,
                recorrencia: 'unica',
                qtdReplicar: 4,
                status: 'confirmado',
                obs: '',
                reminderEnabled: user?.configuracoes?.reminders_enabled !== false,
                dia: dSel instanceof Date ? dSel.getDate() : hoje.getDate(),
                mes: dSel instanceof Date ? dSel.getMonth() : hoje.getMonth(),
                ano: dSel instanceof Date ? dSel.getFullYear() : hoje.getFullYear(),
                data: formatDateLocal(dSel instanceof Date ? dSel : hoje),
                diaSemana: (dSel instanceof Date ? dSel : hoje).toLocaleDateString('pt-BR', { weekday: 'long' })
            });

        } else {
            reset({
                pacienteId: '',
                paciente: '',
                tipo: 'presencial',
                hora: dataPreSelecionada?.hora || '09:00',
                duracao: 50,
                recorrencia: 'unica',
                qtdReplicar: 4,
                status: 'confirmado',
                obs: '',
                reminderEnabled: user?.configuracoes?.reminders_enabled !== false,
                dia: hoje.getDate(),
                mes: hoje.getMonth(),
                ano: hoje.getFullYear(),
                data: formatDateLocal(hoje),
                diaSemana: hoje.toLocaleDateString('pt-BR', { weekday: 'long' })
            });

            const dSel = dataPreSelecionada?.data || dataPreSelecionada;
            if (dSel instanceof Date) {
                setDiaSel(dSel.getDate());
                setCalMes(dSel.getMonth());
                setCalAno(dSel.getFullYear());
            }
        }
    }, [isOpen, consultaEditando, pacientePreSelecionado, dataPreSelecionada, reset]);

    const selecionarPaciente = (p) => {
        setPacienteSelecionado(p);
        setPacienteBusca(p.nome);
        setShowSugestoes(false);
        setErroPaciente(false);
    };

    const handleSalvar = handleSubmit((data) => {
        // Ajustes finos de campos calculados/customizados
        const finalData = {
            ...data,
            // A rodinha de duração já envia o número correto
            duracao: Number(data.duracao) || 50,
            qtdReplicar: data.recorrencia !== 'unica' ? data.qtdReplicar : 1
        };



        onSave && onSave(finalData);

        if (!consultaEditando) {
            const dataBR = new Date(data.ano, data.mes, data.dia).toLocaleDateString('pt-BR');
            showToast(`Consulta agendada para ${dataBR} às ${finalData.hora}!`, 'success');
            setSucesso(true);
        } else {
            if (consultaEditando?.filaId) {
                removeFromWaitingList(consultaEditando.filaId);
            }
            onClose();
        }
    }, (errors) => {
        logger.warn('[NovoAgendamentoModal] Erros de validação:', errors);
        if (errors.pacienteId || errors.paciente) {
            setErroPaciente(true);
            showToast('Por favor, selecione um paciente na lista.', 'warning');
        } else {
            showToast('Verifique os campos obrigatórios.', 'warning');
        }
    });




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
                    html: appointmentReminderTemplate({
                        pacienteNome: pacienteSelecionado.nome,
                        data: dataFormatadaShort,
                        hora: horaStr,
                        tipo: tipo === 'presencial' ? 'Presencial (No Consultório)' : 'Teleconsulta (Videochamada)',
                        profissionalNome: nomeProf,
                        profissionalCrp: crp,
                        profissionalTelefone: telefoneProf
                    }),
                    fromName: nomeProf
                }
            });

            if (error) throw error;
            showToast('E-mail enviado com sucesso!', 'success');
        } catch (error) {
            logger.error('Erro ao enviar e-mail:', error);
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
                            className={`w-full h-12 pl-12 pr-4 rounded-xl transition-all outline-none text-sm border ${
                                erroPaciente 
                                    ? 'bg-red-50 border-red-500 ring-4 ring-red-500/10' 
                                    : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary'
                            }`}
                            placeholder="Buscar por nome ou código..."
                            value={pacienteBusca}
                            onChange={e => { 
                                setPacienteBusca(e.target.value); 
                                setPacienteSelecionado(null); 
                                setShowSugestoes(true);
                                setErroPaciente(false);
                            }}
                            onFocus={() => setShowSugestoes(true)}
                            onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
                        />
                        {erroPaciente && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-red-500 animate-in fade-in slide-in-from-right-2">
                                <span className="material-symbols-outlined text-sm">error</span>
                                <span className="text-[10px] font-black uppercase tracking-tight">Obrigatório</span>
                            </div>
                        )}
                        {pacienteSelecionado && !erroPaciente && (
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

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Coluna Esquerda: Calendário e Tempo */}
                    <div className="md:col-span-5 space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Data e Calendário</label>
                            <div className="border border-slate-200/60 rounded-[2rem] p-4 bg-slate-50/50 dark:bg-slate-800/20 backdrop-blur-sm">
                                {/* Nav Mês */}
                                <div className="flex items-center justify-between mb-4">
                                    <button type="button" onClick={mesAnterior} className="size-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-500 shadow-sm border border-transparent hover:border-slate-100">
                                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                                    </button>
                                    <p className="font-black text-xs text-slate-900 dark:text-slate-100 uppercase tracking-widest">
                                        {MESES[calMes]} {calAno}
                                    </p>
                                    <button type="button" onClick={proximoMes} className="size-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-500 shadow-sm border border-transparent hover:border-slate-100">
                                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                                    </button>
                                </div>

                                {/* Dias da semana */}
                                <div className="grid grid-cols-7 text-center mb-2">
                                    {DIAS_SEMANA.map((d, i) => (
                                        <div key={i} className="text-[9px] font-black uppercase text-slate-400 py-1">{d}</div>
                                    ))}
                                </div>

                                {/* Células do calendário */}
                                <div className="grid grid-cols-7 gap-1">
                                    {cells.map((cell, idx) => {
                                        const isHoje = cell.currentMonth && cell.dia === diaHoje && calMes === mesHoje && calAno === anoHoje;
                                        const isSel = cell.currentMonth && cell.dia === diaSel;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                disabled={!cell.currentMonth}
                                                onClick={() => cell.currentMonth && setDiaSel(cell.dia)}
                                                className={`
                                                    h-8 w-full flex items-center justify-center rounded-xl text-xs font-bold transition-all
                                                    ${!cell.currentMonth ? 'text-slate-200 dark:text-slate-700 cursor-default' : ''}
                                                    ${cell.currentMonth && !isSel && !isHoje ? 'text-slate-600 dark:text-slate-400 hover:bg-primary/10 cursor-pointer' : ''}
                                                    ${isHoje && !isSel ? 'bg-primary/5 text-primary ring-1 ring-inset ring-primary/30' : ''}
                                                    ${isSel ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105 z-10' : ''}
                                                `}
                                            >
                                                {cell.dia}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Hora e Duração */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Horário da Sessão</label>
                                <div className="relative" ref={timePickerRef}>
                                    <Controller
                                        name="hora"
                                        control={control}
                                        render={({ field }) => (
                                            <>
                                                <button 
                                                    type="button"
                                                    onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                                                    className={`flex items-center gap-3 w-full h-12 px-4 rounded-[1.25rem] bg-white dark:bg-slate-900 border-2 transition-all text-left ${isTimePickerOpen ? 'border-primary ring-4 ring-primary/10 shadow-lg' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 shadow-sm'}`}
                                                >
                                                    <span className={`material-symbols-outlined text-xl ${isTimePickerOpen ? 'text-primary' : 'text-slate-400'}`}>schedule</span>
                                                    <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                                                        {field.value && field.value !== 'custom' ? field.value : '08:00'}
                                                    </span>
                                                </button>

                                                {isTimePickerOpen && (
                                                    <div className="absolute top-full left-0 mt-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="shadow-2xl shadow-primary/20">
                                                            <TimeWheelPicker 
                                                                value={field.value} 
                                                                onChange={field.onChange} 
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    />
                                </div>

                            </div>



                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Duração</label>
                                <div className="relative" ref={durationPickerRef}>
                                    <Controller
                                        name="duracao"
                                        control={control}
                                        render={({ field }) => (
                                            <>
                                                <button 
                                                    type="button"
                                                    onClick={() => setIsDurationPickerOpen(!isDurationPickerOpen)}
                                                    className={`flex items-center gap-3 w-full h-12 px-4 rounded-[1.25rem] bg-white dark:bg-slate-900 border-2 transition-all text-left ${isDurationPickerOpen ? 'border-primary ring-4 ring-primary/10 shadow-lg' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 shadow-sm'}`}
                                                >
                                                    <span className={`material-symbols-outlined text-xl ${isDurationPickerOpen ? 'text-primary' : 'text-slate-400'}`}>hourglass_empty</span>
                                                    <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                                                        {parseInt(field.value) || 50} min
                                                    </span>
                                                </button>

                                                {isDurationPickerOpen && (
                                                    <div className="absolute top-full right-0 mt-2 z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                                        <div className="shadow-2xl shadow-primary/20">
                                                            <DurationWheelPicker 
                                                                value={field.value} 
                                                                onChange={field.onChange} 
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    />
                                </div>
                            </div>

                        </div>




                        {/* Data resumo */}
                        {diaSel && (
                            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-[1.5rem] transition-all">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <span className="material-symbols-outlined text-xl">event_available</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">Status da Agenda</p>
                                    <p className="text-xs font-black text-slate-900 dark:text-slate-100 capitalize truncate">
                                        {diaSemanaAtual}, {diaSel} de {MESES[calMes]} · {hora && hora !== 'custom' ? hora : '08:00'}
                                    </p>

                                </div>
                            </div>
                        )}
                    </div>

                    {/* Coluna Direita: Recorrência e Detalhes */}
                    <div className="md:col-span-7 space-y-6">
                        {/* Modalidade */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Tipo de Atendimento</label>
                            <div className="p-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-[1.75rem] flex relative overflow-hidden">
                                {[
                                    { value: 'presencial', label: 'Presencial', icon: 'person' },
                                    { value: 'online', label: 'Teleconsulta', icon: 'videocam' },
                                ].map(t => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => setValue('tipo', t.value)}
                                        className="relative flex-1 flex items-center justify-center gap-2 h-11 z-10 transition-colors"
                                    >
                                        {tipo === t.value && (
                                            <motion.div 
                                                layoutId="typeHighlight"
                                                className="absolute inset-0 bg-white dark:bg-slate-700 rounded-2xl shadow-md border border-slate-200/50 dark:border-slate-600/50"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className={`material-symbols-outlined text-lg relative z-20 ${tipo === t.value ? 'text-primary' : 'text-slate-400'}`}>{t.icon}</span>
                                        <span className={`text-[11px] font-black uppercase tracking-tight relative z-20 ${tipo === t.value ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{t.label}</span>
                                    </button>
                                ))}
                            </div>

                        </div>

                        {/* Recorrência */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Recorrência das Sessões</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'unica', label: 'Sessão Única', desc: 'Pontual', icon: 'event' },
                                    { value: 'semanal', label: 'Semanal', desc: `7 em 7 dias`, icon: 'event_repeat' },
                                    { value: 'quinzenal', label: 'Quinzenal', desc: '15 em 15 dias', icon: 'calendar_view_week' },
                                    { value: 'mensal', label: 'Mensal', desc: `Todo mês`, icon: 'calendar_month' },
                                ].map(r => (
                                    <label
                                        key={r.value}
                                        className={`flex items-center gap-3 p-2.5 rounded-[1.25rem] border-2 cursor-pointer transition-all ${recorrencia === r.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200'
                                            }`}
                                    >
                                        <input className="sr-only" type="radio" {...register('recorrencia')} value={r.value} />
                                        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${recorrencia === r.value ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                                            <span className="material-symbols-outlined text-base">{r.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[10px] font-black uppercase tracking-tight ${recorrencia === r.value ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{r.label}</p>
                                            <p className="text-[9px] font-bold text-slate-400 truncate">{r.desc}</p>
                                        </div>
                                        <div className={`size-3.5 rounded-full border-2 transition-all shrink-0 ${recorrencia === r.value ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-700'}`}>
                                            {recorrencia === r.value && <div className="size-1.5 bg-white rounded-full m-auto" style={{ marginTop: 2.5 }} />}
                                        </div>
                                    </label>
                                ))}
                            </div>
                            
                            {recorrencia !== 'unica' && (
                                <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm">repeat</span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Repetir por quantas {recorrencia === 'semanal' ? 'semanas' : recorrencia === 'quinzenal' ? 'quinzenas' : 'meses'}?</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="52" 
                                            {...register('qtdReplicar', { valueAsNumber: true })}
                                            className="w-16 h-10 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-primary outline-none focus:ring-4 focus:ring-primary/10 shadow-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            {consultaEditando && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Status do Agendamento</label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none group-focus-within:text-primary transition-colors">check_circle</span>
                                        <select
                                            className="w-full h-12 pl-10 pr-3 rounded-[1.25rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-sm font-bold text-slate-900 dark:text-slate-100 transition-all appearance-none"
                                            {...register('status')}
                                        >
                                            <option value="confirmado">Confirmado</option>
                                            <option value="aguardando">Aguardando</option>
                                            <option value="em_sessao">Em Sessão</option>
                                            <option value="concluido">Concluído</option>
                                            <option value="cancelado">Cancelado</option>
                                            <option value="faltou">Faltou</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Observações Privadas</label>
                                <textarea
                                    className="w-full rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-sm font-medium p-4 resize-none transition-all placeholder:text-slate-300 shadow-sm"
                                    rows={consultaEditando ? 2 : 3}
                                    placeholder="Detalhes importantes sobre a sessão..."
                                    {...register('obs')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2.5">
                            <Toggle value={lembreteAtivo} onChange={val => setValue('reminderEnabled', val)} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Lembretes</span>
                        </div>
                        {lembreteAtivo && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-500/20 animate-in fade-in zoom-in duration-300">
                                <span className="material-symbols-outlined text-[12px] font-bold">mail</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">Ativo</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {consultaEditando && (
                        <button 
                            type="button"
                            onClick={() => {
                                if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
                                    deleteAppointment(consultaEditando.id);
                                    showToast('Agendamento excluído com sucesso', 'info');
                                    onClose();
                                }
                            }}
                            className="h-12 px-6 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
                        >
                            Excluir
                        </button>
                    )}
                    <button type="button" onClick={onClose} className="h-12 px-6 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all">
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSalvar}
                        className="flex items-center gap-3 h-12 px-8 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.97] hover:-translate-y-0.5"
                    >
                        <span className="material-symbols-outlined text-lg">{consultaEditando ? 'save' : 'check_circle'}</span>
                        {consultaEditando ? 'Salvar Alterações' : 'Confirmar'}
                    </button>
                </div>
            </div>

        </Modal>
    );
};

export default NovoAgendamentoModal;



