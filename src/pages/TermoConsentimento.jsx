import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTcles } from '../contexts/TcleContext';
import { usePatients } from '../contexts/PatientContext';
import { useUser } from '../contexts/UserContext';
import { showToast } from '../components/Toast';
import { exportToPDF, exportToWord } from '../utils/exportUtils';
import { formatDisplayId, formatFileId } from '../utils/formatId';

const TermoConsentimento = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addTcle, updateTcle, getTcleById } = useTcles();
    const { patients } = usePatients();
    const { user } = useUser();

    const isNovo = id === 'novo';
    const tcleExistente = !isNovo ? getTcleById(id) : null;

    const [salvando, setSalvando] = useState(false);
    const [pacienteBusca, setPacienteBusca] = useState('');
    const [showDropdown, setShowDropdown] = useState(() => {
        const hasPaciente = location.state?.pacienteId || location.state?.documentoReferencia?.pacienteId || location.state?.pacienteObjeto;
        return isNovo && !hasPaciente;
    });
    const [tcleId, setTcleId] = useState(tcleExistente?.id || null);
    const [abaAtiva, setAbaAtiva] = useState('identificacao');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const documentoRef = useRef(null);

    const hoje = new Date();
    const hojeFormatado = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    const [dados, setDados] = useState({
        pacienteId: '',
        pacienteNome: '',
        pacienteIniciais: '',
        pacienteCor: '',
        pacienteCpf: '',
        pacienteEmail: '',
        pacienteTelefone: '',
        pacienteDataNascimento: '',
        tipoAtendimento: 'Psicoterapia Individual',
        modalidade: 'Presencial',
        frequenciaSessoes: 'Semanal',
        duracaoSessoes: '50 minutos',
        valorSessao: '',
        formaPagamento: 'Dinheiro / PIX / Cartão',
        sigiloProfissional: 'O(a) psicólogo(a) compromete-se a manter sigilo sobre todas as informações compartilhadas durante o processo terapêutico, conforme previsto no Art. 9º do Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005). O sigilo somente poderá ser quebrado nas situações previstas em lei, como risco iminente à vida do(a) paciente ou de terceiros, mediante prévia comunicação ao(à) paciente.',
        direitosPaciente: '• Receber informações claras sobre o processo terapêutico, técnicas utilizadas e objetivos;\n• Ter acesso ao prontuário e documentos relacionados ao seu atendimento;\n• Solicitar encaminhamento para outro profissional a qualquer momento;\n• Interromper o tratamento a qualquer momento, sem necessidade de justificativa;\n• Ter sua privacidade, dignidade e autonomia respeitadas;\n• Ser informado(a) sobre os limites da confidencialidade.',
        deveresPaciente: '• Comparecer às sessões nos horários agendados;\n• Comunicar ausências com antecedência mínima de 24 horas;\n• Informar o(a) psicólogo(a) sobre tratamentos médicos e uso de medicamentos;\n• Ser honesto(a) durante o processo terapêutico;\n• Respeitar as normas de funcionamento do consultório.',
        politicaCancelamento: 'As sessões deverão ser canceladas ou remarcadas com no mínimo 24 (vinte e quatro) horas de antecedência. Faltas sem aviso prévio ou cancelamentos com menos de 24 horas poderão ser cobradas integralmente.',
        consentimentoGravacao: 'Não autorizado',
        consentimentoSupervisao: 'Não autorizado',
        observacoes: '',
        dataAssinatura: hoje.toISOString().split('T')[0],
        assinadoPaciente: false,
        assinadoProfissional: false,
        status: 'Pendente',
        documentoId: '',
        profissionalNome: user.nome,
        profissionalCrp: user.crp,
        profissionalEspecialidade: user.especialidade || (user.role === 'psicologo' || user.role === 'admin' ? 'Psicólogo' : ''),
    });

    useEffect(() => {
        if (tcleExistente) {
            setDados({
                pacienteId: tcleExistente.pacienteId || '',
                pacienteNome: tcleExistente.pacienteNome || '',
                pacienteIniciais: tcleExistente.pacienteIniciais || '',
                pacienteCor: tcleExistente.pacienteCor || '',
                pacienteCpf: tcleExistente.pacienteCpf || '',
                pacienteEmail: tcleExistente.pacienteEmail || '',
                pacienteTelefone: tcleExistente.pacienteTelefone || '',
                pacienteDataNascimento: tcleExistente.pacienteDataNascimento || '',
                tipoAtendimento: tcleExistente.tipoAtendimento || 'Psicoterapia Individual',
                modalidade: tcleExistente.modalidade || 'Presencial',
                frequenciaSessoes: tcleExistente.frequenciaSessoes || 'Semanal',
                duracaoSessoes: tcleExistente.duracaoSessoes || '50 minutos',
                valorSessao: tcleExistente.valorSessao || '',
                formaPagamento: tcleExistente.formaPagamento || '',
                sigiloProfissional: tcleExistente.sigiloProfissional || dados.sigiloProfissional,
                direitosPaciente: tcleExistente.direitosPaciente || dados.direitosPaciente,
                deveresPaciente: tcleExistente.deveresPaciente || dados.deveresPaciente,
                politicaCancelamento: tcleExistente.politicaCancelamento || dados.politicaCancelamento,
                consentimentoGravacao: tcleExistente.consentimentoGravacao || 'Não autorizado',
                consentimentoSupervisao: tcleExistente.consentimentoSupervisao || 'Não autorizado',
                observacoes: tcleExistente.observacoes || '',
                dataAssinatura: tcleExistente.dataAssinatura || '',
                assinadoPaciente: tcleExistente.assinadoPaciente || false,
                assinadoProfissional: tcleExistente.assinadoProfissional || false,
                status: tcleExistente.status || 'Pendente',
                documentoId: tcleExistente.documentoId || '',
                profissionalNome: tcleExistente.profissionalNome || user.nome,
                profissionalCrp: tcleExistente.profissionalCrp || user.crp,
                profissionalEspecialidade: tcleExistente.profissionalEspecialidade || user.especialidade || (user.role === 'psicologo' || user.role === 'admin' ? 'Psicólogo' : ''),
            });
            setPacienteBusca(tcleExistente.pacienteNome || '');
            setTcleId(tcleExistente.id);
        } else if (isNovo && location.state?.pacienteId) {
            const p = (patients || []).find(p => p.id === location.state.pacienteId);
            if (p) {
                setDados(prev => ({
                    ...prev,
                    pacienteId: p.id,
                    pacienteNome: p.nome,
                    pacienteIniciais: p.nome.split(' ').map(n => n[0]).slice(0, 2).join(''),
                    pacienteCor: p.cor || 'bg-rose-100 text-rose-600',
                    pacienteCpf: p.cpf || '',
                    pacienteEmail: p.email || '',
                    pacienteTelefone: p.telefone || '',
                    pacienteDataNascimento: p.dataNascimento || '',
                }));
                setPacienteBusca(p.nome);
            }
        }
    }, [tcleExistente, isNovo, location.state, patients]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !inputRef.current?.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const pacientesFiltrados = patients.filter(p =>
        (p.nome || '').toLowerCase().includes(pacienteBusca.toLowerCase())
    ).slice(0, 8);

    const selecionarPaciente = (p) => {
        setDados(prev => ({
            ...prev,
            pacienteId: p.id,
            pacienteNome: p.nome,
            pacienteIniciais: p.iniciais,
            pacienteCor: p.cor,
            pacienteCpf: p.cpf || '',
            pacienteEmail: p.email || '',
            pacienteTelefone: p.telefone || '',
            pacienteDataNascimento: p.dataNascimento || p.nascimento || '',
        }));
        setPacienteBusca(p.nome);
        setShowDropdown(false);
    };

    const handleChange = (campo, valor) => {
        setDados(prev => ({ ...prev, [campo]: valor }));
    };

    const handleSalvar = async (status = dados.status) => {
        if (!dados.pacienteId) {
            showToast('Selecione um paciente antes de salvar.', 'error');
            return;
        }
        setSalvando(true);
        try {
            const payload = {
                ...dados,
                status,
                documentoId: dados.documentoId || `TCLE-${Date.now().toString(36).toUpperCase()}`,
            };
            if (tcleId) {
                await updateTcle(tcleId, payload);
                showToast('TCLE atualizado com sucesso!', 'success');
            } else {
                const novo = await addTcle(payload);
                setTcleId(novo?.id || novo?.[0]?.id);
                showToast('TCLE criado com sucesso!', 'success');
            }
        } catch (err) {
            showToast('Erro ao salvar TCLE.', 'error');
        } finally {
            setSalvando(false);
        }
    };

    const handleExportPDF = async () => {
        if (!documentoRef.current) return;
        try {
            const filename = `tcle_${dados.pacienteNome.replace(/\s+/g, '_').toLowerCase()}_${formatFileId(dados.documentoId)}.pdf`;
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
                titulo: 'Termo de Consentimento Livre e Esclarecido',
                subtitulo: `Documento: ${formatDisplayId(dados.documentoId, 'TCLE')}`,
                paciente: {
                    nome: dados.pacienteNome,
                    cpf: dados.pacienteCpf,
                    nascimento: dados.pacienteDataNascimento ? (dados.pacienteDataNascimento.includes('-') ? dados.pacienteDataNascimento.split('-').reverse().join('/') : dados.pacienteDataNascimento) : '—'
                },
                dataEmissao: new Date().toLocaleDateString('pt-BR'),
                secoes: [
                    { 
                        titulo: '1. Descrição do Serviço', 
                        conteudo: `Tipo: ${dados.tipoAtendimento} | Modalidade: ${dados.modalidade} | Frequência: ${dados.frequenciaSessoes} | Duração: ${dados.duracaoSessoes}${dados.valorSessao ? ` | Valor: R$ ${dados.valorSessao}` : ''}${dados.formaPagamento ? ` | Pagamento: ${dados.formaPagamento}` : ''}`
                    },
                    { titulo: '2. Sigilo Profissional', conteudo: dados.sigiloProfissional },
                    { titulo: '3. Política de Cancelamento', conteudo: dados.politicaCancelamento },
                    { titulo: '4. Direitos do Paciente', conteudo: dados.direitosPaciente },
                    { titulo: '5. Deveres do Paciente', conteudo: dados.deveresPaciente },
                    { 
                        titulo: '6. Consentimentos Específicos', 
                        conteudo: `Gravação de sessões: ${dados.consentimentoGravacao} | Supervisão clínica: ${dados.consentimentoSupervisao}${dados.observacoes ? ` | Observações: ${dados.observacoes}` : ''}`
                    }
                ],
                profissional: {
                    nome: dados.profissionalNome,
                    crp: dados.profissionalCrp,
                    especialidade: dados.profissionalEspecialidade
                }
            };
            
            const filename = `tcle_${dados.pacienteNome.replace(/\s+/g, '_').toLowerCase()}_${formatFileId(dados.documentoId)}.docx`;
            await exportToWord(dataForWord, filename);
            showToast('Word gerado com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao gerar Word.', 'error');
        }
    };

    const handleFinalizar = async () => {
        await handleSalvar('Assinado');
    };

    const abas = [
        { id: 'identificacao', label: 'Identificação', icon: 'person' },
        { id: 'servico', label: 'Serviço', icon: 'medical_services' },
        { id: 'etica', label: 'Ética e Sigilo', icon: 'shield' },
        { id: 'direitos', label: 'Direitos e Deveres', icon: 'gavel' },
        { id: 'consentimentos', label: 'Consentimentos', icon: 'fact_check' },
        { id: 'assinatura', label: 'Assinatura', icon: 'draw' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button onClick={() => navigate('/tcles')} className="flex items-center gap-1 text-slate-400 hover:text-primary text-xs font-bold uppercase tracking-widest mb-2 transition-all">
                        <span className="material-symbols-outlined text-base">arrow_back</span> Voltar
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Termo de Consentimento Livre e Esclarecido
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Conforme Resolução CFP nº 001/2009 e Código de Ética Profissional do Psicólogo
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleSalvar()}
                        disabled={salvando}
                        className="h-10 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-lg">save</span>
                        {salvando ? 'Salvando...' : 'Salvar Rascunho'}
                    </button>
                    {/* <button
                        onClick={handleExportPDF}
                        className="h-10 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                        PDF
                    </button> */}
                    <button
                        onClick={handleExportWord}
                        className="h-10 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">description</span>
                        Word
                    </button>
                    <button
                        onClick={handleFinalizar}
                        disabled={salvando || !dados.pacienteId}
                        className="h-10 px-5 rounded-xl bg-rose-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-lg">verified</span>
                        Assinar e Finalizar
                    </button>
                </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-3 px-1">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    dados.status === 'Assinado' ? 'bg-emerald-100 text-emerald-700' :
                    dados.status === 'Revogado' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                }`}>
                    {dados.status}
                </span>
                {dados.documentoId && (
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDisplayId(dados.documentoId, 'TCLE')}</span>
                )}
            </div>

            {/* Abas */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl overflow-x-auto no-scrollbar print:hidden">
                {abas.map(aba => (
                    <button
                        key={aba.id}
                        onClick={() => setAbaAtiva(aba.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            abaAtiva === aba.id
                                ? 'bg-white dark:bg-slate-900 text-rose-500 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">{aba.icon}</span>
                        {aba.label}
                    </button>
                ))}
            </div>

            {/* Conteúdo da Aba */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                
                {/* Identificação */}
                {abaAtiva === 'identificacao' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            Identificação do Paciente
                        </h3>

                        {/* Seletor de Paciente */}
                        <div className="relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Paciente *</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-3 text-slate-400">search</span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={pacienteBusca}
                                    onChange={(e) => { setPacienteBusca(e.target.value); setShowDropdown(true); }}
                                    onFocus={() => setShowDropdown(true)}
                                    placeholder="Buscar paciente..."
                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-bold focus:border-rose-500 transition-all"
                                    autoFocus={showDropdown}
                                />
                            </div>
                            {showDropdown && pacientesFiltrados.length > 0 && (
                                <div ref={dropdownRef} className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                                    {pacientesFiltrados.map(p => (
                                        <button key={p.id} onClick={() => selecionarPaciente(p)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-all">
                                            <div className={`size-9 rounded-lg flex items-center justify-center text-xs font-bold ${p.cor || 'bg-slate-100 text-slate-500'}`}>{p.iniciais}</div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white uppercase">{p.nome}</p>
                                                <p className="text-[10px] text-slate-400">{p.cpf || 'Sem CPF'}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {dados.pacienteId && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome Completo</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{dados.pacienteNome}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">CPF</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{dados.pacienteCpf || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefone</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{dados.pacienteTelefone || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">E-mail</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{dados.pacienteEmail || '—'}</p>
                                </div>
                            </div>
                        )}

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Profissional Responsável</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome</p>
                                    <input type="text" value={dados.profissionalNome} onChange={e => handleChange('profissionalNome', e.target.value)} className="w-full text-sm font-bold text-slate-800 dark:text-white bg-transparent border-0 border-b border-dashed border-slate-200 dark:border-slate-700 focus:border-rose-500 outline-none p-0 h-6" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">CRP</p>
                                    <input type="text" value={dados.profissionalCrp || ''} onChange={e => handleChange('profissionalCrp', e.target.value)} className="w-full text-sm font-bold text-slate-800 dark:text-white bg-transparent border-0 border-b border-dashed border-slate-200 dark:border-slate-700 focus:border-rose-500 outline-none p-0 h-6" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Especialidade</p>
                                    <input type="text" value={dados.profissionalEspecialidade || ''} onChange={e => handleChange('profissionalEspecialidade', e.target.value)} className="w-full text-sm font-bold text-slate-800 dark:text-white bg-transparent border-0 border-b border-dashed border-slate-200 dark:border-slate-700 focus:border-rose-500 outline-none p-0 h-6" placeholder="Sem especialidade" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Serviço */}
                {abaAtiva === 'servico' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">medical_services</span>
                            </div>
                            Descrição do Serviço
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tipo de Atendimento</label>
                                <select value={dados.tipoAtendimento} onChange={(e) => handleChange('tipoAtendimento', e.target.value)} className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:border-rose-500 transition-all">
                                    <option>Psicoterapia Individual</option>
                                    <option>Psicoterapia de Casal</option>
                                    <option>Psicoterapia Familiar</option>
                                    <option>Psicoterapia de Grupo</option>
                                    <option>Avaliação Psicológica</option>
                                    <option>Orientação Profissional</option>
                                    <option>Neuropsicologia</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Modalidade</label>
                                <select value={dados.modalidade} onChange={(e) => handleChange('modalidade', e.target.value)} className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:border-rose-500 transition-all">
                                    <option>Presencial</option>
                                    <option>Online (Teleconsulta)</option>
                                    <option>Híbrido</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Frequência das Sessões</label>
                                <select value={dados.frequenciaSessoes} onChange={(e) => handleChange('frequenciaSessoes', e.target.value)} className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:border-rose-500 transition-all">
                                    <option>Semanal</option>
                                    <option>Quinzenal</option>
                                    <option>Mensal</option>
                                    <option>A definir conforme demanda</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Duração das Sessões</label>
                                <select value={dados.duracaoSessoes} onChange={(e) => handleChange('duracaoSessoes', e.target.value)} className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:border-rose-500 transition-all">
                                    <option>40 minutos</option>
                                    <option>50 minutos</option>
                                    <option>60 minutos</option>
                                    <option>90 minutos</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Valor por Sessão (R$)</label>
                                <input type="text" value={dados.valorSessao} onChange={(e) => handleChange('valorSessao', e.target.value)} placeholder="Ex: 200,00" className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:border-rose-500 transition-all" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Forma de Pagamento</label>
                                <input type="text" value={dados.formaPagamento} onChange={(e) => handleChange('formaPagamento', e.target.value)} placeholder="Ex: PIX, Cartão, Convênio" className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:border-rose-500 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Política de Cancelamento</label>
                            <textarea value={dados.politicaCancelamento} onChange={(e) => handleChange('politicaCancelamento', e.target.value)} rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-rose-500 transition-all resize-none leading-relaxed" />
                        </div>
                    </div>
                )}

                {/* Ética e Sigilo */}
                {abaAtiva === 'etica' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-violet-100 text-violet-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">shield</span>
                            </div>
                            Sigilo Profissional
                        </h3>
                        <div className="p-5 bg-violet-50/50 dark:bg-violet-900/10 rounded-2xl border border-violet-200/50 dark:border-violet-800/50">
                            <div className="flex items-start gap-3 mb-4">
                                <span className="material-symbols-outlined text-violet-500 text-xl mt-0.5">info</span>
                                <p className="text-xs text-violet-700 dark:text-violet-300 font-medium leading-relaxed">
                                    Este campo é baseado no <strong>Art. 9º do Código de Ética Profissional do Psicólogo</strong> (Resolução CFP nº 010/2005). 
                                    Edite conforme necessário, mantendo a conformidade com as normativas vigentes.
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Cláusula de Sigilo</label>
                            <textarea value={dados.sigiloProfissional} onChange={(e) => handleChange('sigiloProfissional', e.target.value)} rows={6} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-rose-500 transition-all resize-none leading-relaxed" />
                        </div>
                    </div>
                )}

                {/* Direitos e Deveres */}
                {abaAtiva === 'direitos' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">gavel</span>
                            </div>
                            Direitos e Deveres
                        </h3>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Direitos do Paciente</label>
                            <textarea value={dados.direitosPaciente} onChange={(e) => handleChange('direitosPaciente', e.target.value)} rows={8} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-rose-500 transition-all resize-none leading-relaxed" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Deveres do Paciente</label>
                            <textarea value={dados.deveresPaciente} onChange={(e) => handleChange('deveresPaciente', e.target.value)} rows={7} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-rose-500 transition-all resize-none leading-relaxed" />
                        </div>
                    </div>
                )}

                {/* Consentimentos */}
                {abaAtiva === 'consentimentos' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-emerald-100 text-emerald-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">fact_check</span>
                            </div>
                            Consentimentos Específicos
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">Gravação de Sessões</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Autorização para gravação em áudio ou vídeo das sessões terapêuticas.</p>
                                    </div>
                                    <select value={dados.consentimentoGravacao} onChange={(e) => handleChange('consentimentoGravacao', e.target.value)} className="h-9 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none focus:border-rose-500 transition-all">
                                        <option>Não autorizado</option>
                                        <option>Autorizado (Áudio)</option>
                                        <option>Autorizado (Vídeo)</option>
                                        <option>Autorizado (Áudio e Vídeo)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">Supervisão Clínica</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Autorização para discussão do caso em contexto de supervisão profissional, preservando anonimato.</p>
                                    </div>
                                    <select value={dados.consentimentoSupervisao} onChange={(e) => handleChange('consentimentoSupervisao', e.target.value)} className="h-9 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none focus:border-rose-500 transition-all">
                                        <option>Não autorizado</option>
                                        <option>Autorizado</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Observações Adicionais</label>
                            <textarea value={dados.observacoes} onChange={(e) => handleChange('observacoes', e.target.value)} rows={4} placeholder="Informações complementares ou cláusulas adicionais..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-rose-500 transition-all resize-none leading-relaxed" />
                        </div>
                    </div>
                )}

                {/* Assinatura */}
                {abaAtiva === 'assinatura' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">draw</span>
                            </div>
                            Declaração de Consentimento
                        </h3>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                "Declaro que fui informado(a) sobre os objetivos, procedimentos, benefícios potenciais, riscos e direitos relativos ao atendimento psicológico a que me submeto junto ao(à) profissional {dados.profissionalNome} (CRP: {dados.profissionalCrp || '—'}). 
                                <br /><br />
                                Estou ciente das condições estabelecidas neste documento, incluindo o sigilo profissional, a política de cancelamento e os consentimentos específicos acima assinalados. 
                                <br /><br />
                                Compreendo que posso revogar este consentimento a qualquer momento, sem prejuízo ao meu atendimento, mediante comunicação formal ao(à) profissional responsável."
                            </p>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Data de Assinatura</label>
                            <input type="date" value={dados.dataAssinatura} onChange={(e) => handleChange('dataAssinatura', e.target.value)} className="w-full md:w-64 h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:border-rose-500 transition-all" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                                <label className="flex items-center justify-center gap-3 cursor-pointer mb-4">
                                    <input type="checkbox" checked={dados.assinadoPaciente} onChange={(e) => handleChange('assinadoPaciente', e.target.checked)} className="size-5 accent-rose-500 rounded" />
                                    <span className="text-sm font-bold text-slate-800 dark:text-white">Paciente Assinou</span>
                                </label>
                                <div className="h-24 border-b-2 border-dashed border-slate-300 mx-8 mb-2" />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{dados.pacienteNome || 'Paciente'}</p>
                                <p className="text-[9px] text-slate-400">{dados.pacienteCpf || 'CPF'}</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                                <label className="flex items-center justify-center gap-3 cursor-pointer mb-4">
                                    <input type="checkbox" checked={dados.assinadoProfissional} onChange={(e) => handleChange('assinadoProfissional', e.target.checked)} className="size-5 accent-rose-500 rounded" />
                                    <span className="text-sm font-bold text-slate-800 dark:text-white">Profissional Assinou</span>
                                </label>
                                <div className="h-24 border-b-2 border-dashed border-slate-300 mx-8 mb-2" />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{dados.profissionalNome}</p>
                                <p className="text-[9px] text-slate-400">CRP: {dados.profissionalCrp || '—'}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-emerald-500 text-xl mt-0.5">verified_user</span>
                                <div>
                                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">Proteção CFP Garantida</p>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed">
                                                                         </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    @page { margin: 1cm; size: A4 portrait; }
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    
                    /* Desativar o Grid para evitar problemas de largura no Chrome Print */
                    .grid { display: block !important; }
                    .gap-8 { gap: 0 !important; }
                    
                    /* Ocupar a folha inteira na impressão, margens vêm do @page */
                    .max-w-7xl { max-width: none !important; margin: 0 !important; width: 100% !important; display: block !important; }
                    
                    .documento-termo { 
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
                        page-break-inside: auto !important;
                    }
                    * { color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
                }
                .documento-termo {
                    width: 100%;
                    max-width: 794px; /* A4 width */
                    margin: 0 auto;
                }
                .print-tcle {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    color: #1a1a1a;
                    line-height: 1.6;
                    padding: 50px;
                    background: white;
                }
                .print-tcle .header { border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
                .print-tcle h1 { font-size: 16pt; font-weight: 800; color: #0f172a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: -0.02em; }
                .print-tcle .header-sub { font-size: 8pt; color: #64748b; font-weight: 600; margin: 0; }
                .print-tcle h2 { font-size: 11pt; font-weight: 800; color: #334155; margin: 30px 0 12px; border-left: 4px solid #e2e8f0; padding-left: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
                .print-tcle p { font-size: 10pt; margin-bottom: 15px; text-align: justify; color: #334155; }
                .print-tcle .id-card { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px; }
                .print-tcle .label { font-weight: 800; color: #64748b; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
                .print-tcle .value { font-weight: 700; font-size: 10pt; color: #0f172a; }
                .print-tcle .signatures { 
                    margin-top: 70px; 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 50px; 
                    page-break-inside: avoid;
                }
                .print-tcle .sig-box { text-align: center; border-top: 1.5px solid #cbd5e1; padding-top: 12px; }
                .print-tcle .sig-name { font-weight: 800; font-size: 9.5pt; color: #0f172a; margin-bottom: 2px; }
                .print-tcle .sig-detail { font-size: 8pt; color: #64748b; font-weight: 500; }
                .print-tcle ul { padding-left: 18px; margin-bottom: 20px; }
                .print-tcle li { font-size: 9.5pt; margin-bottom: 10px; color: #334155; }
                .print-tcle .footer-info {
                    margin-top: 60px;
                    text-align: center;
                    font-size: 7.5pt;
                    color: #94a3b8;
                    font-weight: 500;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 20px;
                }
            `}</style>

            <div className="print-tcle hidden print:block" ref={documentoRef}>
                {/* Cabeçalho */}
                <div className="header">
                    <h1>Termo de Consentimento Livre e Esclarecido</h1>
                    <p className="header-sub">Conforme Resolução CFP nº 001/2009 e Código de Ética Profissional do Psicólogo (Res. CFP nº 010/2005)</p>
                </div>

                {/* Identificação — Cards */}
                <div className="id-card">
                    <div className="id-item">
                        <span className="label">Paciente</span>
                        <p className="value">{dados.pacienteNome}</p>
                        <p style={{ fontSize: '8pt', color: '#64748b', marginTop: '4px' }}>
                            CPF: {dados.pacienteCpf || '—'} | Telefone: {dados.pacienteTelefone || '—'}
                        </p>
                    </div>
                    <div className="id-item">
                        <span className="label">Profissional Responsável</span>
                        <p className="value">{dados.profissionalNome}</p>
                        <p style={{ fontSize: '8pt', color: '#64748b', marginTop: '4px' }}>
                            CRP: {dados.profissionalCrp || '—'} | {dados.profissionalEspecialidade || '—'}
                        </p>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="content-body">
                    <h2>1. Descrição do Serviço</h2>
                    <p className="section-text" style={{ fontSize: '9.5pt' }}>
                        Este acompanhamento consiste em <strong>{dados.tipoAtendimento}</strong>, realizado na modalidade <strong>{dados.modalidade}</strong>, com frequência <strong>{dados.frequenciaSessoes}</strong> e duração aproximada de <strong>{dados.duracaoSessoes}</strong> por encontro. 
                        {dados.valorSessao ? ` O valor acordado por sessão é de R$ ${dados.valorSessao}, pago via ${dados.formaPagamento || 'PIX/Dinheiro'}.` : ''}
                    </p>

                    <h2>2. Sigilo Profissional</h2>
                    <p className="section-text">{dados.sigiloProfissional}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginBottom: '20px' }}>
                        <div>
                            <h2>3. Direitos</h2>
                            <ul style={{ fontSize: '10pt', lineHeight: '1.6' }}>
                                {(dados.direitosPaciente || '').split('\n').filter(l => l.trim()).map((item, i) => (
                                    <li key={i}>{item.replace(/^[•\-]\s*/, '')}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2>4. Deveres</h2>
                            <ul style={{ fontSize: '10pt', lineHeight: '1.6' }}>
                                {(dados.deveresPaciente || '').split('\n').filter(l => l.trim()).map((item, i) => (
                                    <li key={i}>{item.replace(/^[•\-]\s*/, '')}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <h2>5. Política de Cancelamento</h2>
                    <p className="section-text">{dados.politicaCancelamento}</p>

                    <h2>6. Consentimentos Específicos</h2>
                    <p className="section-text">
                        <strong>Gravação de sessões:</strong> {dados.consentimentoGravacao} <br/>
                        <strong>Supervisão clínica:</strong> {dados.consentimentoSupervisao}
                        {dados.observacoes && <><br/><strong>Observações:</strong> {dados.observacoes}</>}
                    </p>

                    <div style={{ marginTop: '25px', backgroundColor: '#fdf2f2', padding: '15px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                        <h2 style={{ margin: '0 0 8px', color: '#991b1b', border: 'none' }}>7. Declaração</h2>
                        <p className="section-text" style={{ fontStyle: 'italic', color: '#7f1d1d', marginBottom: 0 }}>
                            Declaro que fui devidamente informado(a) sobre os objetivos, procedimentos, benefícios e direitos relativos ao atendimento. Estou ciente e de acordo com as cláusulas deste termo, compreendendo que posso revogá-lo a qualquer momento.
                        </p>
                    </div>
                </div>

                {/* Assinaturas */}
                <div className="signatures">
                    <div className="sig-box">
                        <div className="sig-line"></div>
                        <p className="sig-name">{dados.pacienteNome || 'Paciente'}</p>
                        <p className="sig-detail">CPF: {dados.pacienteCpf || '___.___.___-__'}</p>
                    </div>
                    <div className="sig-box">
                        <div className="sig-line"></div>
                        <p className="sig-name">{dados.profissionalNome}</p>
                        <p className="sig-detail">CRP: {dados.profissionalCrp || '—'}</p>
                    </div>
                </div>

                <div className="footer-info">
                    {hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}<br/>
                    Este documento é sigiloso e de uso exclusivo para fins terapêuticos.
                </div>
            </div>

        </div>
    );
};

export default TermoConsentimento;


