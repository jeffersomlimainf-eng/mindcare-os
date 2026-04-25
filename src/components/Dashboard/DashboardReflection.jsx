import React from 'react';
import { INSIGHTS_PSICOLOGICOS } from '../../data/insights';

const DashboardReflection = () => {
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
};

export default DashboardReflection;
