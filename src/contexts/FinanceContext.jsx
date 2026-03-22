import { createContext, useContext, useState, useEffect } from 'react';
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
    }, [user]);

    const refreshData = async () => setTransactions(await db.list('finance'));

    const addTransaction = async (data) => {
        try {
            const novo = await db.insert('finance', {
                ...data,
                userId: user?.id,
                date: data.data || new Date().toISOString()
            });
            await refreshData();
            return novo;
        } catch (error) {
            console.error('[FinanceContext] Erro ao adicionar:', error);
            throw error;
        }
    };

    const updateTransaction = async (id, updates) => {
        try {
            await db.update('finance', id, updates);
            await refreshData();
        } catch (e) {
            console.error('[FinanceContext] Erro ao atualizar:', e);
        }
    };

    const deleteTransaction = async (id) => {
        try {
            await db.delete('finance', id);
            await refreshData();
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

    const stats = {
        receitaMensal: transactions.filter(t => (t?.valor || 0) > 0).reduce((acc, t) => acc + (t?.valor || 0), 0),
        despesaMensal: transactions.filter(t => (t?.valor || 0) < 0).reduce((acc, t) => acc + Math.abs(t?.valor || 0), 0)
    };

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
