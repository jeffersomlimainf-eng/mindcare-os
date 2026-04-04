import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../utils/db';
import { useUser } from './UserContext';

const AtestadoContext = createContext();

export const useAtestados = () => {
    const context = useContext(AtestadoContext);
    if (!context) {
        throw new Error('useAtestados must be used within an AtestadoProvider');
    }
    return context;
};

export const AtestadoProvider = ({ children }) => {
    const { user } = useUser();
    const [atestados, setAtestados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (user && user.id !== 'guest') {
                setLoading(true);
                try {
                    setAtestados(await db.list('atestados'));
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    }, [user?.id]); // PERF-01 FIX

    const addAtestado = async (data) => {
        try {
            const novo = await db.insert('atestados', {
                ...data, userId: user?.id, status: data.status || 'Finalizado', professional_name: user?.nome
            });
            setAtestados(prev => [...prev, novo]); // PERF-02
            return novo;
        } catch (error) {
            console.error('[AtestadoContext] Erro ao adicionar:', error);
            throw error;
        }
    };

    const updateAtestado = async (id, data) => {
        try {
            const atualizado = await db.update('atestados', id, data);
            setAtestados(prev => prev.map(a => a.id === id ? { ...a, ...atualizado } : a)); // PERF-02
        } catch (error) {
            console.error('[AtestadoContext] Erro ao atualizar:', error);
        }
    };

    const deleteAtestado = async (id) => {
        try {
            await db.delete('atestados', id);
            setAtestados(prev => prev.filter(a => a.id !== id)); // PERF-02
        } catch (error) {
            console.error('[AtestadoContext] Erro ao deletar:', error);
        }
    };

    const getAtestadosByPatient = (patientId) => {
        return atestados.filter(a => a.pacienteId === patientId);
    };

    const getAtestadoById = (id) => {
        return atestados.find(a => a.id === id) || null;
    };

    return (
        <AtestadoContext.Provider value={{ 
            atestados, 
            loading, 
            addAtestado, 
            updateAtestado, 
            deleteAtestado, 
            getAtestadosByPatient, 
            getAtestadoById 
        }}>
            {children}
        </AtestadoContext.Provider>
    );
};


