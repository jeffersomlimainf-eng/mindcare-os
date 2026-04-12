import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAtestados } from '../contexts/AtestadoContext';
import { usePatients } from '../contexts/PatientContext';
import { useModels } from '../contexts/ModelContext';
import { useUser } from '../contexts/UserContext';
import { showToast } from '../components/Toast';
import { formatDisplayId, formatFileId } from '../utils/formatId';

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
                setDados(prev => ({
                    ...prev,
                    parecer: modelo.conteudo || ''
                }));
            } else if (location.state?.categoria) {
                const modeloPadrao = (models || []).find(m => m.categoria === location.state.categoria);
                if (modeloPadrao) {
                    setDados(prev => ({
                        ...prev,
                        parecer: modeloPadrao.conteudo || '',
                    }));
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
            if (atestId) {
                updateAtestado(atestId, dadosSalvar);
                showToast(novoStatus === 'Finalizado' ? 'Atestado finalizado com sucesso! ✅' : 'Atestado salvo!', 'success');
            } else {
                const novo = addAtestado(dadosSalvar);
                setAtestId(novo.id);
                setDados(prev => ({ ...prev, documentoId: novo.documentoId, status: novo.status }));
                showToast('Atestado criado com sucesso!', 'success');
            }
            setSalvando(false);
        }, 600);
    };

    const handlePrint = () => window.print();

    const handleExportPDF = async () => {
        if (!documentoRef.current) return;
        try {
            const { exportToPDF } = await import('../utils/exportUtils');
            const filename = `atestado_${dados.pacienteNome.replace(/\s+/g, '_').toLowerCase()}_${formatFileId(dados.documentoId)}.pdf`;
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
                titulo: 'Atestado de Saúde Mental',
                subtitulo: `Documento ID: #${formatFileId(dados.documentoId)}`,
                paciente: {
                    nome: dados.pacienteNome,
                    cpf: dados.pacienteCpf,
                    nascimento: dados.pacienteNascimento ? new Date(dados.pacienteNascimento).toLocaleDateString('pt-BR') : '—'
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
        const texto = `Olá ${dados.pacienteNome}, segue o atestado de saúde mental (${formatFileId(dados.documentoId)}) emitido pela clínica. Para mais informações, entre em contato.`;
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
                                    <p className="text-sm font-bold text-slate-700">{dados.pacienteDataNascimento || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Data de Emissão</p>
                                    <p className="text-sm font-bold text-slate-700">{hojeExtenso}</p>
                                </div>
                            </div>
                        </div>

                        {/* Título */}
                        <h3 className="text-2xl font-black tracking-[0.15em] uppercase text-center mb-12">Atestado</h3>

                        {/* Corpo */}
                        <div className="text-[14px] leading-[2.2] text-justify space-y-6 flex-1">
                            <p>
                                Atesto, para os devidos fins, que <span className="font-black">{dados.pacienteNome || '________________________________'}</span>
                                {dados.pacienteCpf && <>, inscrito(a) no CPF sob o nº <span className="font-black">{dados.pacienteCpf}</span></>}
                                , foi submetido(a) a avaliação psicológica nesta data, e conforme os procedimentos realizados, apresento o seguinte parecer:
                            </p>

                            {/* Parecer */}
                            <div className="my-4 print:my-4 print-section">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-5 rounded-full bg-violet-500 print:hidden"></div>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-900 print:text-[12pt] print:text-violet-700">Parecer Psicológico</p>
                                </div>
                                <textarea
                                    value={dados.parecer}
                                    onChange={e => handleChange('parecer', e.target.value)}
                                    className="w-full text-[14px] leading-[2] text-slate-700 bg-transparent border-none outline-none resize-none min-h-[100px] focus:bg-violet-50/40 rounded-lg p-3 transition-colors print:hidden"
                                    placeholder="O(A) paciente encontra-se em condições psicológicas adequadas para o exercício de suas atividades laborais/acadêmicas. Não foram identificados sinais ou sintomas que indiquem comprometimento significativo das funções cognitivas, emocionais ou comportamentais que possam interferir em seu desempenho."
                                    readOnly={isFinalizado}
                                />
                                <div className="hidden print:block text-[14px] leading-[2.2] text-slate-800 whitespace-pre-wrap text-justify">
                                    {dados.parecer || 'Não informado.'}
                                </div>
                            </div>

                            {dados.cid && (
                                <p>
                                    Classificação (CID): <span className="font-black">{dados.cid}</span>
                                </p>
                            )}

                            {dados.diasAfastamento && (
                                <p>
                                    Recomenda-se o afastamento de suas atividades pelo período de <span className="font-black">{dados.diasAfastamento} dia(s)</span>, a contar desta data.
                                </p>
                            )}

                            {dados.observacoes && <p>{dados.observacoes}</p>}

                            <p className="mt-4">
                                O presente atestado é emitido com base em avaliação clínica psicológica, conforme as atribuições previstas na Lei nº 4.119/62 e Resolução CFP nº 06/2019.
                            </p>
                        </div>

                        {/* Local e Data */}
                        <p className="text-sm text-right mt-12 mb-16">
                            Paraná, {hojeExtenso}
                        </p>

                        {/* Assinatura */}
                        <div className="flex flex-col items-center">
                            <div className="w-80 border-t-2 border-slate-800 pt-4 text-center">
                                <div className="flex items-center justify-center gap-3 mb-1">
                                    <div className="size-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-lg">
                                        {user.nome?.charAt(user.nome.startsWith('Dr.') ? 4 : 0) || 'P'}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-sm text-slate-900">{user.nome}</p>
                                        <p className="text-xs text-slate-500">{user.especialidade} — CRP {user.crp}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-violet-600 font-bold mt-2">Assinado digitalmente via Meu Sistema Psi</p>
                            </div>
                        </div>

                        {/* Rodapé */}
                        <div className="mt-10 pt-4 border-t border-slate-100 text-center">
                            <p className="text-[8px] text-slate-400 leading-relaxed">
                                Este atestado é um documento sigiloso. Sua divulgação não autorizada constitui infração ética.
                                <br />Emitido conforme a Lei nº 4.119/62, Resolução CFP nº 06/2019 e Código de Ética do Psicólogo (Resolução CFP nº 010/2005).
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
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
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

                    {/* Dados do Atestado */}
                    {!isFinalizado && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Dados do Atestado</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Finalidade</label>
                                    <select
                                        value={dados.finalidade}
                                        onChange={e => handleChange('finalidade', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                    >
                                        <option value="Aptidão psicológica">Aptidão psicológica</option>
                                        <option value="Aptidão para trabalho">Aptidão para trabalho</option>
                                        <option value="Aptidão para porte de arma">Aptidão para porte de arma</option>
                                        <option value="Aptidão para concurso">Aptidão para concurso</option>
                                        <option value="Afastamento por saúde mental">Afastamento por saúde mental</option>
                                        <option value="Acompanhamento psicológico">Acompanhamento psicológico</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">CID (opcional)</label>
                                    <input
                                        type="text"
                                        value={dados.cid}
                                        onChange={e => handleChange('cid', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                        placeholder="Ex: F41.1 - Ansiedade Generalizada"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Dias de Afastamento (opcional)</label>
                                    <input
                                        type="number"
                                        value={dados.diasAfastamento}
                                        onChange={e => handleChange('diasAfastamento', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                        placeholder="Apenas se houver necessidade"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Observações (opcional)</label>
                                    <textarea
                                        value={dados.observacoes}
                                        onChange={e => handleChange('observacoes', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none resize-none min-h-[60px] focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                        placeholder="Observações adicionais..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ações */}
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
                                    <p className="text-[10px] text-slate-400 mt-1">Este documento está bloqueado para edição direta.</p>
                                    <button
                                        onClick={() => { setDados(prev => ({ ...prev, status: 'Rascunho' })); if (atestId) updateAtestado(atestId, { status: 'Rascunho', profissionalNome: user.nome }); showToast('Atestado reaberto para edição.', 'info'); }}
                                        className="mt-3 text-xs font-bold text-primary hover:underline"
                                    >Reabrir para Edição</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Histórico */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-violet-500">history</span> Histórico
                        </h4>
                        {historico.length > 0 ? (
                            <div className="relative">
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                                <div className="space-y-4">
                                    {historico.slice().reverse().map((h, i) => (
                                        <div key={i} className="flex items-start gap-3 relative">
                                            <div className={`size-4 rounded-full flex-shrink-0 mt-0.5 z-10 ${i === 0 ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{h.acao}</p>
                                                <p className="text-[10px] text-slate-400">{h.usuario}</p>
                                                <p className="text-[10px] text-violet-600 font-bold">{formatDateTime(h.data)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-4">Salve o atestado para iniciar o rastreamento.</p>
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

                    .print-section {
                        page-break-inside: avoid !important;
                    }
                    * { color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
                }
                .documento-atestado {
                    width: 100%;
                    max-width: 794px; /* A4 width */
                    margin: 0 auto;
                }
            `}} />
        </div>
    );
};

export default AtestadoSaudeMental;


