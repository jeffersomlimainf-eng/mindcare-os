import { useState, useEffect } from 'react';
import Modal from './Modal';
import { showToast } from './Toast';
import { SUBCATEGORIAS } from '../contexts/FinanceContext';
import { usePatients } from '../contexts/PatientContext';
import { formatCurrencyBRL, parseCurrencyBRL } from '../utils/formatters';

const NovoLancamentoModal = ({ isOpen, onClose, onSave, lancamentoEditando = null, initialType = 'receita' }) => {
    const [tipo, setTipo] = useState(initialType);
    const [desc, setDesc] = useState('');
    const [valor, setValor] = useState(''); // Armazena a string formatada
    const [data, setData] = useState(new Date().toISOString().split('T')[0]);
    const [dataVencimento, setDataVencimento] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState('pendente');
    const [formaPag, setFormaPag] = useState('pix');
    const [categoria, setCategoria] = useState('clinica');
    const [subcategoria, setSubcategoria] = useState('');
    const [repetir, setRepetir] = useState(false);
    const [parcelas, setParcelas] = useState('1');
    const [frequencia, setFrequencia] = useState('mensal');

    // Estado para busca de pacientes
    const { patients } = usePatients();
    const [buscaPaciente, setBuscaPaciente] = useState('');
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

    const pacientesFiltrados = patients.filter(p =>
        (p.nome || '').toLowerCase().includes(buscaPaciente.toLowerCase()) ||
        (p.id || '').toString().toLowerCase().includes(buscaPaciente.toLowerCase())
    );

    useEffect(() => {
        if (lancamentoEditando) {
            setTipo(lancamentoEditando.tipo?.toLowerCase() || 'receita');
            setDesc(lancamentoEditando.desc || '');
            setValor(formatCurrencyBRL(Math.abs(lancamentoEditando.valor || 0) * 100)); // Multiplica por 100 porque o formatador espera centavos
            setData(lancamentoEditando.data || new Date().toISOString().split('T')[0]);
            setDataVencimento(lancamentoEditando.dataVencimento || lancamentoEditando.data || new Date().toISOString().split('T')[0]);
            setStatus(lancamentoEditando.status?.toLowerCase() || 'recebido');
            setFormaPag(lancamentoEditando.formaPag || 'pix');
            setCategoria(lancamentoEditando.categoria || 'clinica');
            setSubcategoria(lancamentoEditando.subcategoria || '');
            setRepetir(false);

            // BUG-FIX: Carregar o paciente vinculado ao registro para não perder o ID no salvamento
            const pId = lancamentoEditando.pacienteId || lancamentoEditando.patient_id;
            if (pId) {
                const p = patients.find(p => p.id === pId);
                if (p) {
                    setPacienteSelecionado(p);
                    setBuscaPaciente(p.nome || p.name || '');
                }
            } else {
                setPacienteSelecionado(null);
                setBuscaPaciente('');
            }
        } else {
            setTipo(initialType);
            setDesc('');
            setValor('');
            setData(new Date().toISOString().split('T')[0]);
            setDataVencimento(new Date().toISOString().split('T')[0]);
            setStatus('pendente');
            setFormaPag('pix');
            setCategoria('clinica');
            setSubcategoria('');
            setRepetir(false);
            setParcelas('1');
            setFrequencia('mensal'); // BUG-09 FIX: resetar frequencia para o padrão
            setBuscaPaciente('');
            setPacienteSelecionado(null);
        }
    }, [lancamentoEditando, isOpen, initialType]);

    const handleSelecionarPaciente = (p) => {
        setPacienteSelecionado(p);
        setBuscaPaciente(p.nome);
        setMostrarSugestoes(false);
        setDesc(`Sessão — ${p.nome}`);
    };

    const handleValorChange = (e) => {
        const formatted = formatCurrencyBRL(e.target.value);
        setValor(formatted);
    };

    const subcategoriasList = SUBCATEGORIAS[tipo] || [];

    const handleSalvar = async () => {
        const numericValor = parseCurrencyBRL(valor);
        if (!desc || numericValor <= 0) { 
            showToast('Preencha descrição e um valor válido', 'warning'); 
            return; 
        }

        const isEdit = !!lancamentoEditando;
        const numParcelas = (!isEdit && repetir) ? Math.max(1, parseInt(parcelas, 10) || 1) : 1;
        
        try {
            for (let i = 0; i < numParcelas; i++) {
                // Cálculo das datas futuras
                const dBase = new Date(data + 'T00:00:00');
                const dvBase = new Date(dataVencimento + 'T00:00:00');
                
                if (i > 0) {
                    if (frequencia === 'mensal') {
                        dBase.setMonth(dBase.getMonth() + i);
                        dvBase.setMonth(dvBase.getMonth() + i);
                    } else if (frequencia === 'quinzenal') {
                        dBase.setDate(dBase.getDate() + (i * 14));
                        dvBase.setDate(dvBase.getDate() + (i * 14));
                    } else if (frequencia === 'semanal') {
                        dBase.setDate(dBase.getDate() + (i * 7));
                        dvBase.setDate(dvBase.getDate() + (i * 7));
                    }
                }

                const dFormatted = dBase.toISOString().split('T')[0];
                const dvFormatted = dvBase.toISOString().split('T')[0];

                const payload = {
                    tipo: tipo.toLowerCase(),
                    desc: numParcelas > 1 ? `${desc} (${i + 1}/${numParcelas})` : desc,
                    valor: numericValor,
                    data: dFormatted,
                    dataVencimento: dvFormatted,
                    status: status.toLowerCase(),
                    formaPag,
                    categoria,
                    subcategoria,
                    parcelas: isEdit ? (lancamentoEditando.parcelas || 1) : numParcelas,
                    current_installment: isEdit ? (lancamentoEditando.current_installment || 1) : (i + 1),
                    frequencia: repetir ? frequencia : (isEdit ? lancamentoEditando.frequencia : null),
                    pacienteId: pacienteSelecionado?.id || null,
                    pacienteNome: pacienteSelecionado?.nome || null,
                };

                if (onSave) {
                    await onSave(payload);
                }
            }
            
            showToast(numParcelas > 1 ? `${numParcelas} parcelas registradas!` : (lancamentoEditando ? 'Lançamento atualizado!' : 'Lançamento registrado!'), 'success');
            onClose();
            setDesc(''); setValor(''); setRepetir(false);
        } catch (error) {
            console.error('[NovoLancamentoModal] Erro ao salvar:', error);
            showToast('Erro ao salvar lançamentos', 'error');
        }
    };

    const renderReceitaFields = () => (
        <div className="space-y-6">
            {/* Seleção de Paciente (Destaque) */}
            <div className="relative group">
                <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 ml-1">Paciente do Atendimento</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-500 text-lg group-focus-within:scale-110 transition-transform">person_search</span>
                    <input
                        className="w-full h-12 pl-11 pr-4 rounded-2xl bg-emerald-50/30 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-800/30 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-bold transition-all"
                        placeholder="Pesquisar por nome ou ID..."
                        value={buscaPaciente}
                        onChange={e => {
                            setBuscaPaciente(e.target.value);
                            setMostrarSugestoes(true);
                            if (!e.target.value) setPacienteSelecionado(null);
                        }}
                        onFocus={() => setMostrarSugestoes(true)}
                        onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
                    />
                    {buscaPaciente && (
                        <button
                            onClick={() => { setBuscaPaciente(''); setPacienteSelecionado(null); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600"
                        >
                            <span className="material-symbols-outlined text-lg">cancel</span>
                        </button>
                    )}
                </div>

                {mostrarSugestoes && buscaPaciente && pacientesFiltrados.length > 0 && (
                    <div className="absolute z-[60] left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                        {pacientesFiltrados.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleSelecionarPaciente(p)}
                                aria-label={`Selecionar paciente ${p.nome}`}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left border-b border-slate-50 dark:border-slate-800 last:border-0"
                            >
                                <div className={`size-9 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${p.cor}`}>
                                    {p.iniciais}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{p.nome}</p>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{p.id}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Valor */}
                <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Valor da Sessão</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-sm">R$</span>
                        <input
                            type="text"
                            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-base font-black transition-all"
                            placeholder="0,00"
                            value={valor}
                            onChange={handleValorChange}
                        />
                    </div>
                </div>

                {/* Data Atendimento */}
                <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Data do Atendimento</label>
                    <input
                        type="date"
                        className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-bold transition-all"
                        value={data}
                        onChange={e => {
                            setData(e.target.value);
                            // Sugestão automática apenas em novos registros
                            if (!lancamentoEditando) setDataVencimento(e.target.value);
                        }}
                    />
                </div>

                {/* Data Vencimento */}
                <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 ml-1">Data de Vencimento</label>
                    <input
                        type="date"
                        className="w-full h-12 px-4 rounded-2xl bg-amber-50/20 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-800/30 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none text-sm font-bold transition-all"
                        value={dataVencimento}
                        onChange={e => setDataVencimento(e.target.value)}
                    />
                </div>

                {/* Descrição / Serviço */}
                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Serviço Prestado / Descrição</label>
                    <input
                        className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-bold transition-all"
                        placeholder="Ex: Sessão de Psicoterapia Individual"
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                    />
                </div>

                {/* Forma de Pagamento */}
                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Como o paciente pagou?</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { v: 'pix', l: 'PIX', i: 'qr_code' },
                            { v: 'cartao', l: 'Cartão', i: 'credit_card' },
                            { v: 'dinheiro', l: 'Dinheiro', i: 'payments' },
                            { v: 'transferencia', l: 'TED/DOC', i: 'account_balance' },
                        ].map(f => (
                            <button
                                key={f.v}
                                onClick={() => setFormaPag(f.v)}
                                className={`flex flex-col items-center gap-2 py-3 rounded-2xl border-2 text-[10px] font-black transition-all ${formaPag === f.v ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 scale-[1.02] shadow-md shadow-emerald-500/10' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-emerald-200'}`}
                            >
                                <span className="material-symbols-outlined text-xl">{f.i}</span>
                                {f.l}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dica de Automação ✨ */}
            <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-2xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-sky-500 mt-0.5">auto_awesome</span>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-sky-700 dark:text-sky-400 uppercase tracking-widest leading-none">Agilidade nas Cobranças</p>
                    <p className="text-[11px] text-sky-600 dark:text-sky-300 leading-tight">
                        Ao salvar como <b>Pendente</b>, você poderá gerar um link de <b>Pix Automático</b> na tela financeira. O sistema identifica o pagamento e baixa a conta sozinho!
                    </p>
                </div>
            </div>
        </div>
    );

    const renderDespesaFields = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Descrição */}
                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 ml-1">Descrição da Despesa</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-rose-500 text-lg">edit_note</span>
                        <input
                            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-rose-50/20 dark:bg-rose-900/10 border-2 border-rose-100 dark:border-rose-800/30 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none text-sm font-bold transition-all"
                            placeholder="Ex: Aluguel do Consultório - Abril"
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                        />
                    </div>
                </div>

                {/* Valor */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Valor</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-600 font-black text-sm">R$</span>
                        <input
                            type="text"
                            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none text-base font-black transition-all"
                            placeholder="0,00"
                            value={valor}
                            onChange={handleValorChange}
                        />
                    </div>
                </div>

                {/* Vencimento */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Data de Vencimento</label>
                    <input
                        type="date"
                        className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none text-sm font-bold transition-all"
                        value={dataVencimento}
                        onChange={e => {
                            setDataVencimento(e.target.value);
                            setData(e.target.value);
                        }}
                    />
                </div>

                {/* Categoria Grid */}
                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Categoria da Despesa</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setCategoria('clinica')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 font-bold text-xs transition-all ${categoria === 'clinica' ? 'border-primary bg-primary/5 text-primary scale-[1.02] shadow-sm' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-primary/30'}`}
                        >
                            <span className="material-symbols-outlined text-lg">local_hospital</span>
                            Gasto da Clínica
                        </button>
                        <button
                            onClick={() => setCategoria('pessoal')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 font-bold text-xs transition-all ${categoria === 'pessoal' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 scale-[1.02] shadow-sm' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-violet-300'}`}
                        >
                            <span className="material-symbols-outlined text-lg">person</span>
                            Gasto Pessoal
                        </button>
                    </div>
                </div>

                {/* Recorrência */}
                {!lancamentoEditando && (
                    <div className="md:col-span-2">
                        <div className={`p-4 rounded-2xl border-2 transition-all ${repetir ? 'bg-rose-50/10 border-rose-200 dark:border-rose-900/30 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800'}`}>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="size-5 rounded-lg accent-rose-500"
                                    checked={repetir}
                                    onChange={e => setRepetir(e.target.checked)}
                                />
                                <span className="text-xs font-black text-slate-700 dark:text-slate-200">Este gasto se repete no tempo (recorrente)</span>
                            </label>

                            {repetir && (
                                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in zoom-in-95 duration-200">
                                    <div>
                                        <label className="block text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Parcelas</label>
                                        <input
                                            type="number" min="2" max="60"
                                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-950 border border-rose-100 dark:border-rose-900/50 outline-none text-sm font-black text-rose-600"
                                            value={parcelas}
                                            onChange={e => setParcelas(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Frequência</label>
                                        <select
                                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-950 border border-rose-100 dark:border-rose-900/50 outline-none text-xs font-black"
                                            value={frequencia}
                                            onChange={e => setFrequencia(e.target.value)}
                                        >
                                            <option value="mensal">Mensal</option>
                                            <option value="quinzenal">Quinzenal</option>
                                            <option value="semanal">Semanal</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderFooter = () => (
        <div className="flex items-center justify-between px-7 py-5">
            <button onClick={onClose} className="text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                Descartar
            </button>
            <button
                onClick={handleSalvar}
                className={`flex items-center gap-3 px-8 py-3 text-white text-xs font-black rounded-2xl shadow-xl transition-all active:scale-95 ${tipo === 'receita' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'}`}
            >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                {lancamentoEditando ? 'Atualizar Dados' : (tipo === 'receita' ? 'Confirmar Receita' : 'Registrar Despesa')}
            </button>
        </div>
    );

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={lancamentoEditando ? "Editar Registro" : (tipo === 'receita' ? "Nova Receita de Atendimento" : "Registrar Nova Despesa")} 
            icon={tipo === 'receita' ? "trending_up" : "trending_down"} 
            maxWidth="max-w-lg"
            headerColor={tipo === 'receita' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}
            footer={renderFooter()}
        >
            <div className="p-7 space-y-6">
                {/* Tipo toggle (Só na edição) */}
                {lancamentoEditando && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Alterar Tipo de Registro</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => { setTipo('receita'); setStatus('pendente'); setSubcategoria(''); }}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-bold text-xs transition-all ${tipo === 'receita' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-emerald-300'}`}
                            >
                                <span className="material-symbols-outlined text-lg">trending_up</span> Receita
                            </button>
                            <button
                                onClick={() => { setTipo('despesa'); setStatus('pendente'); setSubcategoria(''); }}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-bold text-xs transition-all ${tipo === 'despesa' ? 'border-red-400 bg-red-50 text-red-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-red-300'}`}
                            >
                                <span className="material-symbols-outlined text-lg">trending_down</span> Despesa
                            </button>
                        </div>
                    </div>
                )}

                {/* Formulários Individuais */}
                {tipo === 'receita' ? renderReceitaFields() : renderDespesaFields()}

                {/* Classificação e Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Classificação Detalhada</label>
                        <select
                            className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700/50 focus:ring-2 focus:ring-primary/20 outline-none text-xs font-bold transition-all"
                            value={subcategoria}
                            onChange={e => setSubcategoria(e.target.value)}
                        >
                            <option value="">Selecione uma subcategoria...</option>
                            {subcategoriasList.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Situação Atual</label>
                        <div className="flex gap-2">
                            {(tipo === 'receita'
                                ? [['recebido', 'Recebido', 'text-emerald-700 bg-emerald-50 border-emerald-400'], ['pendente', 'Pendente', 'text-amber-700 bg-amber-50 border-amber-400']]
                                : [['pago', 'Já Pago', 'text-slate-700 bg-slate-100 border-slate-400'], ['pendente', 'A Pagar', 'text-rose-700 bg-rose-50 border-rose-400']]
                            ).map(([v, label, cls]) => (
                                <button
                                    key={v}
                                    onClick={() => setStatus(v)}
                                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black border-2 transition-all shadow-sm ${status === v ? cls : 'border-slate-100 dark:border-slate-800 text-slate-400 bg-white dark:bg-slate-900'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default NovoLancamentoModal;
