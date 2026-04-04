import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../utils/db';
import { useUser } from './UserContext';

const TcleContext = createContext();

export const useTcles = () => {
    const context = useContext(TcleContext);
    if (!context) {
        throw new Error('useTcles must be used within a TcleProvider');
    }
    return context;
};

export const TcleProvider = ({ children }) => {
    const { user } = useUser();
    const [tcles, setTcles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (user && user.id !== 'guest') {
                setLoading(true);
                try {
                    setTcles(await db.list('tcles'));
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    }, [user?.id]); // PERF-01 FIX

    const addTcle = async (data) => {
        try {
            const payload = { ...data };
            // Remover campos que não devem ser enviados - o user_id é auto-preenchido via auth.uid()
            delete payload.userId;
            delete payload.professional_name;
            
            const novo = await db.insert('tcles', { ...payload, status: data.status || 'Pendente' });
            setTcles(prev => [...prev, novo]); // PERF-02
            return novo;
        } catch (error) {
            console.error('[TcleContext] Erro ao adicionar:', error);
            console.error('[TcleContext] Payload original:', JSON.stringify(data, null, 2));
            throw error;
        }
    };

    const updateTcle = async (id, data) => {
        try {
            const atualizado = await db.update('tcles', id, data);
            setTcles(prev => prev.map(t => t.id === id ? { ...t, ...atualizado } : t)); // PERF-02
        } catch (error) {
            console.error('[TcleContext] Erro ao atualizar:', error);
        }
    };

    const deleteTcle = async (id) => {
        try {
            await db.delete('tcles', id);
            setTcles(prev => prev.filter(t => t.id !== id)); // PERF-02
        } catch (error) {
            console.error('[TcleContext] Erro ao deletar:', error);
        }
    };

    const getTclesByPatient = (patientId) => {
        return tcles.filter(t => t.pacienteId === patientId);
    };

    const getTcleById = (id) => {
        return tcles.find(t => t.id === id) || null;
    };

    return (
        <TcleContext.Provider value={{ 
            tcles, 
            loading, 
            addTcle, 
            updateTcle, 
            deleteTcle, 
            getTclesByPatient, 
            getTcleById 
        }}>
            {children}
        </TcleContext.Provider>
    );
};


