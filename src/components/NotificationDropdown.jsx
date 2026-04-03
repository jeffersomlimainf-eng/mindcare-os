import { useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationDropdown = ({ isOpen, onClose }) => {
    const dropdownRef = useRef(null);
    const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotifications();

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
        <div 
            ref={dropdownRef}
            className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-2xl shadow-2xl z-[100] overflow-hidden origin-top-right"
        >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Notificações</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{unreadCount} não lidas</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={markAllAsRead}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
                    >
                        Ler Tudo
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <button 
                        onClick={clearAll}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                    >
                        Limpar
                    </button>
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-200 dark:text-slate-800 mb-2">notifications_off</span>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhuma notificação</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {notifications.map((n) => (
                            <button
                                key={n.id}
                                onClick={() => markAsRead(n.id)}
                                className={`p-4 flex gap-4 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50 last:border-0 relative ${!n.read ? 'bg-primary/[0.02]' : ''}`}
                            >
                                {!n.read && (
                                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                                )}
                                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    n.type === 'tip' ? 'bg-amber-100 text-amber-600' : 
                                    n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                    <span className="material-symbols-outlined text-xl">{n.icon || 'notifications'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h4 className={`text-sm tracking-tight truncate ${!n.read ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-600 dark:text-slate-400'}`}>
                                            {n.title}
                                        </h4>
                                        <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">{formatTime(n.date)}</span>
                                    </div>
                                    <p className={`text-xs line-clamp-2 leading-relaxed ${!n.read ? 'text-slate-600 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {n.message}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-center">
                    <button className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-primary transition-colors">
                        Ver todas as notificações
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;


