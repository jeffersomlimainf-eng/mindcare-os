import React from 'react';
import { logger } from '../../utils/logger';

const DashboardNotes = ({ 
    notas, 
    setNotas, 
    ativaNotaId, 
    setAtivaNotaId, 
    textareaRef, 
    loadingInsight, 
    handleGerarInsights,
    aplicarFormatacao 
}) => {
    const ativoNota = notas.find(n => n.id === ativaNotaId) || notas[0] || { texto: '' };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 opacity-60">
                    <span className="material-symbols-outlined text-primary text-base">edit_note</span>
                    <h3 className="text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest">Notas Rápidas</h3>
                </div>
                <div className="flex items-center gap-2">
                    {notas.map(n => (
                        <button 
                            key={n.id}
                            onClick={() => setAtivaNotaId(n.id)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${ativaNotaId === n.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'}`}
                        >
                            {n.titulo}
                        </button>
                    ))}
                </div>
            </div>
            
            <div id="tour-notas" className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-4 relative overflow-hidden group/notes min-h-[450px]">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/notes:opacity-[0.05] transition-opacity pointer-events-none">
                    <span className="material-symbols-outlined text-[120px]">sticky_note_2</span>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-1">
                        <button onClick={() => aplicarFormatacao('**', '**')} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-all" title="Negrito">
                            <span className="material-symbols-outlined text-xl">format_bold</span>
                        </button>
                        <button onClick={() => aplicarFormatacao('*', '*')} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-all" title="Itálico">
                            <span className="material-symbols-outlined text-xl">format_italic</span>
                        </button>
                        <button onClick={() => aplicarFormatacao('• ')} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-all" title="Lista">
                            <span className="material-symbols-outlined text-xl">format_list_bulleted</span>
                        </button>
                    </div>
                    
                    <button 
                        onClick={handleGerarInsights}
                        disabled={loadingInsight}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loadingInsight ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200/50 dark:border-indigo-500/20 shadow-sm'}`}
                    >
                        {loadingInsight ? (
                            <span className="size-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <span className="material-symbols-outlined text-base animate-pulse">auto_awesome</span>
                        )}
                        {loadingInsight ? 'Processando...' : 'IA Insights'}
                    </button>
                </div>

                <textarea 
                    ref={textareaRef}
                    value={ativoNota?.texto || ''}
                    onChange={(e) => setNotas(prev => prev.map(n => n.id === ativaNotaId ? { ...n, texto: e.target.value } : n))}
                    placeholder="Comece a escrever seus rascunhos aqui... A Psiquê pode ajudar a organizar seus pensamentos."
                    className="flex-1 bg-transparent border-none outline-none resize-none text-slate-700 dark:text-slate-300 font-medium text-sm leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-700 custom-scrollbar"
                />

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500"></span>
                        Salvo Localmente
                    </span>
                    <button 
                        onClick={() => {
                            const blob = new Blob([ativoNota?.texto || ''], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `Nota_${ativoNota?.titulo}_${new Date().toLocaleDateString()}.txt`;
                            a.click();
                        }}
                        className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">download</span>
                        Exportar TXT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardNotes;
