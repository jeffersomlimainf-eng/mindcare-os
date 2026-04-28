import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDeclaracoes } from '../contexts/DeclaracaoContext';
import { usePatients } from '../contexts/PatientContext';
import { useModels } from '../contexts/ModelContext';
import { useUser } from '../contexts/UserContext';
import { showToast } from '../components/Toast';
import { formatDisplayId, formatFileId } from '../utils/formatId';

import { logger } from '../utils/logger';
const DeclaracaoComparecimento = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addDeclaracao, updateDeclaracao, getDeclaracaoById } = useDeclaracoes();
    const { patients } = usePatients();
    const { models } = useModels();
    const { user } = useUser();

    const isNovo = id === 'novo';
    const declExistente = !isNovo ? getDeclaracaoById(id) : null;

    const [salvando, setSalvando] = useState(false);
    const [pacienteBusca, setPacienteBusca] = useState('');
    const [showDropdown, setShowDropdown] = useState(() => {
        const hasPaciente = location.state?.pacienteId || location.state?.documentoReferencia?.pacienteId || location.state?.pacienteObjeto;
        return isNovo && !hasPaciente;
    });
    const [declId, setDeclId] = useState(declExistente?.id || null);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const documentoRef = useRef(null);

    const hoje = new Date();
    const hojeFormatado = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const horaAtual = hoje.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const cidadeSalva = localStorage.getItem('decl_local_emissao') || '';

    const [dados, setDados] = useState({
        pacienteId: '',
        pacienteNome: '',
        pacienteIniciais: '',
        pacienteCor: '',
        pacienteCpf: '',
        pacienteNascimento: '',
        pacienteEmail: '',
        pacienteTelefone: '',
        dataAtendimento: hoje.toISOString().split('T')[0],
        horaInicio: horaAtual,
        horaFim: '',
        finalidade: 'Sessão de Psicoterapia',
        localEmissao: cidadeSalva,
        observacoes: '',
        status: 'Rascunho',
        documentoId: '',
        profissionalNome: user.nome,
        profissionalCrp: user.crp,
        profissionalEspecialidade: user.especialidade,
    });

    useEffect(() => {
        if (declExistente) {
            setDados({
                pacienteId: declExistente.pacienteId || '',
                pacienteNome: declExistente.pacienteNome || '',
                pacienteIniciais: declExistente.pacienteIniciais || '',
                pacienteCor: declExistente.pacienteCor || '',
                pacienteCpf: declExistente.pacienteCpf || '',
                pacienteNascimento: declExistente.pacienteNascimento || '',
                pacienteEmail: declExistente.pacienteEmail || '',
                pacienteTelefone: declExistente.pacienteTelefone || '',
                dataAtendimento: declExistente.dataAtendimento || '',
                horaInicio: declExistente.horaInicio || '',
                horaFim: declExistente.horaFim || '',
                finalidade: declExistente.finalidade || 'Sessão de Psicoterapia',
                localEmissao: declExistente.localEmissao || '',
                observacoes: declExistente.observacoes || '',
                status: declExistente.status || 'Rascunho',
                documentoId: declExistente.documentoId || '',
                profissionalNome: declExistente.profissionalNome || user.nome,
                profissionalCrp: declExistente.profissionalCrp || user.crp,
                profissionalEspecialidade: declExistente.profissionalEspecialidade || user.especialidade,
            });
            setPacienteBusca(declExistente.pacienteNome || '');
            setDeclId(declExistente.id);
        } else if (isNovo && location.state) {
            const { modelo, pacienteId, documentoReferencia } = location.state;
            
            if (documentoReferencia) {
                setDados(prev => ({
                    ...prev,
                    dataAtendimento: documentoReferencia.dataAtendimento || documentoReferencia.data || '',
                    horaInicio: documentoReferencia.horaInicio || documentoReferencia.horarioInicio || '',
                    horaFim: documentoReferencia.horaFim || documentoReferencia.horarioFim || '',
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
                    observacoes: modelo.conteudo || '',
                    dataAtendimento: new Date().toISOString().split('T')[0],
                }));
            } else if (location.state?.categoria) {
                const modeloPadrao = (models || []).find(m => m.categoria === location.state.categoria);
                if (modeloPadrao) {
                    setDados(prev => ({
                        ...prev,
                        observacoes: modeloPadrao.conteudo || '',
                    }));
                }
            }
        }
    }, [declExistente, user, isNovo, location.state, models]);

    // Sincronização Automática com o Cadastro do Paciente
    useEffect(() => {
        if (!dados.pacienteId || !patients.length) return;

        const normalize = (id) => id?.toString().replace('#', '');
        const p = patients.find(p => normalize(p.id) === normalize(dados.pacienteId));

        if (p) {
            const cpfVazio = !dados.pacienteCpf || dados.pacienteCpf === '___.___.____-__';
            const dataVazia = !dados.pacienteNascimento || dados.pacienteNascimento === '—';
            
            if ((cpfVazio && p.cpf) || (dataVazia && (p.dataNascimento || p.nascimento))) {
                setDados(prev => ({
                    ...prev,
                    pacienteCpf: (cpfVazio && p.cpf) ? p.cpf : prev.pacienteCpf,
                    pacienteNascimento: (dataVazia && (p.dataNascimento || p.nascimento)) ? (p.dataNascimento || p.nascimento) : prev.pacienteNascimento,
                    // Atualizar também outros campos caso estejam vazios
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
            pacienteCpf: p.cpf || '',
            pacienteNascimento: p.dataNascimento || p.nascimento || '',
            pacienteEmail: p.email || '',
            pacienteTelefone: p.telefone || '',
        }));
        setPacienteBusca(p.nome);
        setShowDropdown(false);
    };

    const handleChange = (campo, valor) => {
        setDados(prev => {
            const next = { ...prev, [campo]: valor };
            // Auto-calcular Hora Fim quando Hora Início mudar e Hora Fim estiver vazia
            if (campo === 'horaInicio' && !prev.horaFim && valor) {
                const [h, m] = valor.split(':').map(Number);
                const fim = new Date(0, 0, 0, h, m + 50);
                next.horaFim = `${String(fim.getHours()).padStart(2,'0')}:${String(fim.getMinutes()).padStart(2,'0')}`;
            }
            // Memorizar cidade para próximas declarações
            if (campo === 'localEmissao') {
                localStorage.setItem('decl_local_emissao', valor);
            }
            return next;
        });
    };

    const handleSalvar = (novoStatus) => {
        if (!dados.pacienteId) {
            showToast('Selecione um paciente antes de salvar.', 'warning');
            return;
        }
        if (novoStatus === 'Finalizado') {
            if (!dados.horaInicio) {
                showToast('Informe a Hora de Início antes de finalizar.', 'warning');
                return;
            }
            if (!dados.localEmissao.trim()) {
                showToast('Informe o Local de Emissão (cidade) antes de finalizar.', 'warning');
                return;
            }
        }

        setSalvando(true);
        const dadosSalvar = { ...dados, status: novoStatus || dados.status, profissionalNome: user.nome, profissionalCrp: user.crp, profissionalEspecialidade: user.especialidade };

        setTimeout(() => {
            if (declId) {
                updateDeclaracao(declId, dadosSalvar);
                showToast(novoStatus === 'Finalizado' ? 'Declaração finalizada com sucesso! ✅' : 'Declaração salva!', 'success');
            } else {
                const nova = addDeclaracao(dadosSalvar);
                setDeclId(nova.id);
                setDados(prev => ({ ...prev, documentoId: nova.documentoId, status: nova.status }));
                showToast('Declaração criada com sucesso!', 'success');
            }
            setSalvando(false);
        }, 600);
    };

    const handlePrint = () => window.print();

    const handleExportPDF = async () => {
        if (!documentoRef.current) return;
        try {
            const { exportToPDF } = await import('../utils/exportUtils');
            const filename = `declaracao_${dados.pacienteNome.replace(/\s+/g, '_').toLowerCase()}_${formatFileId(dados.documentoId)}.pdf`;
            await exportToPDF(documentoRef.current, filename);
            showToast('PDF gerado com sucesso!', 'success');
        } catch (error) {
            logger.error('Erro na exportação PDF:', error);
            showToast(`Erro: ${error.message}. Use a opção "Imprimir" → "Salvar como PDF".`, 'warning');
        }
    };

    const handleExportWord = async () => {
        try {
            const { exportToWord } = await import('../utils/exportUtils');
            const dataForWord = {
                titulo: 'Declaração de Comparecimento',
                subtitulo: `Documento ID: #${formatFileId(dados.documentoId)}`,
                paciente: {
                    nome: dados.pacienteNome,
                    cpf: dados.pacienteCpf,
                    nascimento: dados.pacienteNascimento ? new Date(dados.pacienteNascimento).toLocaleDateString('pt-BR') : '—'
                },
                dataEmissao: new Date().toLocaleDateString('pt-BR'),
                secoes: [
                    { 
                        titulo: 'Declaração', 
                        conteudo: `Declaro, para os devidos fins, que ${dados.pacienteNome}${dados.pacienteCpf ? `, inscrito(a) no CPF sob o nº ${dados.pacienteCpf}` : ''}, compareceu a este consultório no dia ${formatDateBR(dados.dataAtendimento)}${dados.horaInicio ? `, no horário das ${dados.horaInicio}${dados.horaFim ? ` às ${dados.horaFim}` : ''}` : ''}, para ${dados.finalidade}.`
                    }
                ],
                profissional: {
                    nome: user.nome,
                    crp: user.crp,
                    especialidade: user.especialidade
                }
            };
            if (dados.observacoes) {
                dataForWord.secoes.push({ titulo: 'Observações', conteudo: dados.observacoes });
            }
            const filename = `declaracao_${dados.pacienteNome.replace(/\s+/g, '_').toLowerCase()}_${formatFileId(dados.documentoId)}.docx`;
            await exportToWord(dataForWord, filename);
            showToast('Word gerado com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao gerar Word.', 'error');
        }
    };

    const handleWhatsApp = () => {
        const texto = `Olá ${dados.pacienteNome}, segue a declaração de comparecimento referente ao atendimento realizado em ${formatDateBR(dados.dataAtendimento)}. Para mais informações, entre em contato com a clínica.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    };

    const formatDateBR = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const formatDateTime = (iso) => {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const statusConfig = {
        'Rascunho': { cor: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
        'Finalizado': { cor: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    };

    const statusAtual = statusConfig[dados.status] || statusConfig['Rascunho'];
    const isFinalizado = dados.status === 'Finalizado' || dados.status === 'Assinado';
    const historico = declExistente?.historico || [];
    const criadoEm = declExistente?.criadoEm;
    const atualizadoEm = declExistente?.atualizadoEm;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-20 print:bg-white print:p-0">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors mb-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                        {isNovo && !declId ? 'Nova Declaração de Comparecimento' : 'Visualização de Declaração'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isNovo && !declId
                            ? 'Emita uma declaração de comparecimento para o paciente.'
                            : `Documento ${formatDisplayId(dados.documentoId, 'DEC')} · ${dados.pacienteNome}`}
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
                    <div ref={documentoRef} className="bg-white text-slate-900 p-10 md:p-16 shadow-2xl rounded-sm min-h-[900px] documento-declaracao relative flex flex-col print:shadow-none print:p-0 print:min-h-0">
                        {/* Cabeçalho */}
                        <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-2xl">verified</span>
                                </div>
                                <div>
                                    <h2 className="font-black text-lg leading-tight text-emerald-600">Meu Sistema Psi</h2>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Clínica de Psicologia Especializada</p>
                                    <p className="text-[9px] text-slate-400">Contato: {user.telefone || '(11) 4002-8922'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="text-lg font-black uppercase tracking-wider text-slate-800">Declaração de<br />Comparecimento</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Documento: {formatDisplayId(dados.documentoId, 'DEC')}</p>
                            </div>
                        </div>

                        {/* Corpo - Estilo Declaração Formal */}
                        <div className="flex-1 flex flex-col">
                            <h3 className="text-2xl font-black tracking-[0.15em] uppercase text-center mb-16 mt-8">Declaração</h3>

                            <div className="text-[14px] leading-[2.2] text-justify space-y-6">
                                <p>
                                    Declaro, para os devidos fins, que <span className="font-black">{dados.pacienteNome || '________________________________'}</span>
                                    {dados.pacienteCpf && <>, inscrito(a) no CPF sob o nº <span className="font-black">{dados.pacienteCpf}</span></>}
                                    , compareceu a este consultório no dia{' '}
                                    <span className="font-black">{formatDateBR(dados.dataAtendimento)}</span>
                                    {dados.horaInicio && (
                                        <>, no horário das <span className="font-black">{dados.horaInicio}</span>
                                            {dados.horaFim ? <> às <span className="font-black">{dados.horaFim}</span></> : null}</>
                                    )}
                                    , para{' '}
                                    <span className="font-black">{dados.finalidade}</span>.
                                </p>

                                {dados.observacoes ? (
                                    <p>{dados.observacoes}</p>
                                ) : null}

                                <p>
                                    A presente declaração é emitida a pedido do(a) interessado(a) e para os fins que se fizerem necessários.
                                </p>
                            </div>

                            {/* Observações editáveis (antes de finalizar) */}
                            {!isFinalizado && (
                                <div className="mt-8 space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Local de Emissão (Cidade/UF)</label>
                                        <input
                                            type="text"
                                            value={dados.localEmissao || ''}
                                            onChange={e => handleChange('localEmissao', e.target.value)}
                                            className="w-full text-[13px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none p-3 h-10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all print:hidden"
                                            placeholder="Ex: São Paulo, SP / Maringá, PR..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Observações (opcional)</label>
                                        <textarea
                                            value={dados.observacoes}
                                            onChange={e => handleChange('observacoes', e.target.value)}
                                            className="w-full text-[13px] leading-relaxed text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none min-h-[60px] p-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all print:hidden"
                                            placeholder="Adicione observações adicionais se necessário..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Local e Data */}
                            <div className="mt-16">
                                <p className="text-sm text-right mb-16">
                                    {dados.localEmissao || 'Cidade - UF'}, {formatDateBR(dados.dataAtendimento)}
                                </p>
                            </div>

                            {/* Assinatura */}
                            <div className="mt-auto flex flex-col items-center">
                                <div className="w-80 border-t-2 border-slate-800 pt-4 text-center">
                                    <div className="flex items-center justify-center gap-3 mb-1">
                                        <div className="size-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-black shadow-lg">
                                            {user.nome?.charAt(user.nome.startsWith('Dr.') ? 4 : 0) || 'P'}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-sm text-slate-900">{user.nome}</p>
                                            <p className="text-xs text-slate-500">{user.especialidade} — CRP {user.crp}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-emerald-600 font-bold mt-2">Assinado digitalmente via Meu Sistema Psi</p>
                                </div>
                            </div>
                        </div>

                        {/* Rodapé Legal */}
                        <div className="mt-10 pt-4 border-t border-slate-100 text-center">
                            <p className="text-[8px] text-slate-400 leading-relaxed">
                                Este documento é de uso exclusivo do paciente e não substitui atestado médico.
                                <br />Emitido conforme o Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005).
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
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
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
                                <div className="mt-3 flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                                    <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${dados.pacienteCor || 'bg-primary/10 text-primary'}`}>{dados.pacienteIniciais}</div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{dados.pacienteNome}</p>
                                        <p className="text-[10px] text-slate-400">{formatDisplayId(dados.pacienteId, 'PAC')}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dados do Atendimento */}
                    {!isFinalizado && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Dados do Atendimento</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Data do Atendimento</label>
                                    <input
                                        type="date"
                                        value={dados.dataAtendimento}
                                        onChange={e => handleChange('dataAtendimento', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hora Início</label>
                                        <input
                                            type="time"
                                            value={dados.horaInicio}
                                            onChange={e => handleChange('horaInicio', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                                            Hora Fim
                                        </label>
                                        <input
                                            type="time"
                                            value={dados.horaFim}
                                            onChange={e => handleChange('horaFim', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                        {dados.horaFim && dados.horaInicio && (
                                            <p className="text-[10px] text-emerald-600 font-medium mt-1">
                                                ⚡ Auto-calculado (50 min)
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Finalidade</label>
                                    <select
                                        value={dados.finalidade}
                                        onChange={e => handleChange('finalidade', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    >
                                        <option value="Sessão de Psicoterapia">Sessão de Psicoterapia</option>
                                        <option value="Avaliação Psicológica">Avaliação Psicológica</option>
                                        <option value="Consulta Psicológica">Consulta Psicológica</option>
                                        <option value="Acompanhamento Terapêutico">Acompanhamento Terapêutico</option>
                                        <option value="Orientação Familiar">Orientação Familiar</option>
                                        <option value="Triagem Psicológica">Triagem Psicológica</option>
                                        <option value="Plantão Psicológico">Plantão Psicológico</option>
                                        <option value="Orientação Profissional">Orientação Profissional</option>
                                        <option value="Atendimento de Urgência">Atendimento de Urgência</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ações */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-500">bolt</span>
                            Ações
                        </h4>
                        <div className="space-y-3">
                            {!isFinalizado ? (
                                <>
                                    <button onClick={() => handleSalvar(dados.status)} disabled={salvando} className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                                        {salvando ? <><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : <><span className="material-symbols-outlined text-sm">save</span> Salvar Rascunho</>}
                                    </button>
                                    <button onClick={() => handleSalvar('Finalizado')} disabled={salvando} className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/50 hover:scale-[1.02] transition-all disabled:opacity-50">
                                        <span className="material-symbols-outlined text-sm">verified</span> Finalizar e Assinar
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="size-14 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                        <span className="material-symbols-outlined text-3xl text-emerald-600">task_alt</span>
                                    </div>
                                    <p className="text-sm font-black text-emerald-700">Documento {dados.status}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Este documento está bloqueado para edição direta.</p>
                                    <button
                                        onClick={() => { setDados(prev => ({ ...prev, status: 'Rascunho' })); if (declId) updateDeclaracao(declId, { status: 'Rascunho', profissionalNome: user.nome }); showToast('Declaração reaberta para edição.', 'info'); }}
                                        className="mt-3 text-xs font-bold text-primary hover:underline"
                                    >
                                        Reabrir para Edição
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Histórico */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-500">history</span>
                            Histórico de Versões
                        </h4>
                        {historico.length > 0 ? (
                            <div className="relative">
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                                <div className="space-y-4">
                                    {historico.slice().reverse().map((h, i) => (
                                        <div key={i} className="flex items-start gap-3 relative">
                                            <div className={`size-4 rounded-full flex-shrink-0 mt-0.5 z-10 ${i === 0 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{h.acao}</p>
                                                <p className="text-[10px] text-slate-400">{h.usuario}</p>
                                                <p className="text-[10px] text-emerald-600 font-bold">{formatDateTime(h.data)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-4">Salve a declaração para iniciar o rastreamento.</p>
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
                    
                    .documento-declaracao { 
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
                .documento-declaracao {
                    width: 100%;
                    max-width: 794px; /* A4 width */
                    margin: 0 auto;
                }
            `}} />
        </div>
    );
};

export default DeclaracaoComparecimento;



