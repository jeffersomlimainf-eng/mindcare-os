import React from 'react';

const DashboardStats = ({ stats, navigate }) => {
    return (
        <div id="tour-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
            {stats.map((stat, index) => (
                <button
                    key={index}
                    onClick={() => navigate(stat.rota)}
                    className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all text-left group relative overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className={`size-12 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.color} transition-transform`}>
                            <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide ${stat.trend.includes('+') ? 'bg-green-500/10 text-green-600' : stat.trend.includes('-') ? 'bg-red-500/10 text-red-600' : 'bg-slate-500/10 text-slate-400'}`}>
                            {stat.trend}
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.title}</p>
                    <p className="text-slate-900 dark:text-white text-3xl font-bold">{stat.value}</p>
                </button>
            ))}
        </div>
    );
};

export default DashboardStats;
