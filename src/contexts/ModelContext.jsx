import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../utils/db';
import { useUser } from './UserContext';

const ModelContext = createContext();

const defaultModels = [
    { id: '1', nome: 'Laudo de Avaliação Neuropsicológica', categoria: 'Laudos', ícone: 'article', cor: 'bg-blue-50 text-blue-600', uso: 47, data: '12/10/23' },
    { id: '2', nome: 'Atestado Psicológico Padrão (CFP)', categoria: 'Atestados', ícone: 'verified', cor: 'bg-amber-50 text-amber-600', uso: 89, data: '05/10/23' },
    { id: '3', nome: 'Declaração de Comparecimento / Acompanhamento', categoria: 'Declarações', ícone: 'description', cor: 'bg-emerald-50 text-emerald-600', uso: 132, data: '01/10/23' },
    { id: '4', nome: 'Ficha de Anamnese Padrão', categoria: 'Formulários', ícone: 'patient_list', cor: 'bg-orange-50 text-orange-600', uso: 23, data: '20/02/24' },
    { id: '5', nome: 'Encaminhamento Profissional', categoria: 'Encaminhamento', ícone: 'send', cor: 'bg-sky-50 text-sky-600', uso: 34, data: '25/02/24' },
    { id: '6', nome: 'Evolução de Sessão SOAP', categoria: 'Evolução', ícone: 'edit_note', cor: 'bg-rose-50 text-rose-600', uso: 215, data: '05/03/24' },
];

export const ModelProvider = ({ children }) => {
    const { user } = useUser();
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (user && user.id !== 'guest') {
                setLoading(true);
                try {
                    let remoteModels = await db.list('models');
                    
                    // Se estiver vazio, popula com os modelos padrões
                    if (remoteModels.length === 0) {
                        // PERF-07 FIX: Promise.all em vez de loop sequencial (6x mais rápido)
                        await Promise.all(
                            defaultModels.map(model => db.insert('models', {
                                ...model,
                                userId: user.id,
                                tenantId: user.tenantId,
                                conteudo: ''
                            }))
                        );
                        remoteModels = await db.list('models');
                    }
                    
                    setModels(remoteModels);
                } catch (error) {
                    console.error('[ModelContext] Erro ao carregar:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    // PERF-01 FIX: user?.id evita re-fetch em atualizações de perfil
    }, [user?.id]);

    const addModel = async (model) => {
        try {
            const newModel = await db.insert('models', {
                ...model, userId: user?.id, tenantId: user?.tenantId, uso: 0, conteudo: model.conteudo || ''
            });
            setModels(prev => [...prev, newModel]); // PERF-02
            return newModel;
        } catch (error) {
            console.error('[ModelContext] Erro ao adicionar:', error);
        }
    };

    const updateModel = async (id, updatedData) => {
        try {
            const atualizado = await db.update('models', id, updatedData);
            setModels(prev => prev.map(m => m.id === id ? { ...m, ...atualizado } : m)); // PERF-02
        } catch (error) {
            console.error('[ModelContext] Erro ao atualizar:', error);
        }
    };

    const deleteModel = async (id) => {
        try {
            await db.delete('models', id);
            setModels(prev => prev.filter(m => m.id !== id)); // PERF-02
        } catch (error) {
            console.error('[ModelContext] Erro ao deletar:', error);
        }
    };

    const incrementUsage = async (id) => {
        const model = models.find(m => m.id === id);
        if (model) {
            const novoUso = (model.uso || 0) + 1;
            // PERF-02: Atualizar localmente antes de persistir (sem db.list())
            setModels(prev => prev.map(m => m.id === id ? { ...m, uso: novoUso } : m));
            await db.update('models', id, { uso: novoUso });
        }
    };

    return (
        <ModelContext.Provider value={{ models, addModel, updateModel, deleteModel, incrementUsage }}>
            {children}
        </ModelContext.Provider>
    );
};

export const useModels = () => {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error('useModels must be used within a ModelProvider');
    }
    return context;
};


