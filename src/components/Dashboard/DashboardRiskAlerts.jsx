import React from 'react';
import { safeRender } from '../../utils/render';

const DashboardRiskAlerts = ({ pacientesEmRisco, navigate }) => {
    if (pacientesEmRisco.length === 0) return null;

    return (
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
    );
};

export default DashboardRiskAlerts;
