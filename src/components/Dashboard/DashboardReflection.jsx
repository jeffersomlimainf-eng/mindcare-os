import React from 'react';
import { INSIGHTS_PSICOLOGICOS } from '../../data/insights';

const DashboardReflection = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const h = today.getHours();
    const index = (dayOfYear * 24 + h) % INSIGHTS_PSICOLOGICOS.length;
    const insight = INSIGHTS_PSICOLOGICOS[index] || { frase: "Carregando reflexão...", autor: "" };

    return (
        <div className="w-full bg-gradient-to-br from-primary/15 via-blue-500/10 to-indigo-500/5 rounded-2xl px-8 py-7 border border-primary/15 relative overflow-hidden group shadow-sm">
            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-[80px]">format_quote</span>
            </div>
            <div className="relative z-10 flex items-start gap-5">
                <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <span className="material-symbols-outlined text-primary text-2xl">format_quote</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-3">Reflexão do Momento</p>
                    <p className="text-lg text-slate-800 dark:text-slate-100 leading-relaxed font-bold italic">
                        "{insight.frase}"
                    </p>
                    {insight.autor && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-4">
                            — {insight.autor}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardReflection;
