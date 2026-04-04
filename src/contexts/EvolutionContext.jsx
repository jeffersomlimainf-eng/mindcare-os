import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../utils/db';
import { useUser } from './UserContext';

const EvolutionContext = createContext();

export const useEvolutions = () => {
    const context = useContext(EvolutionContext);
    if (!context) {
        throw new Error('useEvolutions must be used within an EvolutionProvider');
    }
    return context;
};

export const EvolutionProvider = ({ children }) => {
    const { user } = useUser();
    const [evolutions, setEvolutions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sincronizar evoluções do tenant logado
    useEffect(() => {
        const load = async () => {
            if (user && user.id !== 'guest') {
                setLoading(true);
                try {
                    setEvolutions(await db.list('evolutions'));
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    // PERF-01 FIX: user?.id evita re-fetch em atualizações de perfil
    }, [user?.id]);

    const addEvolution = async (data) => {
        try {
            // Consolidar campos SOAP em content_soap (JSONB)
            const contentSoap = {
                subjetivo: data.subjetivo || data.evolucao || '',
                objetivo: data.objetivo || '',
                avaliacao: data.avaliacao || '',
                plano: data.plano || data.planejamento || ''
            };

            const nova = await db.insert('evolutions', {
                pacienteId: data.pacienteId,
                pacienteNome: data.pacienteNome,
                dataHora: data.dataHora,
                tipo: data.tipoAtendimento || data.tipo || 'Sessão Individual',
                status: data.status || 'Finalizado',
                profissionalNome: data.profissionalNome || user?.nome,
                conteudo: contentSoap,
                tecnicas: data.tecnicas || [],
                observacoes: data.observacoes || '',
                humorPaciente: data.humorPaciente || 'neutro',
                nivelRisco: data.nivelRisco || 'baixo',
                duracaoSessao: parseInt(data.duracaoSessao) || 50,
                numeroSessao: parseInt(data.numeroSessao) || 1,
                formato: data.formato || 'SOAP',
                userId: user?.id,
            });
            setEvolutions(prev => [...prev, nova]); // PERF-02: optimistic update
            return nova;
        } catch (error) {
            console.error('[EvolutionContext] Erro ao adicionar:', error);
            throw error;
        }
    };

    const updateEvolution = async (id, data) => {
        try {
            // Consolidar campos SOAP se eles estiverem presentes no objeto 'data'
            const updates = { ...data };
            
            if (data.subjetivo !== undefined || data.objetivo !== undefined || data.avaliacao !== undefined || data.plano !== undefined) {
                updates.conteudo = {
                    subjetivo: data.subjetivo ?? '',
                    objetivo: data.objetivo ?? '',
                    avaliacao: data.avaliacao ?? '',
                    plano: data.plano ?? ''
                };
            }

            // Mapear campos de atendimento se presentes
            if (data.tipoAtendimento) updates.tipo = data.tipoAtendimento;
            
            // Mapear técnicas se presentes (salvar objeto completo como JSONB)
            if (data.tecnicas) {
                updates.tecnicas = data.tecnicas;
            }

            // Mapear humor e nível de risco
            // BUG-15 FIX: linha removida — db.js já mapeia 'humorPaciente' → 'humor' automaticamente via _mapKeysToDB
            if (data.nivelRisco) updates.nivelRisco = data.nivelRisco;
            if (data.observacoes) updates.observacoes = data.observacoes;
            if (data.duracaoSessao) updates.duracaoSessao = parseInt(data.duracaoSessao);
            if (data.numeroSessao) updates.numeroSessao = parseInt(data.numeroSessao);
            if (data.dataHora) updates.dataHora = data.dataHora;

            const result = await db.update('evolutions', id, updates);
            setEvolutions(prev => prev.map(e => e.id === id ? { ...e, ...result } : e)); // PERF-02
            return result;
        } catch (error) {
            console.error('[EvolutionContext] Erro ao atualizar:', error);
            throw error; // BUG-14 FIX: propagar erro para o chamador saber da falha
        }
    };

    const deleteEvolution = async (id) => {
        try {
            await db.delete('evolutions', id);
            setEvolutions(prev => prev.filter(e => e.id !== id)); // PERF-02
        } catch (error) {
            console.error('[EvolutionContext] Erro ao deletar:', error);
        }
    };

    const getEvolutionsByPatient = (patientId) => {
        return evolutions.filter(e => e.pacienteId === patientId);
    };

    const getEvolutionById = (id) => {
        return evolutions.find(e => e.id === id) || null;
    };

    return (
        <EvolutionContext.Provider value={{ evolutions, loading, addEvolution, updateEvolution, deleteEvolution, getEvolutionsByPatient, getEvolutionById }}>
            {children}
        </EvolutionContext.Provider>
    );
};


