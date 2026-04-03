import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtestados } from '../contexts/AtestadoContext';

const AtestadosLista = () => {
    const navigate = useNavigate();
    const { atestados, deleteAtestado } = useAtestados();
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('Todos');
    const [confirmDelete, setConfirmDelete] = useState(null);

    const statusFiltros = ['Todos', 'Rascunho', 'Finalizado'];

    const filtrados = atestados.filter(a => {
        const matchBusca = (a.pacienteNome || '').toLowerCase().includes(busca.toLowerCase()) ||
            (a.documentoId || '').toLowerCase().includes(busca.toLowerCase());
            
        let matchStatus = true;
        const normalizedFiltro = filtroStatus === 'Finalizados' ? 'Finalizado' : 
                                filtroStatus === 'Rascunhos' ? 'Rascunho' : 
                                filtroStatus;
                                
        matchStatus = normalizedFiltro === 'Todos' || a.status === normalizedFiltro;
        return matchBusca && matchStatus;
    });

    const totalFinalizado = atestados.filter(a => a.status === 'Finalizado').length;
    const totalRascunho = atestados.filter(a => a.status === 'Rascunho').length;

    const statusConfig = {
        'Rascunho': 'bg-blue-100 text-blue-700',
        'Finalizado': 'bg-primary/10 text-primary',
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
                        <span className="material-symbols-outlined text-sm">history_edu</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Acervo Documental</span>
                    </div>
                    <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold tracking-tight">AtestadosPsicológicos</h1>
                    <p className="text-slate-500 font-medium mt-1">Gestão de atestados e documentação clínica.</p>
                </div>
                <button
                    onClick={() => navigate('/atestados/novo')}
                    className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>Novo Atestado</span>
                </button>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-1">
                {[
                    { label: 'Todos', value: atestados.length, icon: 'folder_open', cor: 'text-primary bg-primary/10' },
                    { label: 'Finalizados', value: totalFinalizado, icon: 'verified', cor: 'text-emerald-500 bg-emerald-500/10' },
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
                            placeholder="Buscar atestado por paciente..."
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
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filtrados.map((a, i) => (
                                <tr
                                    key={a.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                                    onClick={() => navigate(`/atestados/${a.id}`)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-10 rounded-full flex items-center justify-center text-xs font-bold ${a.pacienteCor || 'bg-primary/10 text-primary'}`}>
                                                {a.pacienteIniciais || '?'}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-tight">{a.pacienteNome || 'Pendente'}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">ID: {a.pacienteId || 'Externo'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{a.documentoId}</p>
                                            <p className="text-[9px] text-primary font-bold opacity-60 uppercase">Atestado Psicológico</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusConfig[a.status] || 'bg-slate-100 text-slate-600'}`}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => navigate(`/atestados/${a.id}`)}
                                                className="size-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all"
                                                title="Visualizar"
                                            >
                                                <span className="material-symbols-outlined text-lg">visibility</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setConfirmDelete(a.id); }}
                                                className="size-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white transition-all"
                                                title="Remover"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtrados.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">medical_information</span>
                        <h3 className="text-sm font-bold text-slate-400">Nenhum atestado encontrado</h3>
                    </div>
                )}
            </div>

            {/* Modal de Exclusão */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excluir Atestado?</h3>
                            <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-bold">Cancelar</button>
                                <button onClick={() => { deleteAtestado(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-bold">Excluir</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AtestadosLista;


