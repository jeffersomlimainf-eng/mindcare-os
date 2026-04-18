import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvolutions } from '../contexts/EvolutionContext';
import { formatDisplayId } from '../utils/formatId';

const EvolucoesLista = () => {
    const navigate = useNavigate();
    const { evolutions } = useEvolutions();
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('Todos');

    const statusFiltros = ['Todos', 'Rascunho', 'Finalizado'];

    const filtrados = evolutions.filter(e => {
        const matchBusca = (e.pacienteNome || '').toLowerCase().includes(busca.toLowerCase()) ||
            (e.id || '').toLowerCase().includes(busca.toLowerCase()) ||
            formatDisplayId(e.id, 'EVO').toLowerCase().includes(busca.toLowerCase());
        
        const matchStatus = filtroStatus === 'Todos' || e.status === filtroStatus;
        return matchBusca && matchStatus;
    });

    const totalFinalizado = evolutions.filter(e => e.status === 'Finalizado').length;
    const totalRascunho = evolutions.filter(e => e.status === 'Rascunho').length;

    const statusConfig = {
        'Rascunho': 'bg-blue-100 text-blue-700',
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
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Prontuário Eletrônico</span>
                    </div>
                    <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold tracking-tight">Evoluções de Sessão</h1>
                    <p className="text-slate-500 font-medium mt-1">Histórico completo de atendimentos clínicos.</p>
                </div>
                <button
                    onClick={() => navigate('/prontuarios/evolucao/novo')}
                    className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>Nova Evolução</span>
                </button>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-1">
                {[
                    { label: 'Todos', value: evolutions.length, icon: 'folder_open', cor: 'text-primary bg-primary/10' },
                    { label: 'Finalizados', value: totalFinalizado, icon: 'verified', cor: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Rascunhos', value: totalRascunho, icon: 'edit_note', cor: 'text-blue-500 bg-blue-500/10' },
                ].map((c, i) => (
                    <button 
                        key={i} 
                        onClick={() => setFiltroStatus(c.label === 'Todos' ? 'Todos' : (c.label === 'Rascunhos' ? 'Rascunho' : 'Finalizado'))}
                        className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 transition-all text-left ${filtroStatus === (c.label === 'Todos' ? 'Todos' : (c.label === 'Rascunhos' ? 'Rascunho' : 'Finalizado')) ? 'ring-2 ring-primary/50' : 'hover:border-primary/30'}`}
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
                            placeholder="Buscar por paciente ou código..."
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
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tipo / Cód</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Data Atendimento</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filtrados.map((e) => (
                                <tr
                                    key={e.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
                                    onClick={() => navigate(`/prontuarios/evolucao/${e.id}`)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold uppercase">
                                                {(e.pacienteNome || '?').charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-tight">{e.pacienteNome || 'Pendente'}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">ID: {formatDisplayId(e.pacienteId, 'PAC')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{formatDisplayId(e.id, 'EVO')}</p>
                                            <p className="text-[9px] text-primary font-bold opacity-60 uppercase">{e.tipoAtendimento || 'Sessão Individual'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{formatDate(e.criadoEm)}</span>
                                            <span className="text-[10px] text-slate-400">{new Date(e.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusConfig[e.status] || 'bg-slate-100 text-slate-600'}`}>
                                            {e.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => navigate(`/prontuarios/evolucao/${e.id}`)}
                                                className="size-10 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all outline-none"
                                                title="Visualizar/Editar"
                                            >
                                                <span className="material-symbols-outlined text-lg">visibility</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtrados.length === 0 && (
                    evolutions.length === 0 ? (
                        <div className="py-16 flex flex-col items-center text-center px-6">
                            <div className="size-24 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center mb-5">
                                <span className="material-symbols-outlined text-5xl text-blue-400/40">clinical_notes</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Nenhuma evolução ainda</h3>
                            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
                                Evoluções de sessão registram o progresso clínico de cada atendimento, formando o histórico do paciente ao longo do tempo.
                            </p>
                            <button onClick={() => navigate('/prontuarios/evolucao/novo')} className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">add</span>
                                Registrar Primeira Evolução
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-200 dark:text-slate-700 mb-3">search_off</span>
                            <h3 className="text-sm font-bold text-slate-400">Nenhum resultado encontrado</h3>
                            <p className="text-xs text-slate-400 mt-1">Tente ajustar os filtros ou a busca</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default EvolucoesLista;


