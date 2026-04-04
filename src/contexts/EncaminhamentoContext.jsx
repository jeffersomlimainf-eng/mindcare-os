import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../utils/db';
import { useUser } from './UserContext';

const EncaminhamentoContext = createContext();

export const useEncaminhamentos = () => {
    const context = useContext(EncaminhamentoContext);
    if (!context) {
        throw new Error('useEncaminhamentos must be used within an EncaminhamentoProvider');
    }
    return context;
};

export const EncaminhamentoProvider = ({ children }) => {
    const { user } = useUser();
    const [encaminhamentos, setEncaminhamentos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (user && user.id !== 'guest') {
                setLoading(true);
                try {
                    setEncaminhamentos(await db.list('encaminhamentos'));
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    }, [user?.id]); // PERF-01 FIX

    const addEncaminhamento = async (data) => {
        try {
            const novo = await db.insert('encaminhamentos', {
                ...data, userId: user?.id, status: data.status || 'Finalizado', professional_name: user?.nome
            });
            setEncaminhamentos(prev => [...prev, novo]); // PERF-02
            return novo;
        } catch (error) {
            console.error('[EncaminhamentoContext] Erro ao adicionar:', error);
            throw error;
        }
    };

    const updateEncaminhamento = async (id, data) => {
        try {
            const atualizado = await db.update('encaminhamentos', id, data);
            setEncaminhamentos(prev => prev.map(e => e.id === id ? { ...e, ...atualizado } : e)); // PERF-02
        } catch (error) {
            console.error('[EncaminhamentoContext] Erro ao atualizar:', error);
        }
    };

    const deleteEncaminhamento = async (id) => {
        try {
            await db.delete('encaminhamentos', id);
            setEncaminhamentos(prev => prev.filter(e => e.id !== id)); // PERF-02
        } catch (error) {
            console.error('[EncaminhamentoContext] Erro ao deletar:', error);
        }
    };

    const getEncaminhamentosByPatient = (patientId) => {
        return encaminhamentos.filter(e => e.pacienteId === patientId);
    };

    const getEncaminhamentoById = (id) => {
        return encaminhamentos.find(e => e.id === id) || null;
    };

    return (
        <EncaminhamentoContext.Provider value={{ 
            encaminhamentos, 
            loading, 
            addEncaminhamento, 
            updateEncaminhamento, 
            deleteEncaminhamento, 
            getEncaminhamentosByPatient, 
            getEncaminhamentoById 
        }}>
            {children}
        </EncaminhamentoContext.Provider>
    );
};


