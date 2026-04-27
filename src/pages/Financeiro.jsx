import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NovoLancamentoModal from '../components/NovoLancamentoModal';
import { useFinance, SUBCATEGORIAS } from '../contexts/FinanceContext';
import { showToast } from '../components/Toast';
import GraficosFinanceiros from '../components/GraficosFinanceiros';
import ReciboModal from '../components/ReciboModal';
import { usePatients } from '../contexts/PatientContext';
import HelpModal from '../components/HelpModal';
import { HELP_CONTENT } from '../constants/helpContent';
import FeatureTour from '../components/FeatureTour';
import useFirstVisit from '../hooks/useFirstVisit';
import useDismissible from '../hooks/useDismissible';
import { useUser } from '../contexts/UserContext';
import { generateWhatsAppLink, messages } from '../utils/whatsapp';
import { logger } from '../utils/logger';

const FINANCE_COLORS_CFG = {
    categorias: {
        clinica: { label: 'Clínica', icon: 'medical_services', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', badge: 'bg-sky-100/80 text-sky-800' },
        pessoal: { label: 'Pessoal', icon: 'person', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100/80 text-slate-800' }
    },
    status: {
        Pendente: { label: 'Pendente', icon: 'schedule', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'bg-amber-500' },
        Pago: { label: 'Pago', icon: 'check_circle', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: 'bg-emerald-500' },
        Recebido: { label: 'Recebido', icon: 'check_circle', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: 'bg-emerald-500' },
        Atrasado: { label: 'Atrasado', icon: 'error', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', accent: 'bg-rose-500' }
    },
    cards: {
        geral:   { bg: 'bg-white',          text: 'text-slate-900',   border: 'border-slate-200',  icon: 'account_balance',  grad: 'from-slate-50 to-white' },
        receber: { bg: 'bg-emerald-50/30',   text: 'text-emerald-600', border: 'border-emerald-100',icon: 'trending_up',      grad: 'from-emerald-50/50 to-white' },
        pagar:   { bg: 'bg-rose-50/30',      text: 'text-rose-500',    border: 'border-rose-100',   icon: 'trending_down',    grad: 'from-rose-50/50 to-white' },
        vencidas:{ bg: 'bg-amber-50/30',     text: 'text-amber-600',   border: 'border-amber-100',  icon: 'priority_high',    grad: 'from-amber-50/50 to-white' }
    }
};

const MESES_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const POR_PAGINA   = 20;

const Financeiro = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const { transactions, addTransaction, updateTransaction, deleteTransaction, getContasVencidas, getContasVencemHoje, getStatusVencimento } = useFinance();
    const { patients } = usePatients();

    // ── Filtros & UI state ──────────────────────────────────────────
    const [modalAberto,        setModalAberto]        = useState(false);
    const [lancamentoEditando, setLancamentoEditando] = useState(null);
    const [abaAtiva,           setAbaAtiva]           = useState('geral');
    const [filtroCategoria,    setFiltroCategoria]    = useState('todas');
    const [filtroCliente,      setFiltroCliente]      = useState('todos');
    const [filtroBusca,        setFiltroBusca]        = useState('');
    const [selecionados,       setSelecionados]       = useState([]);
    const [mostrarGraficos,    setMostrarGraficos]    = useState(false);
    const [reciboAberto,       setReciboAberto]       = useState(false);
    const [transacaoRecibo,    setTransacaoRecibo]    = useState(null);
    const [tipoPadrao,         setTipoPadrao]         = useState('receita');
    const [showHelp,           setShowHelp]           = useState(false);
    const [showTour,           setShowTour]           = useState(false);
    const [deleteConfirm,      setDeleteConfirm]      = useState(null); // id da transação

    // ── Período ─────────────────────────────────────────────────────
    const agora    = new Date();
    const [filtroMes,         setFiltroMes]         = useState(agora.getMonth());
    const [filtroAno,         setFiltroAno]         = useState(agora.getFullYear());
    const [filtroTodoPeriodo, setFiltroTodoPeriodo] = useState(false);

    // ── Ordenação ───────────────────────────────────────────────────
    const [sortCol, setSortCol] = useState('dataVencimento');
    const [sortDir, setSortDir] = useState('desc');

    // ── Paginação ───────────────────────────────────────────────────
    const [pagina, setPagina] = useState(1);

    const { shouldTrigger: financeiroFirstVisit, markAsCompleted: markFinanceiroTourCompleted } = useFirstVisit('financeiro');
    const [financeiroBannerDismissed, dismissFinanceiroBanner] = useDismissible('financeiro_cobranca');

    useEffect(() => { if (financeiroFirstVisit) setShowTour(true); }, [financeiroFirstVisit]);

    // Reset página ao mudar qualquer filtro/ordem
    useEffect(() => {
        setPagina(1);
    }, [filtroBusca, filtroMes, filtroAno, filtroTodoPeriodo, filtroCategoria, filtroCliente, abaAtiva, sortCol, sortDir]);

    // ── Helpers período ─────────────────────────────────────────────
    const handlePrevMes = () => {
        if (filtroTodoPeriodo) return;
        if (filtroMes === 0) { setFiltroMes(11); setFiltroAno(y => y - 1); }
        else setFiltroMes(m => m - 1);
    };
    const handleNextMes = () => {
        if (filtroTodoPeriodo) return;
        if (filtroMes === 11) { setFiltroMes(0); setFiltroAno(y => y + 1); }
        else setFiltroMes(m => m + 1);
    };

    // ── Helpers ordenação ───────────────────────────────────────────
    const handleSort = (col) => {
        if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortCol(col); setSortDir('asc'); }
    };
    const SortIcon = ({ col }) => {
        if (sortCol !== col) return <span className="material-symbols-outlined" style={{ fontSize: 12, color: '#cbd5e1', marginLeft: 2, verticalAlign: 'middle' }}>unfold_more</span>;
        return <span className="material-symbols-outlined" style={{ fontSize: 12, color: 'var(--color-primary, #7c3aed)', marginLeft: 2, verticalAlign: 'middle' }}>{sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>;
    };

    // ── Lookup paciente ─────────────────────────────────────────────
    const getPacienteNome = useCallback((t) => {
        const pid = t.patient_id || t.pacienteId;
        if (!pid) return null;
        return patients.find(p => p.id === pid)?.nome || null;
    }, [patients]);

    // ── Pipeline de filtragem ───────────────────────────────────────
    const safe = Array.isArray(transactions) ? transactions.filter(Boolean) : [];

    const filteredCat = filtroCategoria === 'todas' ? safe : safe.filter(t => t.categoria === filtroCategoria);

    const filteredCliente = filtroCliente === 'todos'
        ? filteredCat
        : filteredCat.filter(t => t.patient_id === filtroCliente || t.pacienteId === filtroCliente);

    const filteredBusca = filtroBusca.trim()
        ? filteredCliente.filter(t => {
            const q = filtroBusca.toLowerCase();
            if ((t.desc || '').toLowerCase().includes(q)) return true;
            const nome = getPacienteNome(t);
            return nome?.toLowerCase().includes(q);
        })
        : filteredCliente;

    const filteredPeriodo = filtroTodoPeriodo
        ? filteredBusca
        : filteredBusca.filter(t => {
            if (!t.dataVencimento) return false;
            const [y, m] = t.dataVencimento.split('-');
            return parseInt(y) === filtroAno && (parseInt(m) - 1) === filtroMes;
        });

    // KPI cards usam o período filtrado
    const receitas     = filteredPeriodo.filter(t => (t?.valor || 0) > 0);
    const despesas     = filteredPeriodo.filter(t => (t?.valor || 0) < 0);
    const totalReceitas  = receitas.reduce((a, b) => a + (b?.valor || 0), 0);
    const totalDespesas  = despesas.reduce((a, b) => a + (b?.valor || 0), 0);
    const saldo          = totalReceitas + totalDespesas;
    const realizadoReceitas = receitas.filter(r => r.status !== 'Pendente').reduce((a, b) => a + (b?.valor || 0), 0);
    const realizadoDespesas = despesas.filter(d => d.status !== 'Pendente').reduce((a, b) => a + (b?.valor || 0), 0);
    const saldoRealizado    = realizadoReceitas + realizadoDespesas;
    const pendentesTotalFiltered = filteredPeriodo.filter(t => t.status === 'Pendente');
    const vencidas = getContasVencidas();

    // Ordenação
    const sorted = [...filteredPeriodo].sort((a, b) => {
        let va, vb;
        if (sortCol === 'dataVencimento') { va = a.dataVencimento || ''; vb = b.dataVencimento || ''; }
        else if (sortCol === 'valor')     { va = Math.abs(a.valor || 0); vb = Math.abs(b.valor || 0); }
        else if (sortCol === 'status')    { va = a.status || ''; vb = b.status || ''; }
        else                              { va = (a.desc || '').toLowerCase(); vb = (b.desc || '').toLowerCase(); }
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    // Filtro por aba (sobre o resultado já ordenado)
    const dadosTabelaFull = abaAtiva === 'receber' ? sorted.filter(t => (t?.valor || 0) > 0)
        : abaAtiva === 'pagar'   ? sorted.filter(t => (t?.valor || 0) < 0)
        : abaAtiva === 'vencidas'? sorted.filter(t => t.status === 'Pendente')
        : sorted;

    // Paginação
    const totalPaginas = Math.max(1, Math.ceil(dadosTabelaFull.length / POR_PAGINA));
    const dadosTabela  = dadosTabelaFull.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

    const mostrarColunasPaciente = filtroCliente === 'todos';

    // ── Ações ────────────────────────────────────────────────────────
    const handleCobrarMultiplos = () => {
        if (selecionados.length === 0) return;
        navigate(`/financeiro/cobrar/${selecionados.join(',')}`);
        setSelecionados([]);
    };

    const handleSalvar = (dados) => {
        try {
            const valorNumerico = Number(dados?.valor) || 0;
            const novoValor     = dados.tipo === 'receita' ? Math.abs(valorNumerico) : -Math.abs(valorNumerico);
            const payload = {
                ...dados,
                valor:  novoValor,
                tipo:   dados.tipo.toLowerCase(),
                status: dados.tipo === 'receita'
                    ? (dados.status === 'recebido' ? 'Recebido' : 'Pendente')
                    : (dados.status === 'pago'     ? 'Pago'     : 'Pendente'),
            };
            if (lancamentoEditando) updateTransaction(lancamentoEditando.id, payload);
            else addTransaction(payload);
        } catch (err) {
            logger.error('[Financeiro] Erro ao salvar:', err);
            showToast('Erro ao salvar lançamento.', 'error');
        }
        setLancamentoEditando(null);
    };

    const handleAbrirEdicao = (l) => { setLancamentoEditando(l); setModalAberto(true); };
    const handleNovaReceita  = () => { setLancamentoEditando(null); setTipoPadrao('receita');  setModalAberto(true); };
    const handleNovaDespesa  = () => { setLancamentoEditando(null); setTipoPadrao('despesa');  setModalAberto(true); };

    const handleConfirmarDelete = (id) => {
        deleteTransaction(id);
        setDeleteConfirm(null);
        showToast('Excluído', 'info');
    };

    // ── Formatação ───────────────────────────────────────────────────
    const formatarData = (dataStr) => {
        if (!dataStr || typeof dataStr !== 'string') return '—';
        const parts = dataStr.split('-');
        if (parts.length !== 3) return dataStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const getVencimentoBadge = (t) => {
        const sv = getStatusVencimento(t);
        if (sv === 'vencido') return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 uppercase">Vencido</span>;
        if (sv === 'hoje')    return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase">Hoje</span>;
        if (sv === 'proximo') return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 uppercase">Próximo</span>;
        return null;
    };

    const getSubcategoriaLabel = (tipo, subcat) => {
        const list = SUBCATEGORIAS[tipo?.toLowerCase()] || [];
        return list.find(s => s.value === subcat)?.label || subcat || '—';
    };

    // ── Render ───────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} content={HELP_CONTENT.financeiro} onStartTour={() => setShowTour(true)} />

            <NovoLancamentoModal
                isOpen={modalAberto}
                onClose={() => { setModalAberto(false); setLancamentoEditando(null); }}
                onSave={handleSalvar}
                lancamentoEditando={lancamentoEditando}
                initialType={tipoPadrao}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Financeiro</span>
                        </div>
                        <button onClick={() => setShowHelp(true)} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-all border border-primary/10">
                            <span className="material-symbols-outlined text-[14px]">help_outline</span>
                            <span className="text-[9px] font-black uppercase tracking-tighter">Como funciona?</span>
                        </button>
                    </div>
                    <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold tracking-tight">Gestão Financeira</h1>
                    <p className="text-slate-500 font-medium mt-1">Controle de receitas e despesas.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button id="tour-financeiro-pix" onClick={handleNovaReceita} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-lg">add_circle</span> Nova Receita
                    </button>
                    <button onClick={handleNovaDespesa} className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-lg">do_not_disturb_on</span> Nova Despesa
                    </button>
                </div>
            </div>

            {/* Alertas de vencimento */}
            <div className="flex flex-wrap gap-2 px-1">
                {vencidas.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-black shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {vencidas.length} Atrasada{vencidas.length > 1 ? 's' : ''} (Atraso)
                    </div>
                )}
                {getContasVencemHoje().length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">event</span>
                        {getContasVencemHoje().length} Vence{getContasVencemHoje().length > 1 ? 'm' : ''} Hoje
                    </div>
                )}
            </div>

            {/* Cards KPI */}
            <div id="tour-financeiro-lucro" className="grid grid-cols-1 md:grid-cols-4 gap-4 px-1">
                {[
                    { id: 'geral',   label: 'Saldo em Caixa (Realizado)', value: saldoRealizado, subValue: saldo, subLabel: 'Saldo Projetado', type: 'geral' },
                    { id: 'receber', label: 'Receitas',  value: realizadoReceitas, subValue: totalReceitas, subLabel: 'Total Previsto', type: 'receber' },
                    { id: 'pagar',   label: 'Despesas',  value: Math.abs(realizadoDespesas), subValue: Math.abs(totalDespesas), subLabel: 'Total Previsto', type: 'pagar' },
                    { id: 'vencidas',label: 'Pendências',value: pendentesTotalFiltered.reduce((a, b) => a + Math.abs(b.valor || 0), 0), subLabel: `${vencidas.length} vencidos · ${pendentesTotalFiltered.length} total`, type: 'vencidas' },
                ].map((card, i) => {
                    const cfg = FINANCE_COLORS_CFG.cards[card.type];
                    const isNegativo = card.value < 0;
                    return (
                        <button key={card.id} onClick={() => setAbaAtiva(card.id)}
                            className={`group relative overflow-hidden rounded-2xl p-5 border transition-all text-left hover:shadow-md ${abaAtiva === card.id ? `bg-white shadow-lg border-2 ${cfg.border}` : `${cfg.bg} ${cfg.border}`}`}
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-5xl">{cfg.icon}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{card.label}</p>
                            <p className={`text-xl font-black tracking-tight ${isNegativo ? 'text-rose-600' : cfg.text}`}>
                                {card.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                            {card.subLabel && (
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                                    {card.subLabel} {card.subValue !== undefined && (
                                        <span className={card.subValue < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                                            ({card.subValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                                        </span>
                                    )}
                                </p>
                            )}
                            {abaAtiva === card.id && <div className={`absolute bottom-0 left-0 w-full h-1 ${cfg.text.replace('text-', 'bg-')}`} />}
                        </button>
                    );
                })}
            </div>

            {/* Banner régua de cobrança */}
            {!financeiroBannerDismissed && (
                <div className="glass dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent relative overflow-hidden group px-1">
                    <button onClick={dismissFinanceiroBanner} className="absolute top-3 right-3 z-20 size-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all" title="Dispensar">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                    <div className="absolute top-0 right-0 w-64 h-full bg-emerald-500/5 -skew-x-12 translate-x-32 group-hover:translate-x-20 transition-all duration-1000" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 px-4">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-emerald-600 text-2xl animate-bounce">payments</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Cobrança Inteligente</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl font-medium leading-relaxed">
                                    Configure lembretes automáticos via <span className="text-emerald-600 font-bold">WhatsApp</span> e <span className="text-emerald-600 font-bold">E-mail</span> para pacientes com sessões pendentes.
                                </p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/configuracoes')} className="px-6 py-3 bg-slate-900 dark:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 active:scale-95">
                            <span className="material-symbols-outlined text-sm">settings_suggest</span>
                            Configurar Régua
                        </button>
                    </div>
                </div>
            )}

            {/* Gráficos */}
            <div className="glass dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <button onClick={() => setMostrarGraficos(!mostrarGraficos)} className="w-full px-6 py-4 flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-xs font-bold uppercase tracking-widest">Análise de Dados</span>
                    <span className={`material-symbols-outlined transition-transform ${mostrarGraficos ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                {mostrarGraficos && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-700">
                        <GraficosFinanceiros transacoes={safe} />
                    </div>
                )}
            </div>

            {/* ── Barra de filtros ─────────────────────────────────────────── */}
            <div className="space-y-3 px-1">
                {/* Linha 1: busca + período */}
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                    {/* Busca */}
                    <div className="relative flex-1 max-w-xs">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">search</span>
                        <input
                            type="text"
                            value={filtroBusca}
                            onChange={e => setFiltroBusca(e.target.value)}
                            placeholder="Buscar por descrição ou paciente..."
                            className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-primary outline-none shadow-sm"
                        />
                        {filtroBusca && (
                            <button onClick={() => setFiltroBusca('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        )}
                    </div>

                    {/* Seletor de período */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setFiltroTodoPeriodo(v => !v); }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${filtroTodoPeriodo ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}
                        >
                            Todo o período
                        </button>
                        {!filtroTodoPeriodo && (
                            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-1 shadow-sm">
                                <button onClick={handlePrevMes} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all" title="Mês anterior">
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                                <span className="text-xs font-black text-slate-700 dark:text-slate-200 min-w-[70px] text-center tracking-tight">
                                    {MESES_LABELS[filtroMes]} {filtroAno}
                                </span>
                                <button onClick={handleNextMes} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all" title="Próximo mês">
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                                <button
                                    onClick={() => { setFiltroMes(agora.getMonth()); setFiltroAno(agora.getFullYear()); }}
                                    className="px-2 py-1 text-[9px] font-bold text-primary hover:bg-primary/10 rounded-lg transition-all uppercase tracking-widest"
                                    title="Voltar ao mês atual"
                                >
                                    Hoje
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Linha 2: aba (receita/despesa) + filtro categoria + filtro paciente */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex gap-2">
                        {['todas', 'clinica', 'pessoal'].map(f => (
                            <button key={f} onClick={() => setFiltroCategoria(f)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filtroCategoria === f ? 'bg-primary text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}
                            >
                                {f === 'todas' ? 'Tudo' : f === 'clinica' ? 'Clínica' : 'Pessoal'}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filtrar Paciente</span>
                            <select value={filtroCliente} onChange={e => { setFiltroCliente(e.target.value); setSelecionados([]); }}
                                className="text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                            >
                                <option value="todos">Todos os Pacientes</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.nome || p.name || 'Sem Nome'}</option>)}
                            </select>
                        </div>

                        {(abaAtiva !== 'geral' || filtroCategoria !== 'todas' || filtroCliente !== 'todos' || filtroBusca) && (
                            <button onClick={() => { setAbaAtiva('geral'); setFiltroCategoria('todas'); setFiltroCliente('todos'); setFiltroBusca(''); setSelecionados([]); showToast('Filtros limpos', 'info'); }}
                                className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest flex items-center gap-1 transition-all"
                            >
                                <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
                                Limpar
                            </button>
                        )}
                    </div>
                </div>

                {/* Contador de resultados */}
                <div className="flex items-center justify-between px-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {dadosTabelaFull.length} lançamento{dadosTabelaFull.length !== 1 ? 's' : ''}
                        {!filtroTodoPeriodo && ` em ${MESES_LABELS[filtroMes]}/${filtroAno}`}
                    </p>
                </div>
            </div>

            {/* ── Tabela ───────────────────────────────────────────────────── */}
            <div id="tour-financeiro-fluxo" className="glass dark:bg-slate-900/50 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 animate-settle">
                <div className="overflow-x-auto w-full scrollbar-thin">
                    <table className="w-full text-left whitespace-nowrap md:whitespace-normal min-w-[800px] md:min-w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                {filtroCliente !== 'todos' && <th className="px-4 md:px-6 py-3 md:py-4 w-8" />}
                                {/* Descrição — ordenável */}
                                <th className="px-4 md:px-6 py-3 md:py-4 cursor-pointer select-none" onClick={() => handleSort('desc')}>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Descrição <SortIcon col="desc" /></span>
                                </th>
                                {/* Paciente — só quando "todos" */}
                                {mostrarColunasPaciente && (
                                    <th className="px-4 md:px-6 py-3 md:py-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Paciente</span>
                                    </th>
                                )}
                                <th className="px-4 md:px-6 py-3 md:py-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Categoria</span>
                                </th>
                                {/* Vencimento — ordenável */}
                                <th className="px-4 md:px-6 py-3 md:py-4 cursor-pointer select-none" onClick={() => handleSort('dataVencimento')}>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vencimento <SortIcon col="dataVencimento" /></span>
                                </th>
                                {/* Status — ordenável */}
                                <th className="px-4 md:px-6 py-3 md:py-4 cursor-pointer select-none" onClick={() => handleSort('status')}>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status <SortIcon col="status" /></span>
                                </th>
                                {/* Valor — ordenável */}
                                <th className="px-4 md:px-6 py-3 md:py-4 text-right cursor-pointer select-none" onClick={() => handleSort('valor')}>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Valor <SortIcon col="valor" /></span>
                                </th>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {dadosTabela.length === 0 ? (
                                <tr>
                                    <td colSpan={mostrarColunasPaciente ? 8 : 7} className="px-6 py-16 text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-200 dark:text-slate-700 block mb-3">receipt_long</span>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum lançamento encontrado</p>
                                        <p className="text-[11px] text-slate-300 mt-1">Tente ajustar os filtros ou mudar o período.</p>
                                    </td>
                                </tr>
                            ) : dadosTabela.map((l) => {
                                const isReceita   = l.tipo?.toLowerCase() === 'receita';
                                const rowClass    = isReceita ? 'bg-emerald-50/10 hover:bg-emerald-50/30' : 'bg-rose-50/10 hover:bg-rose-50/30';
                                const pacienteNome = getPacienteNome(l);
                                const isDeletando  = deleteConfirm === l.id;

                                return (
                                    <tr key={l.id}
                                        className={`${rowClass} transition-all cursor-pointer border-l-4 ${isReceita ? 'border-l-emerald-400' : 'border-l-rose-400'}`}
                                        onClick={() => { if (!isDeletando) handleAbrirEdicao(l); }}
                                    >
                                        {/* Checkbox cobrança múltipla */}
                                        {filtroCliente !== 'todos' && (
                                            <td className="px-4 md:px-6 py-3 md:py-4" onClick={e => e.stopPropagation()}>
                                                {isReceita && l.status === 'Pendente' && (
                                                    <input type="checkbox" className="accent-primary size-4 rounded border-slate-300 pointer-events-auto"
                                                        checked={selecionados.includes(l.id)}
                                                        onChange={e => {
                                                            if (e.target.checked) setSelecionados([...selecionados, l.id]);
                                                            else setSelecionados(selecionados.filter(id => id !== l.id));
                                                        }}
                                                    />
                                                )}
                                            </td>
                                        )}

                                        {/* Descrição */}
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-tight">{l.desc}</span>
                                                    {l.link_sent && (
                                                        <span className="inline-flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 uppercase tracking-widest border border-sky-200 dark:border-sky-800" title="Link enviado">
                                                            <span className="material-symbols-outlined text-[10px]">send</span>
                                                            Enviado
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{getSubcategoriaLabel(l.tipo, l.subcategoria)}</span>
                                            </div>
                                        </td>

                                        {/* Paciente */}
                                        {mostrarColunasPaciente && (
                                            <td className="px-4 md:px-6 py-3 md:py-4">
                                                {pacienteNome ? (
                                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{pacienteNome}</span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-300">—</span>
                                                )}
                                            </td>
                                        )}

                                        {/* Categoria */}
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            {(() => {
                                                const cfg = FINANCE_COLORS_CFG.categorias[l.categoria?.toLowerCase()] || FINANCE_COLORS_CFG.categorias.pessoal;
                                                return (
                                                    <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm border ${cfg.badge} ${cfg.border}`}>
                                                        <span className="material-symbols-outlined text-[11px]">{cfg.icon}</span>
                                                        {cfg.label}
                                                    </span>
                                                );
                                            })()}
                                        </td>

                                        {/* Vencimento */}
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            <div className="flex flex-col">
                                                {l.tipo === 'receita' && l.data && l.data !== l.dataVencimento && (
                                                    <span className="text-[9px] font-black text-slate-400/80 uppercase tracking-tight mb-0.5">Sessão: {formatarData(l.data)}</span>
                                                )}
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{formatarData(l.dataVencimento)}</span>
                                                {getVencimentoBadge(l)}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            {(() => {
                                                const cfg = FINANCE_COLORS_CFG.status[l.status] || FINANCE_COLORS_CFG.status.Pendente;
                                                return (
                                                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                                        <div className={`size-1.5 rounded-full ${cfg.accent} animate-pulse`} />
                                                        {l.status}
                                                    </span>
                                                );
                                            })()}
                                        </td>

                                        {/* Valor */}
                                        <td className={`px-4 md:px-6 py-3 md:py-4 text-sm font-bold text-right ${(l?.valor || 0) > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {(l?.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>

                                        {/* Ações */}
                                        <td className="px-4 md:px-6 py-3 md:py-4 text-right" onClick={e => e.stopPropagation()}>
                                            {isDeletando ? (
                                                /* Confirmação de exclusão inline */
                                                <div className="flex items-center gap-1 justify-end">
                                                    <span className="text-[10px] font-bold text-slate-500 mr-1">Excluir?</span>
                                                    <button onClick={() => handleConfirmarDelete(l.id)} className="h-7 px-2.5 rounded-lg bg-red-500 text-white text-[10px] font-black hover:bg-red-600 transition-all">Sim</button>
                                                    <button onClick={() => setDeleteConfirm(null)} className="h-7 px-2.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black hover:bg-slate-200 transition-all">Não</button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2 justify-end">
                                                    {l.status === 'Pendente' && isReceita && (
                                                        <button onClick={() => navigate(`/financeiro/cobrar/${l.id}`)} className="size-8 flex items-center justify-center rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white transition-all shadow-sm" title="Gerar Link de Cobrança">
                                                            <span className="material-symbols-outlined text-base">qr_code</span>
                                                        </button>
                                                    )}
                                                    {l.status === 'Pendente' && (
                                                        <button onClick={() => { updateTransaction(l.id, { status: isReceita ? 'Recebido' : 'Pago' }); showToast('Status atualizado!', 'success'); }}
                                                            className="size-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all" title="Marcar como liquidado">
                                                            <span className="material-symbols-outlined text-base">check</span>
                                                        </button>
                                                    )}
                                                    {l.status === 'Pendente' && isReceita && (() => {
                                                        const p = patients.find(pat => pat.id === (l.patient_id || l.pacienteId));
                                                        if (!p?.phone) return null;
                                                        const paymentLink = `${window.location.origin}/cobranca/${l.id}?desc=${encodeURIComponent(l.desc)}&valor=${Math.abs(l.valor).toFixed(2)}&venc=${l.dataVencimento || ''}`;
                                                        const link = generateWhatsAppLink(p.phone, messages.billing(p.nome, formatarData(l.dataVencimento), Math.abs(l.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }), user.configuracoes?.chavePix, paymentLink));
                                                        return (
                                                            <a href={link} target="_blank" rel="noopener noreferrer"
                                                                className="size-8 flex items-center justify-center rounded-lg bg-[#25D366] text-white hover:scale-110 transition-all shadow-sm" title="Cobrar via WhatsApp">
                                                                <svg viewBox="0 0 24 24" className="size-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                                            </a>
                                                        );
                                                    })()}
                                                    {(l.status === 'Recebido' || l.status === 'Pago') && isReceita && (
                                                        <button onClick={() => { setTransacaoRecibo(l); setReciboAberto(true); }}
                                                            className="size-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all shadow-sm" title="Emitir Recibo">
                                                            <span className="material-symbols-outlined text-base">receipt_long</span>
                                                        </button>
                                                    )}
                                                    <button onClick={() => setDeleteConfirm(l.id)}
                                                        className="size-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white transition-all" title="Excluir">
                                                        <span className="material-symbols-outlined text-base">delete</span>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                {totalPaginas > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, dadosTabelaFull.length)} de {dadosTabelaFull.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPagina(1)} disabled={pagina === 1}
                                className="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                <span className="material-symbols-outlined text-sm">first_page</span>
                            </button>
                            <button onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}
                                className="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                                let p;
                                if (totalPaginas <= 5) p = i + 1;
                                else if (pagina <= 3) p = i + 1;
                                else if (pagina >= totalPaginas - 2) p = totalPaginas - 4 + i;
                                else p = pagina - 2 + i;
                                return (
                                    <button key={p} onClick={() => setPagina(p)}
                                        className={`size-7 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all ${p === pagina ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>
                                        {p}
                                    </button>
                                );
                            })}
                            <button onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas}
                                className="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                            <button onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas}
                                className="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                <span className="material-symbols-outlined text-sm">last_page</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ReciboModal isOpen={reciboAberto} onClose={() => { setReciboAberto(false); setTransacaoRecibo(null); }} transacao={transacaoRecibo} />

            {/* Floating bar cobrança múltipla */}
            {selecionados.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-full px-6 py-4 shadow-2xl flex items-center gap-6 z-50">
                    <span className="text-xs font-bold text-slate-300">{selecionados.length} selecionado(s)</span>
                    <button onClick={handleCobrarMultiplos} className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs py-2 px-5 rounded-full shadow-lg shadow-emerald-500/20 transition-all">
                        Gerar Cobrança Unificada
                    </button>
                    <button onClick={() => setSelecionados([])} className="text-xs font-bold text-slate-400 hover:text-white">Cancelar</button>
                </div>
            )}

            <FeatureTour
                isOpen={showTour}
                steps={HELP_CONTENT.financeiro.tourSteps}
                onClose={() => { setShowTour(false); markFinanceiroTourCompleted(); }}
                onComplete={() => { setShowTour(false); markFinanceiroTourCompleted(); alert("Finanças sob controle! Agora você pode focar no que realmente importa. 💎"); }}
            />
        </div>
    );
};

export default Financeiro;
