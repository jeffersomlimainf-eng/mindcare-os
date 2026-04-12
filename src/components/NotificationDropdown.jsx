import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDropdown = ({ isOpen, onClose }) => {
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { notifications, markAsRead, markAllAsRead, clearAll, removeNotification, unreadCount } = useNotifications();
    const [activeTab, setActiveTab] = useState('GERAL'); // GERAL, CLINICO, FINANCEIRO

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const tabs = [
        { id: 'GERAL', name: 'Geral', icon: 'dashboard' },
        { id: 'CLINICO', name: 'Clínico', icon: 'medical_services' },
        { id: 'FINANCEIRO', name: 'Financeiro', icon: 'payments' },
    ];

    const filteredNotifications = notifications.filter(n => 
        activeTab === 'GERAL' ? true : n.category === activeTab
    );

    const handleNotificationClick = (n) => {
        markAsRead(n.id);
        if (n.path) {
            navigate(n.path);
            onClose();
        }
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        removeNotification(id);
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins}m atrás`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h atrás`;
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    return (
        <motion.div 
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-3 w-80 md:w-[420px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-3xl shadow-2xl z-[100] overflow-hidden origin-top-right ring-1 ring-black/5"
        >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Centro de Notificações</h3>
                    <p className="text-[11px] text-primary font-black uppercase tracking-widest">{unreadCount} notificações pendentes</p>
                </div>
                <div className="flex gap-1.5">
                    <button 
                        onClick={clearAll}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Limpar tudo"
                    >
                        <span className="material-symbols-outlined text-xl">delete_sweep</span>
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all md:hidden"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 py-2 flex gap-1 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800/50">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                            activeTab === tab.id 
                                ? 'bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="max-h-[480px] overflow-y-auto custom-scrollbar p-2">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-20 text-center"
                        >
                            <div className="size-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">notifications_off</span>
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhuma notificação por aqui</p>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {filteredNotifications.map((n) => (
                                <motion.div 
                                    layout
                                    key={n.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="group relative"
                                >
                                    <button
                                        onClick={() => handleNotificationClick(n)}
                                        className={`w-full p-4 flex gap-4 text-left rounded-2xl transition-all relative ${
                                            !n.read 
                                                ? 'bg-primary/[0.03] dark:bg-primary/[0.05] hover:bg-primary/[0.06]' 
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                        }`}
                                    >
                                        <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                                            n.type === 'tip' ? 'bg-amber-100 text-amber-600' : 
                                            n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                            n.type === 'warning' ? 'bg-rose-100 text-rose-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                            <span className="material-symbols-outlined text-2xl">{n.icon || 'notifications'}</span>
                                        </div>
                                        <div className="flex-1 min-w-0 pr-6">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className={`text-sm tracking-tight truncate ${!n.read ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-600 dark:text-slate-400'}`}>
                                                    {n.title}
                                                </h4>
                                                <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">{formatTime(n.date)}</span>
                                            </div>
                                            <p className={`text-xs line-clamp-2 leading-relaxed ${!n.read ? 'text-slate-600 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                                                {n.message}
                                            </p>
                                            
                                            {n.path && (
                                                <div className="mt-3 flex items-center text-[10px] font-black text-primary uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
                                                    Ver Detalhes
                                                    <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                    
                                    {/* Action Buttons Overlay */}
                                    <button 
                                        onClick={(e) => handleDelete(e, n.id)}
                                        className="absolute right-3 top-3 p-2 rounded-xl opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all z-10"
                                        title="Remover"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-4">
                <button 
                    onClick={markAllAsRead}
                    className="text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[16px]">done_all</span>
                    Marcar todas como lidas
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationDropdown;
