import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../utils/db';
import { useUser } from './UserContext';

const LaudoContext = createContext();

export const useLaudos = () => {
    const context = useContext(LaudoContext);
    if (!context) {
        throw new Error('useLaudos must be used within a LaudoProvider');
    }
    return context;
};

export const LaudoProvider = ({ children }) => {
    const { user } = useUser();
    const [laudos, setLaudos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (user && user.id !== 'guest') {
                setLoading(true);
                try {
                    setLaudos(await db.list('laudos'));
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    // PERF-01 FIX: user?.id evita re-fetch em atualizações de perfil
    }, [user?.id]);

    const addLaudo = async (data) => {
        try {
            const novo = await db.insert('laudos', {
                ...data, userId: user?.id, status: data.status || 'Pendente', professional_name: user?.nome
            });
            setLaudos(prev => [...prev, novo]); // PERF-02: optimistic update
            return novo;
        } catch (error) {
            console.error('[LaudoContext] Erro ao adicionar:', error);
            throw error;
        }
    };

    const updateLaudo = async (id, data) => {
        try {
            const atualizado = await db.update('laudos', id, data);
            setLaudos(prev => prev.map(l => l.id === id ? { ...l, ...atualizado } : l)); // PERF-02
        } catch (error) {
            console.error('[LaudoContext] Erro ao atualizar:', error);
        }
    };

    const deleteLaudo = async (id) => {
        try {
            await db.delete('laudos', id);
            setLaudos(prev => prev.filter(l => l.id !== id)); // PERF-02
        } catch (error) {
            console.error('[LaudoContext] Erro ao deletar:', error);
        }
    };

    const getLaudosByPatient = (patientId) => {
        return laudos.filter(l => l.pacienteId === patientId);
    };

    const getLaudoById = (id) => {
        return laudos.find(l => l.id === id) || null;
    };

    return (
        <LaudoContext.Provider value={{ 
            laudos, 
            loading, 
            addLaudo, 
            updateLaudo, 
            deleteLaudo, 
            getLaudosByPatient, 
            getLaudoById 
        }}>
            {children}
        </LaudoContext.Provider>
    );
};


