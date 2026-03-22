import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NovoLancamentoModal from '../components/NovoLancamentoModal';
import { useFinance, SUBCATEGORIAS } from '../contexts/FinanceContext';
import { showToast } from '../components/Toast';
import GraficosFinanceiros from '../components/GraficosFinanceiros';
import ReciboModal from '../components/ReciboModal';
import { usePatients } from '../contexts/PatientContext';

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
        geral: { bg: 'bg-white', text: 'text-slate-900', border: 'border-slate-200', icon: 'account_balance', grad: 'from-slate-50 to-white' },
        receber: { bg: 'bg-emerald-50/30', text: 'text-emerald-600', border: 'border-emerald-100', icon: 'trending_up', grad: 'from-emerald-50/50 to-white' },
        pagar: { bg: 'bg-rose-50/30', text: 'text-rose-500', border: 'border-rose-100', icon: 'trending_down', grad: 'from-rose-50/50 to-white' },
        vencidas: { bg: 'bg-amber-50/30', text: 'text-amber-600', border: 'border-amber-100', icon: 'priority_high', grad: 'from-amber-50/50 to-white' }
    }
};

const Financeiro = () => {
    const navigate = useNavigate();
    const { transactions, addTransaction, updateTransaction, deleteTransaction, getContasVencidas, getContasVencemHoje, getContasProximas, getStatusVencimento } = useFinance();
    const { patients } = usePatients();
    
    const [modalAberto, setModalAberto] = useState(false);
    const [lancamentoEditando, setLancamentoEditando] = useState(null);
    const [abaAtiva, setAbaAtiva] = useState('geral');
    const [filtroCategoria, setFiltroCategoria] = useState('todas');
    const [filtroCliente, setFiltroCliente] = useState('todos');
    const [selecionados, setSelecionados] = useState([]);
    const [mostrarGraficos, setMostrarGraficos] = useState(false);
    const [reciboAberto, setReciboAberto] = useState(false);
    const [transacaoRecibo, setTransacaoRecibo] = useState(null);

    const safe = Array.isArray(transactions) ? transactions.filter(Boolean) : [];
    const filtered = filtroCategoria === 'todas' ? safe : safe.filter(t => t.categoria === filtroCategoria);
    
    const filteredByCliente = filtroCliente === 'todos' 
        ? filtered 
        : filtered.filter(t => t.patient_id === filtroCliente || t.pacienteId === filtroCliente);

    const pendentesTotalFiltered = filteredByCliente.filter(t => t.status === 'Pendente');

    const dadosTabela = abaAtiva === 'receber' ? filteredByCliente.filter(t => (t?.valor || 0) > 0)
        : abaAtiva === 'pagar' ? filteredByCliente.filter(t => (t?.valor || 0) < 0)
        : abaAtiva === 'vencidas' ? pendentesTotalFiltered
        : filteredByCliente;

    const handleCobrarMultiplos = () => {
        if (selecionados.length === 0) return;
        const ids = selecionados.join(',');
        setSelecionados([]);
        navigate(`/financeiro/cobrar/${ids}`);
    };

    const receitas = filteredByCliente.filter(t => (t?.valor || 0) > 0);
    const despesas = filteredByCliente.filter(t => (t?.valor || 0) < 0);
    const totalReceitas = receitas.reduce((a, b) => a + (b?.valor || 0), 0);
    const totalDespesas = despesas.reduce((a, b) => a + (b?.valor || 0), 0);
    const saldo = totalReceitas + totalDespesas;

    const realizadoReceitas = receitas.filter(r => r.status !== 'Pendente').reduce((a, b) => a + (b?.valor || 0), 0);
    const realizadoDespesas = despesas.filter(d => d.status !== 'Pendente').reduce((a, b) => a + (b?.valor || 0), 0);
    const saldoRealizado = realizadoReceitas + realizadoDespesas;

    const vencidas = getContasVencidas();

    const handleSalvar = (dados) => {
        try {
            const valorNumerico = Number(dados?.valor) || 0;
            const novoValor = dados.tipo === 'receita' ? Math.abs(valorNumerico) : -Math.abs(valorNumerico);
            const payload = {
                ...dados,
                valor: novoValor,
                tipo: dados.tipo === 'receita' ? 'Receita' : 'Despesa',
                status: dados.tipo === 'receita' ? (dados.status === 'recebido' ? 'Recebido' : 'Pendente') : (dados.status === 'pago' ? 'Pago' : 'Pendente'),
            };
            if (lancamentoEditando) {
                updateTransaction(lancamentoEditando.id, payload);
            } else {
                addTransaction(payload);
            }
        } catch (error) {
            console.error('[Financeiro] Erro ao processar salvamento:', error);
            showToast('Erro ao salvar lançamento.', 'error');
        }
        setLancamentoEditando(null);
    };

    const handleAbrirEdicao = (l) => { setLancamentoEditando(l); setModalAberto(true); };
    const handleNovoLancamento = () => { setLancamentoEditando(null); setModalAberto(true); };

    const formatarData = (dataStr) => {
        if (!dataStr || typeof dataStr !== 'string') return '—';
        const parts = dataStr.split('-');
        if (parts.length !== 3) return dataStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const getVencimentoBadge = (t) => {
        const sv = getStatusVencimento(t);
        if (sv === 'vencido') return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 uppercase">Vencido</span>;
        if (sv === 'hoje') return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase">Hoje</span>;
        if (sv === 'proximo') return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 uppercase">Próximo</span>;
        return null;
    };

    const getSubcategoriaLabel = (tipo, subcat) => {
        const list = SUBCATEGORIAS[tipo?.toLowerCase()] || [];
        return list.find(s => s.value === subcat)?.label || subcat || '—';
    };

    const pendentesTotal = filteredByCliente.filter(t => t.status === 'Pendente');

    return (
        <div className="space-y-6">
            <NovoLancamentoModal
                isOpen={modalAberto}
                onClose={() => { setModalAberto(false); setLancamentoEditando(null); }}
                onSave={handleSalvar}
                lancamentoEditando={lancamentoEditando}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div>
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Financeiro</span>
                    </div>
                    <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold tracking-tight">Gestão Financeira</h1>
                    <p className="text-slate-500 font-medium mt-1">Controle de receitas e despesas.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleNovoLancamento}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span> Novo Lançamento
                    </button>
                </div>
            </div>

            {/* Resumos Rápidos (Estilo Asaas) */}
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


            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-1">
                {[
                    { 
                        id: 'geral', 
                        label: 'Saldo em Caixa (Realizado)', 
                        value: saldoRealizado, 
                        subValue: saldo,
                        subLabel: 'Saldo Projetado',
                        type: 'geral' 
                    },
                    { id: 'receber', label: 'Receitas', value: realizadoReceitas, subValue: totalReceitas, subLabel: 'Total Previsto', type: 'receber' },
                    { id: 'pagar', label: 'Despesas', value: Math.abs(realizadoDespesas), subValue: Math.abs(totalDespesas), subLabel: 'Total Previsto', type: 'pagar' },
                    { 
                        id: 'vencidas', 
                        label: 'Pendências', 
                        value: pendentesTotal.reduce((a, b) => a + Math.abs(b.valor || 0), 0), 
                        subLabel: `${vencidas.length} vencidos Â· ${pendentesTotal.length} total`,
                        type: 'vencidas' 
                    },
                ].map((card, i) => {
                    const cfg = FINANCE_COLORS_CFG.cards[card.type];
                    const isNegativo = !card.isCount && card.value < 0;
                    
                    return (
                        <button 
                            key={card.id}
                            onClick={() => setAbaAtiva(card.id)}
                            className={`group relative overflow-hidden rounded-2xl p-5 border transition-all text-left hover:shadow-md ${abaAtiva === card.id ? `bg-white shadow-lg border-2 ${cfg.border.replace('border-', 'border-')}` : `${cfg.bg} ${cfg.border}`}`}
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
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
                            {abaAtiva === card.id && (
                                <div className={`absolute bottom-0 left-0 w-full h-1 ${cfg.text.replace('text-', 'bg-')}`} />
                            )}
                        </button>
                    );
                })}
            </div>

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

            {/* Tabela */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
                    <div className="flex gap-2">
                        {['todas', 'clinica', 'pessoal'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFiltroCategoria(f)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filtroCategoria === f ? 'bg-primary text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}
                            >
                                {f === 'todas' ? 'Tudo' : f === 'clinica' ? 'Clínica' : 'Pessoal'}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filtrar Paciente</span>
                        <select 
                            value={filtroCliente}
                            onChange={(e) => { setFiltroCliente(e.target.value); setSelecionados([]); }}
                            className="text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option value="todos">Todos os Pacientes</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.nome || p.name || 'Sem Nome'}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="glass dark:bg-slate-900/50 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 animate-settle">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                {filtroCliente !== 'todos' && <th className="px-6 py-4"></th>}
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Descrição</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Categoria</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Vencimento</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Valor</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {dadosTabela.map((l) => (
                                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer" onDoubleClick={() => handleAbrirEdicao(l)}>
                                    {filtroCliente !== 'todos' && (
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            {l.tipo === 'Receita' && l.status === 'Pendente' && (
                                                <input 
                                                    type="checkbox" 
                                                    className="accent-primary size-4 rounded border-slate-300 pointer-events-auto"
                                                    checked={selecionados.includes(l.id)} 
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelecionados([...selecionados, l.id]);
                                                        else setSelecionados(selecionados.filter(id => id !== l.id));
                                                    }}
                                                />
                                            )}
                                        </td>
                                    )}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-tight">{l.desc}</span>
                                                {l.link_sent && (
                                                    <span className="inline-flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 uppercase tracking-widest border border-sky-200 dark:border-sky-800" title="Link de Cobrança enviado ao paciente">
                                                        <span className="material-symbols-outlined text-[10px]">send</span>
                                                        Enviado
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{getSubcategoriaLabel(l.tipo, l.subcategoria)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {(() => {
                                            const cfg = FINANCE_COLORS_CFG.categorias[l.categoria?.toLowerCase()] || FINANCE_COLORS_CFG.categorias.pessoal;
                                            return (
                                                <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm border ${cfg.badge} ${cfg.border.replace('border-', 'border-')}`}>
                                                    <span className="material-symbols-outlined text-[11px]">{cfg.icon}</span>
                                                    {cfg.label}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{formatarData(l.dataVencimento)}</span>
                                            {getVencimentoBadge(l)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
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
                                    <td className={`px-6 py-4 text-sm font-bold text-right ${(l?.valor || 0) > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {(l?.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            {l.status === 'Pendente' && l.tipo === 'Receita' && (
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`/financeiro/cobrar/${l.id}`); }} className="size-8 flex items-center justify-center rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white transition-all shadow-sm" title="Gerar Link de Cobrança">
                                                    <span className="material-symbols-outlined text-base">qr_code</span>
                                                </button>
                                            )}
                                            {l.status === 'Pendente' && (
                                                <button onClick={(e) => { e.stopPropagation(); updateTransaction(l.id, { status: l.tipo === 'Receita' ? 'Recebido' : 'Pago' }); showToast('Status atualizado!', 'success'); }} className="size-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all" title="Marcar como Liquidado"><span className="material-symbols-outlined text-base">check</span></button>
                                            )}
                                            {(l.status === 'Recebido' || l.status === 'Pago') && l.tipo === 'Receita' && (
                                                <button onClick={(e) => { e.stopPropagation(); setTransacaoRecibo(l); setReciboAberto(true); }} className="size-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all shadow-sm" title="Emitir Recibo"><span className="material-symbols-outlined text-base">receipt_long</span></button>
                                            )}

                                            <button onClick={(e) => { e.stopPropagation(); deleteTransaction(l.id); showToast('Excluído', 'info'); }} className="size-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white transition-all"><span className="material-symbols-outlined text-base">delete</span></button>
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ReciboModal 
                isOpen={reciboAberto}
                onClose={() => { setReciboAberto(false); setTransacaoRecibo(null); }}
                transacao={transacaoRecibo}
            />

            {selecionados.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-full px-6 py-4 shadow-2xl flex items-center gap-6 z-50">
                    <span className="text-xs font-bold text-slate-300">{selecionados.length} selecionado(s)</span>
                    <button 
                        onClick={handleCobrarMultiplos}
                        className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs py-2 px-5 rounded-full shadow-lg shadow-emerald-500/20 transition-all"
                    >
                        Gerar Cobrança Unificada
                    </button>
                    <button onClick={() => setSelecionados([])} className="text-xs font-bold text-slate-400 hover:text-white">Cancelar</button>
                </div>
            )}
        </div>
    );
};

export default Financeiro;
