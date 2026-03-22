import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../utils/db';
import { useUser } from './UserContext';

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
    }, [user]);

    const addAnamnese = async (data) => {
        try {
            const novo = await db.insert('anamneses', {
                ...data,
                userId: user?.id,
                status: data.status || 'Finalizado',
                professional_name: user?.nome
            });
            setAnamneses(await db.list('anamneses'));
            return novo;
        } catch (error) {
            console.error('[AnamneseContext] Erro ao adicionar:', error);
            throw error;
        }
    };

    const updateAnamnese = async (id, data) => {
        try {
            await db.update('anamneses', id, data);
            setAnamneses(await db.list('anamneses'));
        } catch (error) {
            console.error('[AnamneseContext] Erro ao atualizar:', error);
        }
    };

    const deleteAnamnese = async (id) => {
        try {
            await db.delete('anamneses', id);
            setAnamneses(await db.list('anamneses'));
        } catch (error) {
            console.error('[AnamneseContext] Erro ao deletar:', error);
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
