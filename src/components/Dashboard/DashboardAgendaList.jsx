import React from 'react';

const DashboardAgendaList = ({ agenda, navigate, formatarHora }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-900 dark:text-white font-black text-lg uppercase tracking-tight">Agenda de Hoje</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded">{agenda.dataHojeFormatada}</span>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
                {agenda.atendimentosHoje.map((a, i) => (
                    <div 
                        key={i} 
                        onClick={() => navigate(`/prontuarios/paciente/${a.pacienteId?.replace('#', '') || a.paciente}`)}
                        className="flex gap-4 relative cursor-pointer group/item"
                    >
                        {/* Timeline line */}
                        {i !== agenda.atendimentosHoje.length - 1 && <div className="absolute left-[7px] top-4 bottom-[-24px] w-0.5 bg-slate-100 dark:bg-slate-700"></div>}
                        
                        <div className={`size-4 rounded-full border-4 border-white dark:border-slate-800 shrink-0 z-10 mt-1 transition-transform group-hover/item:scale-125 ${a.status === 'finalizado' ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-600'}`}></div>
                        
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <span className={`text-[11px] font-bold ${a.status === 'finalizado' ? 'text-orange-500' : 'text-slate-500'}`}>
                                    {formatarHora(a.timeStart)} - {formatarHora(a.timeStart + a.duracao/60)}
                                </span>
                                {a.status === 'finalizado' ? (
                                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                                ) : (
                                    <span className="material-symbols-outlined text-slate-200 dark:text-slate-700 text-lg group-hover/item:text-primary transition-colors">arrow_forward</span>
                                )}
                            </div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight mt-0.5 group-hover/item:text-primary transition-colors">{a.paciente}</h4>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                                {a.tipo === 'teleconsulta' ? 'Teleconsulta' : 'Presencial'}
                            </p>
                        </div>
                    </div>
                ))}
                {agenda.atendimentosHoje.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 opacity-40">
                        <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                        <p className="text-xs font-bold uppercase">Nenhuma sessão hoje</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardAgendaList;
