import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatients } from '../contexts/PatientContext';
import { useEvolutions } from '../contexts/EvolutionContext';
import { useLaudos } from '../contexts/LaudoContext';
import { useAtestados } from '../contexts/AtestadoContext';
import { useDeclaracoes } from '../contexts/DeclaracaoContext';
import { useAnamneses } from '../contexts/AnamneseContext';
import { useEncaminhamentos } from '../contexts/EncaminhamentoContext';
import { handleNavegacaoDocumento } from '../utils/navigation';
import { calcularIdade } from '../utils/date';
import { safeRender } from '../utils/render';
import PortalPacienteTab from '../components/PortalPacienteTab';

const LinhaDoTempo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { patients } = usePatients();
    const { evolutions } = useEvolutions();
    const { laudos } = useLaudos();
    const { atestados } = useAtestados();
    const { declaracoes } = useDeclaracoes();

    const { anamneses } = useAnamneses();
    const { encaminhamentos } = useEncaminhamentos();

    const [busca, setBusca] = useState('');
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    const [abaAtiva, setAbaAtiva] = useState('visao-geral');
    const [showOptions, setShowOptions] = useState(false);
    const [editandoHistorico, setEditandoHistorico] = useState(false);
    const [textoHistorico, setTextoHistorico] = useState('');
    const { updatePatient } = usePatients();

    // Filtrar pacientes
    const pacientesFiltrados = patients.filter(p => 
        (p.nome || '').toLowerCase().includes(busca.toLowerCase()) || 
        (p.id || '').includes(busca)
    );

    // Sincronizar texto do histórico quando trocar de paciente
    useEffect(() => {
        if (pacienteSelecionado) {
            setTextoHistorico(pacienteSelecionado.historico || '');
            setEditandoHistorico(false);
        }
    }, [pacienteSelecionado]);

    // Selecionar paciente inicial via URL (id)
    useEffect(() => {
        if (id && patients.length > 0) {
            const found = patients.find(p => p.id.replace('#', '') === id.replace('#', ''));
            if (found) {
                setPacienteSelecionado(found);
            }
        }
    }, [id, patients]);

    const handleSalvarHistorico = () => {
        if (!pacienteSelecionado) return;
        updatePatient(pacienteSelecionado.id, { historico: textoHistorico });
        setEditandoHistorico(false);
    };

    // Documentos do paciente selecionado
    const documentos = useMemo(() => {
        if (!pacienteSelecionado) return [];
        const pid = pacienteSelecionado.id;

        const evs = (evolutions || []).filter(e => e.pacienteId === pid).map(e => ({ ...e, tipo: 'Evolução', icon: 'clinical_notes', cor: 'text-primary bg-primary/10' }));
        const lds = (laudos || []).filter(l => l.pacienteId === pid).map(l => ({ ...l, tipo: 'Laudo', icon: 'description', cor: 'text-violet-600 bg-violet-100' }));
        const ats = (atestados || []).filter(a => a.pacienteId === pid).map(a => ({ ...a, tipo: 'Atestado', icon: 'medical_information', cor: 'text-amber-600 bg-amber-100' }));
        const dec = (declaracoes || []).filter(d => d.pacienteId === pid).map(d => ({ ...d, tipo: 'Declaração', icon: 'verified', cor: 'text-emerald-600 bg-emerald-100' }));
        const ana = (anamneses || []).filter(a => a.pacienteId === pid).map(a => ({ ...a, tipo: 'Anamnese', icon: 'assignment', cor: 'text-rose-600 bg-rose-100' }));
        const enc = (encaminhamentos || []).filter(e => e.pacienteId === pid).map(e => ({ ...e, tipo: 'Encaminhamento', icon: 'send', cor: 'text-blue-600 bg-blue-100' }));

        return [...evs, ...lds, ...ats, ...dec, ...ana, ...enc].sort((a, b) => {
            const dateA = new Date(a.criadoEm || a.data);
            const dateB = new Date(b.criadoEm || b.data);
            return dateB - dateA;
        });
    }, [pacienteSelecionado, evolutions, laudos, atestados, declaracoes, anamneses, encaminhamentos]);

    const abas = [
        { id: 'visao-geral', label: 'Visão Geral', icon: 'visibility' },
        { id: 'anamnese', label: 'Anamnese', icon: 'assignment', count: documentos.filter(d => d.tipo === 'Anamnese').length },
        { id: 'evolucoes', label: 'Evoluções', icon: 'clinical_notes', count: documentos.filter(d => d.tipo === 'Evolução').length },
        { id: 'documentos', label: 'Documentos', icon: 'description', count: documentos.filter(d => ['Laudo', 'Atestado', 'Declaração', 'Encaminhamento', 'Recibo'].includes(d.tipo)).length },
        { id: 'portal-paciente', label: 'Portal do Paciente', icon: 'hub' },
        { id: 'historico', label: 'Histórico Clínico', icon: 'history' },
    ];

    return (
        <div className="flex flex-col xl:flex-row h-auto xl:h-[calc(100vh-120px)] gap-6 antialiased">
            {/* Barra Lateral Esquerda: Seleção de Paciente */}
            <div className="w-full xl:w-[300px] shrink-0 h-[350px] xl:h-auto flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Selecionar Paciente</h2>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
                        <input 
                            type="text"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="Buscar por nome..."
                            className="w-full h-9 pl-9 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs font-bold focus:border-primary transition-all shadow-inner"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                    {pacientesFiltrados.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => {
                                setPacienteSelecionado(p);
                                setAbaAtiva('visao-geral');
                                navigate(`/linha-do-tempo/${p.id.replace('#', '')}`, { replace: true });
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all mb-1 ${
                                pacienteSelecionado?.id === p.id 
                                    ? 'bg-primary/10 border border-primary/20 shadow-sm' 
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                            }`}
                        >
                            <div className={`size-10 rounded-xl flex items-center justify-center font-black text-[11px] shadow-sm ${p.cor || 'bg-slate-100 text-slate-500'}`}>
                                {p.iniciais}
                            </div>
                            <div className="flex flex-col items-start overflow-hidden text-left">
                                <span className={`text-xs font-black truncate w-full uppercase ${pacienteSelecionado?.id === p.id ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {safeRender(p.nome)}
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold tracking-widest">ID: {p.id}</span>
                            </div>
                        </button>
                    ))}
                    {pacientesFiltrados.length === 0 && (
                        <div className="py-8 text-center text-slate-400 opacity-60">
                            <span className="material-symbols-outlined text-3xl mb-1">person_search</span>
                            <p className="text-[10px] font-bold uppercase">Nenhum resultado</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Conteúdo Central/Direito: Timeline e Detalhes */}
            <div className="flex-1 flex flex-col min-h-[500px] xl:min-h-0 overflow-hidden">
                {pacienteSelecionado ? (
                    <div className="space-y-6 overflow-visible xl:overflow-y-auto h-full pr-0 xl:pr-2 scrollbar-hide">
                        {/* Card Header do Paciente */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className={`size-20 rounded-3xl flex items-center justify-center text-2xl font-black shadow-inner ${pacienteSelecionado.cor}`}>
                                    {pacienteSelecionado.iniciais}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight">{safeRender(pacienteSelecionado.nome)}</h1>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${pacienteSelecionado.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {pacienteSelecionado.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-slate-500 font-bold uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">fingerprint</span> {safeRender(pacienteSelecionado.cpf)}</span>
                                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">cake</span> {safeRender(pacienteSelecionado.dataNascimento, '—')}</span>
                                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">smartphone</span> {safeRender(pacienteSelecionado.telefone)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => navigate(`/prontuarios/paciente/${pacienteSelecionado.id.replace('#', '')}`)}
                                        className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">folder_open</span> Ver Prontuário
                                    </button>
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowOptions(!showOptions)}
                                            className="h-10 px-4 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-lg">{showOptions ? 'close' : 'add'}</span> Novo Registro
                                        </button>

                                        {showOptions && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
                                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-20 animate-in fade-in zoom-in duration-200">
                                                    {[
                                                        { label: 'Evolução de Sessão', path: '/prontuarios/evolucao/novo', icon: 'clinical_notes', color: 'text-emerald-500' },
                                                        { label: 'Laudo Psicológico', path: '/laudos/novo', icon: 'history_edu', color: 'text-violet-500' },
                                                        { label: 'Atestado Mental', path: '/atestados/novo', icon: 'medical_information', color: 'text-amber-500' },
                                                        { label: 'Declaração', path: '/declaracoes/novo', icon: 'verified', color: 'text-emerald-500' },
                                                        { label: 'Ficha de Anamnese', path: '/anamneses/novo', icon: 'patient_list', color: 'text-rose-500' },
                                                        { label: 'Encaminhamento', path: '/encaminhamentos/novo', icon: 'send', color: 'text-blue-500' },
                                                    ].map((opt, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                navigate(opt.path, { state: { pacienteObjeto: pacienteSelecionado } });
                                                                setShowOptions(false);
                                                            }}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                                                        >
                                                            <span className={`material-symbols-outlined text-lg ${opt.color}`}>{opt.icon}</span>
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">{opt.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Abas Estilo Prontuário */}
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit">
                            {abas.map(aba => (
                                <button
                                    key={aba.id}
                                    onClick={() => setAbaAtiva(aba.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        abaAtiva === aba.id 
                                            ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' 
                                            : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-lg">{aba.icon}</span>
                                    {aba.label}
                                    {!!aba.count && (
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                            abaAtiva === aba.id 
                                                ? 'bg-primary text-white shadow-sm' 
                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                        }`}>
                                            {aba.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Conteúdo da Aba Visão Geral */}
                        {abaAtiva === 'visao-geral' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
                                <div className="lg:col-span-2 space-y-4">
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-primary text-xl">visibility</span> Linha do Tempo Clínica
                                    </h3>
                                    
                                    {documentos.length === 0 ? (
                                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
                                            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Histórico limpo para este paciente.</p>
                                        </div>
                                    ) : (
                                        <div className="relative pl-7 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                                            {documentos.map((doc, idx) => (
                                                <div key={idx} className="relative group">
                                                    <div className={`absolute left-[-24px] top-1.5 size-4 rounded-full border-4 border-slate-50 dark:border-slate-950 shadow-sm z-10 transition-transform group-hover:scale-125 ${doc?.cor?.split(' ')[0] || ''}`} />
                                                    <div 
                                                        onClick={() => handleNavegacaoDocumento(doc, navigate)}
                                                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer select-none"
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`size-10 rounded-xl flex items-center justify-center ${doc?.cor || ''}`}>
                                                                    <span className="material-symbols-outlined text-xl">{doc?.icon || 'description'}</span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase leading-none mb-1">{safeRender(doc?.tipo)}</h4>
                                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                                        {new Date(doc?.criadoEm || doc?.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{doc?.status || 'Finalizado'}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 line-clamp-2 italic leading-relaxed">
                                                            "{(() => {
                                                                const content = doc?.conteudo || doc?.subjetivo || doc?.queixaPrincipal || doc?.motivo;
                                                                if (typeof content === 'object' && content !== null) {
                                                                    return content.subjetivo || content.S || content.A || 'Prontuário estruturado.';
                                                                }
                                                                return content || 'Registro clínico gerado e assinado via Meu Sistema PSI.';
                                                            })()}"
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gradient-to-br from-primary to-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-primary/20">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-4">Queixa Principal</h4>
                                        <p className="text-lg font-medium leading-relaxed italic">
                                            "{safeRender(pacienteSelecionado.queixa, 'Nenhuma queixa inicial registrada.')}"
                                        </p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Informações de Contato</h4>
                                        <div className="space-y-5">
                                            <div className="flex gap-4">
                                                <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <span className="material-symbols-outlined text-xl">mail</span>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">E-mail</p>
                                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 truncate w-40">{safeRender(pacienteSelecionado.email, '--')}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <span className="material-symbols-outlined text-xl">location_on</span>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Endereço</p>
                                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                                                        {pacienteSelecionado.cidade && pacienteSelecionado.estado 
                                                            ? `${pacienteSelecionado.cidade}, ${pacienteSelecionado.estado}` 
                                                            : pacienteSelecionado.cidade || pacienteSelecionado.estado || '—'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <span className="material-symbols-outlined text-xl">medical_information</span>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Convênio</p>
                                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">{safeRender(pacienteSelecionado.plano, 'Particular')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Conteúdo das Abas Dinâmicas */}
                        {abaAtiva === 'anamnese' && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Fichas de Anamnese</h3>
                                    <button 
                                        onClick={() => navigate('/anamneses/novo', { state: { pacienteObjeto: pacienteSelecionado } })}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl text-xs transition-all hover:bg-primary/20 uppercase tracking-widest"
                                    >
                                        <span className="material-symbols-outlined text-lg">add</span> Nova Ficha
                                    </button>
                                </div>
                                {documentos.filter(d => d.tipo === 'Anamnese').length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                                        <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl text-slate-200">assignment_late</span>
                                        </div>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Nenhuma anamnese registrada.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {documentos.filter(d => d.tipo === 'Anamnese').map((doc, idx) => (
                                            <div key={idx} onClick={() => navigate(`/anamneses/${doc.id}`)} className="p-5 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer group flex items-center justify-between">
                                                <div className="flex gap-4 items-center">
                                                    <div className="size-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined">assignment</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-800 dark:text-white uppercase text-xs">Anamnese Psicológica</h4>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(doc.criadoEm || doc.data).toLocaleDateString('pt-BR')}</p>
                                                    </div>
                                                </div>
                                                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">open_in_new</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {abaAtiva === 'evolucoes' && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Histórico de Evoluções</h3>
                                    <button onClick={() => navigate('/prontuarios/evolucao/novo')} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 font-bold rounded-xl text-xs transition-all hover:bg-emerald-500/20 uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-lg">edit_note</span> Registrar Evolução
                                    </button>
                                </div>
                                {documentos.filter(d => d.tipo === 'Evolução').length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                                        <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl text-slate-200">clinical_notes</span>
                                        </div>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Nenhuma evolução registrada.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {documentos.filter(d => d.tipo === 'Evolução').map((doc, idx) => (
                                            <div key={idx} 
                                                onClick={() => navigate(`/prontuarios/evolucao/${doc.id.toString().replace('#', '')}`)} 
                                                className="p-6 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-emerald-200 transition-all group cursor-pointer select-none"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-4">
                                                        <div className="size-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                                            <span className="material-symbols-outlined">clinical_notes</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-slate-800 dark:text-white uppercase text-xs">Evolução de Sessão</h4>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                                {new Date(doc.criadoEm || doc.data).toLocaleDateString('pt-BR')} • {new Date(doc.criadoEm || doc.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-emerald-500 transition-colors">open_in_new</span>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                                    "{typeof doc.conteudo === 'object' ? (doc.conteudo?.subjetivo || doc.conteudo?.evolution || 'Registro estruturado') : (doc.conteudo || 'Conteúdo da evolução clínica...')}"
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {abaAtiva === 'documentos' && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Documentos Gerados</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {['Laudo', 'Atestado', 'Declaração', 'Encaminhamento'].map(tipo => {
                                        const docs = documentos.filter(d => d.tipo === tipo);
                                        return (
                                            <div key={tipo} className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">{tipo}s</h4>
                                                {docs.length === 0 ? (
                                                    <div className="p-4 border border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-center text-[9px] text-slate-400 font-black uppercase tracking-widest">Vazio</div>
                                                ) : (
                                                    docs.map((doc, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            onClick={() => handleNavegacaoDocumento(doc, navigate)}
                                                            className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent hover:border-primary/20 transition-all cursor-pointer group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={`material-symbols-outlined text-lg ${doc.cor.split(' ')[0]}`}>{doc.icon}</span>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[10px] font-black text-slate-800 dark:text-white truncate uppercase">{doc.tipo} - {new Date(doc.criadoEm || doc.data).toLocaleDateString('pt-BR')}</p>
                                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Ver {(doc.tipo || '').toLowerCase()}</p>
                                                                </div>
                                                                <span className="material-symbols-outlined text-slate-300 text-sm group-hover:text-primary">open_in_new</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {abaAtiva === 'portal-paciente' && (
                            <PortalPacienteTab paciente={pacienteSelecionado} />
                        )}

                        {abaAtiva === 'historico' && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Histórico Clínico Resumo</h3>
                                    {!editandoHistorico && textoHistorico && (
                                        <button 
                                            onClick={() => setEditandoHistorico(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl text-xs transition-all hover:bg-primary/20 uppercase tracking-widest"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span> Editar
                                        </button>
                                    )}
                                </div>
                                
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 min-h-[300px] flex flex-col">
                                    {editandoHistorico ? (
                                        <div className="space-y-4 flex flex-col h-full">
                                            <textarea
                                                value={textoHistorico}
                                                onChange={(e) => setTextoHistorico(e.target.value)}
                                                placeholder="Escreva as observações de longo prazo e evolução terapêutica consolidada do paciente..."
                                                className="w-full flex-1 min-h-[250px] p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none text-sm leading-relaxed text-slate-700 dark:text-slate-300 focus:border-primary transition-all resize-none shadow-inner"
                                                autoFocus
                                            />
                                            <div className="flex justify-end gap-3">
                                                <button 
                                                    onClick={() => {
                                                        setEditandoHistorico(false);
                                                        setTextoHistorico(pacienteSelecionado.historico || '');
                                                    }}
                                                    className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"
                                                >
                                                    Cancelar
                                                </button>
                                                <button 
                                                    onClick={handleSalvarHistorico}
                                                    className="px-6 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                                                >
                                                    Salvar Histórico
                                                </button>
                                            </div>
                                        </div>
                                    ) : !textoHistorico ? (
                                        <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-sm mb-8">
                                                "Este espaço serve para agrupar observações de longo prazo e evolução terapêutica consolidada."
                                            </p>
                                            <button 
                                                onClick={() => setEditandoHistorico(true)}
                                                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:border-primary transition-all shadow-sm"
                                            >
                                                <span className="material-symbols-outlined text-lg">edit</span> Começar a escrever histórico
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex-1 relative">
                                            <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap italic">
                                                "{textoHistorico}"
                                            </div>
                                            <div className="mt-8 pt-8 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">
                                                    {pacienteSelecionado.iniciais}
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Última atualização consolidada no prontuário.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm border-dashed">
                        <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-5xl text-slate-300 animate-bounce-slow">visibility</span>
                        </div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-2">Visão 360º do Paciente</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest max-w-xs text-center leading-relaxed">
                            Selecione um paciente na lista lateral para visualizar sua linha do tempo clínica consolidada.
                        </p>
                    </div>
                )}
            </div>


        </div>
    );
};

export default LinhaDoTempo;


