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
    }, [user]);

    const addEncaminhamento = async (data) => {
        try {
            const novo = await db.insert('encaminhamentos', {
                ...data,
                userId: user?.id,
                status: data.status || 'Finalizado',
                professional_name: user?.nome
            });
            setEncaminhamentos(await db.list('encaminhamentos'));
            return novo;
        } catch (error) {
            console.error('[EncaminhamentoContext] Erro ao adicionar:', error);
            throw error;
        }
    };

    const updateEncaminhamento = async (id, data) => {
        try {
            await db.update('encaminhamentos', id, data);
            setEncaminhamentos(await db.list('encaminhamentos'));
        } catch (error) {
            console.error('[EncaminhamentoContext] Erro ao atualizar:', error);
        }
    };

    const deleteEncaminhamento = async (id) => {
        try {
            await db.delete('encaminhamentos', id);
            setEncaminhamentos(await db.list('encaminhamentos'));
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
