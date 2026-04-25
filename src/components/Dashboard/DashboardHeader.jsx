import React from 'react';

const DashboardHeader = ({ setHelpOpen }) => {
    return (
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
    );
};

export default DashboardHeader;
