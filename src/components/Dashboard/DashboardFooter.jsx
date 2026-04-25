import React from 'react';

const DashboardFooter = ({ navigate, setHelpOpen }) => {
    return (
        <footer className="mt-12 pb-8 border-t border-slate-100 dark:border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-lg">psychology</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Psiquê <span className="text-primary">OS</span></span>
                    </div>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        © {new Date().getFullYear()} — Sistema de Gestão Clínica Inteligente
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setHelpOpen(true)}
                        className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">help</span> Suporte
                    </button>
                    <button 
                        onClick={() => navigate('/termos')}
                        className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors"
                    >
                        Termos
                    </button>
                    <button 
                        onClick={() => navigate('/privacidade')}
                        className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors"
                    >
                        Privacidade
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800/50">
                        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Sistema Operacional</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default React.memo(DashboardFooter);
