import { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import { db } from '../utils/db';
import { useUser } from './UserContext';

const AppointmentContext = createContext();

export const useAppointments = () => {
    const context = useContext(AppointmentContext);
    if (!context) {
        throw new Error('useAppointments must be used within an AppointmentProvider');
    }
    return context;
};

export const AppointmentProvider = ({ children }) => {
    const { addNotification } = useNotifications();
    const { user, updateConfigs } = useUser();
    const [appointments, setAppointments] = useState([]);
    const [waitingList, setWaitingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [agendaSettings, setAgendaSettings] = useState({ hInicio: 7, hFim: 19, slotSize: 60 });

    useEffect(() => {
        if (user?.configuracoes?.agendaSettings) {
            setAgendaSettings(user.configuracoes.agendaSettings);
        }
    }, [user?.configuracoes?.agendaSettings]);

    useEffect(() => {
        const load = async () => {
            if (user && user.id !== 'guest') {
                setLoading(true);
                try {
                    const [apps, wait] = await Promise.all([
                        db.list('appointments'),
                        db.list('waiting_list')
                    ]);
                    setAppointments(apps);
                    setWaitingList(wait);
                } catch (error) {
                    console.error('[AppointmentContext] Erro ao carregar dados:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    // PERF-01 FIX: user?.id em vez de user (objeto) — evita re-fetch em qualquer atualização de perfil
    }, [user?.id]);

    const addAppointment = async (appointment, silent = false) => {
        try {
            const novo = await db.insert('appointments', {
                ...appointment,
                userId: user?.id,
                status: appointment.status || 'confirmado'
            });
            setAppointments(prev => [...prev, novo]);
            if (!silent) {
                addNotification({
                title: 'Nova Consulta Agendada',
                // BUG-16 FIX: optional chaining para evitar TypeError se novo.data for undefined
                message: `${novo.paciente || novo.patient_name} agendado para ${(novo.data || '').split('-').reverse().join('/') || 'data informada'}.`,
                type: 'info',
                icon: 'event'
            });
            }
            return novo;
        } catch (error) {
            console.error('[AppointmentContext] Erro ao adicionar:', error);
            throw error;
        }
    };

    const updateAppointment = async (id, dados) => {
        try {
            const atualizado = await db.update('appointments', id, dados);
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...atualizado } : a));
            return atualizado;
        } catch (error) {
            console.error('[AppointmentContext] Erro ao atualizar:', error);
        }
    };

    const deleteAppointment = async (id) => {
        try {
            await db.delete('appointments', id);
            setAppointments(prev => prev.filter(a => a.id !== id));
            return true;
        } catch (error) {
            console.error('[AppointmentContext] Erro ao deletar:', error);
            return false;
        }
    };

    const addToWaitingList = async (item) => {
        try {
            const novo = await db.insert('waiting_list', { ...item, userId: user?.id });
            setWaitingList(prev => [...prev, novo]); // PERF-02
            return true;
        } catch (error) {
            console.error('[AppointmentContext] Erro ao adicionar na fila:', error);
            return false;
        }
    };

    const removeFromWaitingList = async (id) => {
        try {
            await db.delete('waiting_list', id);
            setWaitingList(prev => prev.filter(w => w.id !== id)); // PERF-02
            return true;
        } catch (error) {
            console.error('[AppointmentContext] Erro ao remover da fila:', error);
            return false;
        }
    };

    const updateAgendaSettings = async (configs) => {
        setAgendaSettings(configs);
        if (updateConfigs) {
            await updateConfigs({ agendaSettings: configs });
        }
    };

    return (
        <AppointmentContext.Provider value={{
            appointments, loading, addAppointment, updateAppointment, deleteAppointment,
            waitingList, addToWaitingList, removeFromWaitingList,
            agendaSettings, updateAgendaSettings
        }}>
            {children}
        </AppointmentContext.Provider>
    );
};


