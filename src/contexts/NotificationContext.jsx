import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('Meu Sistema PSI_notifications');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('Meu Sistema PSI_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = useCallback((notif) => {
        const newNotif = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            date: new Date().toISOString(),
            read: false,
            type: 'info',
            icon: 'notifications',
            category: 'SISTEMA',
            isSmart: false,
            ...notif
        };
        setNotifications(prev => [newNotif, ...prev]);
    }, []);

    // Sincroniza notificações inteligentes de uma vez (BATCH)
    const syncSmartNotifications = useCallback((newSmartList) => {
        setNotifications(prev => {
            // Mantém notificações que NÃO são inteligentes ou que o usuário JÁ LEU
            const manualOrRead = prev.filter(n => !n.isSmart || n.read);
            
            // Adiciona as novas inteligentes (se ainda não existirem no histórico)
            const freshSmarts = newSmartList.map(n => ({
                id: `smart-${n.id || Math.random().toString(36).substr(2, 9)}`,
                date: new Date().toISOString(),
                read: false,
                isSmart: true,
                category: n.category || 'GERAL',
                ...n
            }));

            // Evitar duplicatas exatas baseadas no título e categoria no mesmo lote
            return [...freshSmarts, ...manualOrRead];
        });
    }, []);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            addNotification, 
            syncSmartNotifications,
            markAsRead, 
            markAllAsRead, 
            removeNotification, 
            clearAll, 
            unreadCount 
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
