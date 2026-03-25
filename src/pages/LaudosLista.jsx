import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLaudos } from '../contexts/LaudoContext';

const LaudosLista = () => {
    const navigate = useNavigate();
    const { laudos, deleteLaudo } = useLaudos();
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('Todos');
    const [confirmDelete, setConfirmDelete] = useState(null);

    const statusFiltros = ['Todos', 'Rascunho', 'Em Revisão', 'Finalizado'];

    const filtrados = laudos.filter(l => {
        const matchBusca = (l.pacienteNome || '').toLowerCase().includes(busca.toLowerCase()) ||
            (l.documentoId || '').toLowerCase().includes(busca.toLowerCase());
        
        let matchStatus = true;
        const normalizedFiltro = filtroStatus === 'Finalizados' ? 'Finalizado' : 
                               filtroStatus === 'Rascunhos' ? 'Rascunho' : 
                               filtroStatus;
                               
        matchStatus = normalizedFiltro === 'Todos' || l.status === normalizedFiltro;
        return matchBusca && matchStatus;
    });

    const totalFinalizado = laudos.filter(l => l.status === 'Finalizado').length;
    const totalRevisao = laudos.filter(l => l.status === 'Em Revisão').length;
    const totalRascunho = laudos.filter(l => l.status === 'Rascunho').length;

    const statusConfig = {
        'Rascunho': 'bg-blue-100 text-blue-700',
        'Em Revisão': 'bg-amber-100 text-amber-700',
        'Finalizado': 'bg-emerald-100 text-emerald-700',
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
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <span className="material-symbols-outlined text-sm">clinical_notes</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Acervo Documental</span>
                    </div>
                    <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold tracking-tight">LaudosPsicológicos</h1>
                    <p className="text-slate-500 font-medium mt-1">Gestão de documentos conforme normas vigentes.</p>
                </div>
                <button
                    onClick={() => navigate('/laudos/novo')}
                    className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>Novo Laudo</span>
                </button>
            </div>


            {/* Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1">
                {[
                    { label: 'Todos', value: laudos.length, icon: 'folder_open', cor: 'text-primary bg-primary/10' },
                    { label: 'Finalizados', value: totalFinalizado, icon: 'verified', cor: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Em Revisão', value: totalRevisao, icon: 'rate_review', cor: 'text-amber-500 bg-amber-500/10' },
                    { label: 'Rascunhos', value: totalRascunho, icon: 'edit_note', cor: 'text-blue-500 bg-blue-500/10' },
                ].map((c, i) => (
                    <button 
                        key={i} 
                        onClick={() => setFiltroStatus(c.label === 'Todos' ? 'Todos' : c.label)}
                        className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 transition-all text-left ${filtroStatus === (c.label === 'Todos' ? 'Todos' : c.label) ? 'ring-2 ring-primary/50' : 'hover:border-primary/30'}`}
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
                            placeholder="Buscar laudo por paciente..."
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
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-slate-500 hover:text-primary'
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
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Documento</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Data</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filtrados.map((l, i) => (
                                <tr
                                    key={l.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                                    onClick={() => navigate(`/laudos/${l.id}`)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-10 rounded-full flex items-center justify-center text-xs font-bold ${l.pacienteCor || 'bg-primary/10 text-primary'}`}>
                                                {l.pacienteIniciais || '?'}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-tight">{l.pacienteNome || 'Pendente'}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">ID: {l.pacienteId || 'Externo'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{l.documentoId}</p>
                                            <p className="text-[9px] text-primary font-bold opacity-60 uppercase">Laudo Clínico</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{formatDate(l.atualizadoEm)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusConfig[l.status] || 'bg-slate-100 text-slate-600'}`}>
                                            {l.status}
                                        </span>
                                    </td>

                                    <td className="px-8 py-5 text-right">
                                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all translate-x-12 group-hover:translate-x-0">
                                            <button
                                                onClick={() => navigate(`/laudos/${l.id}`)}
                                                className="size-11 flex items-center justify-center rounded-[18px] bg-primary text-white shadow-xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                                                title="Visualizar"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                            </button>
                                            {l.status !== 'Finalizado' && (
                                                <button
                                                    onClick={() => navigate(`/laudos/${l.id}`)}
                                                    className="size-11 flex items-center justify-center rounded-[18px] glass text-slate-400 hover:text-primary hover:scale-110 active:scale-95 transition-all"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); window.open(`/laudos/${l.id}`, '_blank'); }}
                                                className="size-11 flex items-center justify-center rounded-[18px] glass text-slate-400 hover:text-emerald-500 hover:scale-110 active:scale-95 transition-all"
                                                title="Gerar PDF"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">download</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setConfirmDelete(l.id); }}
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
                            <span className="material-symbols-outlined text-4xl text-slate-300">clinical_notes</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Nenhum laudo encontrado</h3>
                        <p className="text-slate-400 max-w-xs mx-auto mb-4">
                            {busca || filtroStatus !== 'Todos'
                                ? 'Tente ajustar seus filtros de busca.'
                                : 'Comece criando seu primeiro laudo psicológico.'}
                        </p>
                        {!busca && filtroStatus === 'Todos' && (
                            <button
                                onClick={() => navigate('/laudos/novo')}
                                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">add</span> Criar Primeiro Laudo
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
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Excluir Laudo?</h3>
                            <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita. O laudo será removido permanentemente.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => { deleteLaudo(confirmDelete); setConfirmDelete(null); }}
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

export default LaudosLista;
