import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePatients } from '../contexts/PatientContext';
import { useEvolutions } from '../contexts/EvolutionContext';
import { useUser } from '../contexts/UserContext';
import { useFinance } from '../contexts/FinanceContext';
import { showToast } from '../components/Toast';
import { formatDisplayId, formatFileId } from '../utils/formatId';
import { evolutionSchema } from '../schemas/evolutionSchema';
import { logger } from '../utils/logger';

const tecnicasDefault = [
    { id: 1, nome: 'Reestruturação Cognitiva', checked: false },
    { id: 2, nome: 'Exposição Gradual', checked: false },
    { id: 3, nome: 'Mindfulness e Relaxamento', checked: false },
    { id: 4, nome: 'Treino de Habilidades Sociais', checked: false },
    { id: 5, nome: 'Psicoeducação', checked: false },
    { id: 6, nome: 'Regulação Emocional', checked: false },
    { id: 7, nome: 'Dessensibilização Sistemática', checked: false },
    { id: 8, nome: 'Terapia Focada em Esquemas', checked: false },
];

const tiposAtendimento = [
    'Psicoterapia Individual',
    'Psicoterapia de Casal',
    'Psicoterapia de Grupo',
    'Avaliação Psicológica',
    'Orientação Parental',
    'Supervisão Clínica',
];

const soapSections = [
    {
        key: 'subjetivo',
        letra: 'S',
        titulo: 'Subjetivo',
        subtitulo: 'Relato do Paciente',
        cor: 'from-blue-500 to-blue-600',
        corBg: 'bg-blue-50 dark:bg-blue-900/10',
        corBorder: 'border-blue-200 dark:border-blue-800',
        corText: 'text-blue-600',
        icon: 'record_voice_over',
        placeholder: 'Registre o que o paciente trouxe espontaneamente na sessão: queixas, sentimentos, pensamentos, eventos relevantes da semana, percepções sobre o progresso terapêutico, relatos sobre relações e situações, etc.\n\nEx: "Paciente relata melhora na qualidade do sono após iniciar técnicas de relaxamento. Refere episódio de ansiedade intensa no trabalho durante reunião de feedback..."',
    },
    {
        key: 'objetivo',
        letra: 'O',
        titulo: 'Objetivo',
        subtitulo: 'Observação Clínica',
        cor: 'from-emerald-500 to-emerald-600',
        corBg: 'bg-emerald-50 dark:bg-emerald-900/10',
        corBorder: 'border-emerald-200 dark:border-emerald-800',
        corText: 'text-emerald-600',
        icon: 'visibility',
        placeholder: 'Registre suas observações objetivas durante a sessão: aparência, comportamento, afeto, humor observado, linguagem corporal, coerência do discurso, nível de engajamento, reações emocionais, indicadores clínicos mensuráveis.\n\nEx: "Paciente apresentou-se com boa aparência, contato visual adequado. Afeto congruente ao discurso. Demonstrou choro contido ao relatar conflito familiar..."',
    },
    {
        key: 'avaliacao',
        letra: 'A',
        titulo: 'Avaliação',
        subtitulo: 'Análise Clínica',
        cor: 'from-amber-500 to-amber-600',
        corBg: 'bg-amber-50 dark:bg-amber-900/10',
        corBorder: 'border-amber-200 dark:border-amber-800',
        corText: 'text-amber-600',
        icon: 'psychology',
        placeholder: 'Registre sua análise e formulação clínica: hipóteses diagnósticas, evolução do quadro, conexão entre os dados subjetivos e objetivos, progressos e retrocessos, reavaliação de metas terapêuticas.\n\nEx: "Observa-se evolução positiva no manejo da ansiedade em contextos sociais. Padrão de evitação experiencial ainda presente em situações laborais..."',
    },
    {
        key: 'plano',
        letra: 'P',
        titulo: 'Plano',
        subtitulo: 'Conduta Terapêutica',
        cor: 'from-violet-500 to-violet-600',
        corBg: 'bg-violet-50 dark:bg-violet-900/10',
        corBorder: 'border-violet-200 dark:border-violet-800',
        corText: 'text-violet-600',
        icon: 'checklist',
        placeholder: 'Registre o plano de ação: objetivos para próxima sessão, técnicas a serem aplicadas, tarefas de casa, encaminhamentos, ajustes no plano terapêutico, necessidade de reavaliação, contato com outros profissionais.\n\nEx: "Próxima sessão: trabalhar exposição gradual em situações de reunião. Tarefa: registro diário de pensamentos automáticos. Manter frequência semanal..."',
    },
];

const EvolucaoSessao = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const { patients } = usePatients();
    const { evolutions, addEvolution, getEvolutionById, updateEvolution } = useEvolutions();
    const { user } = useUser();
    const evolutionRef = useRef();

    const evolucaoExistente = useMemo(() => {
        if (id && id !== 'novo') return getEvolutionById(id);
        return null;
    }, [id, getEvolutionById]);

    const isVisualizando = useMemo(() => {
        const status = evolucaoExistente?.status || location.state?.documentoReferencia?.status;
        return status === 'Finalizado' || status === 'Assinado';
    }, [evolucaoExistente, location.state]);

    const [modoEdicao, setModoEdicao] = useState(() => {
        if (location.state?.modoEdicao) return true;
        return !isVisualizando;
    });

    const [buscaPaciente, setBuscaPaciente] = useState('');
    const [dropdownAberto, setDropdownAberto] = useState(id === 'novo' && !location.state?.pacienteId);
    const [secaoAberta, setSecaoAberta] = useState('subjetivo');
    const [salvando, setSalvando] = useState(false);
    const [novaTecnica, setNovaTecnica] = useState('');

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        resolver: zodResolver(evolutionSchema),
        defaultValues: {
            dataHora: '',
            tipoAtendimento: 'Psicoterapia Individual',
            duracaoSessao: 50,
            numeroSessao: '',
            pacienteId: '',
            pacienteNome: '',
            subjetivo: '',
            objetivo: '',
            avaliacao: '',
            plano: '',
            humorPaciente: 'neutro',
            nivelRisco: 'baixo',
            observacoes: '',
            tecnicas: tecnicasDefault
        }
    });

    const formValues = watch();

    useEffect(() => {
        const now = new Date();
        const defaultDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

        if (evolucaoExistente) {
            let dataFormatted = evolucaoExistente.dataHora;
            if (typeof dataFormatted === 'string' && dataFormatted.includes('T')) {
                dataFormatted = dataFormatted.slice(0, 16);
            } else {
                try {
                    const d = new Date(evolucaoExistente.dataHora);
                    if (!isNaN(d.getTime())) {
                        dataFormatted = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                    }
                } catch (e) {
                    dataFormatted = defaultDate;
                }
            }

            const savedTecnicas = evolucaoExistente.tecnicas || [];
            const baseTecnicas = [...tecnicasDefault];
            const normalizedSaved = savedTecnicas.map(t => 
                typeof t === 'string' ? { id: Math.random(), nome: t, checked: true } : t
            );

            normalizedSaved.forEach(s => {
                const idx = baseTecnicas.findIndex(b => b.nome === s.nome);
                if (idx !== -1) {
                    baseTecnicas[idx] = { ...baseTecnicas[idx], ...s };
                } else {
                    baseTecnicas.push(s);
                }
            });

            reset({
                dataHora: dataFormatted,
                tipoAtendimento: evolucaoExistente.tipoAtendimento || evolucaoExistente.tipo || 'Psicoterapia Individual',
                duracaoSessao: evolucaoExistente.duracaoSessao || evolucaoExistente.duration || 50,
                numeroSessao: evolucaoExistente.numeroSessao || evolucaoExistente.session_number || '',
                pacienteId: evolucaoExistente.pacienteId || '',
                pacienteNome: evolucaoExistente.pacienteNome || '',
                subjetivo: evolucaoExistente.conteudo?.subjetivo || evolucaoExistente.subjetivo || evolucaoExistente.evolucao || '',
                objetivo: evolucaoExistente.conteudo?.objetivo || evolucaoExistente.objetivo || '',
                avaliacao: evolucaoExistente.conteudo?.avaliacao || evolucaoExistente.avaliacao || '',
                plano: evolucaoExistente.conteudo?.plano || evolucaoExistente.plano || evolucaoExistente.planejamento || '',
                humorPaciente: evolucaoExistente.humor || evolucaoExistente.humorPaciente || 'neutro',
                nivelRisco: evolucaoExistente.nivelRisco || evolucaoExistente.nivel_risco || 'baixo',
                observacoes: evolucaoExistente.observacoes || '',
                tecnicas: baseTecnicas
            });
        } else {
            reset({
                dataHora: defaultDate,
                tipoAtendimento: 'Psicoterapia Individual',
                duracaoSessao: 50,
                numeroSessao: '',
                pacienteId: '',
                pacienteNome: '',
                subjetivo: '',
                objetivo: '',
                avaliacao: '',
                plano: '',
                humorPaciente: 'neutro',
                nivelRisco: 'baixo',
                observacoes: '',
                tecnicas: tecnicasDefault
            });
        }
    }, [evolucaoExistente, reset]);
    const handleExportPDF = async () => {
        if (!evolutionRef.current) return;
        try {
            const { exportToPDF } = await import('../utils/exportUtils');
            const nomePaciente = formValues.pacienteNome || 'paciente';
            const dataStr = new Date(formValues.dataHora).toLocaleDateString('pt-BR').replace(/\//g, '-');
            const sanitizedId = formatFileId(id || 'novo');
            const filename = `evolucao_${formatFileId(nomePaciente)}_${sanitizedId}_${dataStr}.pdf`;
            
            await exportToPDF(evolutionRef.current, filename);
            showToast('PDF gerado com sucesso!', 'success');
        } catch (error) {
            logger.error('Erro na exportação PDF:', error);
            showToast(`Erro técnico: ${error.message}. Use Ctrl+P.`, 'error');
        }
    };

    const pacientesFiltrados = useMemo(() => {
        if (!buscaPaciente) return patients.filter(p => p.status === 'Ativo');
        return patients.filter(p =>
            p.status === 'Ativo' &&
            (p.nome.toLowerCase().includes(buscaPaciente.toLowerCase()) || p.id.toLowerCase().includes(buscaPaciente.toLowerCase()))
        );
    }, [patients, buscaPaciente]);

    const selecionarPaciente = (p) => {
        setValue('pacienteId', p.id);
        setValue('pacienteNome', p.nome);
        setBuscaPaciente('');
        setDropdownAberto(false);
    };

    const toggleTecnica = (tid) => {
        if (!modoEdicao) return;
        const updated = formValues.tecnicas.map(t => t.id === tid ? { ...t, checked: !t.checked } : t);
        setValue('tecnicas', updated);
    };

    const adicionarTecnica = () => {
        if (!novaTecnica.trim() || !modoEdicao) return;
        const nova = { id: Date.now(), nome: novaTecnica.trim(), checked: true };
        setValue('tecnicas', [...formValues.tecnicas, nova]);
        setNovaTecnica('');
    };

    const { addTransaction } = useFinance();

    // Automação: Sugerir próximo número de sessão
    useEffect(() => {
        if (formValues.pacienteId && !evolucaoExistente && !formValues.numeroSessao) {
            const count = evolutions.filter(ev => ev.pacienteId === formValues.pacienteId).length;
            setValue('numeroSessao', String(count + 1));
        }
    }, [formValues.pacienteId, evolucaoExistente, evolutions, formValues.numeroSessao, setValue]);

    const onSubmit = async (data, finalizar = false) => {
        setSalvando(true);
        
        const pac = patients.find(p => p.id === data.pacienteId);

        const dados = {
            ...data,
            pacienteIniciais: pac?.iniciais,
            pacienteCor: pac?.cor,
            evolucao: data.subjetivo, // backwards compat
            planejamento: data.plano, // backwards compat
            formato: 'SOAP',
            status: finalizar ? 'Finalizado' : 'Rascunho',
            profissionalNome: user.nome,
            profissionalCrp: user.crp,
        };

        try {
            if (evolucaoExistente) {
                await updateEvolution(evolucaoExistente.id, dados);
                showToast(finalizar ? `Evolução de ${data.pacienteNome} finalizada! ✅` : `Rascunho salvo! 📝`, 'success');
            } else {
                await addEvolution(dados);
                showToast(finalizar ? `Evolução de ${data.pacienteNome} registrada! ✅` : `Rascunho salvo! 📝`, 'success');
                
                // Automação: Faturamento Automático
                if (finalizar && pac) {
                    const valorStr = pac.precoSessao || '0,00';
                    const valorNum = parseFloat(valorStr.replace('.', '').replace(',', '.')) || 0;
                    
                    addTransaction({
                        desc: `Sessão #${data.numeroSessao || '1'} — ${pac.nome}`,
                        data: data.dataHora.split('T')[0],
                        dataVencimento: data.dataHora.split('T')[0],
                        tipo: 'Receita',
                        valor: valorNum,
                        status: 'Recebido',
                        formaPag: 'pix',
                        categoria: 'clinica',
                        subcategoria: 'sessao'
                    });
                }
            }
            
            if (finalizar) {
                navigate(-1);
            }
        } catch (error) {
            logger.error('Erro ao salvar evolução:', error);
            showToast('Erro ao salvar os dados.', 'error');
        } finally {
            setSalvando(false);
        }
    };
    const humores = [
        { v: 'muito_baixo', icon: 'sentiment_very_dissatisfied', label: 'Muito Baixo', color: 'text-red-500 bg-red-50 border-red-300' },
        { v: 'baixo', icon: 'sentiment_dissatisfied', label: 'Baixo', color: 'text-orange-500 bg-orange-50 border-orange-300' },
        { v: 'neutro', icon: 'sentiment_neutral', label: 'Neutro', color: 'text-slate-500 bg-slate-50 border-slate-300' },
        { v: 'bom', icon: 'sentiment_satisfied', label: 'Bom', color: 'text-emerald-500 bg-emerald-50 border-emerald-300' },
        { v: 'muito_bom', icon: 'sentiment_very_satisfied', label: 'Muito Bom', color: 'text-green-500 bg-green-50 border-green-300' },
    ];

    const formatarDataExibicao = (str) => {
        if (!str) return '';
        try {
            const dt = new Date(str);
            if (isNaN(dt.getTime())) return str;
            return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' às ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return str;
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportWord = async () => {
        try {
            const { exportToWord } = await import('../utils/exportUtils');
            const nomePaciente = formValues.pacienteNome || 'Paciente';
            const pac = patients.find(p => p.id === formValues.pacienteId);
            const dataStr = formValues.dataHora ? new Date(formValues.dataHora).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
            const horaStr = formValues.dataHora ? new Date(formValues.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
            
            const humorLabel = humores.find(h => h.v === formValues.humorPaciente)?.label || formValues.humorPaciente;
            const riscoLabel = [
                { v: 'baixo', label: 'Baixo' },
                { v: 'moderado', label: 'Moderado' },
                { v: 'alto', label: 'Alto' },
                { v: 'critico', label: 'Crítico' },
            ].find(r => r.v === formValues.nivelRisco)?.label || formValues.nivelRisco;
            
            const tecnicasAplicadas = (formValues.tecnicas || []).filter(t => t.checked).map(t => t.nome).join(', ') || 'Nenhuma técnica registrada';

            const secoes = [];
            
            if (formValues.subjetivo) secoes.push({ titulo: 'S — Subjetivo (Relato do Paciente)', conteudo: formValues.subjetivo });
            if (formValues.objetivo) secoes.push({ titulo: 'O — Objetivo (Observação Clínica)', conteudo: formValues.objetivo });
            if (formValues.avaliacao) secoes.push({ titulo: 'A — Avaliação (Análise Clínica)', conteudo: formValues.avaliacao });
            if (formValues.plano) secoes.push({ titulo: 'P — Plano (Conduta Terapêutica)', conteudo: formValues.plano });
            
            secoes.push({
                titulo: 'Dados Complementares',
                conteudo: `Humor do Paciente: ${humorLabel}\nAvaliação de Risco: ${riscoLabel}\nTécnicas Aplicadas: ${tecnicasAplicadas}${formValues.observacoes ? '\n\nObservações Internas: ' + formValues.observacoes : ''}`
            });

            const dataForWord = {
                titulo: 'Evolução de Sessão — SOAP',
                subtitulo: `Sessão #${formValues.numeroSessao || '-'} · ${formValues.tipoAtendimento} · ${formValues.duracaoSessao} min`,
                paciente: {
                    nome: nomePaciente,
                    cpf: pac?.cpf || '—',
                    nascimento: pac?.dataNascimento || pac?.nascimento || '—'
                },
                dataEmissao: `${dataStr}${horaStr ? ' às ' + horaStr : ''}`,
                secoes,
                profissional: {
                    nome: user.nome,
                    crp: user.crp,
                    especialidade: user.especialidade || 'Psicólogo(a)'
                }
            };

            const cleanNome = formatFileId(nomePaciente);
            const sanitizedId = formatFileId(id || 'novo');
            const filename = `evolucao_${cleanNome}_${sanitizedId}_sessao${formValues.numeroSessao || 'X'}_${dataStr.replace(/\//g, '-')}.docx`;
            await exportToWord(dataForWord, filename);
            showToast('Word gerado com sucesso!', 'success');
        } catch (error) {
            logger.error('Erro ao gerar Word:', error);
            showToast('Erro ao gerar Word.', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-20">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors mb-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        {!modoEdicao ? 'Visualizar Evolução' : evolucaoExistente ? 'Editar Evolução' : 'Nova Evolução de Sessão'}
                        <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg text-xs font-black tracking-wider">SOAP</span>
                    </h1>
                    <p className="text-sm text-slate-500 flex items-center gap-2 flex-wrap">
                        {formValues.pacienteId ? (
                            <>
                                Paciente: <span className="text-primary font-bold">{formValues.pacienteNome}</span>
                                <span className="opacity-30">·</span>
                                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{formatDisplayId(formValues.pacienteId, 'PAC')}</span>
                                {!modoEdicao && (
                                    <>
                                        <span className="opacity-30">·</span>
                                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold text-[11px]">
                                            <span className="material-symbols-outlined text-[14px]">event</span>
                                            {new Date(formValues.dataHora).toLocaleString('pt-BR')}
                                        </span>
                                    </>
                                )}
                            </>
                        ) : (
                            <span className="text-amber-500 font-medium">⚠ Selecione um paciente para iniciar</span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3 print:hidden">
                    {!modoEdicao ? (
                        <button type="button" onClick={() => setModoEdicao(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                            <span className="material-symbols-outlined text-base">edit</span> Editar
                        </button>
                    ) : (
                        <>
                            <button type="button" onClick={handleSubmit((d) => onSubmit(d, false))} disabled={salvando} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 hover:border-primary transition-all shadow-sm disabled:opacity-50">
                                <span className="material-symbols-outlined text-sm">save</span> Salvar Rascunho
                            </button>
                            <button type="button" onClick={handleSubmit((d) => onSubmit(d, true))} disabled={salvando || !formValues.pacienteId}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 uppercase tracking-widest text-xs">
                                {salvando ? (<><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>) : (<><span className="material-symbols-outlined text-sm">check_circle</span> Finalizar Registro</>)}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8" ref={evolutionRef}>
                {/* Main Column (2/3) */}
                <div className="lg:col-span-2 space-y-0">
                    {/* Paciente Seletor */}
                    {/* Paciente Seletor */}
                    {!formValues.pacienteId && modoEdicao && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-primary/30 shadow-sm overflow-visible relative mb-6">
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-primary">person_search</span>
                                    <h2 className="font-bold text-slate-900 dark:text-white text-sm">Selecionar Paciente</h2>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                    <input className={`w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm ${errors.pacienteId ? 'border-rose-300' : 'border-slate-200 dark:border-slate-700'}`} placeholder="Buscar paciente por nome ou ID..." value={buscaPaciente} onChange={e => { setBuscaPaciente(e.target.value); setDropdownAberto(true); }} onFocus={() => setDropdownAberto(true)} autoFocus />
                                    {dropdownAberto && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-[280px] overflow-y-auto">
                                            {pacientesFiltrados.length === 0 ? (
                                                <div className="p-4 text-center text-slate-400 text-sm">Nenhum paciente encontrado</div>
                                            ) : pacientesFiltrados.map(p => (
                                                <button key={p.id} type="button" onClick={() => selecionarPaciente(p)} className="w-full flex items-center gap-3 p-3 hover:bg-primary/5 transition-colors text-left border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                    <div className={`size-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${p.cor || 'bg-primary/10 text-primary'}`}>{p.iniciais}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.nome}</p>
                                                        <p className="text-[10px] text-slate-400">ID: {formatDisplayId(p.id, 'PAC')}</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-slate-300 text-lg flex-shrink-0">chevron_right</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {errors.pacienteId && <p className="mt-2 text-[10px] text-rose-500 font-bold uppercase">{errors.pacienteId.message}</p>}
                            </div>
                        </div>
                    )}

                    {/* Paciente selecionado */}
                    {formValues.pacienteId && (
                        <div className="bg-white dark:bg-slate-900 rounded-t-2xl border border-slate-200 dark:border-slate-800 border-b-0 p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {(() => {
                                        const pac = patients.find(p => p.id === formValues.pacienteId);
                                        return (
                                            <>
                                                <div className={`size-12 rounded-full flex items-center justify-center text-sm font-bold ${pac?.cor || 'bg-primary/10 text-primary'}`}>{pac?.iniciais}</div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white">{formValues.pacienteNome}</p>
                                                    <p className="text-xs text-slate-500">{formatDisplayId(formValues.pacienteId, 'PAC')} · {formValues.tipoAtendimento}</p>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                                <div className="flex items-center gap-3">
                                    {formValues.numeroSessao && (
                                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-black">Sessão #{formValues.numeroSessao}</span>
                                    )}
                                    {modoEdicao && (
                                        <button type="button" onClick={() => { setValue('pacienteId', ''); setDropdownAberto(true); }} className="text-xs font-bold text-primary hover:text-primary/70 transition-colors flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">swap_horiz</span> Trocar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SOAP Sections */}
                    {soapSections.map((section, idx) => (
                        <div
                            key={section.key}
                            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-t-0 ${idx === soapSections.length - 1 ? 'rounded-b-2xl' : ''} transition-all overflow-hidden`}
                        >
                            <button
                                type="button"
                                onClick={() => setSecaoAberta(secaoAberta === section.key ? null : section.key)}
                                className={`w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`size-10 rounded-xl bg-gradient-to-br ${section.cor} flex items-center justify-center text-white font-black text-lg shadow-lg`}>
                                        {section.letra}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                            {section.titulo}
                                            {formValues[section.key]?.trim() && (
                                                <span className={`material-symbols-outlined text-sm ${section.corText}`}>check_circle</span>
                                            )}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{section.subtitulo}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {formValues[section.key]?.trim() && (
                                        <span className="text-[10px] font-bold text-slate-400">{formValues[section.key].length} chars</span>
                                    )}
                                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${secaoAberta === section.key ? 'rotate-180' : ''}`}>expand_more</span>
                                </div>
                            </button>
                            {secaoAberta === section.key && (
                            <div className={`px-6 pb-6 ${section.corBg} mx-4 mb-4 rounded-xl border ${section.corBorder} print:bg-white print:border-none print:m-0 print:p-0`}>
                                <div className="flex items-center gap-2 py-3 border-b border-slate-200/50 mb-3 print:hidden">
                                    <span className={`material-symbols-outlined ${section.corText} text-lg`}>{section.icon}</span>
                                    <span className={`text-xs font-black ${section.corText} uppercase tracking-wider`}>{section.titulo} — {section.subtitulo}</span>
                                </div>
                                {ultimaEvolucao?.plano && section.key === 'subjetivo' && (
                                    <div className="mb-4 p-3 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-xl flex items-start gap-3 print:hidden">
                                        <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">psychology_alt</span>
                                        <div>
                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">Jarvis Mode: Plano da Sessão Anterior</p>
                                            <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">"{ultimaEvolucao.plano}"</p>
                                        </div>
                                    </div>
                                )}
                                {modoEdicao ? (
                                    <>
                                        <textarea
                                            {...register(section.key)}
                                            className={`w-full text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/50 border rounded-xl outline-none resize-none min-h-[160px] p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all print:border-none print:p-2 print:text-black ${errors[section.key] ? 'border-rose-300' : 'border-slate-200/50 dark:border-slate-700/50'}`}
                                            placeholder={section.placeholder}
                                        />
                                        {errors[section.key] && <p className="mt-1 text-[10px] text-rose-500 font-bold uppercase">{errors[section.key].message}</p>}
                                    </>
                                ) : (
                                    <div className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap p-4 bg-white/70 dark:bg-slate-800/50 rounded-xl min-h-[80px] border border-slate-200/50 print:border-none print:p-2 print:text-black">
                                        {formValues[section.key] || <span className="text-slate-400 italic">Não preenchido</span>}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Versão de Impressão (sempre visível no print) */}
                        <div className="hidden print:block px-8 py-4 bg-white">
                            <h3 className="text-sm font-bold text-slate-900 mb-2 border-b pb-1 uppercase tracking-widest flex items-center gap-2">
                                <span className={`size-3 rounded-full bg-slate-200`}></span>
                                {section.titulo}
                            </h3>
                            <div className="text-[12px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                                {soapValues[section.key] || 'Não preenchido.'}
                            </div>
                        </div>
                        </div>
                    ))}

                    {/* Humor + Risco */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary">mood</span>
                                <h2 className="font-bold text-slate-900 dark:text-white">Humor do Paciente</h2>
                            </div>
                            <div className="flex gap-2">
                                {humores.map(h => (
                                    <button key={h.v} type="button" onClick={() => modoEdicao && setValue('humorPaciente', h.v)}
                                        className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${!modoEdicao ? 'cursor-default' : 'cursor-pointer'} ${formValues.humorPaciente === h.v ? h.color : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                        <span className="material-symbols-outlined text-2xl">{h.icon}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider">{h.label}</span>
                                    </button>
                                ))}
                            </div>
                            {errors.humorPaciente && <p className="mt-2 text-[10px] text-rose-500 font-bold uppercase">{errors.humorPaciente.message}</p>}
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary">shield</span>
                                <h2 className="font-bold text-slate-900 dark:text-white">Avaliação de Risco</h2>
                            </div>
                            <div className="flex gap-2">
                                {[
                                    { v: 'baixo', label: 'Baixo', color: 'text-green-600 bg-green-50 border-green-400' },
                                    { v: 'moderado', label: 'Moderado', color: 'text-amber-600 bg-amber-50 border-amber-400' },
                                    { v: 'alto', label: 'Alto', color: 'text-orange-600 bg-orange-50 border-orange-400' },
                                    { v: 'critico', label: 'Crítico', color: 'text-red-600 bg-red-50 border-red-400' },
                                ].map(r => (
                                    <button key={r.v} type="button" onClick={() => modoEdicao && setValue('nivelRisco', r.v)}
                                        className={`flex-1 py-3 rounded-xl text-xs font-bold border-2 transition-all ${!modoEdicao ? 'cursor-default' : 'cursor-pointer'} ${formValues.nivelRisco === r.v ? r.color : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                            {errors.nivelRisco && <p className="mt-2 text-[10px] text-rose-500 font-bold uppercase">{errors.nivelRisco.message}</p>}
                        </div>
                    </div>

                    {/* Técnicas + Obs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary">science</span>
                                <h2 className="font-bold text-slate-900 dark:text-white">Técnicas Aplicadas</h2>
                            </div>
                            <div className="space-y-2 mb-4 max-h-[220px] overflow-y-auto">
                                {(formValues.tecnicas || []).filter(t => modoEdicao || t.checked).map(t => (
                                    <label key={t.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${modoEdicao ? 'cursor-pointer' : 'cursor-default'} ${t.checked ? 'bg-primary/5 border-primary/20' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                        <input type="checkbox" checked={t.checked} onChange={() => toggleTecnica(t.id)} className="size-5 rounded accent-primary" disabled={!modoEdicao} />
                                        <span className={`text-sm font-medium ${t.checked ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}>{t.nome}</span>
                                    </label>
                                ))}
                                {!modoEdicao && (formValues.tecnicas || []).filter(t => t.checked).length === 0 && (
                                    <p className="text-sm text-slate-400 italic p-3">Nenhuma técnica</p>
                                )}
                            </div>
                            {modoEdicao && (
                                <div className="flex gap-2">
                                    <input className="flex-1 h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none placeholder:text-slate-400" placeholder="+ técnica..." value={novaTecnica} onChange={e => setNovaTecnica(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionarTecnica()} />
                                    <button type="button" onClick={adicionarTecnica} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors">Adicionar</button>
                                </div>
                            )}
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-300 dark:border-amber-500/30 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500">lock</span>
                                    <h2 className="font-bold text-slate-900 dark:text-white">Observações Internas</h2>
                                </div>
                                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase">Confidencial</span>
                            </div>
                            <p className="text-[10px] text-slate-400 italic mb-3">Notas privadas — não aparecem em laudos ou relatórios.</p>
                            {modoEdicao ? (
                                <textarea {...register('observacoes')} className="w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-300 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-xl outline-none resize-none placeholder:text-slate-400 min-h-[140px]" placeholder="Anotações para supervisão ou próximos passos..." />
                            ) : (
                                <div className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 bg-amber-50/50 border border-amber-200 rounded-xl min-h-[80px] whitespace-pre-wrap">
                                    {formValues.observacoes || <span className="text-slate-400 italic">Sem observações</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                    {/* Sidebar - Ocultar na Impressão Central */}
                    <div className="space-y-6 print:hidden">
                        {/* SOAP Progress */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-rose-500">bar_chart</span> Progresso SOAP
                        </h4>
                        {(() => {
                            const preenchimento = soapSections.filter(s => formValues[s.key]?.trim().length > 0).length;
                            const progresso = Math.round((preenchimento / 4) * 100);
                            return (
                                <>
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                            <span>{preenchimento}/4 seções</span>
                                            <span>{progresso}%</span>
                                        </div>
                                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all" style={{ width: `${progresso}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mt-4">
                                        {soapSections.map(s => (
                                            <button
                                                key={s.key}
                                                type="button"
                                                onClick={() => setSecaoAberta(s.key)}
                                                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${formValues[s.key]?.trim()
                                                    ? `${s.corBg} ${s.corText} border ${s.corBorder}`
                                                    : secaoAberta === s.key
                                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-transparent hover:border-slate-200'
                                                    }`}
                                            >
                                                <span className={`text-lg font-black`}>{s.letra}</span>
                                                <span className="text-[8px] font-bold uppercase">{s.titulo}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* Info da Sessão - Sempre visível, mas com estilos diferentes */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Dados da Sessão</h4>
                        {!modoEdicao ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data e Hora</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{new Date(formValues.dataHora).toLocaleString('pt-BR')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                                        <span className="material-symbols-outlined text-lg">medical_services</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{formValues.tipoAtendimento}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                            <span className="material-symbols-outlined text-lg">timer</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duração</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{formValues.duracaoSessao} min</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                                            <span className="material-symbols-outlined text-lg">tag</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Número</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Sessão #{formValues.numeroSessao || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Data e Hora</label>
                                    <input type="datetime-local" {...register('dataHora')} className={`w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.dataHora ? 'border-rose-300' : 'border-slate-200 dark:border-slate-700'}`} />
                                    {errors.dataHora && <p className="mt-1 text-[10px] text-rose-500 font-bold">{errors.dataHora.message}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tipo de Atendimento</label>
                                    <select {...register('tipoAtendimento')} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none">
                                        {tiposAtendimento.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Duração (min)</label>
                                        <input type="number" {...register('duracaoSessao')} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nº Sessão</label>
                                        <input type="number" {...register('numeroSessao')} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none" placeholder="Ex: 12" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Paciente Info */}
                    {pacienteSelecionado && modoEdicao && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Trocar Paciente</h4>
                            <div className="flex items-center gap-2 p-2.5 bg-primary/5 rounded-xl border border-primary/20">
                                <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${pacienteSelecionado.cor || 'bg-primary/10 text-primary'}`}>{pacienteSelecionado.iniciais}</div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{pacienteSelecionado.nome}</p>
                                    <p className="text-[10px] text-slate-400">{pacienteSelecionado.id}</p>
                                </div>
                                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                            </div>
                        </div>
                    )}

                    {/* Ações */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-rose-500">bolt</span> Ações
                        </h4>
                        <div className="space-y-3">
                            {modoEdicao ? (
                                <>
                                    <button type="button" onClick={handleSubmit((d) => onSubmit(d, false))} disabled={salvando} className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                                        <span className="material-symbols-outlined text-sm">save</span> Salvar Rascunho
                                    </button>
                                    <button type="button" onClick={handleSubmit((d) => onSubmit(d, true))} disabled={salvando || !formValues.pacienteId} className="w-full py-3.5 bg-rose-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-200/50 hover:scale-[1.02] transition-all disabled:opacity-50">
                                        <span className="material-symbols-outlined text-sm">check_circle</span> Finalizar Registro
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="size-14 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                        <span className="material-symbols-outlined text-3xl text-emerald-600">task_alt</span>
                                    </div>
                                    <p className="text-sm font-black text-emerald-700">Documento {evolucaoExistente?.status || 'Finalizado'}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Este documento está bloqueado para edição direta.</p>
                                    
                                    <div className="mt-6 flex flex-col gap-2">
                                        {/* <button 
                                            onClick={handleExportPDF}
                                            className="w-full py-3 bg-primary text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                                        >
                                            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                                            Salvar como PDF
                                        </button> */}
                                        <button onClick={() => setModoEdicao(true)} className="mt-3 text-xs font-bold text-primary hover:underline">Reabrir para Edição</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profissional */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Profissional</h4>
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-xs font-black">
                                {(evolucaoExistente?.profissionalNome || user.nome)?.charAt((evolucaoExistente?.profissionalNome || user.nome)?.startsWith('Dr.') ? 4 : 0)}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{evolucaoExistente?.profissionalNome || user.nome}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{evolucaoExistente?.profissionalCrp || user.crp || 'CRP não informado'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== DOCUMENTO EXCLUSIVO PARA IMPRESSÃO ===== */}
            <div className="hidden print:block" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {/* Cabeçalho */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#8b5cf6', margin: 0 }}>Meu Sistema Psi</h2>
                        <p style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Clínica de Psicologia Especializada</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', color: '#0f172a', margin: 0 }}>Evolução de Sessão</h3>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', margin: '2px 0 0' }}>Formato SOAP</p>
                    </div>
                </div>

                {/* Dados do Paciente */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 18px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 8px' }}>Dados do Paciente</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                        <div>
                            <p style={{ fontSize: '8px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Paciente</p>
                            <p style={{ fontSize: '12px', fontWeight: 900, color: '#0f172a', margin: 0 }}>{pacienteSelecionado?.nome || '—'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '8px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>CPF</p>
                            <p style={{ fontSize: '12px', fontWeight: 700, color: '#334155', margin: 0 }}>{pacienteSelecionado?.cpf || '___.___.___-__'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '8px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Data / Hora</p>
                            <p style={{ fontSize: '12px', fontWeight: 700, color: '#334155', margin: 0 }}>{formatarDataExibicao(dataHora)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '8px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Sessão / Tipo</p>
                            <p style={{ fontSize: '12px', fontWeight: 700, color: '#334155', margin: 0 }}>#{numeroSessao || '-'} · {tipoAtendimento} · {duracaoSessao} min</p>
                        </div>
                    </div>
                </div>

                {/* Seções SOAP */}
                {soapSections.map(section => {
                    const val = formValues[section.key];
                    if (!val?.trim()) return null;
                    const colors = {
                        subjetivo: '#3b82f6',
                        objetivo: '#10b981',
                        avaliacao: '#f59e0b',
                        plano: '#8b5cf6'
                    };
                    return (
                        <div key={section.key} style={{ marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <div style={{ width: '4px', height: '18px', borderRadius: '4px', background: colors[section.key] }}></div>
                                <p style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#0f172a', margin: 0 }}>
                                    {section.letra} — {section.subtitulo}
                                </p>
                            </div>
                            <div style={{ fontSize: '11px', lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word', paddingLeft: '12px' }}>
                                {val}
                            </div>
                        </div>
                    );
                })}

                {/* Humor + Risco + Técnicas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px', marginBottom: '16px' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
                        <p style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Humor do Paciente</p>
                        <p style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{humores.find(h => h.v === humorPaciente)?.label || humorPaciente}</p>
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
                        <p style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Avaliação de Risco</p>
                        <p style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{{baixo: 'Baixo', moderado: 'Moderado', alto: 'Alto', critico: 'Crítico'}[nivelRisco] || nivelRisco}</p>
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
                        <p style={{ fontSize: '8px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Técnicas Aplicadas</p>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#334155', margin: 0 }}>{tecnicas.filter(t => t.checked).map(t => t.nome).join(', ') || 'Nenhuma'}</p>
                    </div>
                </div>

                {/* Observações (se houver) */}
                {observacoes && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                        <p style={{ fontSize: '8px', fontWeight: 900, color: '#d97706', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Observações Internas (Confidencial)</p>
                        <p style={{ fontSize: '11px', lineHeight: 1.7, color: '#92400e', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word', margin: 0 }}>{observacoes}</p>
                    </div>
                )}

                {/* Assinatura */}
                <div style={{ marginTop: '40px', paddingTop: '16px', borderTop: '2px solid #0f172a', maxWidth: '300px', margin: '40px auto 0', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', margin: '0 0 2px' }}>{evolucaoExistente?.profissionalNome || user.nome}</p>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', margin: 0 }}>{user.especialidade || 'Psicólogo(a)'} — CRP {evolucaoExistente?.profissionalCrp || user.crp || '---'}</p>
                    <p style={{ fontSize: '8px', color: '#8b5cf6', fontWeight: 700, marginTop: '8px' }}>Assinado digitalmente via Meu Sistema Psi</p>
                </div>

                {/* Rodapé */}
                <div style={{ marginTop: '24px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <p style={{ fontSize: '7px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                        Documento sigiloso, protegido pelo sigilo profissional (Código de Ética do Psicólogo — Resolução CFP nº 010/2005).
                        <br />Evolução clínica conforme Resolução CFP nº 001/2009 — Registro de Documentos Psicológicos.
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body { background: white !important; -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
                    .print\\:hidden { display: none !important; }
                    .print\\:block { display: block !important; }
                    .min-h-screen { min-height: auto !important; background: white !important; padding: 0 !important; }
                    .max-w-7xl { display: none !important; }
                    @page { margin: 1.8cm 1.5cm; size: A4; }
                }
            `}} />
        </div>
    );
};

export default EvolucaoSessao;



