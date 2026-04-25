import React from 'react';
import { generateWhatsAppLink } from '../../utils/whatsapp';

const DashboardTasks = ({ tasks, novaTarefa, setNovaTarefa, navigate }) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 opacity-60">
                    <span className="material-symbols-outlined text-primary text-base">fact_check</span>
                    <h3 className="text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest">Pendências do Dia</h3>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                {/* Input para Adicionar */}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!novaTarefa.trim()) return;
                    tasks.addTarefaManual(novaTarefa.trim());
                    setNovaTarefa('');
                }} className="flex gap-2">
                    <input 
                        type="text" 
                        value={novaTarefa} 
                        onChange={e => setNovaTarefa(e.target.value)} 
                        placeholder="Adicionar lembrete..." 
                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-xs rounded-lg border border-slate-100 dark:border-slate-700 focus:outline-none focus:border-primary text-slate-900 dark:text-white"
                    />
                    <button type="submit" className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                </form>

                {/* Lista de Tarefas */}
                <div className="space-y-3 max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
                    {tasks.todasPendencias.length > 0 ? tasks.todasPendencias.map((task) => (
                        <div key={task.id} className="flex items-start gap-2 group">
                            <button 
                                onClick={() => tasks.toggleTarefa(task.id)}
                                className="mt-0.5 size-4 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-primary shrink-0"
                            >
                                {task.completed && <span className="material-symbols-outlined text-xs text-primary font-bold">check</span>}
                            </button>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                                    {task.text}
                                </p>
                                {task.rota && !task.completed && (
                                    <button 
                                        onClick={() => navigate(task.rota, task.state ? { state: task.state } : {})} 
                                        className="text-[9px] font-bold text-primary hover:underline mt-0.5 inline-flex items-center gap-0.5"
                                    >
                                        <span className="material-symbols-outlined text-[11px]">{task.type === 'evolucao' ? 'edit_note' : 'east'}</span>
                                        {task.type === 'evolucao' ? 'Escrever agora' : task.type === 'financeiro' ? 'Ir para Financeiro' : 'Emitir agora'}
                                    </button>
                                )}

                                {task.patientPhone && !task.completed && (
                                    <a 
                                        href={generateWhatsAppLink(task.patientPhone, task.waMessage)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[9px] font-bold text-emerald-500 hover:underline mt-0.5 inline-flex items-center gap-0.5 ml-2"
                                    >
                                        <span className="material-symbols-outlined text-[11px]">chat</span>
                                        Mandar WhatsApp
                                    </a>
                                )}
                            </div>
                            {task.type === 'manual' && (
                                <button 
                                    onClick={() => tasks.removeTarefaManual(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded transition-all"
                                >
                                    <span className="material-symbols-outlined text-xs">delete</span>
                                </button>
                            )}
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-6 opacity-30">
                            <span className="material-symbols-outlined text-3xl mb-1">check_circle</span>
                            <p className="text-[10px] font-bold uppercase">Tudo em dia!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardTasks;
