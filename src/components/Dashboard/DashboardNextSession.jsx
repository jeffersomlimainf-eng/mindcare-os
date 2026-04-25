import React from 'react';
import ClockWidget from './ClockWidget';

const DashboardNextSession = ({ 
    agenda, 
    patients, 
    navigate, 
    weather,
    formatarHora 
}) => {
    return (
        <div id="tour-proxima" className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative overflow-hidden group min-h-[220px]">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all">
                <span className="material-symbols-outlined text-[100px] text-primary rotate-12">calendar_today</span>
            </div>
            
            <div className="flex-1 text-left w-full flex flex-col justify-center">
                <div className="flex flex-col items-start gap-2 mb-3">
                    <span className="inline-flex px-3 py-1 bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Próxima Sessão • {agenda.proximaSessao ? formatarHora(agenda.proximaSessao.timeStart) : '--:--'}
                    </span>
                    <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wide">Tempo restante: <span className="text-slate-900 dark:text-white font-black italic">{agenda.tempoRestante || '---'}</span></span>
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
                    {agenda.proximaSessao?.paciente || 'Nenhum agendamento'}
                    {agenda.proximaSessao?.pacienteId && (
                        <span className="text-slate-400 font-medium ml-2">
                            , {(() => {
                                const p = patients.find(pat => pat.id === agenda.proximaSessao.pacienteId);
                                if (!p?.dataNascimento) return '--';
                                const birth = new Date(p.dataNascimento);
                                const age = new Date().getFullYear() - birth.getFullYear();
                                return age;
                            })()}
                        </span>
                    )}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-base mb-6 capitalize">
                    {agenda.proximaSessao?.tipo || 'Sessão'} • {agenda.proximaSessao?.duracao || '50'} min
                </p>

                <div className="flex flex-wrap justify-start gap-3">
                    <button 
                        onClick={() => agenda.proximaSessao && navigate('/prontuarios/evolucao/novo', { state: { pacienteId: agenda.proximaSessao.pacienteId || agenda.proximaSessao.paciente } })}
                        className="h-10 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-orange-500/25 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-xl">play_circle</span>
                        Iniciar Sessão
                    </button>
                    <button 
                        onClick={() => agenda.proximaSessao && navigate(`/linha-do-tempo/${agenda.proximaSessao.pacienteId?.replace('#', '') || agenda.proximaSessao.paciente}`)}
                        className="h-10 px-6 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                    >
                        Ver Prontuário
                    </button>
                </div>
            </div>

            <ClockWidget
                dadosClima={weather.dadosClima}
                cidade={weather.cidade}
                loadingClima={weather.loadingClima}
                editandoCidade={weather.editandoCidade}
                setEditandoCidade={weather.setEditandoCidade}
                onCidadeChange={(nova) => weather.setCidade(nova)}
                onAutoLocalizar={weather.handleAutoLocalizar}
            />
        </div>
    );
};

export default DashboardNextSession;
