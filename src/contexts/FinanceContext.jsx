import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../utils/db';
import { useUser } from './UserContext';

export const SUBCATEGORIAS = {
    receita: [
        { value: 'sessao', label: 'Sessão Individual' },
        { value: 'pacote', label: 'Pacote de Sessões' },
        { value: 'laudo', label: 'Emissão de Laudo' },
        { value: 'palestra', label: 'Palestra / Workshop' },
        { value: 'supervisao', label: 'Supervisão' }
    ],
    despesa: [
        { value: 'aluguel', label: 'Aluguel / Condomínio' },
        { value: 'luz_agua_tel', label: 'Luz / Água / Telefone' },
        { value: 'marketing', label: 'Marketing / Anúncios' },
        { value: 'software', label: 'Software / Assinaturas' },
        { value: 'limpeza', label: 'Limpeza / Manutenção' },
        { value: 'materiais', label: 'Materiais de Escritório' },
        { value: 'impostos', label: 'Impostos / DAS' }
    ]
};

const FinanceContext = createContext();

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (!context) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
};

export const FinanceProvider = ({ children }) => {
    const { user } = useUser();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (user && user.id !== 'guest') {
                setLoading(true);
                try {
                    setTransactions(await db.list('finance'));
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    // PERF-01 FIX: usar user?.id em vez de user (objeto inteiro)
    // Antes: qualquer campo do perfil (plano, configs, etc.) re-disparava db.list()
    // Depois: só re-carrega quando o usuário real muda (login/logout)
    }, [user?.id]);

    // PERF-02 FIX: refreshData mantido apenas para uso explícito (ex: sincronização forçada)
    const refreshData = async () => setTransactions(await db.list('finance'));

    const addTransaction = async (data) => {
        try {
            const novo = await db.insert('finance', { ...data, userId: user?.id });
            // PERF-02: optimistic update — sem segundo db.list()
            setTransactions(prev => [...prev, novo]);
            return novo;
        } catch (error) {
            console.error('[FinanceContext] Erro ao adicionar:', error);
            throw error;
        }
    };

    const updateTransaction = async (id, updates) => {
        try {
            const atualizado = await db.update('finance', id, updates);
            // PERF-02: merge local do item atualizado
            setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...atualizado } : t));
        } catch (e) {
            console.error('[FinanceContext] Erro ao atualizar:', e);
        }
    };

    const deleteTransaction = async (id) => {
        try {
            await db.delete('finance', id);
            // PERF-02: remover localmente sem refetch
            setTransactions(prev => prev.filter(t => t.id !== id));
        } catch (e) {
            console.error('[FinanceContext] Erro ao excluir:', e);
        }
    };

    const _parseDate = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr + 'T00:00:00');
        return isNaN(d.getTime()) ? null : d;
    };

    const _today = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const getContasVencidas = () => {
        const hoje = _today();
        return transactions.filter(t => {
            if (t.status !== 'Pendente') return false;
            const dt = _parseDate(t.dataVencimento);
            return dt && dt < hoje;
        });
    };

    const getContasVencemHoje = () => {
        const hoje = _today().getTime();
        return transactions.filter(t => {
            if (t.status !== 'Pendente') return false;
            const dt = _parseDate(t.dataVencimento);
            return dt && dt.getTime() === hoje;
        });
    };

    const getContasProximas = () => {
        const hoje = _today();
        const limite = new Date(hoje);
        limite.setDate(limite.getDate() + 7);
        return transactions.filter(t => {
            if (t.status !== 'Pendente') return false;
            const dt = _parseDate(t.dataVencimento);
            return dt && dt > hoje && dt <= limite;
        });
    };

    const getStatusVencimento = (t) => {
        if (!t || t.status !== 'Pendente') return null;
        const hoje = _today();
        const dt = _parseDate(t.dataVencimento);
        if (!dt) return null;
        if (dt.getTime() < hoje.getTime()) return 'vencido';
        if (dt.getTime() === hoje.getTime()) return 'hoje';
        const limite = new Date(hoje);
        limite.setDate(limite.getDate() + 7);
        if (dt <= limite) return 'proximo';
        return null;
    };

    // BUG-01 FIX: useMemo garante recálculo toda vez que transactions mudar
    // BUG-02 FIX: filtro por campo 'tipo', não pelo sinal matemático do valor
    const stats = useMemo(() => {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const mesAtual = agora.getMonth(); // 0-11

        const inCurrentMonth = (dateStr) => {
            if (!dateStr) return false;
            const d = _parseDate(dateStr);
            return d && d.getFullYear() === anoAtual && d.getMonth() === mesAtual;
        };

        const currentMonthTransactions = transactions.filter(t => inCurrentMonth(t.dataVencimento));

        return {
            receitaMensal: currentMonthTransactions
                .filter(t => t?.tipo?.toLowerCase() === 'receita')
                .reduce((acc, t) => acc + Math.abs(t?.valor || 0), 0),
            despesaMensal: currentMonthTransactions
                .filter(t => t?.tipo?.toLowerCase() === 'despesa')
                .reduce((acc, t) => acc + Math.abs(t?.valor || 0), 0)
        };
    }, [transactions]);

    return (
        <FinanceContext.Provider value={{
            transactions,
            loading,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            getContasVencidas,
            getContasVencemHoje,
            getContasProximas,
            getStatusVencimento,
            stats
        }}>
            {children}
        </FinanceContext.Provider>
    );
};


