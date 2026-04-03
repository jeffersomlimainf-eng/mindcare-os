import Modal from './Modal';

const HelpModal = ({ isOpen, onClose, content }) => {
    if (!content) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={content.title} 
            icon="auto_awesome" 
            maxWidth="max-w-xl"
        >
            <div className="p-8 space-y-10">
                {/* Cabeçalho Educativo */}
                <div className="relative p-6 rounded-3xl bg-primary/5 border border-primary/10 overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <span className="material-symbols-outlined text-6xl text-primary">school</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-primary font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                            Guia de Aprendizado
                        </h3>
                        <p className="text-slate-700 dark:text-slate-300 font-medium text-base leading-relaxed">
                            {content.description}
                        </p>
                    </div>
                </div>

                {/* Passos do Tutorial */}
                <div className="space-y-8 px-2">
                    {content.steps?.map((step, i) => (
                        <div key={i} className="flex gap-6 group">
                            <div className="relative flex flex-col items-center">
                                <div className="size-14 shrink-0 rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                    <span className="material-symbols-outlined text-3xl font-light">{step.icon}</span>
                                </div>
                                {i !== content.steps.length - 1 && (
                                    <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 absolute top-14 mt-1" />
                                )}
                            </div>
                            
                            <div className="space-y-1 pb-4">
                                <h4 className="font-black text-slate-900 dark:text-white text-[11px] uppercase tracking-widest group-hover:text-primary transition-colors">
                                    {step.title}
                                </h4>
                                <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    {step.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ação Final */}
                <div className="pt-2">
                    <button 
                        onClick={onClose}
                        className="w-full h-14 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        Entendi, vamos praticar!
                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </button>
                    
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">
                            Ainda tem dúvidas?
                        </p>
                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                    
                    <button 
                        onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
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


