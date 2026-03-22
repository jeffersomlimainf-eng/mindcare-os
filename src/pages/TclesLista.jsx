import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTcles } from '../contexts/TcleContext';

const TclesLista = () => {
    const navigate = useNavigate();
    const { tcles, deleteTcle } = useTcles();
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('Todos');
    const [confirmDelete, setConfirmDelete] = useState(null);

    const statusFiltros = ['Todos', 'Pendente', 'Assinado', 'Revogado'];

    const filtrados = tcles.filter(t => {
        const matchBusca = (t.pacienteNome || '').toLowerCase().includes(busca.toLowerCase());
        const matchStatus = filtroStatus === 'Todos' || t.status === filtroStatus;
        return matchBusca && matchStatus;
    });

    const totalAssinado = tcles.filter(t => t.status === 'Assinado').length;
    const totalPendente = tcles.filter(t => t.status === 'Pendente').length;
    const totalRevogado = tcles.filter(t => t.status === 'Revogado').length;

    const statusConfig = {
        'Pendente': 'bg-amber-100 text-amber-700',
        'Assinado': 'bg-emerald-100 text-emerald-700',
        'Revogado': 'bg-red-100 text-red-700',
    };

    const formatDate = (iso) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div>
                    <div className="flex items-center gap-2 text-rose-500 mb-1">
                        <span className="material-symbols-outlined text-sm">handshake</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Proteção Ética</span>
                    </div>
                    <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold tracking-tight">Termos de Consentimento</h1>
                    <p className="text-slate-500 font-medium mt-1">TCLE — Conforme Resolução CFP nº 001/2009 e Código de Ética Profissional.</p>
                </div>
                <button
                    onClick={() => navigate('/tcles/novo')}
                    className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-rose-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>Novo TCLE</span>
                </button>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1">
                {[
                    { label: 'Todos', value: tcles.length, icon: 'folder_open', cor: 'text-rose-500 bg-rose-500/10' },
                    { label: 'Assinado', value: totalAssinado, icon: 'verified', cor: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Pendente', value: totalPendente, icon: 'pending', cor: 'text-amber-500 bg-amber-500/10' },
                    { label: 'Revogado', value: totalRevogado, icon: 'block', cor: 'text-red-500 bg-red-500/10' },
                ].map((c, i) => (
                    <button 
                        key={i} 
                        onClick={() => setFiltroStatus(c.label === 'Todos' ? 'Todos' : c.label)}
                        className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 transition-all text-left ${filtroStatus === (c.label === 'Todos' ? 'Todos' : c.label) ? 'ring-2 ring-rose-500/50' : 'hover:border-rose-500/30'}`}
                    >
                        <div className={`size-10 rounded-lg flex items-center justify-center mb-3 ${c.cor}`}>
                            <span className="material-symbols-outlined text-xl">{c.icon}</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{c.value}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{c.label}</p>
                    </button>
                ))}
            </div>

            {/* Busca e Filtros */}
            <div className="flex flex-col lg:flex-row gap-4 items-center px-1">
                <div className="flex-1 w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <label className="relative flex items-center w-full">
                        <span className="material-symbols-outlined absolute left-4 text-slate-400">search</span>
                        <input
                            className="w-full h-11 pl-12 pr-4 bg-transparent outline-none text-sm font-medium text-slate-900 dark:text-white"
                            placeholder="Buscar TCLE por paciente..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </label>
                </div>
                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
                    {statusFiltros.map(s => (
                        <button
                            key={s}
                            onClick={() => setFiltroStatus(s)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filtroStatus === s
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'text-slate-500 hover:text-rose-500'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Paciente</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tipo de Atendimento</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Data</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filtrados.map((t) => (
                                <tr
                                    key={t.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
                                    onDoubleClick={() => navigate(`/tcles/${t.id}`)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-10 rounded-full flex items-center justify-center text-xs font-bold ${t.pacienteCor || 'bg-rose-100 text-rose-600'}`}>
                                                {t.pacienteIniciais || '?'}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-tight">{t.pacienteNome || 'Pendente'}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t.pacienteCpf || '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.tipoAtendimento || 'Psicoterapia'}</p>
                                            <p className="text-[9px] text-rose-500 font-bold opacity-60 uppercase">{t.modalidade || 'Presencial'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{formatDate(t.criadoEm || t.dataAssinatura)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusConfig[t.status] || 'bg-slate-100 text-slate-600'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => navigate(`/tcles/${t.id}`)}
                                                className="size-11 flex items-center justify-center rounded-[18px] bg-rose-500 text-white shadow-xl shadow-rose-500/20 hover:scale-110 active:scale-95 transition-all"
                                                title="Visualizar"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setConfirmDelete(t.id); }}
                                                className="size-11 flex items-center justify-center rounded-[18px] glass text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all"
                                                title="Remover"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtrados.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-4xl text-slate-300">handshake</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Nenhum TCLE encontrado</h3>
                        <p className="text-slate-400 max-w-xs mx-auto mb-4">
                            {busca || filtroStatus !== 'Todos'
                                ? 'Tente ajustar seus filtros de busca.'
                                : 'Comece criando o primeiro termo de consentimento.'}
                        </p>
                        {!busca && filtroStatus === 'Todos' && (
                            <button
                                onClick={() => navigate('/tcles/novo')}
                                className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">add</span> Criar Primeiro TCLE
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Confirmação de Exclusão */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="size-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl text-red-500">delete_forever</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Excluir TCLE?</h3>
                            <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita. O termo será removido permanentemente.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => { deleteTcle(confirmDelete); setConfirmDelete(null); }}
                                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/25"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TclesLista;
