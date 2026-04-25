import React from 'react';

const DashboardOccupation = ({ agenda, setIsSettingsOpen }) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 opacity-60">
                    <span className="material-symbols-outlined text-primary text-base">calendar_view_week</span>
                    <h3 className="text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest">Ocupação da Semana</h3>
                </div>
                <button 
                    onClick={() => setIsSettingsOpen(true)} 
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-primary transition-all flex items-center justify-center" 
                    title="Configurar Expediente"
                >
                    <span className="material-symbols-outlined text-base">settings</span>
                </button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{agenda.insightsAgenda.vagasSemana} <span className="text-xs text-slate-400 font-medium">vagas</span></p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Expediente: {agenda.insightsAgenda.horasExpediente}</p>
                    </div>
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-2xl">event_available</span>
                    </div>
                </div>
                
                {/* Barra de Progresso */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${agenda.insightsAgenda.percentualOcupado}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{agenda.insightsAgenda.percentualOcupado}% da sua agenda preenchida</p>

                {agenda.insightsAgenda.vagasSemana > 0 && (
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">lightbulb</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                            Você tem <span className="font-bold text-primary">{agenda.insightsAgenda.vagasSemana} horários</span> livres para encaixe. Que tal mandar um lembrete para sua fila de espera?
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardOccupation;
