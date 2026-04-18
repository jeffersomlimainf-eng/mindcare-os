import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../utils/db';
import { useUser } from './UserContext';

import { logger } from '../utils/logger';
const AnamneseContext = createContext();

export const useAnamneses = () => {
    const context = useContext(AnamneseContext);
    if (!context) {
        throw new Error('useAnamneses must be used within an AnamneseProvider');
    }
    return context;
};

export const AnamneseProvider = ({ children }) => {
    const { user } = useUser();
    const [anamneses, setAnamneses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (user && user.id !== 'guest') {
                setLoading(true);
                try {
                    setAnamneses(await db.list('anamneses'));
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    }, [user?.id]); // PERF-01 FIX

    const addAnamnese = async (data) => {
        try {
            const novo = await db.insert('anamneses', {
                ...data, userId: user?.id, status: data.status || 'Finalizado', professional_name: user?.nome
            });
            setAnamneses(prev => [...prev, novo]); // PERF-02
            return novo;
        } catch (error) {
            logger.error('[AnamneseContext] Erro ao adicionar:', error);
            throw error;
        }
    };

    const updateAnamnese = async (id, data) => {
        try {
            const atualizado = await db.update('anamneses', id, data);
            setAnamneses(prev => prev.map(a => a.id === id ? { ...a, ...atualizado } : a)); // PERF-02
        } catch (error) {
            logger.error('[AnamneseContext] Erro ao atualizar:', error);
        }
    };

    const deleteAnamnese = async (id) => {
        try {
            await db.delete('anamneses', id);
            setAnamneses(prev => prev.filter(a => a.id !== id)); // PERF-02
        } catch (error) {
            logger.error('[AnamneseContext] Erro ao deletar:', error);
        }
    };

    const getAnamnesesByPatient = (patientId) => {
        return anamneses.filter(a => a.pacienteId === patientId);
    };

    const getAnamneseById = (id) => {
        return anamneses.find(a => a.id === id) || null;
    };

    return (
        <AnamneseContext.Provider value={{ 
            anamneses, 
            loading, 
            addAnamnese, 
            updateAnamnese, 
            deleteAnamnese, 
            getAnamnesesByPatient, 
            getAnamneseById 
        }}>
            {children}
        </AnamneseContext.Provider>
    );
};



