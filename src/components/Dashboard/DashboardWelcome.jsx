import React from 'react';
import { motion } from 'framer-motion';
import SmartTooltip from '../SmartTooltip';
import AiAssistantAnimation from '../AiAssistantAnimation';

const DashboardWelcome = ({ user, agenda, navigate }) => {
    return (
        <div className="px-1 relative">
            <motion.div 
                id="tour-welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                    opacity: 1, 
                    y: 0,
                    filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"]
                }}
                transition={{ 
                    opacity: { duration: 0.5 },
                    y: { duration: 0.5 },
                    filter: { duration: 30, repeat: Infinity, ease: "linear" }
                }}
                className="relative bg-gradient-to-r from-teal-500/15 via-primary/15 to-indigo-500/15 dark:from-teal-500/10 dark:via-primary/10 dark:to-indigo-500/10 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-10 md:p-14 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-14 group overflow-hidden"
            >
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 blur-[60px] rounded-full translate-y-1/3 -translate-x-1/4"></div>

                {/* Avatar Area */}
                <div className="relative shrink-0 group/avatar flex items-center justify-center">
                    <AiAssistantAnimation />
                    
                    {/* Status badge */}
                    <div className="absolute -top-6 -right-4 z-30 bg-emerald-500 text-white text-[10px] font-black px-4 py-2 rounded-full border-2 border-white dark:border-slate-800 shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                        <span className="size-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                        PSIQUÊ ONLINE
                    </div>
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
    );
};

export default DashboardWelcome;
