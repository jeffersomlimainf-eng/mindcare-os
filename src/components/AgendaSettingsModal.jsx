import React, { useState, useEffect } from 'react';
import { useAppointments } from '../contexts/AppointmentContext';

const AgendaSettingsModal = ({ isOpen, onClose }) => {
    const { agendaSettings, updateAgendaSettings } = useAppointments();
    const [localSettings, setLocalSettings] = useState(agendaSettings);

    useEffect(() => {
        if (isOpen) setLocalSettings(agendaSettings);
    }, [isOpen, agendaSettings]);

    if (!isOpen) return null;

    const handleSave = () => {
        updateAgendaSettings(localSettings);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">settings</span>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">Configurações da Agenda</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-full">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Início do Dia</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-slate-400">schedule</span>
                                <select
                                    value={localSettings.hInicio}
                                    onChange={e => setLocalSettings({ ...localSettings, hInicio: parseInt(e.target.value) })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                >
                                    {Array.from({ length: 25 }, (_, i) => i).map(h => (
                                        <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Fim do Dia</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-slate-400">event_busy</span>
                                <select
                                    value={localSettings.hFim}
                                    onChange={e => setLocalSettings({ ...localSettings, hFim: parseInt(e.target.value) })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                >
                                    {Array.from({ length: 25 }, (_, i) => i).map(h => (
                                        <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Duração Padrão da Sessão</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[30, 50, 60].map(duration => (
                                <button
                                    key={duration}
                                    onClick={() => setLocalSettings({ ...localSettings, slotSize: duration })}
                                    className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition-all ${localSettings.slotSize === duration ? 'bg-primary border-primary text-white shadow-md shadow-primary/25' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary/50 hover:text-primary'}`}
                                >
                                    {duration} min
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex gap-3">
                        <span className="material-symbols-outlined text-amber-500 shrink-0 mt-0.5">info</span>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                            Alterar estes horários mudará a visualização da grade central imediatamente. Certifique-se de que não há consultas fora do novo intervalo.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98] uppercase tracking-widest"
                    >
                        Salvar Ajustes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgendaSettingsModal;


