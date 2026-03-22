import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../utils/db';
import { useUser } from './UserContext';

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
    }, [user]);

    const addDeclaracao = async (data) => {
        try {
            const novo = await db.insert('declaracoes', {
                ...data,
                userId: user?.id,
                status: data.status || 'Finalizado',
                professional_name: user?.nome
            });
            setDeclaracoes(await db.list('declaracoes'));
            return novo;
        } catch (error) {
            console.error('[DeclaracaoContext] Erro ao adicionar:', error);
            throw error;
        }
    };

    const updateDeclaracao = async (id, data) => {
        try {
            await db.update('declaracoes', id, data);
            setDeclaracoes(await db.list('declaracoes'));
        } catch (error) {
            console.error('[DeclaracaoContext] Erro ao atualizar:', error);
        }
    };

    const deleteDeclaracao = async (id) => {
        try {
            await db.delete('declaracoes', id);
            setDeclaracoes(await db.list('declaracoes'));
        } catch (error) {
            console.error('[DeclaracaoContext] Erro ao deletar:', error);
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
