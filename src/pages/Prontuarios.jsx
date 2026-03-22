import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NovoDocumentoModal from '../components/NovoDocumentoModal';
import { useEvolutions } from '../contexts/EvolutionContext';
import { useLaudos } from '../contexts/LaudoContext';
import { useAtestados } from '../contexts/AtestadoContext';
import { useDeclaracoes } from '../contexts/DeclaracaoContext';
import { useAnamneses } from '../contexts/AnamneseContext';
import { useEncaminhamentos } from '../contexts/EncaminhamentoContext';
import { showToast } from '../components/Toast';
import { handleNavegacaoDocumento } from '../utils/navigation';

const TIPO_COLORS_CFG = {
    'Evolução de Sessão': { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800', icon: 'clinical_notes' },
    'Laudo Psicológico': { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-100 dark:border-violet-800', icon: 'history_edu' },
    'Atestado de Saúde Mental': { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-800', icon: 'medical_information' },
    'Declaração de Comparecimento': { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800', icon: 'verified' },
    'Ficha de Anamnese': { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-800', icon: 'patient_list' },
    'Encaminhamento Profissional': { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-800', icon: 'forward_to_inbox' },
};

const Prontuarios = () => {
    const navigate = useNavigate();
    const { evolutions = [], addEvolution } = useEvolutions() || {};
    const { laudos = [], addLaudo } = useLaudos() || {};
    const { atestados = [], addAtestado } = useAtestados() || {};
    const { declaracoes = [], addDeclaracao } = useDeclaracoes() || {};
    const { anamneses = [], addAnamnese } = useAnamneses() || {};
    const { encaminhamentos = [], addEncaminhamento } = useEncaminhamentos() || {};

    const [busca, setBusca] = useState('');
    const [modalAberto, setModalAberto] = useState(false);
    
    const totalDocumentos = (evolutions?.length || 0) + (laudos?.length || 0) + (atestados?.length || 0) + (declaracoes?.length || 0) + (anamneses?.length || 0) + (encaminhamentos?.length || 0);
    
    const [filtroStatus, setFiltroStatus] = useState('Total');
    const [filtroTipo, setFiltroTipo] = useState('Todos');

    const { state } = useLocation();
    const [modeloNav, setModeloNav] = useState(null);

    useEffect(() => {
        if (state?.abrirNovo) {
            setModalAberto(true);
            if (state.modelo) setModeloNav(state.modelo);
            else if (state.modeloId) setModeloNav({ id: state.modeloId });
            window.history.replaceState({}, document.title);
        }
    }, [state]);

    const evolucoesList = (evolutions || []).map(ev => ({
        id: ev.id,
        nome: ev.pacienteNome,
        paciente: ev.pacienteNome,
        iniciais: ev.pacienteIniciais,
        cor: ev.pacienteCor || 'bg-primary/10 text-primary',
        tipo: 'Evolução de Sessão',
        data: ev.dataHora ? new Date(ev.dataHora).toLocaleDateString('pt-BR') : ev.criadoEm ? new Date(ev.criadoEm).toLocaleDateString('pt-BR') : 'Hoje',
        status: ev.status || 'Finalizado',
        statusCor: ev.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700',
        isEvolucao: true,
        evolucaoId: ev.id,
        pacienteId: ev.pacienteId,
    }));

    const laudosList = (laudos || []).map(l => ({
        id: l.id,
        nome: l.pacienteNome || l.paciente,
        paciente: l.pacienteNome || l.paciente,
        iniciais: l.pacienteIniciais,
        cor: l.pacienteCor || 'bg-violet-100 text-violet-600',
        tipo: 'Laudo Psicológico',
        data: l.criadoEm ? new Date(l.criadoEm).toLocaleDateString('pt-BR') : 'Hoje',
        status: l.status,
        statusCor: l.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700',
        link: `/laudos/${encodeURIComponent(l.id)}`
    }));

    const atestadosList = (atestados || []).map(a => ({
        id: a.id,
        nome: a.pacienteNome || a.paciente,
        paciente: a.pacienteNome || a.paciente,
        iniciais: a.pacienteIniciais,
        cor: a.pacienteCor || 'bg-amber-100 text-amber-600',
        tipo: 'Atestado de Saúde Mental',
        data: a.criadoEm ? new Date(a.criadoEm).toLocaleDateString('pt-BR') : 'Hoje',
        status: a.status,
        statusCor: a.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700',
        link: `/atestados/${encodeURIComponent(a.id)}`
    }));

    const declaracoesList = (declaracoes || []).map(d => ({
        id: d.id,
        nome: d.pacienteNome || d.paciente,
        paciente: d.pacienteNome || d.paciente,
        iniciais: d.pacienteIniciais,
        cor: d.pacienteCor || 'bg-emerald-100 text-emerald-600',
        tipo: 'Declaração de Comparecimento',
        data: d.criadoEm ? new Date(d.criadoEm).toLocaleDateString('pt-BR') : 'Hoje',
        status: d.status,
        statusCor: d.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-emerald-100 text-emerald-700',
        link: `/declaracoes/${encodeURIComponent(d.id)}`
    }));

    const anamnesesList = (anamneses || []).map(a => ({
        id: a.id,
        nome: a.pacienteNome || a.paciente,
        paciente: a.pacienteNome || a.paciente,
        iniciais: a.pacienteIniciais,
        cor: a.pacienteCor || 'bg-rose-100 text-rose-600',
        tipo: 'Ficha de Anamnese',
        data: a.criadoEm ? new Date(a.criadoEm).toLocaleDateString('pt-BR') : 'Hoje',
        status: a.status,
        statusCor: a.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700',
        link: `/anamneses/${encodeURIComponent(a.id)}`
    }));

    const encaminhamentosList = (encaminhamentos || []).map(e => ({
        id: e.id,
        nome: e.pacienteNome || e.paciente,
        paciente: e.pacienteNome || e.paciente,
        iniciais: e.pacienteIniciais,
        cor: e.pacienteCor || 'bg-blue-100 text-blue-600',
        tipo: 'Encaminhamento Profissional',
        data: e.criadoEm ? new Date(e.criadoEm).toLocaleDateString('pt-BR') : 'Hoje',
        status: e.status,
        statusCor: e.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700',
        link: `/encaminhamentos/${encodeURIComponent(e.id)}`
    }));

    const todosDocumentos = [
        ...evolucoesList,
        ...laudosList,
        ...atestadosList,
        ...declaracoesList,
        ...anamnesesList,
        ...encaminhamentosList
    ].filter(doc => {
        const pNome = (doc.nome || doc.paciente || '').toLowerCase();
        const pTipo = (doc.tipo || '').toLowerCase();
        const search = busca.toLowerCase();
        
        const matchBusca = pNome.includes(search) || pTipo.includes(search);
        const matchesTipo = filtroTipo === 'Todos' || pTipo.includes(filtroTipo.toLowerCase());

        let matchStatus = true;
        if (filtroStatus === 'Assinados') {
            matchStatus = doc.status === 'Assinado' || doc.status === 'Finalizado';
        } else if (filtroStatus === 'Pendentes') {
            matchStatus = doc.status === 'Pendente';
        } else if (filtroStatus === 'Rascunhos') {
            matchStatus = doc.status === 'Rascunho';
        }
        
        return matchBusca && matchStatus && matchesTipo;
    }).sort((a, b) => {
        if (a.data === 'Hoje') return -1;
        if (b.data === 'Hoje') return 1;
        return 0;
    });

    const handleSalvar = (dados) => {
        const { paciente, tipo, conteudo } = dados;
        const tipoNorm = tipo.toLowerCase();

        const payload = {
            pacienteId: paciente.id,
            pacienteNome: paciente.nome,
            pacienteIniciais: paciente.iniciais,
            pacienteCor: paciente.cor,
            conteudo,
            status: 'Finalizado'
        };

        if (tipoNorm.includes('evolu')) addEvolution(payload);
        else if (tipoNorm.includes('laudo')) addLaudo(payload);
        else if (tipoNorm.includes('atestado')) addAtestado(payload);
        else if (tipoNorm.includes('declara')) addDeclaracao(payload);
        else if (tipoNorm.includes('anamnese')) addAnamnese(payload);
        else if (tipoNorm.includes('encaminhamento')) addEncaminhamento(payload);

        showToast(`${tipo} salvo com sucesso!`, 'success');
        setModalAberto(false);
    };

    return (
        <>
            <NovoDocumentoModal
                isOpen={modalAberto}
                onClose={() => { setModalAberto(false); setModeloNav(null); }}
                onSave={handleSalvar}
                modeloInicial={modeloNav}
            />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                    <div>
                        <div className="flex items-center gap-2 text-primary mb-1">
                            <span className="material-symbols-outlined text-sm">description</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Acervo Digital</span>
                        </div>
                        <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold tracking-tight">Prontuários</h1>
                        <p className="text-slate-500 font-medium mt-1">Gestão segura de documentos clínicos com isolamento Multi-Tenant.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1">
                    {[
                        { label: 'Total', value: totalDocumentos, icon: 'folder_open', cor: 'text-primary bg-primary/10' },
                        { label: 'Assinados', value: todosDocumentos.filter(d => d.status === 'Finalizado').length, icon: 'verified', cor: 'text-emerald-500 bg-emerald-500/10' },
                        { label: 'Pendentes', value: todosDocumentos.filter(d => d.status === 'Pendente').length, icon: 'pending', cor: 'text-amber-500 bg-amber-500/10' },
                        { label: 'Rascunhos', value: todosDocumentos.filter(d => d.status === 'Rascunho').length, icon: 'edit_note', cor: 'text-blue-500 bg-blue-500/10' },
                    ].map((c, i) => (
                        <button 
                            key={i} 
                            onClick={() => setFiltroStatus(c.label)}
                            className={`glass dark:bg-slate-800/50 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 transition-all text-left ${filtroStatus === c.label ? 'ring-2 ring-primary/50' : 'hover:border-primary/30'}`}
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <div className={`size-10 rounded-lg flex items-center justify-center mb-3 ${c.cor}`}>
                                <span className="material-symbols-outlined text-xl">{c.icon}</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{c.value}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{c.label}</p>
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="glass dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden px-1">
                        <label className="relative flex items-center w-full">
                            <span className="material-symbols-outlined absolute left-4 text-slate-400">search</span>
                            <input
                                className="w-full h-12 pl-12 pr-4 bg-transparent outline-none text-sm font-medium text-slate-900 dark:text-white"
                                placeholder="Pequise por paciente ou tipo de documento..."
                                value={busca}
                                onChange={e => {
                                    setBusca(e.target.value);
                                    if (e.target.value) setFiltroStatus('Total');
                                }}
                            />
                        </label>
                    </div>

                    <div className="flex flex-wrap gap-2 px-1">
                        {['Todos', 'Evolução', 'Laudo', 'Atestado', 'Declaração', 'Anamnese', 'Encaminhamento'].map((tipo) => {
                            const isActive = filtroTipo === tipo;
                            const colors = {
                                'Todos': 'bg-slate-100 text-slate-600 border-slate-200',
                                'Evolução': 'bg-blue-50 text-blue-600 border-blue-100',
                                'Laudo': 'bg-violet-50 text-violet-600 border-violet-100',
                                'Atestado': 'bg-amber-50 text-amber-600 border-amber-100',
                                'Declaração': 'bg-emerald-50 text-emerald-600 border-emerald-100',
                                'Anamnese': 'bg-rose-50 text-rose-600 border-rose-100',
                                'Encaminhamento': 'bg-indigo-50 text-indigo-600 border-indigo-100',
                            };
                            return (
                                <button
                                    key={tipo}
                                    onClick={() => setFiltroTipo(tipo)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                        isActive 
                                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105' 
                                        : `${colors[tipo] || colors.Todos} opacity-70 hover:opacity-100 hover:scale-105`
                                    }`}
                                >
                                    {tipo}
                                </button>
                            );
                        })}
                    </div>

                    <div className="glass dark:bg-slate-900/50 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 animate-settle">
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Paciente</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tipo</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Data</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {todosDocumentos.map((p, i) => (
                                    <tr
                                        key={p.id || i}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                                        onDoubleClick={() => handleNavegacaoDocumento(p, navigate)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-10 rounded-full flex items-center justify-center text-xs font-bold ${p.cor}`}>
                                                    {p.iniciais}
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-tight">{p.nome}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">ID: {p.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const cfg = TIPO_COLORS_CFG[p.tipo] || { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-100 dark:border-slate-700', icon: 'description' };
                                                return (
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                                        <span className="material-symbols-outlined text-base opacity-70">{cfg.icon}</span>
                                                        <span className="text-[10px] font-black uppercase tracking-wider">{p.tipo}</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-center text-xs font-bold text-slate-500">{p.data}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${p.statusCor || 'bg-slate-100 text-slate-600'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleNavegacaoDocumento(p, navigate);
                                                    }}
                                                    className="size-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                        {todosDocumentos.length === 0 && (
                            <div className="py-12 text-center text-slate-400 font-medium">
                                <span className="material-symbols-outlined text-4xl mb-2">description</span>
                                <p>Nenhum documento encontrado.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Prontuarios;
