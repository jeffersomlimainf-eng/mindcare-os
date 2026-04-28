import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardQuickActions = ({ quickActions }) => {
    const navigate = useNavigate();
    return (
        <section id="tour-acoes" className="px-1">
            <div className="flex items-center gap-2 mb-6 opacity-60">
                <span className="material-symbols-outlined text-primary text-base">bolt</span>
                <h3 className="text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest">Ações Rápidas</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {quickActions.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            navigate(action.path, { state: { categoria: action.categoria } });
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
    );
};

export default DashboardQuickActions;
