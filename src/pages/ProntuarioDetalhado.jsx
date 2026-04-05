import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatients } from '../contexts/PatientContext';
import { useEvolutions } from '../contexts/EvolutionContext';
import { useLaudos } from '../contexts/LaudoContext';
import { useAtestados } from '../contexts/AtestadoContext';
import { useDeclaracoes } from '../contexts/DeclaracaoContext';
import { useAnamneses } from '../contexts/AnamneseContext';
import { useEncaminhamentos } from '../contexts/EncaminhamentoContext';
import { useUser } from '../contexts/UserContext';
import CadastroPacienteModal from '../components/CadastroPacienteModal';
import NovoDocumentoModal from '../components/NovoDocumentoModal';
import { handleNavegacaoDocumento } from '../utils/navigation';
import { formatDisplayId, formatFileId, getDocumentPrefix } from '../utils/formatId';
import { calcularIdade } from '../utils/date';
import { safeRender } from '../utils/render';
/* Tarefa: Auditoria Profunda "100% Sem Enfeite"

- [x] Corrigir telas principais (Prontuário, Dashboard, Header) [Step Id: 305-314]
- [x] Auditoria em Telas Secundárias [Step Id: 345]
    - [x] `Sidebar.jsx` (Logout e links)
    - [x] `Prontuarios.jsx` (Lista geral e botão Assinar)
    - [x] `Relatorios.jsx` e `Configuracoes.jsx` (Exportar, Foto, Excluir)
- [x] Verificação de Ações em Documentos (Impressão/Save) [Step Id: 346]
- [x] Validação final de 100% do fluxo [Step Id: 347]
*/
import { showToast } from '../components/Toast';
import { exportToPDF } from '../utils/exportUtils';

const ProntuarioDetalhado = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const [abaAtiva, setAbaAtiva] = useState('visao-geral');
    const { patients, updatePatient } = usePatients();
    const [modalEditar, setModalEditar] = useState(false);
    const [modalNovoRegistro, setModalNovoRegistro] = useState(false);
    const [tipoDocInicial, setTipoDocInicial] = useState(null);
    const [editandoHistorico, setEditandoHistorico] = useState(false);
    const [historicoTexto, setHistoricoTexto] = useState('');

    const contextEvolutions = useEvolutions();
    const evolutions = contextEvolutions?.evolutions || [];
    
    const contextLaudos = useLaudos();
    const laudos = contextLaudos?.laudos || [];
    
    const contextAtestados = useAtestados();
    const atestados = contextAtestados?.atestados || [];
    
    const contextDeclaracoes = useDeclaracoes();
    const declaracoes = contextDeclaracoes?.declaracoes || [];
    
    const contextAnamneses = useAnamneses();
    const anamneses = contextAnamneses?.anamneses || [];
    
    const contextEncaminhamentos = useEncaminhamentos();
    const encaminhamentos = contextEncaminhamentos?.encaminhamentos || [];

    // Buscar paciente
    const paciente = useMemo(() => {
        const normalize = id => id?.toString().replace('#', '');
        const targetId = normalize(id);
        
        const foundById = patients.find(p => normalize(p.id) === targetId);
        if (foundById) return foundById;
        
        const decodedName = decodeURIComponent(id).toLowerCase();
        return patients.find(p => p.nome.toLowerCase() === decodedName);
    }, [patients, id]);

    // Sincronizar texto do histórico com o paciente
    useEffect(() => {
        if (paciente) {
            setHistoricoTexto(paciente.historico || '');
        }
    }, [paciente]);

    // Filtrar todos os documentos do paciente
    const documentos = useMemo(() => {
        const pid = paciente?.id;
        if (!pid) return [];

        const evs = evolutions.filter(e => e.pacienteId === pid).map(e => ({ ...e, tipo: 'Evolução', icon: 'clinical_notes', cor: 'text-primary bg-primary/10' }));
        const lds = laudos.filter(l => l.pacienteId === pid).map(l => ({ ...l, tipo: 'Laudo', icon: 'description', cor: 'text-violet-600 bg-violet-100' }));
        const ats = atestados.filter(a => a.pacienteId === pid).map(a => ({ ...a, tipo: 'Atestado', icon: 'medical_information', cor: 'text-amber-600 bg-amber-100' }));
        const dec = declaracoes.filter(d => d.pacienteId === pid).map(d => ({ ...d, tipo: 'Declaração', icon: 'verified', cor: 'text-emerald-600 bg-emerald-100' }));
        const ana = anamneses.filter(a => a.pacienteId === pid).map(a => ({ ...a, tipo: 'Anamnese', icon: 'assignment', cor: 'text-rose-600 bg-rose-100' }));
        const enc = encaminhamentos.filter(e => e.pacienteId === pid).map(e => ({ ...e, tipo: 'Encaminhamento', icon: 'send', cor: 'text-blue-600 bg-blue-100' }));

        return [...evs, ...lds, ...ats, ...dec, ...ana, ...enc].sort((a, b) => {
            const dateA = new Date(a.criadoEm || a.data);
            const dateB = new Date(b.criadoEm || b.data);
            if (isNaN(dateA)) return 1;
            if (isNaN(dateB)) return -1;
            return dateB - dateA;
        });
    }, [paciente, evolutions, laudos, atestados, declaracoes, anamneses, encaminhamentos]);

    if (!paciente) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <span className="material-symbols-outlined text-6xl text-slate-300">person_off</span>
                <p className="text-slate-500 font-medium">Paciente não encontrado.</p>
                <button onClick={() => navigate(-1)} className="text-primary font-bold hover:underline">Voltar</button>
            </div>
        );
    }

    const abas = [
        { id: 'visao-geral', label: 'Visão Geral', icon: 'visibility' },
        { id: 'anamnese', label: 'Anamnese', icon: 'assignment', count: documentos.filter(d => d.tipo === 'Anamnese').length },
        { id: 'evolucoes', label: 'Evoluções', icon: 'clinical_notes', count: documentos.filter(d => d.tipo === 'Evolução').length },
        { id: 'documentos', label: 'Documentos', icon: 'description', count: documentos.filter(d => ['Laudo', 'Atestado', 'Declaração', 'Encaminhamento'].includes(d.tipo)).length },
        { id: 'historico', label: 'Histórico Clínico', icon: 'history' },
    ];

    return (
        <div className="space-y-6">
            {/* Header do Paciente */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center">
                    <div className={`size-24 rounded-3xl flex items-center justify-center text-3xl font-black ${paciente.cor || 'bg-primary/10 text-primary'}`}>
                        {paciente.iniciais}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white truncate">{safeRender(paciente.nome)}</h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${paciente.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {paciente.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">fingerprint</span> {formatDisplayId(paciente.id, 'PAC')}</span>
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">cake</span> {safeRender(paciente.dataNascimento || paciente.nascimento || '—')} ({calcularIdade(paciente.dataNascimento || paciente.nascimento)})</span>
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">smartphone</span> {safeRender(paciente.telefone)}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap w-full md:w-auto mt-4 md:mt-0 gap-3">
                        <button 
                            onClick={() => setModalEditar(true)}
                            className="flex-1 md:flex-none justify-center h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 transition-all flex items-center gap-2 text-sm"
                        >
                            <span className="material-symbols-outlined text-xl">edit</span> Editar
                        </button>
                        <button 
                            onClick={() => setModalNovoRegistro(true)}
                            className="flex-1 md:flex-none justify-center h-11 px-5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 text-sm"
                        >
                            <span className="material-symbols-outlined text-xl">add</span> Novo Registro
                        </button>
                    </div>
                </div>
            </div>

            <CadastroPacienteModal
                isOpen={modalEditar}
                onClose={() => setModalEditar(false)}
                paciente={paciente}
                onSave={(dados) => {
                    updatePatient(paciente.id, dados);
                    setModalEditar(false);
                    showToast('Cadastro atualizado com sucesso!', 'success');
                }}
            />

            <NovoDocumentoModal
                isOpen={modalNovoRegistro}
                onClose={() => setModalNovoRegistro(false)}
                pacientePreSelecionado={paciente}
                tipoInicial={tipoDocInicial}
            />

            {/* Navegação por Abas */}
            <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit overflow-x-auto max-w-full">
                {abas.map(aba => (
                    <button
                        key={aba.id}
                        onClick={() => setAbaAtiva(aba.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${abaAtiva === aba.id 
                            ? 'bg-white dark:bg-slate-900 text-primary shadow-md translate-y-[-1px]' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                    >
                        <span className="material-symbols-outlined text-xl">{aba.icon}</span>
                        {aba.label}
                        {!!aba.count && (
                            <span className={`size-5 rounded-full flex items-center justify-center text-[10px] ${abaAtiva === aba.id ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                {aba.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Conteúdo das Abas */}
            <div className="min-h-[400px]">
                {abaAtiva === 'visao-geral' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-4">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">visibility</span> Linha do Tempo Clínica
                                </h3>
                                
                                {documentos.length === 0 ? (
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
                                        <p className="text-slate-400 font-medium">Nenhum registro encontrado para este paciente.</p>
                                    </div>
                                ) : (
                                    <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                                        {documentos.map((doc, idx) => {
                                            return (
                                                <div key={idx} className="relative group">
                                                    <div className={`absolute left-[-26px] top-1.5 size-4 rounded-full border-4 border-white dark:border-slate-950 shadow-sm z-10 transition-transform group-hover:scale-125 ${doc?.cor?.split(' ')[0] || ''}`} />
                                                    <div 
                                                        onClick={() => handleNavegacaoDocumento(doc, navigate)}
                                                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer select-none"
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`size-10 rounded-xl flex items-center justify-center font-bold ${doc?.cor || ''}`}>
                                                                    <span className="material-symbols-outlined">{doc?.icon || 'description'}</span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-slate-900 dark:text-white">{doc?.tipo}</h4>
                                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {formatDisplayId(doc?.id, getDocumentPrefix(doc?.tipo))}</p>
                                                                    <p className="text-xs text-slate-400 capitalize">
                                                                        {(() => {
                                                                            const d = new Date(doc?.criadoEm || doc?.data);
                                                                            return isNaN(d) ? 'Data não disponível' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                                                                        })()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc?.status || 'Finalizado'}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                            {typeof doc?.conteudo === 'object' 
                                                                ? (doc.conteudo?.subjetivo || doc.conteudo?.S || 'Registro clínico estruturado...') 
                                                                : (doc?.conteudo || 'Registro clínico realizado via sistema Meu Sistema PSI...')}
                                                        </p>
                                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    handleNavegacaoDocumento(doc, navigate); 
                                                                }} 
                                                                className="text-[11px] font-bold text-primary px-3 py-1 hover:bg-primary/5 rounded-lg transition-all"
                                                            >
                                                                Ver Detalhes
                                                            </button>
                                                            {/* <button 
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    const element = e.currentTarget.closest('.bg-white');
                                                                    exportToPDF(element, `Snapshot_${doc.tipo}_${paciente.nome.replace(/\s+/g, '_')}.pdf`);
                                                                }} 
                                                                className="text-[11px] font-bold text-slate-400 px-3 py-1 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-1"
                                                            >
                                                                <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span> PDF
                                                            </button> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-primary to-violet-600 rounded-3xl p-6 text-white shadow-lg shadow-primary/20">
                                    <h4 className="text-sm font-black uppercase tracking-widest opacity-80 mb-4">Queixa Principal</h4>
                                    <p className="text-lg font-medium leading-relaxed italic">
                                        "{safeRender(paciente.queixa, 'Nenhuma queixa inicial registrada para este paciente.')}"
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                    <h4 className="font-black text-slate-900 dark:text-white mb-4">Informações de Contato</h4>
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-xl">mail</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-mail</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{safeRender(paciente.email, '--')}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-xl">location_on</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Endereço</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {paciente.cidade && paciente.estado 
                                                        ? `${paciente.cidade}, ${paciente.estado}` 
                                                        : paciente.cidade || paciente.estado || '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-xl">medical_information</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plano / Convênio</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{safeRender(paciente.plano, 'Particular')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {abaAtiva === 'anamnese' && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Fichas de Anamnese</h3>
                            <button 
                                onClick={() => { setTipoDocInicial('anamnese'); setModalNovoRegistro(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl text-sm transition-all hover:bg-primary/20"
                            >
                                <span className="material-symbols-outlined text-lg">add</span> Nova Ficha
                            </button>
                        </div>
                        {documentos.filter(d => d.tipo === 'Anamnese').length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300">assignment_late</span>
                                </div>
                                <p className="text-slate-400 font-medium">Nenhuma anamnese registrada.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {documentos.filter(d => d.tipo === 'Anamnese').map((doc, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => navigate(`/anamneses/${doc.id}`)}
                                        className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group"
                                    >
                                        <div className="flex gap-4">
                                            <div className="size-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined">assignment</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 dark:text-white truncate">Anamnese Psicológica</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {formatDisplayId(doc.id, 'ANA')}</p>
                                                <p className="text-xs text-slate-400">{new Date(doc.criadoEm || doc.data).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                            <button 
                                                onClick={() => navigate(`/anamneses/${doc.id}`)}
                                                className="size-10 rounded-full flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors"
                                            >
                                                <span className="material-symbols-outlined">open_in_new</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {abaAtiva === 'evolucoes' && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Histórico de Evoluções</h3>
                            <button onClick={() => navigate('/prontuarios/evolucao/novo')} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 font-bold rounded-xl text-sm transition-all hover:bg-emerald-500/20">
                                <span className="material-symbols-outlined text-lg">edit_note</span> Registrar Evolução
                            </button>
                        </div>
                        {documentos.filter(d => d.tipo === 'Evolução').length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300">clinical_notes</span>
                                </div>
                                <p className="text-slate-400 font-medium">Nenhuma evolução registrada.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {documentos.filter(d => d.tipo === 'Evolução').map((doc, idx) => (
                                    <div key={idx} 
                                        onClick={() => navigate(`/prontuarios/evolucao/${doc.id.toString().replace('#', '')}`)}
                                        className="p-6 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-emerald-200 transition-all group select-none"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4">
                                                <div className="size-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined">clinical_notes</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">Evolução de Sessão</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {formatDisplayId(doc.id, 'EVO')}</p>
                                                    <p className="text-xs text-slate-400">{new Date(doc.criadoEm || doc.data).toLocaleDateString('pt-BR')} • {new Date(doc.criadoEm || doc.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => navigate(`/prontuarios/evolucao/${doc.id}`)} className="p-2 text-slate-400 hover:text-primary"><span className="material-symbols-outlined">open_in_new</span></button>
                                                <button onClick={() => navigate(`/prontuarios/evolucao/${doc.id}`)} className="p-2 text-slate-400 hover:text-primary"><span className="material-symbols-outlined">edit</span></button>
                                            </div>
                                        </div>
                                        <div 
                                            className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-sm text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer hover:bg-slate-100 transition-all font-medium italic"
                                        >
                                            "{typeof doc.conteudo === 'object' ? (doc.conteudo?.subjetivo || 'Registro estruturado...') : (doc.conteudo || 'Conteúdo da evolução clínica...')}"
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {abaAtiva === 'documentos' && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Documentos Gerados</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {['Laudo', 'Atestado', 'Declaração', 'Encaminhamento'].map(tipo => {
                                const docs = documentos.filter(d => d.tipo === tipo);
                                return (
                                    <div key={tipo} className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{tipo}s</h4>
                                        {docs.length === 0 ? (
                                            <div className="p-4 border border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vazio</div>
                                        ) : (
                                            docs.map((doc, idx) => (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => handleNavegacaoDocumento(doc, navigate)}
                                                    className="p-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-transparent hover:border-primary/20 transition-all cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={`material-symbols-outlined text-xl ${doc.cor.split(' ')[0]}`}>{doc.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{doc.tipo} do dia {new Date(doc.criadoEm || doc.data).toLocaleDateString('pt-BR')}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {formatDisplayId(doc.id, getDocumentPrefix(doc.tipo))}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium">Assinado por {user.nome || 'Profissional'}</p>
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

                {abaAtiva === 'historico' && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Histórico Clínico Resumo</h3>
                        <div className="prose dark:prose-invert max-w-none">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 min-h-[300px]">
                                {editandoHistorico ? (
                                    <div className="space-y-4">
                                        <textarea
                                            value={historicoTexto}
                                            onChange={(e) => setHistoricoTexto(e.target.value)}
                                            className="w-full h-64 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-primary/30 text-sm font-medium resize-none shadow-sm dark:text-white"
                                            placeholder="Descreva o histórico clínico do paciente..."
                                        />
                                        <div className="flex gap-3 justify-end">
                                            <button 
                                                onClick={() => {
                                                    setEditandoHistorico(false);
                                                    setHistoricoTexto(paciente.historico || '');
                                                }}
                                                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                            >
                                                Cancelar
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        await updatePatient(paciente.id, { historico: historicoTexto });
                                                        showToast('Histórico atualizado com sucesso!', 'success');
                                                        setEditandoHistorico(false);
                                                    } catch (e) {
                                                        showToast('Erro ao atualizar histórico.', 'error');
                                                    }
                                                }}
                                                className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:bg-primary/90 transition-all"
                                            >
                                                Salvar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-slate-500 italic leading-relaxed whitespace-pre-wrap">
                                            {historicoTexto || 'Inicie aqui o resumo do histórico clínico do paciente. Agrupe observações de longo prazo, diagnósticos confirmados, evolução terapêutica e considerações importantes para o tratamento.'}
                                        </p>
                                        <button 
                                            onClick={() => setEditandoHistorico(true)}
                                            className="mt-8 flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl text-sm hover:border-primary transition-all shadow-sm"
                                        >
                                            <span className="material-symbols-outlined">edit</span> {historicoTexto ? 'Editar Histórico' : 'Começar a escrever histórico'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProntuarioDetalhado;


