import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { showToast } from './Toast';
import { usePatients } from '../contexts/PatientContext';
import { useModels } from '../contexts/ModelContext';

const MODEL_COLORS_CFG = {
    'Laudos': { bg: 'bg-violet-100 text-violet-600', border: 'border-violet-200' },
    'Laudo': { bg: 'bg-violet-100 text-violet-600', border: 'border-violet-200' },
    'Declarações': { bg: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-200' },
    'Declaração': { bg: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-200' },
    'Atestados': { bg: 'bg-amber-100 text-amber-600', border: 'border-amber-200' },
    'Atestado': { bg: 'bg-amber-100 text-amber-600', border: 'border-amber-200' },
    'Formulários': { bg: 'bg-rose-100 text-rose-600', border: 'border-rose-200' },
    'Formulário': { bg: 'bg-rose-100 text-rose-600', border: 'border-rose-200' },
    'Encaminhamento': { bg: 'bg-sky-100 text-sky-600', border: 'border-sky-200' },
    'Encaminhamentos': { bg: 'bg-sky-100 text-sky-600', border: 'border-sky-200' },
    'Evolução': { bg: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
    'Evoluções': { bg: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
    'Recibos': { bg: 'bg-indigo-100 text-indigo-600', border: 'border-indigo-200' },
};

const CORE_DOCUMENT_TYPES = [
    { id: 'evolucao', nome: 'Evolução', categoria: 'Evolução', icon: 'clinical_notes', cor: 'bg-emerald-100 text-emerald-600' },
    { id: 'laudo', nome: 'Laudo', categoria: 'Laudos', icon: 'article', cor: 'bg-violet-100 text-violet-600' },
    { id: 'atestado', nome: 'Atestado', categoria: 'Atestados', icon: 'verified', cor: 'bg-amber-100 text-amber-600' },
    { id: 'declaracao', nome: 'Declaração', categoria: 'Declarações', icon: 'description', cor: 'bg-sky-100 text-sky-600' },
    { id: 'anamnese', nome: 'Anamnese', categoria: 'Formulários', icon: 'assignment', cor: 'bg-rose-100 text-rose-600' },
    { id: 'encaminhamento', nome: 'Encaminhamento', categoria: 'Encaminhamento', icon: 'send', cor: 'bg-indigo-100 text-indigo-600' },
    { id: 'recibo', nome: 'Recibo', categoria: 'Recibos', icon: 'payments', cor: 'bg-emerald-100 text-emerald-600' },
];

const NovoDocumentoModal = ({ isOpen, onClose, onSave, tipoInicial, modeloInicial, pacientePreSelecionado }) => {
    const navigate = useNavigate();
    const { patients } = usePatients();
    const { models, incrementUsage } = useModels();
    const [etapa, setEtapa] = useState(1); 
    const [modeloSel, setModeloSel] = useState(null);
    const [pacienteBusca, setPacienteBusca] = useState('');
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    const [conteudo, setConteudo] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [abaSelecao, setAbaSelecao] = useState('tipos'); // 'tipos' ou 'modelos'
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Filtrar pacientes pelo texto digitado
    const pacientesFiltrados = patients.filter(p =>
        (p.nome || '').toLowerCase().includes(pacienteBusca.toLowerCase())
    );

    // Agrupar modelos por categoria
    const categoriasModelos = useMemo(() => {
        const groups = {};
        models.forEach(m => {
            const cat = m.categoria || 'Geral';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(m);
        });
        return groups;
    }, [models]);

    // Efeito para lidar com abertura e inicialização
    useEffect(() => {
        if (isOpen) {
            if (pacientePreSelecionado) {
                setPacienteSelecionado(pacientePreSelecionado);
                setPacienteBusca(pacientePreSelecionado.nome || '');
                setShowDropdown(false);
            }

            if (modeloInicial) {
                if (modeloInicial.nome) {
                    setModeloSel(modeloInicial);
                    setConteudo(modeloInicial.conteudo || '');
                } else if (modeloInicial.id) {
                    const found = models.find(m => m.id === modeloInicial.id);
                    if (found) {
                        setModeloSel(found);
                        setConteudo(found.conteudo || '');
                    }
                }
                setEtapa(1);
            } else if (tipoInicial) {
                const modelo = models.find(m => (m.nome || '').toLowerCase().includes(tipoInicial.toLowerCase()) || (m.categoria || '').toLowerCase().includes(tipoInicial.toLowerCase()));
                if (modelo) {
                    setModeloSel(modelo);
                    setConteudo(modelo.conteudo || '');
                }
            }
        } else {
            setEtapa(1); setModeloSel(null); setPacienteBusca(''); setPacienteSelecionado(null); setConteudo(''); setAbaSelecao('tipos');
        }
    }, [isOpen, tipoInicial, modeloInicial, models, pacientePreSelecionado]);

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

    const handleSelecionarPaciente = (p) => {
        setPacienteSelecionado(p);
        setPacienteBusca(p.nome);
        setShowDropdown(false);
    };

    const handleBuscaChange = (e) => {
        setPacienteBusca(e.target.value);
        setPacienteSelecionado(null);
        setShowDropdown(true);
    };

    const handleProximo = () => {
        if (!modeloSel) { showToast('Escolha o tipo de documento ou modelo', 'warning'); return; }
        if (!pacienteSelecionado) { showToast('Selecione um paciente da lista', 'warning'); return; }

        let textoFinal = modeloSel.conteudo || '';
        const birthDate = pacienteSelecionado.dataNascimento || pacienteSelecionado.nascimento || pacienteSelecionado.data_nascimento || '—';
        const resp = pacienteSelecionado.dadosResponsavel || (typeof pacienteSelecionado.responsavel === 'object' ? pacienteSelecionado.responsavel : { nome: pacienteSelecionado.responsavel || '—', cpf: '—', telefone: '—' });
        const dataExtenso = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

        if (textoFinal) {
            textoFinal = textoFinal
                .replace(/{paciente_nome}/g, pacienteSelecionado.nome || '')
                .replace(/{paciente_cpf}/g, pacienteSelecionado.cpf || '—')
                .replace(/{paciente_data_nascimento}/g, birthDate)
                .replace(/{responsavel_nome}/g, resp.nome || '—')
                .replace(/{responsavel_cpf}/g, resp.cpf || '—')
                .replace(/{responsavel_telefone}/g, resp.telefone || '—')
                .replace(/{preco_sessao}/g, pacienteSelecionado.precoSessao || '0,00')
                .replace(/{data_atual}/g, new Date().toLocaleDateString('pt-BR'))
                .replace(/{data_atual_extenso}/g, dataExtenso);

            if (!textoFinal.includes(pacienteSelecionado.nome) && textoFinal.length < 50) {
                textoFinal = `PACIENTE: ${pacienteSelecionado.nome}\nCPF: ${pacienteSelecionado.cpf || '—'}\nDATA: ${dataExtenso}\n\n${textoFinal}`;
            }
        } else {
            textoFinal = `PACIENTE: ${pacienteSelecionado.nome}\nCPF: ${pacienteSelecionado.cpf || '—'}\nDATA DE NASCIMENTO: ${birthDate}\nDATA: ${dataExtenso}\n\n`;
        }

        const state = {
            pacienteId: pacienteSelecionado.id,
            pacienteNome: pacienteSelecionado.nome,
            pacienteObjeto: pacienteSelecionado,
            modelo: { ...modeloSel, conteudo: textoFinal }
        };

        const categoria = (modeloSel.categoria || '').toLowerCase();
        const nome = (modeloSel.nome || '').toLowerCase();

        if (categoria === 'laudos' || nome.includes('laudo')) {
            onClose(); navigate('/laudos/novo', { state });
        } else if (categoria === 'atestados' || nome.includes('atestado')) {
            onClose(); navigate('/atestados/novo', { state });
        } else if (categoria === 'evolução' || nome.includes('evolução') || nome.includes('soap')) {
            onClose(); navigate('/prontuarios/evolucao/novo', { state });
        } else if (categoria === 'declarações' || nome.includes('declaração')) {
            onClose(); navigate('/declaracoes/novo', { state });
        } else if (categoria === 'formulários' || nome.includes('anamnese')) {
            onClose(); navigate('/anamneses/novo', { state });
        } else if (categoria === 'encaminhamento' || nome.includes('encaminhamento')) {
            onClose(); navigate('/encaminhamentos/novo', { state });
        } else if (categoria === 'recibos' || nome.includes('recibo')) {
            onClose(); navigate('/financeiro/recibo/novo', { state });
        } else {
            setConteudo(textoFinal);
            setEtapa(2);
        }
    };

    const handleSalvar = () => {
        showToast('Documento salvo!', 'success');
        if (modeloSel?.id) incrementUsage(modeloSel.id);
        onSave && onSave({
            tipo: modeloSel.nome,
            categoria: modeloSel.categoria,
            paciente: pacienteSelecionado,
            conteudo,
            modeloId: modeloSel.id
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={etapa === 1 ? 'Novo Documento' : `Editando: ${modeloSel?.nome}`} icon="description" maxWidth="max-w-4xl">
            {etapa === 1 ? (
                <div className="p-7 space-y-8">
                     {/* Seletor de Paciente - Colocado no TOPO como prioridade */}
                     <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">1. Qual o Paciente?</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                ref={inputRef}
                                className="w-full pl-12 pr-4 h-12 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-xs font-bold uppercase tracking-tight transition-all"
                                placeholder="Buscar paciente..."
                                value={pacienteBusca}
                                onChange={handleBuscaChange}
                                onFocus={() => setShowDropdown(true)}
                                autoComplete="off"
                            />
                            {pacienteSelecionado && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <div className={`h-8 px-3 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700`}>
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        {pacienteSelecionado.iniciais}
                                    </div>
                                    <button
                                        onClick={() => { setPacienteSelecionado(null); setPacienteBusca(''); inputRef.current?.focus(); setShowDropdown(true); }}
                                        className="size-8 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            )}

                            {showDropdown && !pacienteSelecionado && (
                                <div ref={dropdownRef} className="absolute z-50 left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-56 overflow-y-auto overflow-x-hidden">
                                    {pacientesFiltrados.length > 0 ? (
                                        pacientesFiltrados.map(p => (
                                            <button key={p.id} onClick={() => handleSelecionarPaciente(p)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm group-hover:scale-110 transition-transform ${p.cor || 'bg-primary/10 text-primary'}`}>{p.iniciais}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-slate-800 dark:text-white truncate uppercase tracking-tight">{p.nome}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.id} • {p.plano || 'Particular'}</p>
                                                </div>
                                                <span className="material-symbols-outlined text-slate-200 group-hover:text-primary transition-colors">add_circle</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-6 py-8 text-center text-slate-400">Nenhum paciente encontrado</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                            {[
                                { id: 'tipos', label: 'Atalhos de Documentos', icon: 'grid_view' },
                                { id: 'modelos', label: 'Modelos de Texto', icon: 'library_books' }
                            ].map(aba => (
                                <button
                                    key={aba.id}
                                    onClick={() => setAbaSelecao(aba.id)}
                                    className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest relative transition-all ${abaSelecao === aba.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">{aba.icon}</span>
                                        {aba.label}
                                    </div>
                                    {abaSelecao === aba.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
                                </button>
                            ))}
                        </div>
                        
                        <div className="max-h-[350px] overflow-y-auto px-1 pr-2 scrollbar-hide">
                            {abaSelecao === 'tipos' ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {CORE_DOCUMENT_TYPES.map(t => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => {
                                                setModeloSel(t);
                                                setConteudo('');
                                            }}
                                            className={`flex flex-col items-center gap-4 p-5 rounded-3xl border-2 transition-all group ${modeloSel?.id === t.id ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' : 'border-slate-100 dark:border-slate-800 text-slate-500 bg-white dark:bg-slate-900 hover:border-slate-200'}`}
                                        >
                                            <div className={`size-14 rounded-[1.25rem] flex items-center justify-center ${t.cor} shadow-sm group-hover:scale-110 transition-transform`}>
                                                <span className="material-symbols-outlined text-3xl">{t.icon}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[11px] font-black uppercase tracking-tight">{t.nome}</span>
                                                <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Novo</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {Object.keys(categoriasModelos).length === 0 ? (
                                        <div className="py-12 text-center text-slate-400">
                                            <span className="material-symbols-outlined text-4xl mb-4 opacity-20">library_books</span>
                                            <p className="font-black text-[10px] uppercase tracking-widest">Nenhum modelo cadastrado ainda.</p>
                                        </div>
                                    ) : (
                                        Object.entries(categoriasModelos).map(([categoria, mds]) => (
                                            <div key={categoria} className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-1 flex items-center gap-3">
                                                    {categoria}
                                                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {mds.map(m => {
                                                        const cfg = MODEL_COLORS_CFG[m.categoria] || { bg: 'bg-slate-100 text-slate-500', border: 'border-slate-200' };
                                                        return (
                                                            <button
                                                                key={m.id}
                                                                type="button"
                                                                onClick={() => { setModeloSel(m); setConteudo(m.conteudo || ''); }}
                                                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${modeloSel?.id === m.id ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-slate-200'}`}
                                                            >
                                                                <div className={`size-10 rounded-xl flex items-center justify-center ${cfg.bg} shrink-0`}>
                                                                    <span className="material-symbols-outlined text-lg">{m.ícone || m.icon || 'description'}</span>
                                                                </div>
                                                                <span className="text-[10px] font-black uppercase leading-tight line-clamp-2">{m.nome}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-7 space-y-6">
                    <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${pacienteSelecionado?.cor || 'bg-primary/10 text-primary'}`}>{pacienteSelecionado?.iniciais || '?'}</div>
                        <div className="flex-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Paciente</p>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{pacienteSelecionado?.nome}</h3>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Texto do Documento</label>
                        <textarea
                            className="w-full p-8 rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-sm font-medium leading-relaxed resize-none min-h-[400px] shadow-sm transition-all"
                            placeholder="Comece a escrever aqui..."
                            value={conteudo}
                            onChange={e => setConteudo(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between px-10 py-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                {etapa === 2 ? (
                    <button onClick={() => setEtapa(1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-lg">arrow_back</span> Voltar
                    </button>
                ) : <div />}
                
                <div className="flex gap-4">
                    <button onClick={onClose} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800">Cancelar</button>
                    {etapa === 1 ? (
                        <button onClick={handleProximo} className="flex items-center gap-3 px-10 py-3.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all">
                            Continuar <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    ) : (
                        <button onClick={handleSalvar} className="flex items-center gap-3 px-10 py-3.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all">
                            <span className="material-symbols-outlined text-lg">draw</span> Salvar Documento
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default NovoDocumentoModal;
