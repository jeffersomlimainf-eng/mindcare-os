import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useAtestados } from '../contexts/AtestadoContext';
import { usePatients } from '../contexts/PatientContext';
import { useModels } from '../contexts/ModelContext';
import { useUser } from '../contexts/UserContext';
import { showToast } from '../components/Toast';
import { formatDisplayId, formatFileId } from '../utils/formatId';

import { logger } from '../utils/logger';
import { atestadoSchema } from '../schemas/documentSchema';

const AtestadoSaudeMental = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addAtestado, updateAtestado, getAtestadoById } = useAtestados();
    const { patients } = usePatients();
    const { models } = useModels();
    const { user } = useUser();

    const isNovo = id === 'novo';
    const atestExistente = !isNovo ? getAtestadoById(id) : null;
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
    const [atestId, setAtestId] = useState(atestExistente?.id || null);
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
        finalidade: 'Aptidão psicológica',
        diasAfastamento: '',
        cid: '',
        parecer: '',
        observacoes: '',
        status: 'Rascunho',
        documentoId: '',
        profissionalNome: user.nome,
        profissionalCrp: user.crp,
        profissionalEspecialidade: user.especialidade,
    });

    useEffect(() => {
        if (atestExistente) {
            setDados({
                pacienteId: atestExistente.pacienteId || '',
                pacienteNome: atestExistente.pacienteNome || '',
                pacienteIniciais: atestExistente.pacienteIniciais || '',
                pacienteCor: atestExistente.pacienteCor || '',
                pacienteCpf: atestExistente.pacienteCpf || '',
                pacienteDataNascimento: atestExistente.pacienteDataNascimento || '',
                finalidade: atestExistente.finalidade || 'Aptidão psicológica',
                diasAfastamento: atestExistente.diasAfastamento || '',
                cid: atestExistente.cid || '',
                parecer: atestExistente.parecer || '',
                observacoes: atestExistente.observacoes || '',
                status: atestExistente.status || 'Rascunho',
                documentoId: atestExistente.documentoId || '',
                profissionalNome: atestExistente.profissionalNome || user.nome,
                profissionalCrp: atestExistente.profissionalCrp || user.crp,
                profissionalEspecialidade: atestExistente.profissionalEspecialidade || user.especialidade,
            });
            setPacienteBusca(atestExistente.pacienteNome || '');
            setAtestId(atestExistente.id);
        } else if (isNovo && location.state) {
            const { modelo, pacienteId, documentoReferencia } = location.state;
            
            if (documentoReferencia) {
                setDados(prev => ({
                    ...prev,
                    finalidade: documentoReferencia.finalidade || '',
                    parecer: documentoReferencia.parecer || documentoReferencia.conteudo || '',
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
                    }));
                    setPacienteBusca(p.nome);
                }
            }
            
            if (modelo) {
                setDados(prev => ({ ...prev, parecer: modelo.conteudo || '' }));
            } else if (location.state?.categoria) {
                const modeloPadrao = (models || []).find(m => m.categoria === location.state.categoria);
                if (modeloPadrao) {
                    setDados(prev => ({ ...prev, parecer: modeloPadrao.conteudo || '' }));
                }
            }
        }
    }, [atestExistente, user, isNovo, location.state, models]);

    useEffect(() => {
        if (!dados.pacienteId || !patients.length) return;
        const normalize = (id) => id?.toString().replace('#', '');
        const p = patients.find(p => normalize(p.id) === normalize(dados.pacienteId));
        if (p) {
            const cpfVazio = !dados.pacienteCpf || dados.pacienteCpf === '___.___.____-__';
            const dataVazia = !dados.pacienteDataNascimento || dados.pacienteDataNascimento === '—' || !dados.pacienteDataNascimento;
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
            pacienteCpf: p.cpf || '',
            pacienteDataNascimento: p.dataNascimento || p.nascimento || '',
        }));
        setPacienteBusca(p.nome);
        setShowDropdown(false);
    };

    const formatBirthDate = (dateStr) => {
        if (!dateStr || dateStr === '—') return '—';
        const d = new Date(dateStr + 'T00:00:00');
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('pt-BR');
    };

    const handleLocalEmissaoChange = (valor) => {
        setLocalEmissao(valor);
        localStorage.setItem('decl_local_emissao', valor);
    };

    const handleChange = (campo, valor) => {
        setDados(prev => ({ ...prev, [campo]: valor }));
    };

    const handleSalvar = (novoStatus) => {
        setSalvando(true);
        const dadosSalvar = { ...dados, status: novoStatus || dados.status, profissionalNome: user.nome, profissionalCrp: user.crp, profissionalEspecialidade: user.especialidade };

        // Validação robusta com Zod
        if (novoStatus === 'Finalizado') {
            const validation = atestadoSchema.safeParse(dadosSalvar);
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
            if (atestId) {
                updateAtestado(atestId, dadosSalvar);
                showToast(novoStatus === 'Finalizado' ? 'Atestado finalizado com sucesso! ✅' : 'Atestado salvo!', 'success');
            } else {
                const novo = addAtestado(dadosSalvar);
                setAtestId(novo.id);
                setDados(prev => ({ ...prev, documentoId: novo.documentoId, status: novo.status }));
                showToast('Atestado criado com sucesso!', 'success');
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
                titulo: 'Atestado de Saúde Mental',
                subtitulo: `Documento ID: #${formatFileId(dados.documentoId)}`,
                paciente: {
                    nome: dados.pacienteNome,
                    cpf: dados.pacienteCpf,
                    nascimento: formatBirthDate(dados.pacienteDataNascimento)
                },
                dataEmissao: new Date().toLocaleDateString('pt-BR'),
                secoes: [
                    { 
                        titulo: 'Atestado', 
                        conteudo: `Atesto, para os devidos fins, que ${dados.pacienteNome}${dados.pacienteCpf ? `, inscrito(a) no CPF sob o nº ${dados.pacienteCpf}` : ''}, foi submetido(a) a avaliação psicológica nesta data, e conforme os procedimentos realizados, apresento o seguinte parecer: ${dados.parecer}`
                    }
                ],
                profissional: {
                    nome: user.nome,
                    crp: user.crp,
                    especialidade: user.especialidade
                }
            };
            if (dados.cid) dataForWord.secoes.push({ titulo: 'CID', conteudo: dados.cid });
            if (dados.diasAfastamento) dataForWord.secoes.push({ titulo: 'Afastamento', conteudo: `${dados.diasAfastamento} dia(s)` });
            if (dados.observacoes) dataForWord.secoes.push({ titulo: 'Observações', conteudo: dados.observacoes });
            
            const filename = `atestado_${dados.pacienteNome.replace(/\s+/g, '_').toLowerCase()}_${formatFileId(dados.documentoId)}.docx`;
            await exportToWord(dataForWord, filename);
            showToast('Word gerado com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao gerar Word.', 'error');
        }
    };
    const handleWhatsApp = () => {
        const texto = `Olá ${dados.pacienteNome}, segue o atestado de saúde mental (${formatFileId(dados.documentoId)}) emitido pela clínica.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    };

    const statusConfig = {
        'Rascunho': { cor: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
        'Finalizado': { cor: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
    };
    const statusAtual = statusConfig[dados.status] || statusConfig['Rascunho'];
    const isFinalizado = dados.status === 'Finalizado' || dados.status === 'Assinado';
    const historico = atestExistente?.historico || [];
    const criadoEm = atestExistente?.criadoEm;
    const atualizadoEm = atestExistente?.atualizadoEm;

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
                        {isNovo && !atestId ? 'Novo Atestado de Saúde Mental' : 'Visualização de Atestado'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isNovo && !atestId
                            ? 'Emita um atestado de saúde mental conforme as normas do CFP.'
                            : `Documento ${formatDisplayId(dados.documentoId, 'ATE')} · ${dados.pacienteNome}`}
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
                    <div ref={documentoRef} className="bg-white text-slate-900 p-10 md:p-16 shadow-2xl rounded-sm min-h-[1000px] documento-atestado relative flex flex-col print:shadow-none print:p-0 print:min-h-0">
                        {/* Cabeçalho */}
                        <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-violet-500 flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-2xl">medical_information</span>
                                </div>
                                <div>
                                    <h2 className="font-black text-lg leading-tight text-violet-600">Meu Sistema Psi</h2>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Clínica de Psicologia Especializada</p>
                                    <p className="text-[9px] text-slate-400">Contato: {user.telefone || '(11) 4002-8922'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="text-lg font-black uppercase tracking-wider text-slate-800">Atestado de<br />Saúde Mental</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Documento: {formatDisplayId(dados.documentoId, 'ATE')}</p>
                            </div>
                        </div>

                        {/* Dados do Paciente */}
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
                                    <p className="text-sm font-bold text-slate-700">{formatBirthDate(dados.pacienteDataNascimento)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Data de Emissão</p>
                                    <p className="text-sm font-bold text-slate-700">{hojeExtenso}</p>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-2xl font-black tracking-[0.15em] uppercase text-center mb-12">Atestado</h3>

                        <div className="text-[14px] leading-[2.2] text-justify space-y-6 flex-1">
                            <p>
                                Atesto, para os devidos fins, que <span className="font-black">{dados.pacienteNome || '________________________________'}</span>
                                {dados.pacienteCpf && <>, inscrito(a) no CPF sob o nº <span className="font-black">{dados.pacienteCpf}</span></>}
                                , foi submetido(a) a avaliação psicológica nesta data, e apresento o seguinte parecer:
                            </p>

                            <div className="my-4 print:my-4 print-section">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-5 rounded-full bg-violet-500 print:hidden"></div>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-900 print:text-[12pt] print:text-violet-700">Parecer Psicológico</p>
                                </div>
                                <textarea
                                    value={dados.parecer}
                                    onChange={e => handleChange('parecer', e.target.value)}
                                    className="w-full text-[14px] leading-[2] text-slate-700 bg-transparent border-none outline-none resize-none min-h-[100px] focus:bg-violet-50/40 rounded-lg p-3 transition-colors print:hidden"
                                    placeholder="O(A) paciente encontra-se em condições psicológicas adequadas..."
                                    readOnly={isFinalizado}
                                />
                                <div className="hidden print:block text-[14px] leading-[2.2] text-slate-800 whitespace-pre-wrap text-justify">
                                    {dados.parecer || 'Não informado.'}
                                </div>
                            </div>

                            {dados.cid && <p>Classificação (CID): <span className="font-black">{dados.cid}</span></p>}
                            {dados.diasAfastamento && <p>Recomenda-se o afastamento de suas atividades pelo período de <span className="font-black">{dados.diasAfastamento} dia(s)</span>.</p>}
                            {dados.observacoes && <p>{dados.observacoes}</p>}
                        </div>

                        <p className="text-sm text-right mt-12 mb-16">{localEmissao || 'Local'}, {hojeExtenso}</p>

                        <div className="flex flex-col items-center">
                            <div className="w-80 border-t-2 border-slate-800 pt-4 text-center">
                                <div className="flex items-center justify-center gap-3 mb-1">
                                    <div className="size-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-lg">
                                        {user.nome?.charAt(user.nome.startsWith('Dr.') ? 4 : 0) || 'P'}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-sm text-slate-900">{user.nome}</p>
                                        <p className="text-xs text-slate-500">{user.especialidade || 'Psicólogo(a)'}{user.crp ? ` — CRP ${user.crp}` : ''}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-violet-600 font-bold mt-2">Assinado digitalmente via Meu Sistema Psi</p>
                            </div>
                        </div>

                        <div className="mt-10 pt-4 border-t border-slate-100 text-center">
                            <p className="text-[8px] text-slate-400 leading-relaxed">
                                Este atestado é um documento sigiloso.
                                <br />Emitido conforme a Resolução CFP nº 06/2019.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 print:hidden">
                    {!isFinalizado && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Selecionar Paciente</h4>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Buscar paciente..."
                                    value={pacienteBusca}
                                    onChange={e => { setPacienteBusca(e.target.value); setShowDropdown(true); }}
                                    onFocus={() => setShowDropdown(true)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                    autoComplete="off"
                                />
                                {showDropdown && (
                                    <div ref={dropdownRef} className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                        {pacientesFiltrados.map(p => (
                                            <button key={p.id} onClick={() => handleSelecionarPaciente(p)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors">
                                                <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${p.cor || 'bg-primary/10 text-primary'}`}>{p.iniciais}</div>
                                                <div>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{p.nome}</span>
                                                    <p className="text-[10px] text-slate-400">{formatDisplayId(p.id, 'PAC')}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {dados.pacienteId && (
                                <div className="mt-3 flex items-center gap-2 p-2.5 bg-violet-50 rounded-xl border border-violet-200">
                                    <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${dados.pacienteCor || 'bg-primary/10 text-primary'}`}>{dados.pacienteIniciais}</div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{dados.pacienteNome}</p>
                                        <p className="text-[10px] text-slate-400">{formatDisplayId(dados.pacienteId, 'PAC')}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-violet-500 text-sm">check_circle</span>
                                </div>
                            )}
                        </div>
                    )}

                    {!isFinalizado && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Dados do Atestado</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Finalidade</label>
                                    <select value={dados.finalidade} onChange={e => handleChange('finalidade', e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none">
                                        <option value="Aptidão psicológica">Aptidão psicológica</option>
                                        <option value="Aptidão para trabalho">Aptidão para trabalho</option>
                                        <option value="Aptidão para porte de arma">Aptidão para porte de arma</option>
                                        <option value="Aptidão para concurso público">Aptidão para concurso público</option>
                                        <option value="Afastamento por saúde mental">Afastamento por saúde mental</option>
                                        <option value="Acompanhamento psicológico">Acompanhamento psicológico</option>
                                        <option value="Capacidade para atos civis">Capacidade para atos civis</option>
                                        <option value="Laudo para guarda/tutela">Laudo para guarda/tutela</option>
                                        <option value="Laudo para internação voluntária">Laudo para internação voluntária</option>
                                        <option value="Avaliação para adoção">Avaliação para adoção</option>
                                        <option value="Fins previdenciários (INSS)">Fins previdenciários (INSS)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">CID (opcional)</label>
                                    <input type="text" value={dados.cid} onChange={e => handleChange('cid', e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none" placeholder="Ex: F41.1" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Dias de Afastamento</label>
                                    <input type="number" value={dados.diasAfastamento} onChange={e => handleChange('diasAfastamento', e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none" placeholder="Ex: 5" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Local de Emissão</label>
                                    <input
                                        type="text"
                                        value={localEmissao}
                                        onChange={e => handleLocalEmissaoChange(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                        placeholder="Ex: Curitiba"
                                    />
                                    <p className="text-[9px] text-slate-400 mt-1">💾 Salvo automaticamente</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-violet-500">bolt</span> Ações
                        </h4>
                        <div className="space-y-3">
                            {!isFinalizado ? (
                                <>
                                    <button onClick={() => handleSalvar(dados.status)} disabled={salvando} className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                                        {salvando ? <><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : <><span className="material-symbols-outlined text-sm">save</span> Salvar Rascunho</>}
                                    </button>
                                    <button onClick={() => handleSalvar('Finalizado')} disabled={salvando} className="w-full py-3.5 bg-violet-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-200/50 hover:scale-[1.02] transition-all disabled:opacity-50">
                                        <span className="material-symbols-outlined text-sm">verified</span> Finalizar e Assinar
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="size-14 mx-auto bg-violet-100 rounded-full flex items-center justify-center mb-3">
                                        <span className="material-symbols-outlined text-3xl text-violet-600">task_alt</span>
                                    </div>
                                    <p className="text-sm font-black text-violet-700">Documento {dados.status}</p>
                                    <button onClick={() => { setDados(prev => ({ ...prev, status: 'Rascunho' })); if (atestId) updateAtestado(atestId, { status: 'Rascunho' }); showToast('Atestado reaberto.', 'info'); }} className="mt-3 text-xs font-bold text-primary hover:underline">Reabrir para Edição</button>
                                </div>
                            )}
                        </div>
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
                    .documento-atestado { 
                        width: auto !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                        min-height: 0 !important;
                    }
                    .print-section { page-break-inside: avoid !important; }
                    * { color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
                }
                .documento-atestado { width: 100%; max-width: 794px; margin: 0 auto; }
            `}} />
        </div>
    );
};

export default AtestadoSaudeMental;
