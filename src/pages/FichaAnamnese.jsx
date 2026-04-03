import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAnamneses } from '../contexts/AnamneseContext';
import { usePatients } from '../contexts/PatientContext';
import { useModels } from '../contexts/ModelContext';
import { useUser } from '../contexts/UserContext';
import { showToast } from '../components/Toast';
import { exportToPDF, exportToWord } from '../utils/exportUtils';

const secoes = [
    {
        id: 'queixaPrincipal',
        titulo: '1. Queixa Principal',
        placeholder: 'Descreva o motivo do encaminhamento ou a queixa trazida pelo paciente. Ex: O paciente relata sentir ansiedade intensa, dificuldade de concentração e insônia há aproximadamente 3 meses...',
        icon: 'chat_bubble'
    },
    {
        id: 'historicoPessoal',
        titulo: '2. Histórico Pessoal',
        placeholder: 'Informe dados relevantes da história de vida do paciente: nascimento, desenvolvimento, marcos importantes, escolaridade, relacionamentos afetivos, eventos significativos...',
        icon: 'person'
    },
    {
        id: 'historicoFamiliar',
        titulo: '3. Histórico Familiar',
        placeholder: 'Descreva a composição e dinâmica familiar, relações parentais, antecedentes psiquiátricos/psicológicos na família, eventos familiares relevantes...',
        icon: 'family_restroom'
    },
    {
        id: 'historicoMedico',
        titulo: '4. Histórico Médico',
        placeholder: 'Registre doenças prévias e atuais, cirurgias, internações, alergias, uso de medicamentos atuais e anteriores, acompanhamento com outros profissionais...',
        icon: 'medical_services'
    },
    {
        id: 'historicoSocial',
        titulo: '5. Vida Social e Ocupacional',
        placeholder: 'Descreva rede de apoio social, atividades de lazer, vida profissional/acadêmica, rotina, uso de substâncias (álcool, tabaco, drogas), prática de atividade física...',
        icon: 'groups'
    },
    {
        id: 'sintomasAtuais',
        titulo: '6. Sintomas Atuais',
        placeholder: 'Liste os sintomas presentes: humor, sono, apetite, energia, concentração, pensamentos recorrentes, comportamentos, queixas somáticas, ideação suicida (se aplicável)...',
        icon: 'psychology_alt'
    },
    {
        id: 'tratamentosAnteriores',
        titulo: '7. Tratamentos Anteriores',
        placeholder: 'Registre tratamentos psicológicos ou psiquiátricos anteriores, medicações utilizadas, internações, resultados obtidos...',
        icon: 'history'
    },
    {
        id: 'observacoesClinicas',
        titulo: '8. Observações Clínicas',
        placeholder: 'Registre suas observações clínicas sobre o paciente durante a entrevista: aparência, comportamento, linguagem, afeto, orientação, pensamento, percepção, juízo crítico...',
        icon: 'edit_note'
    },
    {
        id: 'planoTerapeutico',
        titulo: '9. Plano Terapêutico Inicial',
        placeholder: 'Descreva as hipóteses diagnósticas iniciais, objetivos terapêuticos, abordagem proposta, frequência sugerida de sessões, encaminhamentos necessários...',
        icon: 'assignment'
    }
];

const FichaAnamnese = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addAnamnese, updateAnamnese, getAnamneseById } = useAnamneses();
    const { patients } = usePatients();
    const { models } = useModels();
    const { user } = useUser();

    const isNovo = id === 'novo';
    const existente = !isNovo ? getAnamneseById(id) : null;

    const [salvando, setSalvando] = useState(false);
    const [pacienteBusca, setPacienteBusca] = useState('');
    const [showDropdown, setShowDropdown] = useState(() => {
        const hasPaciente = location.state?.pacienteId || location.state?.documentoReferencia?.pacienteId || location.state?.pacienteObjeto;
        return isNovo && !hasPaciente;
    });
    const [fichaId, setFichaId] = useState(existente?.id || null);
    const [secaoAberta, setSecaoAberta] = useState('queixaPrincipal');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const documentoRef = useRef(null);

    const camposIniciais = {};
    secoes.forEach(s => { camposIniciais[s.id] = ''; });

    const [dados, setDados] = useState({
        pacienteId: '',
        pacienteNome: '',
        pacienteIniciais: '',
        pacienteCor: '',
        pacienteIdade: '',
        pacienteEstadoCivil: '',
        pacienteProfissao: '',
        pacienteEscolaridade: '',
        ...camposIniciais,
        pacienteCpf: '',
        status: 'Rascunho',
        documentoId: '',
        profissionalNome: user.nome,
        profissionalCrp: user.crp,
        profissionalEspecialidade: user.especialidade,
    });

    useEffect(() => {
        const calcularIdadeLocal = (dataNasc) => {
            if (!dataNasc) return '';
            const hoje = new Date();
            const nasc = new Date(dataNasc);
            let idade = hoje.getFullYear() - nasc.getFullYear();
            const m = hoje.getMonth() - nasc.getMonth();
            if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
                idade--;
            }
            return idade.toString();
        };

        if (existente) {
            const restored = { ...dados };
            Object.keys(existente).forEach(k => {
                if (k in restored || secoes.find(s => s.id === k)) {
                    restored[k] = existente[k] || restored[k];
                }
            });

            restored.status = existente.status || 'Rascunho';
            restored.documentoId = existente.documentoId || '';
            restored.profissionalNome = existente.profissionalNome || user.nome,
            restored.profissionalCrp = existente.profissionalCrp || user.crp,
            restored.profissionalEspecialidade = existente.profissionalEspecialidade || user.especialidade,
            setDados(restored);
            setPacienteBusca(existente.pacienteNome || '');
            setFichaId(existente.id);
        } else if (isNovo && location.state) {
            const { modelo, pacienteId, documentoReferencia } = location.state;
            
            if (documentoReferencia) {
                const restored = { ...dados };
                Object.keys(documentoReferencia).forEach(k => {
                    if (k in restored || secoes.find(s => s.id === k)) {
                        restored[k] = documentoReferencia[k] || restored[k];
                    }
                });
                restored.status = documentoReferencia.status || 'Rascunho';
                restored.documentoId = documentoReferencia.documentoId || documentoReferencia.id || '';
                setDados(restored);
                setPacienteBusca(documentoReferencia.pacienteNome || documentoReferencia.paciente || '');
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
                setDados(prev => ({
                    ...prev,
                    queixaPrincipal: modelo.conteudo || ''
                }));
            } else if (location.state?.categoria) {
                const modeloPadrao = (models || []).find(m => m.categoria === location.state.categoria);
                if (modeloPadrao) {
                    setDados(prev => ({
                        ...prev,
                        queixaPrincipal: modeloPadrao.conteudo || '',
                    }));
                }
            }
        }
    }, [existente, user, isNovo, location.state, models]);

    // Sincronização Automática com o Cadastro do Paciente
    useEffect(() => {
        if (!dados.pacienteId || !patients.length) return;

        const calcularIdadeLocal = (dataNasc) => {
            if (!dataNasc) return '';
            const hoje = new Date();
            const nasc = new Date(dataNasc);
            let idade = Math.max(0, hoje.getFullYear() - nasc.getFullYear());
            const m = hoje.getMonth() - nasc.getMonth();
            if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
                idade--;
            }
            return Math.max(0, idade).toString();
        };

        const normalize = (id) => id?.toString().replace('#', '');
        const p = patients.find(p => normalize(p.id) === normalize(dados.pacienteId));

        if (p) {
            const cpfVazio = !dados.pacienteCpf || dados.pacienteCpf === '___.___.____-__';
            const dataVazia = !dados.pacienteDataNascimento || dados.pacienteDataNascimento === '—' || !dados.pacienteDataNascimento;
            const idadeVazia = !dados.pacienteIdade || dados.pacienteIdade === '--' || dados.pacienteIdade === '';
            
            if ((cpfVazio && p.cpf) || (dataVazia && (p.dataNascimento || p.nascimento)) || (idadeVazia && (p.dataNascimento || p.nascimento))) {
                setDados(prev => {
                    const novaData = (dataVazia && (p.dataNascimento || p.nascimento)) ? (p.dataNascimento || p.nascimento) : prev.pacienteDataNascimento;
                    return {
                        ...prev,
                        pacienteCpf: (cpfVazio && p.cpf) ? p.cpf : prev.pacienteCpf,
                        pacienteDataNascimento: novaData,
                        pacienteIdade: (idadeVazia && novaData) ? calcularIdadeLocal(novaData) : prev.pacienteIdade,
                        pacienteEstadoCivil: !prev.pacienteEstadoCivil ? (p.estadoCivil || '') : prev.pacienteEstadoCivil,
                        pacienteProfissao: !prev.pacienteProfissao ? (p.profissao || p.ocupacao || '') : prev.pacienteProfissao,
                        pacienteEscolaridade: !prev.pacienteEscolaridade ? (p.escolaridade || '') : prev.pacienteEscolaridade,
                    };
                });
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
        const calcularIdade = (dataNasc) => {
            if (!dataNasc) return '';
            const hoje = new Date();
            const nasc = new Date(dataNasc);
            let idade = hoje.getFullYear() - nasc.getFullYear();
            const m = hoje.getMonth() - nasc.getMonth();
            if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
                idade--;
            }
            return idade.toString();
        };

        setDados(prev => ({
            ...prev,
            pacienteId: p.id,
            pacienteNome: p.nome,
            pacienteIniciais: p.iniciais,
            pacienteCor: p.cor,
            pacienteCpf: p.cpf || '',
            pacienteDataNascimento: p.dataNascimento || p.nascimento || '',
            pacienteIdade: p.idade || calcularIdade(p.dataNascimento || p.nascimento),
            pacienteEstadoCivil: p.estadoCivil || '',
            pacienteProfissao: p.profissao || p.ocupacao || '',
            pacienteEscolaridade: p.escolaridade || '',
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
            if (fichaId) {
                updateAnamnese(fichaId, dadosSalvar);
                showToast(novoStatus === 'Finalizado' ? 'Anamnese finalizada! ✅' : 'Anamnese salva!', 'success');
            } else {
                const nova = addAnamnese(dadosSalvar);
                setFichaId(nova.id);
                setDados(prev => ({ ...prev, documentoId: nova.documentoId, status: nova.status }));
                showToast('Anamnese criada com sucesso!', 'success');
            }
            setSalvando(false);
        }, 600);
    };

    const handlePrint = () => window.print();

    const handleExportPDF = async () => {
        if (!documentoRef.current) return;
        try {
            const filename = `anamnese_${dados.pacienteNome.replace(/\s+/g, '_').toLowerCase()}_${dados.documentoId || 'novo'}.pdf`;
            await exportToPDF(documentoRef.current, filename);
            showToast('PDF gerado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro na exportação PDF:', error);
            showToast(`Erro técnico: ${error.message}. Use a opção "Imprimir" → "Salvar como PDF".`, 'warning');
        }
    };

    const handleExportWord = async () => {
        try {
            const dataForWord = {
                titulo: 'Ficha de Anamnese Psicológica',
                subtitulo: `Documento ID: #${dados.documentoId || 'Novo'}`,
                paciente: {
                    nome: dados.pacienteNome,
                    cpf: dados.pacienteCpf,
                    nascimento: dados.pacienteNascimento ? new Date(dados.pacienteNascimento).toLocaleDateString('pt-BR') : '—'
                },
                dataEmissao: new Date().toLocaleDateString('pt-BR'),
                secoes: secoes.map(s => ({
                    titulo: s.titulo,
                    conteudo: dados[s.id] || 'Não informado.'
                })),
                profissional: {
                    nome: user.nome,
                    crp: user.crp,
                    especialidade: user.especialidade
                }
            };
            
            const filename = `anamnese_${dados.pacienteNome.replace(/\s+/g, '_').toLowerCase()}_${dados.documentoId || 'novo'}.docx`;
            await exportToWord(dataForWord, filename);
            showToast('Word gerado com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao gerar Word.', 'error');
        }
    };
    const handleWhatsApp = () => {
        const texto = `Olá ${dados.pacienteNome}, sua ficha de anamnese (${dados.documentoId || 'novo'}) foi registrada. Para mais informações, entre em contato com a clínica.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    };

    const statusConfig = {
        'Rascunho': { cor: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
        'Finalizado': { cor: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
        'Assinado': { cor: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
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

    const preenchimento = secoes.filter(s => dados[s.id] && dados[s.id].trim().length > 0).length;
    const progresso = Math.round((preenchimento / secoes.length) * 100);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-20">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors mb-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                        {isNovo && !fichaId ? 'Nova Ficha de Anamnese' : 'Ficha de Anamnese'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isNovo && !fichaId
                            ? 'Preencha a ficha de anamnese do paciente de forma completa e detalhada.'
                            : `Documento ${dados.documentoId || ''} · ${dados.pacienteNome}`}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
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
                {/* Formulário (2 cols) */}
                <div className="lg:col-span-2 print:col-span-3 space-y-0" ref={documentoRef} id="documento-anamnese">
                    {/* Cabeçalho do documento */}
                    <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-t-2xl border border-slate-200 dark:border-slate-800 border-b-0 print:border-none print:px-12 print:pt-12 print:pb-6 relative overflow-hidden">
                        {/* Faixa decorativa no topo apenas para PDF */}
                        <div className="hidden print:block absolute top-0 left-0 right-0 h-2 bg-amber-500"></div>

                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-5">
                                <div className="size-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                    <span className="material-symbols-outlined text-3xl">assignment</span>
                                </div>
                                <div>
                                    <h2 className="font-black text-2xl leading-none text-slate-900 dark:text-white print:text-slate-900">Meu Sistema PSI</h2>
                                    <p className="text-[10px] text-amber-600 font-black uppercase tracking-[0.2em] mt-2">Ficha de Anamnese Psicológica</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="inline-block px-3 py-1 bg-slate-100 rounded-md mb-2">
                                    <p className="text-[10px] font-black text-slate-500 uppercase">Doc #{dados.documentoId || 'Novo'}</p>
                                </div>
                                <p className="text-xs font-bold text-slate-400">{new Date().toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>

                        {/* Dados do Paciente (Estilo Premium Card) */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 print:bg-slate-50 print:border-slate-200">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-200/50 pb-3">
                                <span className="material-symbols-outlined text-amber-500 text-lg">person</span>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação do Paciente</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="col-span-2">
                                    <p className="text-[9px] font-bold text-amber-600 uppercase mb-1">Nome Completo</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white print:text-slate-900">{dados.pacienteNome || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-amber-600 uppercase mb-1">Idade/Nascimento</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 print:text-slate-700">
                                        {dados.pacienteIdade ? `${dados.pacienteIdade} anos` : '—'}
                                        <span className="block text-[10px] font-medium text-slate-400 mt-0.5">{dados.pacienteDataNascimento || ''}</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-amber-600 uppercase mb-1">CPF</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 print:text-slate-700">{dados.pacienteCpf || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-amber-600 uppercase mb-1">Estado Civil</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 print:text-slate-700">{dados.pacienteEstadoCivil || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-amber-600 uppercase mb-1">Profissão/Ocupação</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 print:text-slate-700">{dados.pacienteProfissao || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seções da Anamnese */}
                    {secoes.map((secao, idx) => (
                        <div
                            key={secao.id}
                            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-t-0 ${idx === secoes.length - 1 ? 'rounded-b-2xl' : ''} transition-all`}
                        >
                            <button
                                onClick={() => setSecaoAberta(secaoAberta === secao.id ? null : secao.id)}
                                className="w-full flex items-center justify-between px-5 md:px-8 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`size-8 rounded-lg flex items-center justify-center ${dados[secao.id]?.trim() ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <span className="material-symbols-outlined text-sm">{secao.icon}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{secao.titulo}</span>
                                    {dados[secao.id]?.trim() && (
                                        <span className="material-symbols-outlined text-amber-500 text-sm">check_circle</span>
                                    )}
                                </div>
                                <span className={`material-symbols-outlined text-slate-400 transition-transform print:hidden ${secaoAberta === secao.id ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>
                            {secaoAberta === secao.id && (
                                <div className="px-5 md:px-8 pb-6 print:hidden">
                                    <textarea
                                        value={dados[secao.id]}
                                        onChange={e => handleChange(secao.id, e.target.value)}
                                        className="w-full text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none resize-none min-h-[140px] p-4 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                        placeholder={secao.placeholder}
                                        readOnly={isFinalizado}
                                    />
                                </div>
                            )}

                            {/* Versão de Impressão (sempre visível no PDF) */}
                            <div className="hidden print:block print-section px-10 py-6 bg-white border-b border-slate-100 last:border-0" style={{ pageBreakInside: 'avoid' }}>
                                <h3 className="text-[12pt] font-black text-amber-600 mb-3 uppercase tracking-widest flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[14pt]" style={{ fontVariant: 'ligatures' }}>{secao.icon}</span>
                                    {secao.titulo}
                                </h3>
                                <div className="text-[10.5pt] leading-relaxed text-slate-800 whitespace-pre-wrap text-justify">
                                    {dados[secao.id] || 'Não informado.'}
                                </div>
                            </div>
                        </div>
                    ))}
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
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                    autoComplete="off"
                                    autoFocus={showDropdown}
                                />
                                {showDropdown && (
                                    <div ref={dropdownRef} className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                        {pacientesFiltrados.length > 0 ? (
                                            pacientesFiltrados.map(p => (
                                                <button key={p.id} onClick={() => handleSelecionarPaciente(p)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors">
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
                                <div className="mt-3 flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                                    <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${dados.pacienteCor || 'bg-primary/10 text-primary'}`}>{dados.pacienteIniciais}</div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{dados.pacienteNome}</p>
                                        <p className="text-[10px] text-slate-400">{dados.pacienteId}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-amber-500 text-sm">check_circle</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Progresso */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">bar_chart</span> Progresso
                        </h4>
                        <div className="mb-3">
                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                <span>{preenchimento} de {secoes.length} seções</span>
                                <span>{progresso}%</span>
                            </div>
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${progresso}%` }}></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 mt-4">
                            {secoes.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSecaoAberta(s.id)}
                                    className={`p-2 rounded-lg text-center transition-all ${dados[s.id]?.trim()
                                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                        : secaoAberta === s.id
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-transparent hover:border-slate-200'
                                        }`}
                                    title={s.titulo}
                                >
                                    <span className="material-symbols-outlined text-sm">{s.icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ações */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">bolt</span> Ações
                        </h4>
                        <div className="space-y-3">
                            {!isFinalizado ? (
                                <>
                                    <button onClick={() => handleSalvar(dados.status)} disabled={salvando} className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                                        {salvando ? <><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : <><span className="material-symbols-outlined text-sm">save</span> Salvar Rascunho</>}
                                    </button>
                                    <button onClick={() => handleSalvar('Finalizado')} disabled={salvando} className="w-full py-3.5 bg-amber-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-200/50 hover:scale-[1.02] transition-all disabled:opacity-50">
                                        <span className="material-symbols-outlined text-sm">verified</span> Finalizar Anamnese
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="size-14 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-3">
                                        <span className="material-symbols-outlined text-3xl text-amber-600">task_alt</span>
                                    </div>
                                    <p className="text-sm font-black text-amber-700">Documento {dados.status}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Este documento está bloqueado para edição direta.</p>
                                    <button
                                        onClick={() => { setDados(prev => ({ ...prev, status: 'Rascunho' })); if (fichaId) updateAnamnese(fichaId, { status: 'Rascunho', profissionalNome: user.nome }); showToast('Anamnese reaberta.', 'info'); }}
                                        className="mt-3 text-xs font-bold text-primary hover:underline"
                                    >Reabrir para Edição</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Histórico */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">history</span> Histórico
                        </h4>
                        {historico.length > 0 ? (
                            <div className="relative">
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                                <div className="space-y-4">
                                    {historico.slice().reverse().map((h, i) => (
                                        <div key={i} className="flex items-start gap-3 relative">
                                            <div className={`size-4 rounded-full flex-shrink-0 mt-0.5 z-10 ${i === 0 ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{h.acao}</p>
                                                <p className="text-[10px] text-slate-400">{h.usuario}</p>
                                                <p className="text-[10px] text-amber-600 font-bold">{formatDateTime(h.data)}</p>
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

            {/* Rodapé de Assinatura exclusivo para Print */}
            <div className="hidden print:block mt-20 pt-10 border-t border-slate-300 text-center max-w-sm mx-auto">
                <p className="text-sm font-bold text-slate-900 mb-1">{dados.profissionalNome || user.nome}</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-black">Psicólogo(a) Clínico(a) • CRP {dados.profissionalCrp || user.crp || '---'}</p>
                <div className="mt-8 text-[9px] text-slate-400">Gerado em {new Date().toLocaleDateString('pt-BR')} • Meu Sistema PSI</div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { margin: 0; size: A4; }
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    
                    #documento-anamnese { 
                        width: 794px !important; 
                        margin: 0 auto !important;
                        padding: 0 !important;
                        background: white !important;
                        display: block !important;
                        text-rendering: optimizeLegibility;
                        -webkit-font-smoothing: antialiased;
                    }

                    .print-section {
                        page-break-inside: avoid !important;
                        border-bottom: 2px solid #f8fafc !important;
                        padding: 30px 50px !important;
                    }

                    .material-symbols-outlined {
                        font-family: 'Material Symbols Outlined' !important;
                        font-style: normal !important;
                        display: inline-block !important;
                        line-height: 1 !important;
                        text-transform: none !important;
                        letter-spacing: normal !important;
                        word-wrap: normal !important;
                        white-space: nowrap !important;
                        direction: ltr !important;
                    }

                    h1, h2, h3, p, span, div {
                        font-family: 'Inter', system-ui, sans-serif !important;
                    }
                }
            `}} />
        </div>
    );
};

export default FichaAnamnese;


