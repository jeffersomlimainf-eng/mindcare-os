import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../utils/db';
import { useUser } from './UserContext';

import { logger } from '../utils/logger';
const DeclaracaoContext = createContext();

export const useDeclaracoes = () => {
    const context = useContext(DeclaracaoContext);
    if (!context) {
        throw new Error('useDeclaracoes must be used within a DeclaracaoProvider');
    }
    return context;
};

export const DeclaracaoProvider = ({ children }) => {
    const { user } = useUser();
    const [declaracoes, setDeclaracoes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (user && user.id !== 'guest') {
                setLoading(true);
                try {
                    setDeclaracoes(await db.list('declaracoes'));
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    }, [user?.id]); // PERF-01 FIX

    const addDeclaracao = async (data) => {
        try {
            const novo = await db.insert('declaracoes', {
                ...data, userId: user?.id, status: data.status || 'Finalizado', professional_name: user?.nome
            });
            setDeclaracoes(prev => [...prev, novo]); // PERF-02
            return novo;
        } catch (error) {
            logger.error('[DeclaracaoContext] Erro ao adicionar:', error);
            throw error;
        }
    };

    const updateDeclaracao = async (id, data) => {
        try {
            const atualizado = await db.update('declaracoes', id, data);
            setDeclaracoes(prev => prev.map(d => d.id === id ? { ...d, ...atualizado } : d)); // PERF-02
        } catch (error) {
            logger.error('[DeclaracaoContext] Erro ao atualizar:', error);
        }
    };

    const deleteDeclaracao = async (id) => {
        try {
            await db.delete('declaracoes', id);
            setDeclaracoes(prev => prev.filter(d => d.id !== id)); // PERF-02
        } catch (error) {
            logger.error('[DeclaracaoContext] Erro ao deletar:', error);
        }
    };

    const getDeclaracoesByPatient = (patientId) => {
        return declaracoes.filter(d => d.pacienteId === patientId);
    };

    const getDeclaracaoById = (id) => {
        return declaracoes.find(d => d.id === id) || null;
    };

    return (
        <DeclaracaoContext.Provider value={{ 
            declaracoes, 
            loading, 
            addDeclaracao, 
            updateDeclaracao, 
            deleteDeclaracao,
            getDeclaracoesByPatient,
            getDeclaracaoById
        }}>
            {children}
        </DeclaracaoContext.Provider>
    );
};



