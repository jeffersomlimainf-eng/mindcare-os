import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEncaminhamentos } from '../contexts/EncaminhamentoContext';
import { usePatients } from '../contexts/PatientContext';
import { useModels } from '../contexts/ModelContext';
import { useUser } from '../contexts/UserContext';
import { showToast } from '../components/Toast';
import { formatDisplayId, formatFileId } from '../utils/formatId';

const especialidadesDestino = [
    'Psiquiatria',
    'Neurologia',
    'Fonoaudiologia',
    'Terapia Ocupacional',
    'Psicopedagogia',
    'Neuropsicologia',
    'Nutrição',
    'Assistência Social',
    'Psicologia (outra abordagem)',
    'Pediatria',
    'Endocrinologia',
    'Fisioterapia',
    'Outro'
];

const EncaminhamentoProfissional = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addEncaminhamento, updateEncaminhamento, getEncaminhamentoById } = useEncaminhamentos();
    const { patients } = usePatients();
    const { models } = useModels();
    const { user } = useUser();

    const isNovo = id === 'novo';
    const existente = !isNovo ? getEncaminhamentoById(id) : null;

    const [salvando, setSalvando] = useState(false);
    const [pacienteBusca, setPacienteBusca] = useState('');
    const [showDropdown, setShowDropdown] = useState(() => {
        const hasPaciente = location.state?.pacienteId || location.state?.documentoReferencia?.pacienteId || location.state?.pacienteObjeto;
        return isNovo && !hasPaciente;
    });
    const [encId, setEncId] = useState(existente?.id || null);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const documentoRef = useRef(null);

    const [dados, setDados] = useState({
        pacienteId: '',
        pacienteNome: '',
        pacienteIniciais: '',
        pacienteCor: '',
        pacienteCpf: '',
        pacienteDataNascimento: '',
        especialidadeDestino: 'Psiquiatria',
        profissionalDestino: '',
        clinicaDestino: '',
        motivo: '',
        resumoClinico: '',
        objetivoEncaminhamento: '',
        urgencia: 'Normal',
        observacoes: '',
        status: 'Rascunho',
        documentoId: '',
        profissionalNome: user.nome,
        profissionalCrp: user.crp,
        profissionalEspecialidade: user.especialidade,
    });

    useEffect(() => {
        if (existente) {
            setDados({
                pacienteId: existente.pacienteId || '',
                pacienteNome: existente.pacienteNome || '',
                pacienteIniciais: existente.pacienteIniciais || '',
                pacienteCor: existente.pacienteCor || '',
                pacienteCpf: existente.pacienteCpf || '',
                pacienteDataNascimento: existente.pacienteDataNascimento || '',
                especialidadeDestino: existente.especialidadeDestino || 'Psiquiatria',
                profissionalDestino: existente.profissionalDestino || '',
                clinicaDestino: existente.clinicaDestino || '',
                motivo: existente.motivo || '',
                resumoClinico: existente.resumoClinico || '',
                objetivoEncaminhamento: existente.objetivoEncaminhamento || '',
                urgencia: existente.urgencia || 'Normal',
                observacoes: existente.observacoes || '',
                status: existente.status || 'Rascunho',
                documentoId: existente.documentoId || '',
                profissionalNome: existente.profissionalNome || user.nome,
                profissionalCrp: existente.profissionalCrp || user.crp,
                profissionalEspecialidade: existente.profissionalEspecialidade || user.especialidade,
            });
            setPacienteBusca(existente.pacienteNome || '');
            setEncId(existente.id);
        } else if (isNovo && location.state) {
            const { modelo, pacienteId, documentoReferencia } = location.state;
            
            if (documentoReferencia) {
                setDados(prev => ({
                    ...prev,
                    pacienteId: documentoReferencia.pacienteId || '',
                    pacienteNome: documentoReferencia.pacienteNome || '',
                    pacienteIniciais: documentoReferencia.pacienteIniciais || '',
                    pacienteCor: documentoReferencia.pacienteCor || '',
                    pacienteCpf: documentoReferencia.pacienteCpf || '',
                    pacienteDataNascimento: documentoReferencia.pacienteDataNascimento || '',
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
                    }));
                    setPacienteBusca(p.nome);
                }
            }
            
            if (modelo) {
                setDados(prev => ({
                    ...prev,
                    motivo: modelo.conteudo || ''
                }));
            } else if (location.state?.categoria) {
                const modeloPadrao = (models || []).find(m => m.categoria === location.state.categoria);
                if (modeloPadrao) {
                    setDados(prev => ({
                        ...prev,
                        motivo: modeloPadrao.conteudo || '',
                    }));
                }
            }
        }
    }, [existente, user, isNovo, location.state, models]);

    // Sincronização Automática com o Cadastro do Paciente
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
            pacienteCpf: p.cpf || '',
            pacienteDataNascimento: p.dataNascimento || p.nascimento || '',
        }));
        setPacienteBusca(p.nome);
        setShowDropdown(false);
    };

    const handleChange = (campo, valor) => {
        setDados(prev => ({ ...prev, [campo]: valor }));
    };

    const handleSalvar = (novoStatus) => {
        if (!dados.pacienteId) {
            showToast('Selecione um paciente antes de salvar.', 'warning');
            return;
        }
        setSalvando(true);
        const dadosSalvar = { ...dados, status: novoStatus || dados.status, profissionalNome: user.nome, profissionalCrp: user.crp, profissionalEspecialidade: user.especialidade };

        setTimeout(() => {
            if (encId) {
                updateEncaminhamento(encId, dadosSalvar);
                showToast(novoStatus === 'Finalizado' ? 'Encaminhamento finalizado! ✅' : 'Encaminhamento salvo!', 'success');
            } else {
                const novo = addEncaminhamento(dadosSalvar);
                setEncId(novo.id);
                setDados(prev => ({ ...prev, documentoId: novo.documentoId, status: novo.status }));
                showToast('Encaminhamento criado com sucesso!', 'success');
            }
            setSalvando(false);
        }, 600);
    };

    const handlePrint = () => window.print();

    const handleExportPDF = async () => {
        if (!documentoRef.current) return;
        try {
            const { exportToPDF } = await import('../utils/exportUtils');
            const filename = `encaminhamento_${dados.pacienteNome.replace(/\s+/g, '_').toLowerCase()}_${formatFileId(dados.documentoId)}.pdf`;
            await exportToPDF(documentoRef.current, filename);
            showToast('PDF gerado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro na exportação PDF:', error);
            showToast(`Erro técnico: ${error.message}. Use a opção "Imprimir" → "Salvar como PDF".`, 'warning');
        }
    };

    const handleExportWord = async () => {
        try {
            const { exportToWord } = await import('../utils/exportUtils');
            const dataForWord = {
                titulo: 'Encaminhamento Profissional',
                subtitulo: `Documento ID: #${formatFileId(dados.documentoId)}`,
                paciente: {
                    nome: dados.pacienteNome,
                    cpf: dados.pacienteCpf,
                    nascimento: dados.pacienteNascimento ? new Date(dados.pacienteNascimento).toLocaleDateString('pt-BR') : '—'
                },
                dataEmissao: new Date().toLocaleDateString('pt-BR'),
                secoes: [
                    { 
                        titulo: 'Encaminhamento', 
                        conteudo: `Encaminho o(a) paciente ${dados.pacienteNome}${dados.pacienteCpf ? `, CPF ${dados.pacienteCpf}` : ''}, que se encontra em acompanhamento psicológico nesta clínica, para avaliação e conduta em ${dados.especialidadeDestino}.`
                    },
                    { titulo: 'Motivo do Encaminhamento', conteudo: dados.motivo },
                    { titulo: 'Resumo Clínico', conteudo: dados.resumoClinico },
                    { titulo: 'Objetivo do Encaminhamento', conteudo: dados.objetivoEncaminhamento }
                ],
                profissional: {
                    nome: user.nome,
                    crp: user.crp,
                    especialidade: user.especialidade
                }
            };
            if (dados.observacoes) dataForWord.secoes.push({ titulo: 'Observações', conteudo: dados.observacoes });
            
            const filename = `encaminhamento_${dados.pacienteNome.replace(/\s+/g, '_').toLowerCase()}_${formatFileId(dados.documentoId)}.docx`;
            await exportToWord(dataForWord, filename);
            showToast('Word gerado com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao gerar Word.', 'error');
        }
    };
    const handleWhatsApp = () => {
        const texto = `Olá ${dados.pacienteNome}, segue seu encaminhamento profissional (${formatFileId(dados.documentoId)}) para ${dados.especialidadeDestino}. Para mais informações, entre em contato.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    };

    const statusConfig = {
        'Rascunho': { cor: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
        'Finalizado': { cor: 'bg-sky-100 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
    };
    const urgenciaConfig = {
        'Baixa': 'bg-slate-100 text-slate-600',
        'Normal': 'bg-blue-100 text-blue-700',
        'Alta': 'bg-orange-100 text-orange-700',
        'Urgente': 'bg-red-100 text-red-700',
    };
    const statusAtual = statusConfig[dados.status] || statusConfig['Rascunho'];
    const isFinalizado = dados.status === 'Finalizado' || dados.status === 'Assinado';
    const historico = existente?.historico || [];
    const criadoEm = existente?.criadoEm;
    const atualizadoEm = existente?.atualizadoEm;

    const formatDateTime = (iso) => {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const hojeExtenso = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-20 print:bg-white print:p-0">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors mb-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                        {isNovo && !encId ? 'Novo Encaminhamento' : 'Encaminhamento Profissional'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isNovo && !encId
                            ? 'Encaminhe o paciente para outro profissional ou especialidade.'
                            : `Documento ${formatDisplayId(dados.documentoId, 'ENC')} · ${dados.pacienteNome}`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-primary transition-all shadow-sm">
                        <span className="material-symbols-outlined text-sm">print</span> Imprimir
                    </button>
                    {/* <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-primary transition-all shadow-sm">
                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span> PDF
                    </button> */}
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
                {/* Documento A4 */}
                <div className="lg:col-span-2 print:col-span-3">
                    <div ref={documentoRef} className="bg-white text-slate-900 p-10 md:p-16 shadow-2xl rounded-sm min-h-[1000px] documento-encaminhamento relative flex flex-col print:shadow-none print:p-0 print:min-h-0">
                        {/* Cabeçalho */}
                        <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-sky-500 flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-2xl">send</span>
                                </div>
                                <div>
                                    <h2 className="font-black text-lg leading-tight text-sky-600">Meu Sistema Psi</h2>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Clínica de Psicologia Especializada</p>
                                    <p className="text-[9px] text-slate-400">Contato: {user.telefone || '(11) 4002-8922'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="text-lg font-black uppercase tracking-wider text-slate-800">Encaminhamento<br />Profissional</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Documento: {formatDisplayId(dados.documentoId, 'ENC')}</p>
                                {dados.urgencia !== 'Normal' && (
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black ${urgenciaConfig[dados.urgencia]}`}>
                                        {dados.urgencia === 'Urgente' ? '⚠ URGENTE' : dados.urgencia === 'Alta' ? '! PRIORIDADE ALTA' : dados.urgencia}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Dados do Paciente */}
                        <div className="bg-slate-50 rounded-lg p-5 mb-8 border border-slate-100">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Dados do Paciente</h4>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Paciente</p>
                                    <p className="text-sm font-black text-slate-900">{dados.pacienteNome || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">CPF</p>
                                    <p className="text-sm font-bold text-slate-700">{dados.pacienteCpf || '___.___.___-__'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Data de Nascimento</p>
                                    <p className="text-sm font-bold text-slate-700">{dados.pacienteDataNascimento || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Data do Encaminhamento</p>
                                    <p className="text-sm font-bold text-slate-700">{hojeExtenso}</p>
                                </div>
                            </div>
                        </div>

                        {/* Destino */}
                        <div className="bg-sky-50 rounded-lg p-5 mb-8 border border-sky-100">
                            <h4 className="text-[9px] font-black text-sky-600 uppercase tracking-widest mb-3">Encaminhamento Destinado a</h4>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Especialidade</p>
                                    <p className="text-sm font-black text-sky-700">{dados.especialidadeDestino}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Profissional / Clínica</p>
                                    <p className="text-sm font-bold text-slate-700">{dados.profissionalDestino || dados.clinicaDestino || 'A definir'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Título */}
                        <h3 className="text-2xl font-black tracking-[0.15em] uppercase text-center mb-10">Encaminhamento</h3>

                        {/* Corpo */}
                        <div className="text-[14px] leading-[2.2] text-justify space-y-6 flex-1">
                            <p>
                                Prezado(a) colega,
                            </p>
                            <p>
                                Encaminho a Vossa Senhoria o(a) paciente <span className="font-black">{dados.pacienteNome || '________________________________'}</span>
                                {dados.pacienteCpf && <>, CPF <span className="font-black">{dados.pacienteCpf}</span></>}
                                , que se encontra em acompanhamento psicológico nesta clínica, para avaliação e conduta em <span className="font-black">{dados.especialidadeDestino}</span>.
                            </p>

                            {/* Motivo */}
                            <div className="my-4 print:my-4 print-section">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-5 rounded-full bg-sky-500 print:hidden"></div>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-900 print:text-[12pt] print:text-sky-700 border-b border-transparent print:border-slate-200 print:pb-1">Motivo do Encaminhamento</p>
                                </div>
                                <textarea
                                    value={dados.motivo}
                                    onChange={e => handleChange('motivo', e.target.value)}
                                    className="w-full text-[14px] leading-[2] text-slate-700 bg-transparent border-none outline-none resize-none min-h-[80px] focus:bg-sky-50/40 rounded-lg p-3 transition-colors print:hidden"
                                    placeholder="Descreva o motivo principal do encaminhamento. Ex: Paciente apresenta sintomatologia sugestiva de transtorno de ansiedade generalizada, necessitando de avaliação psiquiátrica para possível intervenção medicamentosa complementar ao tratamento psicoterápico."
                                    readOnly={isFinalizado}
                                />
                                <div className="hidden print:block text-[14px] leading-[2.2] text-slate-800 whitespace-pre-wrap text-justify">
                                    {dados.motivo || 'Não informado.'}
                                </div>
                            </div>

                            {/* Resumo Clínico */}
                            <div className="my-4 print:my-4 print-section">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-5 rounded-full bg-sky-500 print:hidden"></div>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-900 print:text-[12pt] print:text-sky-700 border-b border-transparent print:border-slate-200 print:pb-1">Resumo Clínico</p>
                                </div>
                                <textarea
                                    value={dados.resumoClinico}
                                    onChange={e => handleChange('resumoClinico', e.target.value)}
                                    className="w-full text-[14px] leading-[2] text-slate-700 bg-transparent border-none outline-none resize-none min-h-[80px] focus:bg-sky-50/40 rounded-lg p-3 transition-colors print:hidden"
                                    placeholder="Breve resumo clínico relevante para o profissional de destino. Ex: Paciente em acompanhamento há 6 meses, com queixa de insônia, irritabilidade e episódios de pânico. Abordagem cognitivo-comportamental em andamento com evolução parcial."
                                    readOnly={isFinalizado}
                                />
                                <div className="hidden print:block text-[14px] leading-[2.2] text-slate-800 whitespace-pre-wrap text-justify">
                                    {dados.resumoClinico || 'Não informado.'}
                                </div>
                            </div>

                            {/* Objetivo */}
                            <div className="my-4 print:my-4 print-section">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-5 rounded-full bg-sky-500 print:hidden"></div>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-900 print:text-[12pt] print:text-sky-700 border-b border-transparent print:border-slate-200 print:pb-1">Objetivo do Encaminhamento</p>
                                </div>
                                <textarea
                                    value={dados.objetivoEncaminhamento}
                                    onChange={e => handleChange('objetivoEncaminhamento', e.target.value)}
                                    className="w-full text-[14px] leading-[2] text-slate-700 bg-transparent border-none outline-none resize-none min-h-[60px] focus:bg-sky-50/40 rounded-lg p-3 transition-colors print:hidden"
                                    placeholder="O que se espera do profissional de destino. Ex: Avaliação diagnóstica e conduta farmacológica, se necessário, para manejo da sintomatologia ansiosa."
                                    readOnly={isFinalizado}
                                />
                                <div className="hidden print:block text-[14px] leading-[2.2] text-slate-800 whitespace-pre-wrap text-justify">
                                    {dados.objetivoEncaminhamento || 'Não informado.'}
                                </div>
                            </div>

                            {dados.observacoes && (
                                <p className="italic text-slate-500">
                                    <span className="font-bold not-italic text-slate-700">Observações:</span> {dados.observacoes}
                                </p>
                            )}

                            <p className="mt-4">
                                Coloco-me à disposição para quaisquer informações complementares que se façam necessárias.
                            </p>
                            <p>Atenciosamente,</p>
                        </div>

                        {/* Local e Data */}
                        <p className="text-sm text-right mt-8 mb-16">
                            Paraná, {hojeExtenso}
                        </p>

                        {/* Assinatura */}
                        <div className="flex flex-col items-center">
                            <div className="w-80 border-t-2 border-slate-800 pt-4 text-center">
                                <div className="flex items-center justify-center gap-3 mb-1">
                                    <div className="size-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg">
                                        {user.nome?.charAt(user.nome.startsWith('Dr.') ? 4 : 0) || 'P'}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-sm text-slate-900">{user.nome}</p>
                                        <p className="text-xs text-slate-500">{user.especialidade} — CRP {user.crp}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-sky-600 font-bold mt-2">Assinado digitalmente via Meu Sistema Psi</p>
                            </div>
                        </div>

                        {/* Rodapé */}
                        <div className="mt-10 pt-4 border-t border-slate-100 text-center">
                            <p className="text-[8px] text-slate-400 leading-relaxed">
                                Documento sigiloso, protegido pelo sigilo profissional (Código de Ética do Psicólogo — Resolução CFP nº 010/2005).
                                <br />Encaminhamento emitido conforme a Lei nº 4.119/62 e Resolução CFP nº 06/2019.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Painel Lateral */}
                <div className="space-y-6 print:hidden">
                    {/* Paciente */}
                    {!isFinalizado && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">
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
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                    autoComplete="off"
                                    autoFocus={showDropdown}
                                />
                                {showDropdown && (
                                    <div ref={dropdownRef} className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                        {pacientesFiltrados.length > 0 ? (
                                            pacientesFiltrados.map(p => (
                                                <button key={formatDisplayId(p.id, 'PAC')} onClick={() => handleSelecionarPaciente(p)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors">
                                                    <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${p.cor || 'bg-primary/10 text-primary'}`}>{p.iniciais}</div>
                                                    <div>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{p.nome}</span>
                                                        <p className="text-[10px] text-slate-400">{p.id}</p>
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
                                <div className="mt-3 flex items-center gap-2 p-2.5 bg-sky-50 rounded-xl border border-sky-200">
                                    <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${dados.pacienteCor || 'bg-primary/10 text-primary'}`}>{dados.pacienteIniciais}</div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{dados.pacienteNome}</p>
                                        <p className="text-[10px] text-slate-400">{formatDisplayId(dados.pacienteId, 'PAC')}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-sky-500 text-sm">check_circle</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dados do Encaminhamento */}
                    {!isFinalizado && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Dados do Encaminhamento</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Especialidade Destino</label>
                                    <select
                                        value={dados.especialidadeDestino}
                                        onChange={e => handleChange('especialidadeDestino', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                    >
                                        {especialidadesDestino.map(e => (
                                            <option key={e} value={e}>{e}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Profissional Destino (opcional)</label>
                                    <input
                                        type="text"
                                        value={dados.profissionalDestino}
                                        onChange={e => handleChange('profissionalDestino', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                        placeholder="Nome do profissional"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Clínica / Instituição (opcional)</label>
                                    <input
                                        type="text"
                                        value={dados.clinicaDestino}
                                        onChange={e => handleChange('clinicaDestino', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                        placeholder="Nome da clínica ou instituição"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Urgência</label>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {['Baixa', 'Normal', 'Alta', 'Urgente'].map(u => (
                                            <button
                                                key={u}
                                                onClick={() => handleChange('urgencia', u)}
                                                className={`py-2 rounded-lg text-[10px] font-black transition-all border ${dados.urgencia === u
                                                    ? urgenciaConfig[u] + ' border-current shadow-sm'
                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent hover:border-slate-200'
                                                    }`}
                                            >{u}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Observações (opcional)</label>
                                    <textarea
                                        value={dados.observacoes}
                                        onChange={e => handleChange('observacoes', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none resize-none min-h-[60px] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                        placeholder="Observações adicionais..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ações */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sky-500">bolt</span> Ações
                        </h4>
                        <div className="space-y-3">
                            {!isFinalizado ? (
                                <>
                                    <button onClick={() => handleSalvar(dados.status)} disabled={salvando} className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                                        {salvando ? <><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : <><span className="material-symbols-outlined text-sm">save</span> Salvar Rascunho</>}
                                    </button>
                                    <button onClick={() => handleSalvar('Finalizado')} disabled={salvando} className="w-full py-3.5 bg-sky-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-200/50 hover:scale-[1.02] transition-all disabled:opacity-50">
                                        <span className="material-symbols-outlined text-sm">verified</span> Finalizar e Assinar
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="size-14 mx-auto bg-sky-100 rounded-full flex items-center justify-center mb-3">
                                        <span className="material-symbols-outlined text-3xl text-sky-600">task_alt</span>
                                    </div>
                                    <p className="text-sm font-black text-sky-700">Documento {dados.status}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Este documento está bloqueado para edição direta.</p>
                                    <button
                                        onClick={() => { setDados(prev => ({ ...prev, status: 'Rascunho' })); if (encId) updateEncaminhamento(encId, { status: 'Rascunho', profissionalNome: user.nome }); showToast('Encaminhamento reaberto.', 'info'); }}
                                        className="mt-3 text-xs font-bold text-primary hover:underline"
                                    >Reabrir para Edição</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Histórico */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sky-500">history</span> Histórico
                        </h4>
                        {historico.length > 0 ? (
                            <div className="relative">
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                                <div className="space-y-4">
                                    {historico.slice().reverse().map((h, i) => (
                                        <div key={i} className="flex items-start gap-3 relative">
                                            <div className={`size-4 rounded-full flex-shrink-0 mt-0.5 z-10 ${i === 0 ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{h.acao}</p>
                                                <p className="text-[10px] text-slate-400">{h.usuario}</p>
                                                <p className="text-[10px] text-sky-600 font-bold">{formatDateTime(h.data)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-4">Salve para iniciar o rastreamento.</p>
                        )}
                    </div>

                    {/* Datas */}
                    {(criadoEm || atualizadoEm) && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Datas</h4>
                            <div className="space-y-3">
                                {criadoEm && (
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400 text-sm">calendar_today</span>
                                        <div>
                                            <p className="text-[10px] text-slate-400">Criado em</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-white">{formatDateTime(criadoEm)}</p>
                                        </div>
                                    </div>
                                )}
                                {atualizadoEm && (
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400 text-sm">update</span>
                                        <div>
                                            <p className="text-[10px] text-slate-400">Última edição</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-white">{formatDateTime(atualizadoEm)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { margin: 1cm; size: A4 portrait; }
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    
                    /* Desativar o Grid para evitar problemas de largura no Chrome Print */
                    .grid { display: block !important; }
                    .gap-8 { gap: 0 !important; }
                    
                    /* Ocupar a folha inteira na impressão, margens vêm do @page */
                    .max-w-7xl { max-width: none !important; margin: 0 !important; width: 100% !important; display: block !important; }
                    
                    .documento-encaminhamento { 
                        width: auto !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                        min-height: 0 !important;
                    }

                    .print-section {
                        page-break-inside: avoid !important;
                    }
                    * { color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
                }
                .documento-encaminhamento {
                    width: 100%;
                    max-width: 794px; /* A4 width */
                    margin: 0 auto;
                }
            `}} />
        </div>
    );
};

export default EncaminhamentoProfissional;


