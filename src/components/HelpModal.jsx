import Modal from './Modal';

const HelpModal = ({ isOpen, onClose, content, onStartTour }) => {
    if (!content) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={content.title} 
            icon="auto_awesome" 
            maxWidth="max-w-xl"
        >
            <div className="p-4 md:p-8 space-y-8 md:space-y-10">
                {/* Cabeçalho Educativo */}
                <div className="relative p-6 rounded-3xl bg-primary/5 border border-primary/10 overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <span className="material-symbols-outlined text-6xl text-primary">school</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                            Guia de Aprendizado
                        </h3>
                        <p className="text-slate-700 dark:text-slate-300 font-medium text-base leading-relaxed">
                            {content.description}
                        </p>
                    </div>
                </div>

                {/* Grande Vantagem */}
                {content.advantage && (
                    <div className="flex items-center gap-4 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-2xl">
                        <div className="size-10 shrink-0 bg-teal-500 text-white rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl">star</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-0.5">Vantagem Principal</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-teal-100">{content.advantage}</p>
                        </div>
                    </div>
                )}

                {/* Passos do Tutorial */}
                <div className="space-y-8 px-2">
                    {content.steps?.map((step, i) => (
                        <div key={i} className="flex gap-6 group">
                            <div className="relative flex flex-col items-center">
                                <div className="size-12 md:size-14 shrink-0 rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                    <span className="material-symbols-outlined text-2xl md:text-3xl font-light">{step.icon}</span>
                                </div>
                                {i !== content.steps.length - 1 && (
                                    <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 absolute top-14 mt-1" />
                                )}
                            </div>
                            
                            <div className="space-y-1 pb-4">
                                <h4 className="font-black text-slate-900 dark:text-white text-[11px] uppercase tracking-widest group-hover:text-primary transition-colors">
                                    {step.title}
                                </h4>
                                <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                                    {step.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dica Extra */}
                {content.extraTip && (
                    <div className="p-5 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 rounded-r-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-amber-500">lightbulb</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-500">Dica de Especialista</span>
                        </div>
                        <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium italic">
                            "{content.extraTip}"
                        </p>
                    </div>
                )}

                {/* Ação Final */}
                <div className="pt-2">
                    <button 
                        onClick={onClose}
                        className="w-full h-14 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        Entendi, vamos praticar!
                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </button>

                    {content.tourSteps && (
                        <button 
                            onClick={() => {
                                onClose();
                                if (onStartTour) onStartTour();
                            }}
                            className="w-full h-14 mt-4 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                        >
                            <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">rocket_launch</span>
                            Iniciar Modo Aula (Passo a Passo)
                        </button>
                    )}
                    
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">
                            Ainda tem dúvidas?
                        </p>
                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                    
                    <button 
                        onClick={() => window.open('https://wa.me/5544988446371', '_blank')}
                        className="w-full mt-4 text-xs text-primary hover:text-primary-dark font-black tracking-widest uppercase py-2 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">support_agent</span>
                        Falar com Suporte Humano
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default HelpModal;


