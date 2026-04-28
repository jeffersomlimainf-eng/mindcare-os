import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useLaudos } from '../contexts/LaudoContext';
import { usePatients } from '../contexts/PatientContext';
import { useModels } from '../contexts/ModelContext';
import { useUser } from '../contexts/UserContext';
import { showToast } from '../components/Toast';
import { formatDisplayId, formatFileId } from '../utils/formatId';
import { logger } from '../utils/logger';
import { laudoSchema } from '../schemas/documentSchema';

const formatBirthDate = (dateStr) => {
    if (!dateStr || dateStr === '—') return '—';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('pt-BR');
};

const LaudoPsicologico = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addLaudo, updateLaudo, getLaudoById } = useLaudos();
    const { patients } = usePatients();
    const { models } = useModels();
    const { user } = useUser();

    const isNovo = id === 'novo';
    const laudoExistente = !isNovo ? getLaudoById(id) : null;
    const { markDirty, markClean } = useUnsavedChanges();
    const initialLoadRef = useRef(true);

    const cidadeSalva = localStorage.getItem('decl_local_emissao') || '';
    const [localEmissao, setLocalEmissao] = useState(cidadeSalva);
    const [salvando, setSalvando] = useState(false);
    const [pacienteBusca, setPacienteBusca] = useState('');
    const [showDropdown, setShowDropdown] = useState(() => {
        const hasPaciente = location.state?.pacienteId || location.state?.documentoReferencia?.pacienteId || location.state?.pacienteObjeto;
        return isNovo && !hasPaciente;
    });
    const [laudoId, setLaudoId] = useState(laudoExistente?.id || null);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const documentoRef = useRef(null);

    const [dados, setDados] = useState({
        pacienteId: '',
        pacienteNome: '',
        pacienteIniciais: '',
        pacienteCor: '',
        pacienteEmail: '',
        pacienteTelefone: '',
        pacienteCpf: '',
        pacienteDataNascimento: '',
        solicitante: '',
        identificacao: '',
        demanda: '',
        procedimento: '',
        analiseConclusao: '',
        status: 'Rascunho',
        documentoId: '',
        profissionalNome: user.nome,
        profissionalCrp: user.crp,
        profissionalEspecialidade: user.especialidade,
    });

    useEffect(() => {
        if (laudoExistente) {
            setDados({
                pacienteId: laudoExistente.pacienteId || '',
                pacienteNome: laudoExistente.pacienteNome || '',
                pacienteIniciais: laudoExistente.pacienteIniciais || '',
                pacienteCor: laudoExistente.pacienteCor || '',
                pacienteEmail: laudoExistente.pacienteEmail || '',
                pacienteTelefone: laudoExistente.pacienteTelefone || '',
                pacienteCpf: laudoExistente.pacienteCpf || '',
                pacienteDataNascimento: laudoExistente.pacienteDataNascimento || '',
                solicitante: laudoExistente.solicitante || '',
                identificacao: laudoExistente.identificacao || '',
                demanda: laudoExistente.demanda || '',
                procedimento: laudoExistente.procedimento || '',
                analiseConclusao: laudoExistente.analiseConclusao || '',
                status: laudoExistente.status || 'Rascunho',
                documentoId: laudoExistente.documentoId || '',
                profissionalNome: laudoExistente.profissionalNome || user.nome,
                profissionalCrp: laudoExistente.profissionalCrp || user.crp,
                profissionalEspecialidade: laudoExistente.profissionalEspecialidade || user.especialidade,
            });
            setPacienteBusca(laudoExistente.pacienteNome || '');
            setLaudoId(laudoExistente.id);
        } else if (isNovo && location.state) {
            const { modelo, pacienteId, documentoReferencia } = location.state;

            if (documentoReferencia) {
                setDados(prev => ({
                    ...prev,
                    identificacao: documentoReferencia.identificacao || documentoReferencia.pacienteNome || '',
                    solicitante: documentoReferencia.solicitante || '',
                    demanda: documentoReferencia.demanda || '',
                    procedimento: documentoReferencia.procedimento || '',
                    analiseConclusao: documentoReferencia.analiseConclusao || documentoReferencia.conteudo || '',
                    status: documentoReferencia.status || 'Rascunho',
                    documentoId: documentoReferencia.documentoId || documentoReferencia.id || '',
                }));
                if (documentoReferencia.pacienteNome) setPacienteBusca(documentoReferencia.pacienteNome);
            }

            if (pacienteId || documentoReferencia?.pacienteId || location.state?.pacienteObjeto) {
                const targetId = pacienteId || documentoReferencia?.pacienteId || location.state?.pacienteObjeto?.id;
                const normalize = (id) => id?.toString().replace('#', '');
                const p = patients.find(p => normalize(p.id) === normalize(targetId));
                if (p) {
                    setDados(prev => ({
                        ...prev,
                        pacienteId: p.id,
                        pacienteNome: p.nome,
                        pacienteIniciais: p.iniciais,
                        pacienteCor: p.cor,
                        pacienteEmail: p.email || '',
                        pacienteTelefone: p.telefone || '',
                    }));
                    setPacienteBusca(p.nome);
                }
            }

            if (modelo) {
                setDados(prev => ({ ...prev, analiseConclusao: modelo.conteudo || '' }));
            } else if (location.state?.categoria) {
                const modeloPadrao = (models || []).find(m => m.categoria === location.state.categoria);
                if (modeloPadrao) {
                    setDados(prev => ({ ...prev, analiseConclusao: modeloPadrao.conteudo || '' }));
                }
            }
        }
    }, [laudoExistente, user, isNovo, location.state, models]);

    useEffect(() => {
        if (!dados.pacienteId || !patients.length) return;
        const normalize = (id) => id?.toString().replace('#', '');
        const p = patients.find(p => normalize(p.id) === normalize(dados.pacienteId));
        if (p) {
            const cpfVazio = !dados.pacienteCpf || dados.pacienteCpf === '___.___.____-__';
            const dataVazia = !dados.pacienteDataNascimento || dados.pacienteDataNascimento === '—';
            if ((cpfVazio && p.cpf) || (dataVazia && (p.dataNascimento || p.nascimento))) {
                setDados(prev => ({
                    ...prev,
                    pacienteCpf: (cpfVazio && p.cpf) ? p.cpf : prev.pacienteCpf,
                    pacienteDataNascimento: (dataVazia && (p.dataNascimento || p.nascimento)) ? (p.dataNascimento || p.nascimento) : prev.pacienteDataNascimento,
                    pacienteEmail: !prev.pacienteEmail ? (p.email || '') : prev.pacienteEmail,
                    pacienteTelefone: !prev.pacienteTelefone ? (p.telefone || '') : prev.pacienteTelefone,
                }));
            }
        }
    }, [patients, dados.pacienteId]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (initialLoadRef.current) { initialLoadRef.current = false; return; }
        markDirty();
    }, [dados]);

    const pacientesFiltrados = patients.filter(p =>
        p.nome.toLowerCase().includes(pacienteBusca.toLowerCase()) ||
        p.id.toLowerCase().includes(pacienteBusca.toLowerCase())
    );

    const handleSelecionarPaciente = (p) => {
        setDados(prev => ({
            ...prev,
            pacienteId: p.id,
            pacienteNome: p.nome,
            pacienteIniciais: p.iniciais,
            pacienteCor: p.cor,
            pacienteEmail: p.email || '',
            pacienteTelefone: p.telefone || '',
            pacienteCpf: p.cpf || '',
            pacienteDataNascimento: p.dataNascimento || p.nascimento || '',
        }));
        setPacienteBusca(p.nome);
        setShowDropdown(false);
    };

    const handleChange = (campo, valor) => setDados(prev => ({ ...prev, [campo]: valor }));

    const handleLocalEmissaoChange = (valor) => {
        setLocalEmissao(valor);
        localStorage.setItem('decl_local_emissao', valor);
    };

    const handleSalvar = (novoStatus) => {
        setSalvando(true);
        const dadosSalvar = {
            ...dados,
            status: novoStatus || dados.status,
            profissionalNome: user.nome,
            profissionalCrp: user.crp,
            profissionalEspecialidade: user.especialidade,
        };

        if (novoStatus === 'Finalizado' || novoStatus === 'Em Revisão') {
            const validation = laudoSchema.safeParse(dadosSalvar);
            if (!validation.success) {
                showToast(validation.error.errors[0].message, 'warning');
                setSalvando(false);
                return;
            }
        } else if (!dados.pacienteId) {
            showToast('Selecione um paciente antes de salvar.', 'warning');
            setSalvando(false);
            return;
        }

        setTimeout(() => {
            if (laudoId) {
                updateLaudo(laudoId, dadosSalvar);
                showToast(novoStatus === 'Finalizado' ? 'Laudo finalizado! ✅' : 'Laudo salvo!', 'success');
            } else {
                const novo = addLaudo(dadosSalvar);
                setLaudoId(novo.id);
                setDados(prev => ({ ...prev, documentoId: novo.documentoId, status: novo.status }));
                showToast('Laudo criado com sucesso!', 'success');
            }
            markClean();
            setSalvando(false);
        }, 600);
    };

    const handlePrint = () => window.print();

    const handleExportWord = async () => {
        try {
            const { exportToWord } = await import('../utils/exportUtils');
            const dataForWord = {
                titulo: 'Laudo Psicológico',
                subtitulo: `Documento: ${formatDisplayId(dados.documentoId, 'LAU')}`,
                paciente: {
                    nome: dados.pacienteNome,
                    cpf: dados.pacienteCpf,
                    nascimento: formatBirthDate(dados.pacienteDataNascimento),
                },
                dataEmissao: new Date().toLocaleDateString('pt-BR'),
                secoes: [
                    { titulo: 'I. Identificação', conteudo: dados.identificacao },
                    { titulo: 'II. Descrição da Demanda', conteudo: dados.demanda },
                    { titulo: 'III. Procedimento', conteudo: dados.procedimento },
                    { titulo: 'IV. Análise e Conclusão', conteudo: dados.analiseConclusao },
                ],
                profissional: { nome: user.nome, crp: user.crp, especialidade: user.especialidade },
            };
            const filename = `laudo_${dados.pacienteNome.replace(/\s+/g, '_').toLowerCase()}_${formatFileId(dados.documentoId)}.docx`;
            await exportToWord(dataForWord, filename);
            showToast('Word gerado com sucesso!', 'success');
        } catch {
            showToast('Erro ao gerar Word.', 'error');
        }
    };

    const handleWhatsApp = () => {
        const texto = `Olá ${dados.pacienteNome}, segue informação sobre o seu laudo psicológico (${formatDisplayId(dados.documentoId, 'LAU')}). Para mais detalhes, entre em contato com a clínica.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    };

    const statusConfig = {
        'Rascunho':   { cor: 'bg-slate-100 text-slate-600 border-slate-200',    dot: 'bg-slate-400' },
        'Em Revisão': { cor: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
        'Finalizado': { cor: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    };

    const statusAtual = statusConfig[dados.status] || statusConfig['Rascunho'];
    const isFinalizado = dados.status === 'Finalizado' || dados.status === 'Assinado';
    const historico = laudoExistente?.historico || [];

    const formatDate = (iso) => {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const hojeExtenso = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const docLabel = dados.documentoId ? formatDisplayId(dados.documentoId, 'LAU') : 'RASCUNHO';

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 md:p-8 pb-20 print:bg-white print:p-0">

            {/* ── Topbar ── */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors mb-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                        {isNovo && !laudoId ? 'Novo Laudo Psicológico' : 'Laudo Psicológico'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isNovo && !laudoId
                            ? 'Conforme a Resolução CFP nº 06/2019.'
                            : `${docLabel} · ${dados.pacienteNome}`}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-primary transition-all shadow-sm">
                        <span className="material-symbols-outlined text-sm">print</span> Imprimir
                    </button>
                    <button onClick={handleExportWord} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-primary transition-all shadow-sm">
                        <span className="material-symbols-outlined text-sm">description</span> Word
                    </button>
                    <button onClick={handleWhatsApp} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
                        <span className="material-symbols-outlined text-sm">send</span> WhatsApp
                    </button>
                    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black border ${statusAtual.cor}`}>
                        <span className={`size-2 rounded-full ${statusAtual.dot}`}></span>
                        {dados.status}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Documento A4 ── */}
                <div className="lg:col-span-2 print:col-span-3">
                    <div
                        ref={documentoRef}
                        className="documento-laudo bg-white text-slate-900 shadow-xl print:shadow-none"
                    >
                        {/* Topo colorido — oculto na impressão */}
                        <div className="h-1.5 bg-gradient-to-r from-primary to-violet-500 print:hidden" />

                        <div className="px-12 py-10 md:px-16 md:py-14 print:px-0 print:py-0 flex flex-col min-h-[1060px] print:min-h-0">

                            {/* ── Cabeçalho do documento ── */}
                            <header className="mb-8 print:mb-6">
                                <div className="flex items-start justify-between gap-6">
                                    {/* Identidade da clínica */}
                                    <div className="flex items-center gap-3">
                                        <div className="size-11 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 print:hidden">
                                            <span className="material-symbols-outlined text-xl">psychology</span>
                                        </div>
                                        <div>
                                            <p className="font-black text-base text-primary leading-tight print:text-slate-900">
                                                {user.clinica?.nome || user.clinic_name || user.nome}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                                                Psicologia Clínica
                                            </p>
                                            {user.telefone && (
                                                <p className="text-[10px] text-slate-400">{user.telefone}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Título do documento */}
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Documento Psicológico</p>
                                        <h3 className="text-xl font-black uppercase tracking-wider text-slate-800 leading-tight">
                                            Laudo<br />Psicológico
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1 font-mono">{docLabel}</p>
                                    </div>
                                </div>

                                {/* Linha divisória */}
                                <div className="mt-6 border-t-2 border-slate-800 print:border-slate-900" />
                                <div className="mt-0.5 border-t border-slate-200 print:border-slate-300" />
                            </header>

                            {/* ── Dados do paciente ── */}
                            <section className="mb-8 print:mb-6">
                                <div className="grid grid-cols-2 gap-0 border border-slate-200 print:border-slate-300 rounded-lg overflow-hidden text-sm">
                                    <div className="p-3 border-b border-r border-slate-200 print:border-slate-300">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Paciente</p>
                                        <p className="font-black text-slate-900">{dados.pacienteNome || '—'}</p>
                                    </div>
                                    <div className="p-3 border-b border-slate-200 print:border-slate-300">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">CPF</p>
                                        <p className="font-semibold text-slate-700">{dados.pacienteCpf || '___.___.___-__'}</p>
                                    </div>
                                    <div className="p-3 border-b border-r border-slate-200 print:border-slate-300">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Data de Nascimento</p>
                                        <p className="font-semibold text-slate-700">{formatBirthDate(dados.pacienteDataNascimento)}</p>
                                    </div>
                                    <div className="p-3 border-b border-slate-200 print:border-slate-300">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Solicitante</p>
                                        <input
                                            type="text"
                                            value={dados.solicitante}
                                            onChange={e => handleChange('solicitante', e.target.value)}
                                            className="font-semibold text-slate-700 bg-transparent outline-none w-full border-b border-dotted border-slate-300 focus:border-primary transition-colors print:hidden"
                                            placeholder="Ex: Dr. Marcos Rebouças"
                                            readOnly={isFinalizado}
                                        />
                                        <p className="hidden print:block font-semibold text-slate-700">{dados.solicitante || '—'}</p>
                                    </div>
                                    <div className="p-3 col-span-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Data de Emissão</p>
                                        <p className="font-semibold text-slate-700">{hojeExtenso}</p>
                                    </div>
                                </div>
                            </section>

                            {/* ── Corpo do laudo ── */}
                            <div className="flex-1 space-y-7 print:space-y-5">
                                {[
                                    { num: 'I',   titulo: 'Identificação',        campo: 'identificacao',    placeholder: `O presente laudo refere-se ao processo de avaliação psicológica realizado com o(a) paciente ${dados.pacienteNome || '[Nome]'}, visando a compreensão de demandas cognitivas e emocionais relatadas em consulta inicial.`, minH: 80 },
                                    { num: 'II',  titulo: 'Descrição da Demanda', campo: 'demanda',          placeholder: 'Descreva o motivo do encaminhamento e a queixa principal do paciente.', minH: 100 },
                                    { num: 'III', titulo: 'Procedimento',         campo: 'procedimento',     placeholder: 'Liste os instrumentos, técnicas e número de sessões utilizados na avaliação.', minH: 100 },
                                    { num: 'IV',  titulo: 'Análise e Conclusão',  campo: 'analiseConclusao', placeholder: 'Apresente os resultados, o diagnóstico (CID se aplicável) e as recomendações clínicas.', minH: 140 },
                                ].map(({ num, titulo, campo, placeholder, minH }) => (
                                    <section key={campo} className="print-section">
                                        <div className="flex items-baseline gap-3 mb-2 pb-1.5 border-b border-slate-200 print:border-slate-300">
                                            <span className="text-[11px] font-black text-primary print:text-slate-900 shrink-0">{num}.</span>
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-800">{titulo}</h4>
                                        </div>
                                        <textarea
                                            value={dados[campo]}
                                            onChange={e => handleChange(campo, e.target.value)}
                                            style={{ minHeight: minH }}
                                            className="w-full text-sm leading-[1.85] text-slate-700 bg-transparent border-none outline-none resize-none focus:bg-blue-50/40 rounded-lg px-2 py-1.5 transition-colors print:hidden"
                                            placeholder={placeholder}
                                            readOnly={isFinalizado}
                                        />
                                        <div className="hidden print:block text-[11pt] leading-[1.9] text-slate-800 whitespace-pre-wrap text-justify">
                                            {dados[campo] || 'Não informado.'}
                                        </div>
                                    </section>
                                ))}
                            </div>

                            {/* ── Localidade e data ── */}
                            <div className="mt-10 print:mt-8 text-right">
                                <p className="text-sm text-slate-600">
                                    {localEmissao || 'Local'}, {hojeExtenso}
                                </p>
                            </div>

                            {/* ── Assinatura ── */}
                            <div className="mt-8 print:mt-10 pt-6 border-t-2 border-slate-800 print:border-slate-900 flex flex-col items-center text-center">
                                <div className="size-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-sm font-black shadow-md mb-3 print:hidden">
                                    {user.nome?.charAt(user.nome.startsWith('Dr') ? 3 : 0) || 'P'}
                                </div>
                                <p className="font-black text-sm text-slate-900 tracking-wide">{user.nome}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{user.especialidade}{user.crp ? ` · CRP ${user.crp}` : ''}</p>
                                <p className="text-[9px] text-primary font-bold mt-2 uppercase tracking-widest print:hidden">
                                    Assinado digitalmente via Meu Sistema Psi
                                </p>
                                <div className="mt-6 text-[8px] text-slate-400 leading-relaxed border-t border-slate-100 pt-4 w-full print:border-slate-200">
                                    Este laudo é um documento sigiloso e pessoal. Sua divulgação sem autorização constitui infração ética.
                                    Elaborado conforme a Resolução CFP nº 06/2019.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Painel Lateral ── */}
                <div className="space-y-5 print:hidden">

                    {/* Selecionar Paciente */}
                    {!isFinalizado && (
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-3">
                                {dados.pacienteId ? 'Trocar Paciente' : 'Selecionar Paciente'}
                            </h4>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Buscar paciente..."
                                    value={pacienteBusca}
                                    onChange={e => { setPacienteBusca(e.target.value); setShowDropdown(true); }}
                                    onFocus={() => setShowDropdown(true)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    autoComplete="off"
                                />
                                {showDropdown && (
                                    <div ref={dropdownRef} className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                                        {pacientesFiltrados.length > 0 ? (
                                            pacientesFiltrados.map(p => (
                                                <button key={p.id} onClick={() => handleSelecionarPaciente(p)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors">
                                                    <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${p.cor || 'bg-primary/10 text-primary'}`}>{p.iniciais}</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{p.nome}</p>
                                                        <p className="text-[10px] text-slate-400">{formatDisplayId(p.id, 'PAC')}</p>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-6 text-center text-slate-400 text-sm">Nenhum paciente encontrado</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {dados.pacienteId && (
                                <div className="mt-3 flex items-center gap-2 p-2.5 bg-primary/5 rounded-xl border border-primary/20">
                                    <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${dados.pacienteCor || 'bg-primary/10 text-primary'}`}>{dados.pacienteIniciais}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{dados.pacienteNome}</p>
                                        <p className="text-[10px] text-slate-400">{formatDisplayId(dados.pacienteId, 'PAC')}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Configurações do documento */}
                    {!isFinalizado && (
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-3">Documento</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Local de Emissão</label>
                                    <input
                                        type="text"
                                        value={localEmissao}
                                        onChange={e => handleLocalEmissaoChange(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="Ex: Curitiba"
                                    />
                                    <p className="text-[9px] text-slate-400 mt-1">💾 Salvo automaticamente</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ações */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                            Ações do Laudo
                        </h4>
                        {!isFinalizado ? (
                            <div className="space-y-2.5">
                                <button onClick={() => handleSalvar(dados.status)} disabled={salvando}
                                    className="w-full py-3 bg-primary text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50">
                                    {salvando
                                        ? <><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
                                        : <><span className="material-symbols-outlined text-sm">save</span> Salvar Rascunho</>}
                                </button>
                                <button onClick={() => handleSalvar('Em Revisão')} disabled={salvando}
                                    className="w-full py-3 bg-amber-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:opacity-90 transition-all disabled:opacity-50">
                                    <span className="material-symbols-outlined text-sm">rate_review</span> Enviar para Revisão
                                </button>
                                <button onClick={() => handleSalvar('Finalizado')} disabled={salvando}
                                    className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all disabled:opacity-50">
                                    <span className="material-symbols-outlined text-sm">verified</span> Finalizar Laudo
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-3">
                                <div className="size-12 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-2xl text-emerald-600">task_alt</span>
                                </div>
                                <p className="text-sm font-black text-emerald-700">Documento {dados.status}</p>
                                <p className="text-[10px] text-slate-400 mt-1">Bloqueado para edição direta.</p>
                                <button
                                    onClick={() => {
                                        setDados(prev => ({ ...prev, status: 'Em Revisão' }));
                                        if (laudoId) updateLaudo(laudoId, { status: 'Em Revisão', profissionalNome: user.nome });
                                        showToast('Laudo reaberto para edição.', 'info');
                                    }}
                                    className="mt-3 text-xs font-bold text-primary hover:underline"
                                >
                                    Reabrir para Edição
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Histórico */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">history</span>
                            Histórico de Versões
                        </h4>
                        {historico.length > 0 ? (
                            <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-4">
                                {historico.slice().reverse().map((h, i) => (
                                    <div key={i} className="relative">
                                        <div className={`absolute -left-[21px] size-3.5 rounded-full border-2 border-white dark:border-slate-900 ${i === 0 ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                        <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{h.acao}</p>
                                        <p className="text-[10px] text-slate-400">{h.usuario}</p>
                                        <p className="text-[10px] text-primary font-bold">{formatDate(h.data)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-3">Nenhum histórico disponível.</p>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .documento-laudo {
                    width: 100%;
                    max-width: 794px;
                    margin: 0 auto;
                    border-radius: 4px;
                    overflow: hidden;
                }

                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 2.5cm 2cm 2.5cm 2.5cm;
                    }
                    html, body {
                        background: white !important;
                        font-size: 11pt !important;
                        color: #111 !important;
                    }
                    .print\\:hidden { display: none !important; }
                    .grid { display: block !important; }
                    .gap-8 { gap: 0 !important; }
                    .max-w-7xl { max-width: none !important; margin: 0 !important; width: 100% !important; }
                    .documento-laudo {
                        max-width: none !important;
                        width: 100% !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        overflow: visible !important;
                    }
                    .print-section { page-break-inside: avoid !important; }
                    * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
                }
            `}} />
        </div>
    );
};

export default LaudoPsicologico;
