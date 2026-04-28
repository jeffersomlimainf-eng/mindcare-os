import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
import { generateWhatsAppLink } from '../utils/whatsapp';
import { INSIGHTS_PSICOLOGICOS } from '../data/insights';
import HelpModal from '../components/HelpModal';
import { HELP_CONTENT } from '../constants/helpContent';
import FeatureTour from '../components/FeatureTour';
import useFirstVisit from '../hooks/useFirstVisit';
import SmartTooltip from '../components/SmartTooltip';
import { logger } from '../utils/logger';

// Novos Subcomponentes
import ClockWidget from '../components/Dashboard/ClockWidget';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import DashboardWelcome from '../components/Dashboard/DashboardWelcome';
import DashboardStats from '../components/Dashboard/DashboardStats';
import DashboardQuickActions from '../components/Dashboard/DashboardQuickActions';
import DashboardNextSession from '../components/Dashboard/DashboardNextSession';
import DashboardAgendaList from '../components/Dashboard/DashboardAgendaList';
import DashboardRiskAlerts from '../components/Dashboard/DashboardRiskAlerts';
import DashboardTasks from '../components/Dashboard/DashboardTasks';
import DashboardOccupation from '../components/Dashboard/DashboardOccupation';
import DashboardReflection from '../components/Dashboard/DashboardReflection';
import DashboardNotes from '../components/Dashboard/DashboardNotes';
import DashboardRecentDocs from '../components/Dashboard/DashboardRecentDocs';
import DashboardFooter from '../components/Dashboard/DashboardFooter';


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
            try { return JSON.parse(salva)[0]?.id || '1'; } catch(e) { logger.error(e); }
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
        appointments,
        user
    });

    const [helpOpen, setHelpOpen] = useState(false);
    const [showTour, setShowTour] = useState(false);
    const { shouldTrigger: dashboardFirstVisit, markAsCompleted: markDashboardTourCompleted } = useFirstVisit('dashboard');

    useEffect(() => {
        if (dashboardFirstVisit) setShowTour(true);
    }, [dashboardFirstVisit]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [novaTarefa, setNovaTarefa] = useState('');

    // Fechar modais locais do Dashboard com Esc
    useGlobalShortcuts({
        isModalOpen: helpOpen,
        closeModal: () => {
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
                onStartTour={() => setShowTour(true)}
            />


            <DashboardHeader setHelpOpen={setHelpOpen} />

            <DashboardWelcome user={user} agenda={agenda} navigate={navigate} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DashboardNextSession 
                    agenda={agenda} 
                    patients={patients} 
                    navigate={navigate} 
                    weather={weather} 
                    formatarHora={formatarHora} 
                />

                <DashboardAgendaList 
                    agenda={agenda} 
                    navigate={navigate} 
                    formatarHora={formatarHora} 
                />
            </div>

            <DashboardStats stats={stats.stats} navigate={navigate} />

            <DashboardQuickActions 
                quickActions={stats.quickActions} 
            />

            <DashboardRiskAlerts pacientesEmRisco={pacientesEmRisco} navigate={navigate} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Coluna 1: Documentos Recentes + Reflexão */}
                <div className="flex flex-col gap-6">
                    <DashboardRecentDocs 
                        documents={stats.todosDocumentosRecentes}
                        navigate={navigate}
                        onNewDoc={() => navigate('/prontuarios')}
                    />

                    <DashboardReflection />
                </div>

                {/* Coluna 2: Bloco de Notas Rápidas */}
                <DashboardNotes 
                    notas={notas}
                    setNotas={setNotas}
                    ativaNotaId={ativaNotaId}
                    setAtivaNotaId={setAtivaNotaId}
                    textareaRef={textareaRef}
                    loadingInsight={loadingInsight}
                    handleGerarInsights={handleGerarInsights}
                    aplicarFormatacao={aplicarFormatacao}
                    patients={patients}
                    navigate={navigate}
                />

                {/* Coluna 3: Pendências e Ocupação */}
                <div className="flex flex-col gap-6">
                    <DashboardTasks 
                        tasks={tasks} 
                        novaTarefa={novaTarefa} 
                        setNovaTarefa={setNovaTarefa} 
                        navigate={navigate} 
                    />

                    <DashboardOccupation 
                        agenda={agenda} 
                        setIsSettingsOpen={setIsSettingsOpen} 
                    />
                </div>
            </div>

            <DashboardFooter navigate={navigate} setHelpOpen={setHelpOpen} />

            {/* Modais */}
            <AgendaSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <FeatureTour 
                isOpen={showTour} 
                steps={HELP_CONTENT.dashboard.tourSteps} 
                onClose={() => {
                    setShowTour(false);
                    markDashboardTourCompleted();
                }}
                onComplete={() => {
                    setShowTour(false);
                    markDashboardTourCompleted();
                    alert("Seu centro de comando está pronto! Vamos dominar a clínica? 🚀");
                }}
            />
        </div>
    );
};

export default Dashboard;



