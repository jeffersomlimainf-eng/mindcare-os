import React, { useState, useEffect } from 'react';

const ClockWidget = React.memo(({ dadosClima, cidade, loadingClima, editandoCidade, setEditandoCidade, onCidadeChange, onAutoLocalizar }) => {
    const [hora, setHora] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setHora(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800/10 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 w-full md:w-auto md:self-center justify-center shadow-lg shadow-slate-100/50 dark:shadow-none hover:shadow-xl transition-all relative z-10 backdrop-blur-md">
            <div className="flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-4xl text-amber-500 animate-pulse">{dadosClima.icone}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dadosClima.condicao}</span>
            </div>
            <div className="h-12 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
            <div className="flex flex-col">
                <div className="flex items-baseline gap-0.5 relative">
                    {loadingClima && <span className="absolute -left-5 top-2 size-3 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>}
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{dadosClima.temp}°</span>
                    <span className="text-sm font-bold text-slate-400">C</span>
                    <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                    <div className="flex items-baseline gap-0.5" title="Hora atual">
                        <span className="text-2xl font-black text-slate-700 dark:text-slate-300">
                            {hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 ml-0.5 animate-pulse">
                            :{String(hora.getSeconds()).padStart(2, '0')}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {editandoCidade ? (
                        <input type="text" defaultValue={cidade} autoFocus
                            onBlur={(e) => { const nova = e.target.value.trim(); if (nova) onCidadeChange(nova); setEditandoCidade(false); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { const nova = e.target.value.trim(); if (nova) onCidadeChange(nova); setEditandoCidade(false); } }}
                            className="text-[10px] font-black text-slate-900 dark:text-white uppercase bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1 max-w-[110px] outline-none focus:border-primary"
                        />
                    ) : (
                        <span onClick={() => setEditandoCidade(true)} className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:text-primary transition-colors group" title="Clique para mudar a cidade">
                            <span className="material-symbols-outlined text-[12px] text-primary">location_on</span>
                            {cidade}
                            <span className="material-symbols-outlined text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                        </span>
                    )}
                    
                    {!editandoCidade && (
                        <button 
                            onClick={onAutoLocalizar}
                            className="p-1 hover:bg-primary/10 rounded-full text-slate-400 hover:text-primary transition-all flex items-center justify-center group/loc"
                            title="Detectar minha localização"
                        >
                            <span className="material-symbols-outlined text-[12px] group-hover/loc:scale-110">my_location</span>
                        </button>
                    )}
                </div>
                <div className="flex gap-3 mt-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    <span>💧 {dadosClima.umidade}%</span>
                    <span>💨 {dadosClima.vento} km/h</span>
                </div>
            </div>
        </div>
    );
});

export default ClockWidget;
