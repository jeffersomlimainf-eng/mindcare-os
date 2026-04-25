import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLaudos } from '../contexts/LaudoContext';
import { usePatients } from '../contexts/PatientContext';
import { useModels } from '../contexts/ModelContext';
import { useUser } from '../contexts/UserContext';
import { showToast } from '../components/Toast';

import { formatDisplayId, formatFileId } from '../utils/formatId';

import { logger } from '../utils/logger';
import { laudoSchema } from '../schemas/documentSchema';

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

    // States
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

    // Carregar laudo existente ou inicializar novo
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
                setDados(prev => ({
                    ...prev,
                    analiseConclusao: modelo.conteudo || '',
                }));
            } else if (location.state?.categoria) {
                const modeloPadrao = (models || []).find(m => m.categoria === location.state.categoria);
                if (modeloPadrao) {
                    setDados(prev => ({
                        ...prev,
                        analiseConclusao: modeloPadrao.conteudo || '',
                    }));
                }
            }
        }
    }, [laudoExistente, user, isNovo, location.state, models]);

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

    const handleChange = (campo, valor) => {
        setDados(prev => ({ ...prev, [campo]: valor }));
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

        // Validação robusta com Zod
        if (novoStatus === 'Finalizado' || novoStatus === 'Em Revisão') {
            const validation = laudoSchema.safeParse(dadosSalvar);
            if (!validation.success) {
                const erro = validation.error.errors[0].message;
                showToast(erro, 'warning');
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
                showToast(novoStatus === 'Finalizado' ? 'Laudo finalizado com sucesso! ✅' : 'Laudo salvo com sucesso!', 'success');
            } else {
                const novo = addLaudo(dadosSalvar);
                setLaudoId(novo.id);
                setDados(prev => ({ ...prev, documentoId: novo.documentoId, status: novo.status }));
                showToast('Laudo criado com sucesso!', 'success');
            }
            setSalvando(false);
        }, 600);
    };

    const handlePrint = () => { window.print(); };

    const handleExportPDF = async () => {
        if (!documentoRef.current) return;
        try {
            const { exportToPDF } = await import('../utils/exportUtils');
            const filename = `laudo_${dados.pacienteNome.replace(/\s+/g, '_').toLowerCase()}_${formatFileId(dados.documentoId)}.pdf`;
            await exportToPDF(documentoRef.current, filename);
            showToast('PDF gerado com sucesso!', 'success');
        } catch (error) {
            logger.error('Erro na exportação PDF:', error);
            showToast('Conflito de cores no navegador. Use a opção "Imprimir" → "Salvar como PDF".', 'warning');
        }
    };

    const handleExportWord = async () => {
        try {
            const { exportToWord } = await import('../utils/exportUtils');
            const dataForWord = {
                titulo: 'Laudo Psicológico',
                subtitulo: `Documento: ${formatDisplayId(dados.documentoId, 'LAU')}`,
                paciente: {
                    nome: dados.pacienteNome,
                    cpf: dados.pacienteCpf,
                    nascimento: dados.pacienteNascimento ? new Date(dados.pacienteNascimento).toLocaleDateString('pt-BR') : '—'
                },
                dataEmissao: new Date().toLocaleDateString('pt-BR'),
                secoes: [
                    { titulo: 'I. Identificação', conteudo: dados.identificacao },
                    { titulo: 'II. Descrição da Demanda', conteudo: dados.demanda },
                    { titulo: 'III. Procedimento', conteudo: dados.procedimento },
                    { titulo: 'IV. Análise e Conclusão', conteudo: dados.analiseConclusao }
                ],
                profissional: {
                    nome: user.nome,
                    crp: user.crp,
                    especialidade: user.especialidade
                }
            };
            const filename = `laudo_${dados.pacienteNome.replace(/\s+/g, '_').toLowerCase()}_${formatFileId(dados.documentoId)}.docx`;
            await exportToWord(dataForWord, filename);
            showToast('Word gerado com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao gerar Word.', 'error');
        }
    };

    const handleWhatsApp = () => {
        const texto = `Olá ${dados.pacienteNome}, segue informação sobre o seu laudo psicológico (${formatDisplayId(dados.documentoId, 'LAU')}). Para mais detalhes, entre em contato com a clínica.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    };

    const statusConfig = {
        'Rascunho': { cor: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'edit_note', dot: 'bg-blue-500' },
        'Em Revisão': { cor: 'bg-amber-100 text-amber-700 border-amber-200', icon: 'rate_review', dot: 'bg-amber-500' },
        'Finalizado': { cor: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: 'verified', dot: 'bg-emerald-500' },
    };

    const statusAtual = statusConfig[dados.status] || statusConfig['Rascunho'];
    const isFinalizado = dados.status === 'Finalizado' || dados.status === 'Assinado';

    const historico = laudoExistente?.historico || [];
    const criadoEm = laudoExistente?.criadoEm;
    const atualizadoEm = laudoExistente?.atualizadoEm;

    const formatDate = (iso) => {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-20 print:bg-white print:p-0">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors mb-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                        {isNovo && !laudoId ? 'Novo Laudo Psicológico' : 'Visualização de Laudo'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isNovo && !laudoId
                            ? 'Crie um laudo conforme a Resolução CFP nº 06/2019.'
                            : `Documento ${formatDisplayId(dados.documentoId, 'LAU')} · ${dados.pacienteNome}`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
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
                {/* Documento A4 */}
                <div className="lg:col-span-2 print:col-span-3">
                    <div ref={documentoRef} className="bg-white text-slate-900 p-10 md:p-16 shadow-2xl rounded-sm min-h-[1100px] documento-laudo relative flex flex-col print:shadow-none print:p-0 print:min-h-0">
                        {/* Cabeçalho do Documento */}
                        <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-2xl">psychology</span>
                                </div>
                                <div>
                                    <h2 className="font-black text-lg leading-tight text-primary invisible">Meu Sistema Psi</h2>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 invisible">Clínica de Psicologia Especializada</p>
                                    <p className="text-[9px] text-slate-400">Contato: {user.telefone || '(41) 99999-9999'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="text-xl font-black uppercase tracking-wider text-slate-800">Laudo Psicológico</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Documento: {formatDisplayId(dados.documentoId, 'LAU')}</p>
                            </div>
                        </div>

                        {/* Dados do Paciente e Solicitante */}
                        <div className="bg-slate-50 rounded-lg p-5 mb-8 border border-slate-100">
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
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Solicitante</p>
                                    <input
                                        type="text"
                                        value={dados.solicitante}
                                        onChange={e => handleChange('solicitante', e.target.value)}
                                        className="text-sm font-bold text-slate-700 border-b border-dotted border-slate-300 focus:border-primary outline-none bg-transparent w-full print:hidden"
                                        placeholder="Ex: Dr. Marcos Rebouças (Neurologista)"
                                        readOnly={isFinalizado}
                                    />
                                    <div className="hidden print:block text-sm font-bold text-slate-700 pt-0.5 border-b border-transparent">
                                        {dados.solicitante || '—'}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Data de Emissão</p>
                                    <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Seção I - Identificação */}
                        <div className="mb-8 print:mb-6 print-section">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-6 rounded-full bg-primary print:hidden"></div>
                                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-3 print:mb-2 print:border-b print:pb-2 print:border-slate-200">I. Identificação</h4>
                            </div>
                            <textarea
                                value={dados.identificacao}
                                onChange={e => handleChange('identificacao', e.target.value)}
                                className="w-full text-[13px] leading-relaxed text-slate-700 bg-transparent border-none outline-none resize-none min-h-[80px] focus:bg-blue-50/30 rounded-lg p-3 transition-colors print:hidden"
                                placeholder={`O presente laudo refere-se ao processo de avaliação psicológica realizado com o(a) paciente ${dados.pacienteNome || '[Nome do Paciente]'}, visando a compreensão de demandas cognitivas e emocionais relatadas em consulta inicial.`}
                                readOnly={isFinalizado}
                            />
                            <div className="hidden print:block text-[10.5pt] leading-relaxed text-slate-800 whitespace-pre-wrap text-justify">
                                {dados.identificacao || 'Não informado.'}
                            </div>
                        </div>

                        {/* Seção II - Descrição da Demanda */}
                        <div className="mb-8 print:mb-6 print-section">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-6 rounded-full bg-primary print:hidden"></div>
                                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-3 print:mb-2 print:border-b print:pb-2 print:border-slate-200">II. Descrição da Demanda</h4>
                            </div>
                            <textarea
                                value={dados.demanda}
                                onChange={e => handleChange('demanda', e.target.value)}
                                className="w-full text-[13px] leading-relaxed text-slate-700 bg-transparent border-none outline-none resize-none min-h-[100px] focus:bg-blue-50/30 rounded-lg p-3 transition-colors print:hidden"
                                placeholder="Descreva o motivo do encaminhamento e a queixa principal do paciente."
                                readOnly={isFinalizado}
                            />
                            <div className="hidden print:block text-[10.5pt] leading-relaxed text-slate-800 whitespace-pre-wrap text-justify">
                                {dados.demanda || 'Não informado.'}
                            </div>
                        </div>

                        {/* Seção III - Procedimento */}
                        <div className="mb-8 print:mb-6 print-section">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-6 rounded-full bg-primary print:hidden"></div>
                                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-3 print:mb-2 print:border-b print:pb-2 print:border-slate-200">III. Procedimento</h4>
                            </div>
                            <textarea
                                value={dados.procedimento}
                                onChange={e => handleChange('procedimento', e.target.value)}
                                className="w-full text-[13px] leading-relaxed text-slate-700 bg-transparent border-none outline-none resize-none min-h-[100px] focus:bg-blue-50/30 rounded-lg p-3 transition-colors print:hidden"
                                placeholder="Liste os instrumentos e técnicas utilizados."
                                readOnly={isFinalizado}
                            />
                            <div className="hidden print:block text-[10.5pt] leading-relaxed text-slate-800 whitespace-pre-wrap text-justify">
                                {dados.procedimento || 'Não informado.'}
                            </div>
                        </div>

                        {/* Seção IV - Análise e Conclusão */}
                        <div className="mb-10 print:mb-6 print-section">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-6 rounded-full bg-primary print:hidden"></div>
                                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-3 print:mb-2 print:border-b print:pb-2 print:border-slate-200">IV. Análise e Conclusão</h4>
                            </div>
                            <textarea
                                value={dados.analiseConclusao}
                                onChange={e => handleChange('analiseConclusao', e.target.value)}
                                className="w-full text-[13px] leading-relaxed text-slate-700 bg-transparent border-none outline-none resize-none min-h-[120px] focus:bg-blue-50/30 rounded-lg p-3 transition-colors print:hidden"
                                placeholder="Apresente os resultados, diagnóstico (CID se aplicável) e recomendações clínicas."
                                readOnly={isFinalizado}
                            />
                            <div className="hidden print:block text-[10.5pt] leading-relaxed text-slate-800 whitespace-pre-wrap text-justify">
                                {dados.analiseConclusao || 'Não informado.'}
                            </div>
                        </div>

                        <div className="text-right mt-8 mb-4">
                            <p className="text-sm font-bold text-slate-700">Paraná, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>

                        {/* Assinatura do Profissional */}
                        <div className="mt-auto pt-10 border-t border-slate-100">
                            <div className="flex flex-col items-start gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="size-12 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-sm font-black shadow-lg">
                                            {user.nome?.charAt(user.nome.startsWith('Dr.') ? 4 : 0) || 'P'}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm text-slate-900">{user.nome}</p>
                                            <p className="text-xs text-slate-500">{user.especialidade} | CRP {user.crp}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-primary font-bold">Assinado digitalmente via Meu Sistema Psi</p>
                                </div>
                            </div>
                        </div>

                        {/* Rodapé Legal */}
                        <div className="mt-8 pt-4 border-t border-slate-100 text-center">
                            <p className="text-[8px] text-slate-400 leading-relaxed">
                                Este laudo é um documento sigiloso e pessoal. Sua divulgação sem autorização constitui infração ética.
                                <br />Elaborado conforme a Resolução CFP nº 06/2019.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Painel Lateral */}
                <div className="space-y-6 print:hidden">
                    {/* Selecionar Paciente */}
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
                                    placeholder="Buscar paciente cadastrado..."
                                    value={pacienteBusca}
                                    onChange={e => { setPacienteBusca(e.target.value); setShowDropdown(true); }}
                                    onFocus={() => setShowDropdown(true)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    autoComplete="off"
                                />
                                {showDropdown && (
                                    <div ref={dropdownRef} className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                        {pacientesFiltrados.length > 0 ? (
                                            pacientesFiltrados.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => handleSelecionarPaciente(p)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors"
                                                >
                                                    <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${p.cor || 'bg-primary/10 text-primary'}`}>
                                                        {p.iniciais}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{p.nome}</span>
                                                        <p className="text-[10px] text-slate-400">{formatDisplayId(p.id, 'PAC')} · {p.email || p.telefone}</p>
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
                                    <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${dados.pacienteCor || 'bg-primary/10 text-primary'}`}>
                                        {dados.pacienteIniciais}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{dados.pacienteNome}</p>
                                        <p className="text-[10px] text-slate-400">{formatDisplayId(dados.pacienteId, 'PAC')}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Ações */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">bolt</span>
                            Ações do Laudo
                        </h4>
                        <div className="space-y-3">
                            {!isFinalizado && (
                                <>
                                    <button
                                        onClick={() => handleSalvar(dados.status)}
                                        disabled={salvando}
                                        className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                                    >
                                        {salvando ? (
                                            <><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
                                        ) : (
                                            <><span className="material-symbols-outlined text-sm">save</span> Salvar Rascunho</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleSalvar('Em Revisão')}
                                        disabled={salvando}
                                        className="w-full py-3.5 bg-amber-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-200/50 hover:scale-[1.02] transition-all disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">rate_review</span> Enviar para Revisão
                                    </button>
                                    <button
                                        onClick={() => handleSalvar('Finalizado')}
                                        disabled={salvando}
                                        className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/50 hover:scale-[1.02] transition-all disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">verified</span> Finalizar Laudo
                                    </button>
                                </>
                            )}

                            {isFinalizado && (
                                <div className="text-center py-4">
                                    <div className="size-14 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                        <span className="material-symbols-outlined text-3xl text-emerald-600">task_alt</span>
                                    </div>
                                    <p className="text-sm font-black text-emerald-700">Documento {dados.status}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Este documento está bloqueado para edição direta.</p>
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
                    </div>

                    {/* Histórico de Versões */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">history</span>
                            Histórico de Versões
                        </h4>
                        {historico.length > 0 ? (
                            <div className="relative">
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                                <div className="space-y-4">
                                    {historico.slice().reverse().map((h, i) => (
                                        <div key={i} className="flex items-start gap-3 relative">
                                            <div className={`size-4 rounded-full flex-shrink-0 mt-0.5 z-10 ${i === 0 ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{h.acao}</p>
                                                <p className="text-[10px] text-slate-400">{h.usuario}</p>
                                                <p className="text-[10px] text-primary font-bold">{formatDate(h.data)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-4">Nenhum histórico disponível.</p>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { margin: 1cm; size: A4 portrait; }
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    .grid { display: block !important; }
                    .gap-8 { gap: 0 !important; }
                    .max-w-7xl { max-width: none !important; margin: 0 !important; width: 100% !important; display: block !important; }
                    .documento-laudo { 
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
                .documento-laudo {
                    width: 100%;
                    max-width: 794px;
                    margin: 0 auto;
                }
            `}} />
        </div>
    );
};

export default LaudoPsicologico;
