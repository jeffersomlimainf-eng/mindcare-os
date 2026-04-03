import { createContext, useContext, useState, useEffect } from 'react';

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
        return saved ? JSON.parse(saved) : [
            {
                id: 1,
                title: 'Bem-vindo ao Meu Sistema PSI',
                message: 'Explore as novas funcionalidades de prontuário e agenda.',
                date: new Date().toISOString(),
                read: false,
                type: 'info',
                icon: 'info'
            },
            {
                id: 2,
                title: 'Dica de Produtividade',
                message: 'Você pode usar o atalho Nova Consulta em qualquer tela.',
                date: new Date(Date.now() - 3600000).toISOString(),
                read: false,
                type: 'tip',
                icon: 'lightbulb'
            }
        ];
    });

    useEffect(() => {
        localStorage.setItem('Meu Sistema PSI_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = (notif) => {
        const newNotif = {
            id: Date.now(),
            date: new Date().toISOString(),
            read: false,
            type: 'info',
            icon: 'notifications',
            ...notif
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

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


