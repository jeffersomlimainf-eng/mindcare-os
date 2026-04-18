import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnamneses } from '../contexts/AnamneseContext';
import HelpModal from '../components/HelpModal';
import { HELP_CONTENT } from '../constants/helpContent';
import { formatDisplayId } from '../utils/formatId';

const AnamnesesLista = () => {
    const navigate = useNavigate();
    const { anamneses, deleteAnamnese } = useAnamneses();
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('Todos');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [helpOpen, setHelpOpen] = useState(false);

    const statusFiltros = ['Todos', 'Rascunho', 'Finalizado'];

    const filtrados = anamneses.filter(a => {
        const matchBusca = (a.pacienteNome || '').toLowerCase().includes(busca.toLowerCase()) ||
            (a.documentoId || '').toLowerCase().includes(busca.toLowerCase());
            
        let matchStatus = true;
        const normalizedFiltro = filtroStatus === 'Finalizadas' ? 'Finalizado' : 
                                filtroStatus === 'Rascunhos' ? 'Rascunho' : 
                                filtroStatus;
                               
        matchStatus = normalizedFiltro === 'Todos' || a.status === normalizedFiltro;
        return matchBusca && matchStatus;
    });

    const totalFinalizado = anamneses.filter(a => a.status === 'Finalizado').length;
    const totalRascunho = anamneses.filter(a => a.status === 'Rascunho').length;

    const statusConfig = {
        'Rascunho': 'bg-blue-100 text-blue-700',
        'Finalizado': 'bg-amber-100 text-amber-700',
    };

    const formatDate = (iso) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            <HelpModal 
                isOpen={helpOpen} 
                onClose={() => setHelpOpen(false)} 
                content={HELP_CONTENT.prontuarios} 
            />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-sm">assignment</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Anamneses</span>
                        </div>
                        <button 
                            onClick={() => setHelpOpen(true)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-all border border-primary/10"
                        >
                            <span className="material-symbols-outlined text-[14px]">help_outline</span>
                            <span className="text-[9px] font-black uppercase tracking-tighter">Como funciona?</span>
                        </button>
                    </div>
                    <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold tracking-tight">Fichas de Anamnese</h1>
                    <p className="text-slate-500 font-medium mt-1">Gestão de histórico clínico e triagem.</p>
                </div>
                <button
                    onClick={() => navigate('/anamneses/novo')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add_circle</span> Nova Anamnese
                </button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-1">
                {[
                    { label: 'Todos', value: anamneses.length, icon: 'folder_open', cor: 'text-primary bg-primary/10' },
                    { label: 'Finalizadas', value: totalFinalizado, icon: 'verified', cor: 'text-emerald-500 bg-emerald-500/10' },
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
            <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden px-1">
                    <div className="relative flex items-center w-full">
                        <span className="material-symbols-outlined absolute left-4 text-slate-400">search</span>
                        <input
                            className="w-full h-12 pl-12 pr-4 bg-transparent outline-none text-sm font-medium text-slate-900 dark:text-white"
                            placeholder="Buscar por paciente ou documento..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left whitespace-nowrap md:whitespace-normal">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Paciente</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Documento</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Data</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtrados.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                                        onClick={() => navigate(`/anamneses/${a.id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-9 rounded-full flex items-center justify-center text-xs font-bold ${a.pacienteCor || 'bg-primary/10 text-primary'}`}>{a.pacienteIniciais || '?'}</div>
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-tight">{a.pacienteNome || 'Sem paciente'}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{formatDisplayId(a.pacienteId, 'PAC')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatDisplayId(a.documentoId, 'ANA')}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center text-xs font-bold text-slate-500">{formatDate(a.criadoEm)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusConfig[a.status] || 'bg-slate-100 text-slate-600'}`}>{a.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => navigate(`/anamneses/${a.id}`)} className="size-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all">
                                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(a.id); }} className="size-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white transition-all">
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filtrados.length === 0 && (
                    anamneses.length === 0 ? (
                        <div className="py-16 flex flex-col items-center text-center px-6">
                            <div className="size-24 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center mb-5">
                                <span className="material-symbols-outlined text-5xl text-amber-400/40">assignment</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Nenhuma anamnese ainda</h3>
                            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
                                A ficha de anamnese coleta o histórico clínico, queixas e contexto de vida do paciente antes do início do processo terapêutico.
                            </p>
                            <button onClick={() => navigate('/anamneses/novo')} className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">add</span>
                                Iniciar Primeira Anamnese
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

            {/* Modal de Exclusão */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excluir Anamnese?</h3>
                            <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-bold">Cancelar</button>
                                <button onClick={() => { deleteAnamnese(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-bold">Excluir</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnamnesesLista;


