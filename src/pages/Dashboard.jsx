import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NovoDocumentoModal from '../components/NovoDocumentoModal';
import AgendaSettingsModal from '../components/AgendaSettingsModal';
import { usePatients } from '../contexts/PatientContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { useEvolutions } from '../contexts/EvolutionContext';
import { useLaudos } from '../contexts/LaudoContext';
import { useAtestados } from '../contexts/AtestadoContext';
import { useDeclaracoes } from '../contexts/DeclaracaoContext';
import { useAnamneses } from '../contexts/AnamneseContext';
import { useEncaminhamentos } from '../contexts/EncaminhamentoContext';
import { useFinance } from '../contexts/FinanceContext';
import { useTcles } from '../contexts/TcleContext';
import { useUser } from '../contexts/UserContext';
import { handleNavegacaoDocumento } from '../utils/navigation';
import { checkAIAccess, trackAIConsumption } from '../utils/authMiddleware';
import { formatDateLocal } from '../utils/date';
import { safeRender } from '../utils/render';
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts';
import { useDashboardWeather } from '../hooks/useDashboardWeather';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useDashboardTasks } from '../hooks/useDashboardTasks';
import { useDashboardAgenda } from '../hooks/useDashboardAgenda';
import { INSIGHTS_PSICOLOGICOS } from '../data/insights';
import HelpModal from '../components/HelpModal';
import { HELP_CONTENT } from '../constants/helpContent';
import SmartTooltip from '../components/SmartTooltip';

import { logger } from '../utils/logger';
// PERF-04: ClockWidget isolado para evitar que o Dashboard inteiro re-renderize a cada segundo
const ClockWidget = React.memo(({ dadosClima, cidade, loadingClima, editandoCidade, setEditandoCidade, onCidadeChange, onAutoLocalizar }) => {
    const [hora, setHora] = React.useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setHora(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800/10 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 w-full md:w-auto md:self-center justify-center shadow-lg shadow-slate-100/50 dark:shadow-none hover:shadow-xl transition-all relative z-10 backdrop-blur-md">
            <div className="flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-4xl text-amber-500 animate-pulse">{dadosClima.icone}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dadosClima.condicao}</span>
            </div>
            <div className="h-12 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
            <div className="flex flex-col">
                <div className="flex items-baseline gap-0.5 relative">
                    {loadingClima && <span className="absolute -left-5 top-2 size-3 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>}
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{dadosClima.temp}°</span>
                    <span className="text-sm font-bold text-slate-400">C</span>
                    <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                    <div className="flex items-baseline gap-0.5" title="Hora atual">
                        <span className="text-2xl font-black text-slate-700 dark:text-slate-300">
                            {hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 ml-0.5 animate-pulse">
                            :{String(hora.getSeconds()).padStart(2, '0')}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {editandoCidade ? (
                        <input type="text" defaultValue={cidade} autoFocus
                            onBlur={(e) => { const nova = e.target.value.trim(); if (nova) onCidadeChange(nova); setEditandoCidade(false); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { const nova = e.target.value.trim(); if (nova) onCidadeChange(nova); setEditandoCidade(false); } }}
                            className="text-[10px] font-black text-slate-900 dark:text-white uppercase bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1 max-w-[110px] outline-none focus:border-primary"
                        />
                    ) : (
                        <span onClick={() => setEditandoCidade(true)} className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:text-primary transition-colors group" title="Clique para mudar a cidade">
                            <span className="material-symbols-outlined text-[12px] text-primary">location_on</span>
                            {cidade}
                            <span className="material-symbols-outlined text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                        </span>
                    )}
                    
                    {!editandoCidade && (
                        <button 
                            onClick={onAutoLocalizar}
                            className="p-1 hover:bg-primary/10 rounded-full text-slate-400 hover:text-primary transition-all flex items-center justify-center group/loc"
                            title="Detectar minha localização"
                        >
                            <span className="material-symbols-outlined text-[12px] group-hover/loc:scale-110">my_location</span>
                        </button>
                    )}
                </div>
                <div className="flex gap-3 mt-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    <span>💧 {dadosClima.umidade}%</span>
                    <span>💨 {dadosClima.vento} km/h</span>
                </div>
            </div>
        </div>
    );
});

const Dashboard = () => {
    const navigate = useNavigate();
    
    // Contextos
    const { patients } = usePatients();
    const { appointments, agendaSettings } = useAppointments();
    const { evolutions } = useEvolutions();
    const { laudos } = useLaudos();
    const { atestados } = useAtestados();
    const { declaracoes } = useDeclaracoes();
    const { anamneses } = useAnamneses();
    const { encaminhamentos } = useEncaminhamentos();
    const { user, updateUser } = useUser();
    const { getContasVencidas } = useFinance();
    const { tcles } = useTcles();

    // Notas Rápidas
    const [notas, setNotas] = useState(() => {
        const salva = localStorage.getItem('Meu Sistema PSI_dashboard_notes_v2');
        if (salva) {
            try { return JSON.parse(salva); } catch(e) { logger.error(e); }
        }
        return [{ id: '1', titulo: 'Geral', texto: '' }];
    });
    const [ativaNotaId, setAtivaNotaId] = useState(() => {
        const salva = localStorage.getItem('Meu Sistema PSI_dashboard_notes_v2');
        if (salva) {
            try { return JSON.parse(salva)[0]?.id || '1'; } catch(e) {}
        }
        return '1';
    });

    useEffect(() => {
        localStorage.setItem('Meu Sistema PSI_dashboard_notes_v2', JSON.stringify(notas));
    }, [notas]);

    const ativoNota = notas.find(n => n.id === ativaNotaId) || notas[0] || { texto: '' };
    const [loadingInsight, setLoadingInsight] = useState(false);
    
    // Hooks Personalizados
    const weather = useDashboardWeather();
    
    const textareaRef = useRef(null);

    const aplicarFormatacao = (prefixo, sufixo = '') => {
        const el = textareaRef.current;
        if (!el) return;
        const { selectionStart, selectionEnd, value } = el;
        const selecionado = value.substring(selectionStart, selectionEnd);
        const novoTexto = value.substring(0, selectionStart) + prefixo + selecionado + sufixo + value.substring(selectionEnd);
        
        setNotas(prev => prev.map(n => n.id === ativaNotaId ? { ...n, texto: novoTexto } : n));
        
        setTimeout(() => {
            if (el) {
                el.focus();
                el.setSelectionRange(selectionStart + prefixo.length, selectionEnd + prefixo.length);
            }
        }, 10);
    };

    const handleGerarInsights = async () => {
        // 1. Verificação de acesso à IA por plano
        const aiAccess = checkAIAccess(user);
        if (!aiAccess.allowed) {
            const estrutura = `\n⚠️ [Acesso Restrito]: ${aiAccess.reason}`;
            setNotas(prev => prev.map(n => n.id === ativaNotaId ? { ...n, texto: (ativoNota?.texto || '') + estrutura } : n));
            return;
        }

        const original = ativoNota?.texto || '';
        if (!original.trim()) {
            const estrutura = `\n🧠 [Sugestão de Estrutura]:\n• Queixa Principal/Sintomas: \n• Dinâmica/Mecanismos Ativados: \n• Intervenção/Conduta Adotada: \n• Plano para Próxima Sessão: \n---`;
            setNotas(prev => prev.map(n => n.id === ativaNotaId ? { ...n, texto: original + estrutura } : n));
            return;
        }

        setLoadingInsight(true);
        setNotas(prev => prev.map(n => n.id === ativaNotaId ? { ...n, texto: original + `

🧠 **[Análise Clínico-IA]** Gerando insights...` } : n));

        try {
            const nomePsicologo = user?.nome || 'Psicólogo(a)';
            const systemPrompt = `Você é o "Meu Sistema PSI AI Assist", parceiro clínico do(a) Dr(a). ${nomePsicologo}.
Seu trabalho é ler as notas rápidas (rascunhos) anotados sobre uma sessão ou paciente e estruturar insights clínicos úteis.
Retorne SEMPRE no seguinte formato (Markdown):

---
🧠 **[Análise Clínico-IA]**

**🔍 Hipóteses Táticas:**
• [Sua análise médica/psicológica]

**🛠️ Conduta Recomendada:**
• [Sugestões de intervenção em TCC ou geral]

**❓ Perguntas Chaves:**
• [O que investigar na próxima sessão]
---`;

            const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
            const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-assist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: `Aqui está o meu rascunho de nota:\n\n"${original}"\n\nPor favor, gere os insights clínicos.` }],
                    systemPrompt,
                    temperature: 0.5
                })
            });

            if (!response.ok) throw new Error(`Status ${response.status}: Falha de conexão na Edge Function`);
            const data = await response.json();

            if (data?.error) throw new Error(`Erro da IA: ${data.error}`);
            if (!data?.choices?.[0]) throw new Error('Resposta inesperada da IA.');

            const aiText = data.choices[0].message.content;

            for (let i = 0; i <= aiText.length; i += 4) {
                setNotas(prev => prev.map(n => n.id === ativaNotaId
                    ? { ...n, texto: original + `

` + aiText.slice(0, i) }
                    : n
                ));
                await new Promise(r => setTimeout(r, 10));
            }
            setNotas(prev => prev.map(n => n.id === ativaNotaId ? { ...n, texto: original + `

` + aiText } : n));

            trackAIConsumption((original.length + aiText.length) / 4, user, updateUser);

        } catch (error) {
            logger.error('Erro ao gerar insights:', error);
            const estrutura = `
🧠 [Sugestão de Estrutura]:
• Queixa Principal/Sintomas: 
• Dinâmica/Mecanismos Ativados: 
• Intervenção/Conduta Adotada: 
• Plano para Próxima Sessão: 
--- (Erro: ${error.message})`;
            setNotas(prev => prev.map(n => n.id === ativaNotaId ? { ...n, texto: original + estrutura } : n));
        } finally {
            setLoadingInsight(false);
        }
    };
    // Hooks Personalizados
    const agenda = useDashboardAgenda({ appointments, agendaSettings });
    const stats = useDashboardStats({ evolutions, laudos, atestados, declaracoes, anamneses, encaminhamentos, patients });
    const tasks = useDashboardTasks({ 
        atendimentosHoje: agenda.atendimentosHoje, 
        evolutions, 
        getContasVencidas, 
        patients, 
        tcles, 
        proximaSessao: agenda.proximaSessao, 
        appointments 
    });

    const [modalDoc, setModalDoc] = useState(false);
    const [novaTarefa, setNovaTarefa] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [tipoModalDoc, setTipoModalDoc] = useState(null);

    // Fechar modais locais do Dashboard com Esc
    useGlobalShortcuts({
        isModalOpen: modalDoc || helpOpen,
        closeModal: () => {
            setModalDoc(false);
            setHelpOpen(false);
        },
        priority: 1
    });

    // Jarvis Mode: Alerta de Risco Clínico
    const pacientesEmRisco = useMemo(() => {
        const riscos = (evolutions || [])
            .filter(ev => ev.nivelRisco === 'Alto' || ev.nivelRisco === 'Crítico')
            .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
        
        // Pegar apenas o risco mais recente por paciente
        const unicos = {};
        riscos.forEach(r => {
            if (!unicos[r.pacienteId]) unicos[r.pacienteId] = r;
        });
        return Object.values(unicos);
    }, [evolutions]);

    const formatarHora = (h) => {
        try {
            const numH = Number(h);
            if (isNaN(numH)) return '--:--';
            const hh = Math.floor(numH);
            const mm = Math.round((numH - hh) * 60);
            return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
        } catch (e) {
            return '--:--';
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <HelpModal 
                isOpen={helpOpen} 
                onClose={() => setHelpOpen(false)} 
                content={HELP_CONTENT.dashboard} 
            />

            <NovoDocumentoModal
                isOpen={modalDoc}
                onClose={() => setModalDoc(false)}
                tipoInicial={null}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-sm">space_dashboard</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Visão Geral</span>
                        </div>
                        <button 
                            onClick={() => setHelpOpen(true)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-all border border-primary/10 relative"
                        >
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="material-symbols-outlined text-[14px]">help_outline</span>
                            <span className="text-[9px] font-black uppercase tracking-tighter">Como funciona?</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Welcome Area Re-designed */}
            {/* Psiquê Smart Banner */}
            <div className="px-1 relative">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-gradient-to-r from-teal-500/10 via-primary/10 to-indigo-500/10 dark:from-teal-500/5 dark:via-primary/5 dark:to-indigo-500/5 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-10 md:p-14 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-14 group"
                >
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 blur-[60px] rounded-full translate-y-1/3 -translate-x-1/4"></div>

                    {/* Avatar Area */}
                    <div className="relative shrink-0 group/avatar flex items-center justify-center">
                        <div className="size-32 md:size-40 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl relative z-10 bg-white transition-transform duration-500 group-hover/avatar:scale-105">
                            <img 
                                src="/avatar_psique.png" 
                                alt="Psiquê AI" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        {/* Status badge - Re-positioned and styled */}
                        <div className="absolute -top-4 -right-2 z-20 bg-emerald-500 text-white text-[10px] font-black px-4 py-2 rounded-full border-2 border-white dark:border-slate-800 shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                            <span className="size-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                            PSIQUÊ ONLINE
                        </div>
                        
                        {/* Decorative glow */}
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 text-center md:text-left relative z-10 flex flex-col justify-center">
                        <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
                            {(() => {
                                const hora = new Date().getHours();
                                let saudacao = 'Olá';
                                if (hora < 12) saudacao = 'Bom dia';
                                else if (hora < 18) saudacao = 'Boa tarde';
                                else saudacao = 'Boa noite';
                                
                                // Pega o primeiro nome, mas evita o termo genérico 'Psicologo' que costuma vir do default
                                const nomeUsuario = user?.nome || '';
                                const isDefaultName = nomeUsuario.toLowerCase().includes('psicologo');
                                const displayNome = (nomeUsuario && !isDefaultName) 
                                    ? nomeUsuario.split(' ')[0] 
                                    : 'Doutor(a)';
                                    
                                return `${saudacao}, ${displayNome} ! 🦋`;
                            })()}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 font-medium text-lg leading-relaxed max-w-2xl">
                            {agenda.atendimentosHoje.length > 0 
                                ? `Preparei tudo para suas ${agenda.atendimentosHoje.length} sessões de hoje. Já organizei os prontuários e rastreei as pendências financeiras. Foco no atendimento, a burocracia é comigo!`
                                : "Enquanto você estava off, eu organizei o sistema. Hoje sua agenda está livre, aproveite para revisar prontuários ou planejar sua semana. Pode relaxar, eu cuido do backup!"
                            }
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-8">
                            <SmartTooltip 
                                content="Sua IA assistente! Peça resumos clínicos, insights para pacientes ou gerencie a agenda."
                                position="bottom"
                                icon="auto_awesome"
                                color="indigo"
                                showPulse={true}
                            >
                                <button 
                                    onClick={() => navigate('/ai-clinica')}
                                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 group/btn"
                                >
                                    <span className="material-symbols-outlined text-lg group-hover/btn:rotate-12 transition-transform">speech_to_text</span>
                                    Falar com Psiquê
                                </button>
                            </SmartTooltip>
                            <div className="px-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-white dark:border-slate-700 text-xs font-bold text-slate-500 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                                {agenda.atendimentosHoje.length > 0 ? `${agenda.atendimentosHoje.length} sessões preparadas` : "Sistema 100% atualizado"}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Próxima Sessão Card */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative overflow-hidden group min-h-[220px]">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all">
                            <span className="material-symbols-outlined text-[100px] text-primary rotate-12">calendar_today</span>
                        </div>
                        
                        <div className="flex-1 text-left w-full flex flex-col justify-center">
                            <div className="flex flex-col items-start gap-2 mb-3">
                                <span className="inline-flex px-3 py-1 bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Próxima Sessão • {agenda.proximaSessao ? formatarHora(agenda.proximaSessao.timeStart) : '--:--'}
                                </span>
                                <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wide">Tempo restante: <span className="text-slate-900 dark:text-white font-black italic">{agenda.tempoRestante || '---'}</span></span>
                            </div>
                            
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
                                {safeRender(agenda.proximaSessao?.paciente, 'Nenhum agendamento')}
                                {agenda.proximaSessao?.pacienteId && (
                                    <span className="text-slate-400 font-medium ml-2">
                                        , {(() => {
                                            const p = patients.find(pat => pat.id === agenda.proximaSessao.pacienteId);
                                            if (!p?.dataNascimento) return '29';
                                            const birth = new Date(p.dataNascimento);
                                            const age = new Date().getFullYear() - birth.getFullYear();
                                            return age;
                                        })()}
                                    </span>
                                )}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-base mb-6 capitalize">
                                {agenda.proximaSessao?.tipo || 'Sessão'} • {agenda.proximaSessao?.duracao || '50'} min
                            </p>

                            <div className="flex flex-wrap justify-start gap-3">
                                <button 
                                    onClick={() => agenda.proximaSessao && navigate('/prontuarios/evolucao/novo', { state: { pacienteId: agenda.proximaSessao.pacienteId || agenda.proximaSessao.paciente } })}
                                    className="h-10 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-orange-500/25 active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-xl">play_circle</span>
                                    Iniciar Sessão
                                </button>
                                <button 
                                    onClick={() => agenda.proximaSessao && navigate(`/linha-do-tempo/${agenda.proximaSessao.pacienteId?.replace('#', '') || agenda.proximaSessao.paciente}`)}
                                    className="h-10 px-6 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                                >
                                    Ver Prontuário
                                </button>
                            </div>
                        </div>

                        {/* PERF-04 FIX: ClockWidget isolado — só ele re-renderiza a cada segundo, não o Dashboard inteiro */}
                        <ClockWidget
                            dadosClima={weather.dadosClima}
                            cidade={weather.cidade}
                            loadingClima={weather.loadingClima}
                            editandoCidade={weather.editandoCidade}
                            setEditandoCidade={weather.setEditandoCidade}
                            onCidadeChange={(nova) => weather.setCidade(nova)}
                            onAutoLocalizar={weather.handleAutoLocalizar}
                        />
                    </div>

                    {/* Agenda de Hoje SideBlock */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-slate-900 dark:text-white font-black text-lg uppercase tracking-tight">Agenda de Hoje</h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded">{agenda.dataHojeFormatada}</span>
                        </div>

                        <div className="space-y-6 flex-1 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
                            {agenda.atendimentosHoje.map((a, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => navigate(`/prontuarios/paciente/${a.pacienteId?.replace('#', '') || a.paciente}`)}
                                    className="flex gap-4 relative cursor-pointer group/item"
                                >
                                    {/* Timeline line */}
                                    {i !== agenda.atendimentosHoje.length - 1 && <div className="absolute left-[7px] top-4 bottom-[-24px] w-0.5 bg-slate-100 dark:bg-slate-700"></div>}
                                    
                                    <div className={`size-4 rounded-full border-4 border-white dark:border-slate-800 shrink-0 z-10 mt-1 transition-transform group-hover/item:scale-125 ${a.status === 'finalizado' ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-600'}`}></div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[11px] font-bold ${a.status === 'finalizado' ? 'text-orange-500' : 'text-slate-500'}`}>
                                                {formatarHora(a.timeStart)} - {formatarHora(a.timeStart + a.duracao/60)}
                                            </span>
                                            {a.status === 'finalizado' ? (
                                                <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-slate-200 dark:text-slate-700 text-lg group-hover/item:text-primary transition-colors">arrow_forward</span>
                                            )}
                                        </div>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight mt-0.5 group-hover/item:text-primary transition-colors">{safeRender(a.paciente)}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                                            {a.tipo === 'teleconsulta' ? 'Teleconsulta' : 'Presencial'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {agenda.atendimentosHoje.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                    <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                                    <p className="text-xs font-bold uppercase">Nenhuma sessão hoje</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            {/* Jarvis Mode: Alertas Críticos */}
            {pacientesEmRisco.length > 0 && (
                <div className="px-1">
                    <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/50 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                            <span className="material-symbols-outlined text-6xl text-red-500 animate-pulse">monitoring</span>
                        </div>
                        <div className="size-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                            <span className="material-symbols-outlined text-2xl animate-pulse">warning</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                Jarvis Mode: Alerta de Segurança Clínica
                                <span className="size-1.5 rounded-full bg-red-500 animate-ping"></span>
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {pacientesEmRisco.map(r => (
                                    <button 
                                        key={r.id}
                                        onClick={() => navigate(`/prontuarios/paciente/${r.pacienteId.replace('#', '')}`)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-red-200 dark:border-red-800 hover:border-red-500 transition-all shadow-sm"
                                    >
                                        <div className="size-2 rounded-full bg-red-500"></div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-red-200">{safeRender(r.pacienteNome)}</span>
                                        <span className="text-[9px] font-black text-red-600 dark:text-red-400 uppercase">{r.nivelRisco}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
                {stats.stats.map((stat, index) => (
                    <button
                        key={index}
                        onClick={() => navigate(stat.rota)}
                        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all text-left group relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`size-12 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.color} transition-transform`}>
                                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide ${stat.trend.includes('+') ? 'bg-green-500/10 text-green-600' : stat.trend.includes('-') ? 'bg-red-500/10 text-red-600' : 'bg-slate-500/10 text-slate-400'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.title}</p>
                        <p className="text-slate-900 dark:text-white text-3xl font-bold">{stat.value}</p>
                    </button>
                ))}
            </div>


            {/* Quick Actions */}
            <section className="px-1">
                <div className="flex items-center gap-2 mb-6 opacity-60">
                    <span className="material-symbols-outlined text-primary text-base">bolt</span>
                    <h3 className="text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest">Ações Rápidas</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                if (action.categoria) {
                                    setTipoModalDoc(action.categoria);
                                    setModalDoc(true);
                                } else {
                                    navigate(action.path, { state: { categoria: action.categoria } });
                                }
                            }}
                            className="bg-white dark:bg-slate-800 flex items-center gap-4 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left group"
                        >

                            <div className={`size-12 rounded-lg ${action.bgColor} flex items-center justify-center ${action.color} shrink-0 relative`}>
                                <span className="material-symbols-outlined text-xl">{action.icon}</span>
                                {action.count >= 0 && (
                                    <span className="absolute -top-1 -right-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                                        {action.count}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-slate-900 dark:text-white font-bold text-sm truncate">{action.title}</p>
                                <p className="text-slate-500 text-[10px] uppercase truncate">{action.desc}</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-all">chevron_right</span>
                        </button>
                    ))}
                </div>
            </section>


            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Coluna 1: Pendências e Ocupação */}
                <div className="flex flex-col gap-6">
                    {/* Pendências do Dia */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2 opacity-60">
                                <span className="material-symbols-outlined text-primary text-base">fact_check</span>
                                <h3 className="text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest">Pendências do Dia</h3>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                            {/* Input para Adicionar */}
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (!novaTarefa.trim()) return;
                                tasks.addTarefaManual(novaTarefa.trim());
                                setNovaTarefa('');
                            }} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={novaTarefa} 
                                    onChange={e => setNovaTarefa(e.target.value)} 
                                    placeholder="Adicionar lembrete..." 
                                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-xs rounded-lg border border-slate-100 dark:border-slate-700 focus:outline-none focus:border-primary text-slate-900 dark:text-white"
                                />
                                <button type="submit" className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                            </form>

                            {/* Lista de Tarefas */}
                            <div className="space-y-3 max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
                                {tasks.todasPendencias.length > 0 ? tasks.todasPendencias.map((task) => (
                                    <div key={task.id} className="flex items-start gap-2 group">
                                        <button 
                                            onClick={() => tasks.toggleTarefa(task.id)}
                                            className="mt-0.5 size-4 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-primary shrink-0"
                                        >
                                            {task.completed && <span className="material-symbols-outlined text-xs text-primary font-bold">check</span>}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                                                {task.text}
                                            </p>
                                            {task.rota && !task.completed && (
                                                <button 
                                                    onClick={() => navigate(task.rota, task.state ? { state: task.state } : {})} 
                                                    className="text-[9px] font-bold text-primary hover:underline mt-0.5 inline-flex items-center gap-0.5"
                                                >
                                                    <span className="material-symbols-outlined text-[11px]">{task.type === 'evolucao' ? 'edit_note' : 'east'}</span>
                                                    {task.type === 'evolucao' ? 'Escrever agora' : task.type === 'financeiro' ? 'Ir para Financeiro' : 'Emitir agora'}
                                                </button>
                                            )}
                                        </div>
                                        {task.type === 'manual' && (
                                            <button 
                                                onClick={() => tasks.removeTarefaManual(task.id)}
                                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded transition-all"
                                            >
                                                <span className="material-symbols-outlined text-xs">delete</span>
                                            </button>
                                        )}
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center py-6 opacity-30">
                                        <span className="material-symbols-outlined text-3xl mb-1">check_circle</span>
                                        <p className="text-[10px] font-bold uppercase">Tudo em dia!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Insights de Agenda */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2 opacity-60">
                                <span className="material-symbols-outlined text-primary text-base">calendar_view_week</span>
                                <h3 className="text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest">Ocupação da Semana</h3>
                            </div>
                            <button 
                                onClick={() => setIsSettingsOpen(true)} 
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-primary transition-all flex items-center justify-center" 
                                title="Configurar Expediente"
                            >
                                <span className="material-symbols-outlined text-base">settings</span>
                            </button>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{agenda.insightsAgenda.vagasSemana} <span className="text-xs text-slate-400 font-medium">vagas</span></p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Expediente: {agenda.insightsAgenda.horasExpediente}</p>
                                </div>
                                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-2xl">event_available</span>
                                </div>
                            </div>
                            
                            {/* Barra de Progresso */}
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all" style={{ width: `${agenda.insightsAgenda.percentualOcupado}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">{agenda.insightsAgenda.percentualOcupado}% da sua agenda preenchida</p>

                            {agenda.insightsAgenda.vagasSemana > 0 && (
                                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">lightbulb</span>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                        Você tem <span className="font-bold text-primary">{agenda.insightsAgenda.vagasSemana} horários</span> livres para encaixe. Que tal mandar um lembrete para sua fila de espera?
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tip Area - Reflexão Dinâmica */}
                    {(() => {
                        const today = new Date();
                        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
                        const h = today.getHours();
                        const index = (dayOfYear * 24 + h) % INSIGHTS_PSICOLOGICOS.length;
                        const insight = INSIGHTS_PSICOLOGICOS[index] || { frase: "Carregando reflexão...", autor: "" };
                        return (
                            <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-900 rounded-xl p-6 border border-white/10 relative overflow-hidden group shadow-md hover:shadow-lg transition-all">
                                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform text-white">
                                    <span className="material-symbols-outlined text-8xl">format_quote</span>
                                </div>
                                <div className="relative z-10 flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-white/90">
                                        <span className="material-symbols-outlined text-lg">psychology</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Reflexão do Momento</span>
                                    </div>
                                    
                                    <p className="text-base text-white leading-relaxed font-bold italic">
                                        "{insight.frase}"
                                    </p>
                                    
                                    {insight.autor && (
                                        <div className="text-[10px] text-white/80 font-semibold uppercase tracking-wider text-right border-t border-white/10 pt-2">
                                            — {insight.autor}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Coluna 2: Bloco de Notas Rápidas */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 opacity-60">
                            <span className="material-symbols-outlined text-primary text-base">edit_note</span>
                            <h3 className="text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest">Anotações Gerais</h3>
                        </div>
                    </div>

                    {/* Barra de Abas */}
                    <div className="flex items-center gap-1.5 px-1 overflow-x-auto scrollbar-none max-w-full">
                        {notas.map(n => (
                            <button 
                                key={n.id} 
                                onClick={() => setAtivaNotaId(n.id)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    const novoTitulo = prompt("Renomear nota para:", n.titulo);
                                    if (novoTitulo && novoTitulo.trim()) {
                                        setNotas(prev => prev.map(no => no.id === n.id ? { ...no, titulo: novoTitulo.trim() } : no));
                                    }
                                }}
                                className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border transition-all flex items-center gap-1 shrink-0 hover:scale-95 ${ativaNotaId === n.id ? `bg-primary/10 border-primary/20 text-primary` : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-100'}`}
                                title="Clique para selecionar • Botão direito para renomear"
                            >
                                <span className={`material-symbols-outlined text-[11px] ${n.cor === 'red' ? 'text-red-500' : n.cor === 'green' ? 'text-green-500' : n.cor === 'orange' ? 'text-orange-500' : n.cor === 'purple' ? 'text-purple-500' : n.cor === 'pink' ? 'text-pink-500' : n.cor === 'cyan' ? 'text-cyan-500' : n.cor === 'yellow' ? 'text-yellow-500' : ''}`}>description</span>
                                <span className="truncate max-w-[65px]">{n.titulo}</span>

                                {notas.length > 1 && (
                                    <span 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Evitar trocar de aba
                                            const filtrado = notas.filter(no => no.id !== n.id);
                                            setNotas(filtrado);
                                            if (ativaNotaId === n.id) {
                                                // Definir a próxima nota ativa
                                                const proxima = filtrado[0]?.id || '1';
                                                setAtivaNotaId(proxima);
                                            }
                                        }}
                                        className="material-symbols-outlined text-[10px] ml-0.5 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-500 rounded-full p-0.5 transition-all cursor-pointer"
                                        title="Excluir nota"
                                    >
                                        close
                                    </span>
                                )}
                            </button>
                        ))}
                        <button 
                            onClick={() => {
                                // Inteligência: Renomear nota anterior se for "Nota X"
                                const novo = { id: `n-${Date.now()}`, titulo: `Nota ${notas.length + 1}`, texto: '', cor: 'primary' };
                                setNotas(prev => {
                                    const atualizado = prev.map(n => {
                                        if (n.id === ativaNotaId && n.titulo.startsWith('Nota ') && n.texto.trim()) {
                                            const primeiraLinha = n.texto.split('\n')[0].substring(0, 15).trim();
                                            if (primeiraLinha) return { ...n, titulo: primeiraLinha };
                                        }
                                        return n;
                                    });
                                    return [...atualizado, novo];
                                });
                                setAtivaNotaId(novo.id);
                            }}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-all flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 shrink-0"
                            title="Nova Nota"
                        >
                            <span className="material-symbols-outlined text-xs">add</span>
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3 min-h-[220px] h-full">
                        {/* Barra de Ferramentas de Formatação */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 flex-wrap gap-2">
                            {/* Seletor de Cores */}
                            <div className="flex items-center gap-1 opacity-80 flex-wrap max-w-[150px]">
                                {['primary', 'red', 'green', 'orange', 'purple', 'pink', 'cyan', 'yellow'].map(cor => (
                                    <button 
                                        key={cor}
                                        onClick={() => setNotas(prev => prev.map(n => n.id === ativaNotaId ? { ...n, cor } : n))}
                                        className={`size-2.5 rounded-full border transition-all ${cor === 'red' ? 'bg-red-500' : cor === 'green' ? 'bg-green-500' : cor === 'orange' ? 'bg-orange-400' : cor === 'purple' ? 'bg-purple-500' : cor === 'pink' ? 'bg-pink-500' : cor === 'cyan' ? 'bg-cyan-500' : cor === 'yellow' ? 'bg-yellow-400' : 'bg-primary'} ${ativoNota?.cor === cor ? 'border-white dark:border-slate-900 ring-2 ring-primary ring-offset-1' : 'border-transparent'}`}
                                        title={cor === 'primary' ? 'Padrão' : cor.toUpperCase()}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-1">

                                <button onClick={() => aplicarFormatacao('\n• ')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 flex items-center justify-center" title="Lista de Marcadores"><span className="material-symbols-outlined text-sm">format_list_bulleted</span></button>
                            </div>
                            
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <button 
                                    onClick={handleGerarInsights}
                                    disabled={loadingInsight}
                                    className="px-2 py-1 bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded text-[9px] font-black flex items-center gap-1 shadow-sm hover:scale-95 transition-all disabled:opacity-50"
                                    title="Gerar insights clínicos com IA"
                                >
                                    <span className={`material-symbols-outlined text-[11px] ${loadingInsight ? 'animate-spin' : ''}`}>{loadingInsight ? 'sync' : 'auto_awesome'}</span>
                                    {loadingInsight ? 'Gerando...' : 'Gerar Ideias'}
                                </button>

                                {/* Vincular a Paciente */}
                                <select 
                                    className="text-[9px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-slate-600 dark:text-slate-300 outline-none max-w-[90px] truncate hover:border-primary transition-all cursor-pointer"
                                    onChange={(e) => {
                                        const pId = e.target.value;
                                        if (!pId) return;
                                        
                                        // Navegar para nova evolução com o texto da nota pré-preenchido
                                        navigate('/prontuarios/evolucao/novo', { 
                                            state: { 
                                                pacienteId: pId,
                                                modelo: { conteudo: ativoNota?.texto || '' } 
                                            } 
                                        });
                                        
                                        // Resetar select
                                        e.target.value = "";
                                    }}
                                >
                                    <option value="">🔗 Vincular</option>
                                    {patients?.map(p => (
                                        <option key={p.id} value={p.id}>{p.nome || p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <textarea 
                            ref={textareaRef}
                            value={ativoNota?.texto || ''}
                            onChange={(e) => {
                                setNotas(prev => prev.map(n => n.id === ativaNotaId ? { ...n, texto: e.target.value } : n));
                            }}
                            placeholder="Clique para digitar seus lembretes e notas do dia (salva automático)..."
                            className="bg-transparent text-xs text-slate-600 dark:text-slate-300 resize-none outline-none flex-1 min-h-[140px] leading-relaxed placeholder:italic"
                        />
                        <div className="flex items-center justify-end gap-1.5 opacity-40 mt-auto border-t border-slate-100 dark:border-slate-800 pt-2">
                            <span className="material-symbols-outlined text-xs">sync</span>
                            <span className="text-[8px] font-bold uppercase tracking-wider">Salvo Localmente</span>
                        </div>
                    </div>
                </div>

                {/* Coluna 3: Documentos Recentes */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 opacity-60">
                            <span className="material-symbols-outlined text-primary text-base">description</span>
                            <h3 className="text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest">Documentos Recentes</h3>
                        </div>
                        <button onClick={() => navigate('/prontuarios')} className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline transition-all">
                            Ver todos
                        </button>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documento</th>
                                        <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paciente</th>
                                        <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-4 md:px-6 py-3 md:py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {stats.todosDocumentosRecentes.length > 0 ? (
                                        stats.todosDocumentosRecentes.map((doc, i) => (
                                            <tr 
                                                key={i} 
                                                onClick={() => handleNavegacaoDocumento(doc, navigate)} 
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
                                            >
                                                <td className="px-4 md:px-6 py-3 md:py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
                                                            <span className="material-symbols-outlined text-lg">{doc.icon}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-slate-900 dark:text-white uppercase truncate max-w-[150px]">{doc.name}</span>
                                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{doc.date}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4">
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{safeRender(doc.patient)}</span>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4">
                                                    <span className={`px-2.5 py-1 inline-flex items-center rounded-full text-[10px] font-bold uppercase tracking-wide ${doc.status === 'Assinado' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                                                        {doc.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                                                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-xs italic">Nenhuma atividade recente encontrada.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


            </div>
            
            {/* Footer Institucional - 3 Colunas */}
            <footer className="mt-20 pt-16 border-t border-slate-200 dark:border-slate-800 px-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                    {/* Coluna 1: Marca e Slogan */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Meu Sistema PSI</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs">
                            O sistema completo e inteligente projetado para simplificar a gestão da sua prática clínica. 100% focado em psicólogos.
                        </p>
                    </div>

                    {/* Coluna 2: Atalhos Rápidos */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Funcionalidades</h4>
                            <ul className="space-y-3">
                                {['Agenda', 'Prontuários', 'Financeiro', 'Relatórios'].map(item => (
                                    <li key={item}>
                                        <button onClick={() => navigate(`/${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`)} className="text-xs text-slate-500 hover:text-primary transition-colors font-medium">{item}</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Suporte</h4>
                            <ul className="space-y-3">
                                <li><button onClick={() => setHelpOpen(true)} className="text-xs text-slate-500 hover:text-primary transition-colors font-medium">Ajuda</button></li>
                                <li><a href="#" className="text-xs text-slate-500 hover:text-primary transition-colors font-medium">WhatsApp</a></li>
                                <li><a href="#" className="text-xs text-slate-500 hover:text-primary transition-colors font-medium">Tutorial</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Coluna 3: Siga-nos / Comunidade */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Comunidade</h4>
                        <div className="flex gap-4">
                            {['instagram', 'youtube', 'facebook'].map(social => (
                                <a key={social} href="#" className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-primary/10 hover:text-primary transition-all">
                                    <span className="material-symbols-outlined text-lg">{social === 'instagram' ? 'photo_camera' : social === 'youtube' ? 'play_circle' : 'public'}</span>
                                </a>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Acompanhe as novidades e dicas para sua carreira.</p>
                    </div>
                </div>

                {/* Rodapé Final */}
                <div className="flex flex-col md:flex-row items-center justify-between py-8 border-t border-slate-100 dark:border-slate-800 gap-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} Meu Sistema Psi · Todos os direitos reservados.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-[10px] text-slate-400 hover:text-primary font-bold uppercase tracking-widest">Privacidade</a>
                        <a href="#" className="text-[10px] text-slate-400 hover:text-primary font-bold uppercase tracking-widest">Termos</a>
                    </div>
                </div>
            </footer>

            {/* Modais */}

            <AgendaSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <NovoDocumentoModal 
                isOpen={modalDoc} 
                onClose={() => setModalDoc(false)} 
                tipoInicial={tipoModalDoc}
            />
            <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
        </div>
    );
};


export default Dashboard;



