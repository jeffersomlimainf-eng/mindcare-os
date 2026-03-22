import { useState, useEffect } from 'react';
import Modal from './Modal';
import { showToast } from './Toast';
import { SUBCATEGORIAS } from '../contexts/FinanceContext';
import { usePatients } from '../contexts/PatientContext';

const NovoLancamentoModal = ({ isOpen, onClose, onSave, lancamentoEditando = null }) => {
    const [tipo, setTipo] = useState('receita');
    const [desc, setDesc] = useState('');
    const [valor, setValor] = useState('');
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
        p.nome.toLowerCase().includes(buscaPaciente.toLowerCase()) ||
        p.id.toLowerCase().includes(buscaPaciente.toLowerCase())
    );

    useEffect(() => {
        if (lancamentoEditando) {
            setTipo(lancamentoEditando.tipo?.toLowerCase() || 'receita');
            setDesc(lancamentoEditando.desc || '');
            setValor(Math.abs(lancamentoEditando.valor || 0).toString());
            setData(lancamentoEditando.data || new Date().toISOString().split('T')[0]);
            setDataVencimento(lancamentoEditando.dataVencimento || lancamentoEditando.data || new Date().toISOString().split('T')[0]);
            setStatus(lancamentoEditando.status?.toLowerCase() || 'recebido');
            setFormaPag(lancamentoEditando.formaPag || 'pix');
            setCategoria(lancamentoEditando.categoria || 'clinica');
            setSubcategoria(lancamentoEditando.subcategoria || '');
            setRepetir(false);
        } else {
            setTipo('receita');
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
            setBuscaPaciente('');
            setPacienteSelecionado(null);
        }
    }, [lancamentoEditando, isOpen]);

    const handleSelecionarPaciente = (p) => {
        setPacienteSelecionado(p);
        setBuscaPaciente(p.nome);
        setMostrarSugestoes(false);
        setDesc(`Sessão — ${p.nome}`);
    };

    const subcategoriasList = SUBCATEGORIAS[tipo] || [];

    const handleSalvar = () => {
        if (!desc || !valor) { showToast('Preencha descrição e valor', 'warning'); return; }

        const payload = {
            tipo,
            desc,
            valor: parseFloat(valor) || 0,
            data,
            dataVencimento: dataVencimento || data,
            status,
            formaPag,
            categoria,
            subcategoria,
            parcelas: repetir ? parcelas : 1,
            frequencia: repetir ? frequencia : null,
            pacienteId: pacienteSelecionado?.id || null,
            pacienteNome: pacienteSelecionado?.nome || null,
        };

        onSave && onSave(payload);
        showToast(lancamentoEditando ? 'Lançamento atualizado!' : 'Lançamento registrado!', 'success');
        onClose();
        setDesc(''); setValor(''); setRepetir(false);
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={lancamentoEditando ? "Editar Lançamento" : "Novo Lançamento"} icon="payments" maxWidth="max-w-lg">
            <div className="p-7 space-y-5 overflow-y-auto max-h-[70vh]">
                {/* Tipo toggle */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => { setTipo('receita'); setStatus('pendente'); setSubcategoria(''); }}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${tipo === 'receita' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-emerald-300'}`}
                        >
                            <span className="material-symbols-outlined">trending_up</span> Receita
                        </button>
                        <button
                            onClick={() => { setTipo('despesa'); setStatus('pendente'); setSubcategoria(''); }}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${tipo === 'despesa' ? 'border-red-400 bg-red-50 text-red-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-red-300'}`}
                        >
                            <span className="material-symbols-outlined">trending_down</span> Despesa
                        </button>
                    </div>
                </div>

                {/* Categoria Clínica / Pessoal */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categoria</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setCategoria('clinica')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${categoria === 'clinica' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/40'}`}
                        >
                            <span className="material-symbols-outlined text-lg">local_hospital</span> Clínica
                        </button>
                        <button
                            onClick={() => setCategoria('pessoal')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${categoria === 'pessoal' ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-violet-300'}`}
                        >
                            <span className="material-symbols-outlined text-lg">person</span> Pessoal
                        </button>
                    </div>
                </div>

                {/* Seleção de Paciente (Apenas para Receita) */}
                {tipo === 'receita' && !lancamentoEditando && (
                    <div className="relative">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Paciente (Opcional)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">person_search</span>
                            <input
                                className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
                                placeholder="Buscar paciente por nome ou ID..."
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
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <span className="material-symbols-outlined text-lg">cancel</span>
                                </button>
                            )}
                        </div>

                        {mostrarSugestoes && buscaPaciente && pacientesFiltrados.length > 0 && (
                            <div className="absolute z-[60] left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                {pacientesFiltrados.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => handleSelecionarPaciente(p)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-slate-50 dark:border-slate-800 last:border-0"
                                    >
                                        <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${p.cor}`}>
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
                )}

                {/* Descrição */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Descrição *</label>
                    <input
                        className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
                        placeholder="Ex: Sessão de Terapia — Jane Doe"
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                    />
                </div>

                {/* Subcategoria */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subcategoria</label>
                    <select
                        className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
                        value={subcategoria}
                        onChange={e => setSubcategoria(e.target.value)}
                    >
                        <option value="">Selecione...</option>
                        {subcategoriasList.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Valor */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Valor (R$) *</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
                                placeholder="0.00"
                                value={valor}
                                onChange={e => setValor(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Data */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Data</label>
                        <input
                            type="date"
                            className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
                            value={data}
                            onChange={e => setData(e.target.value)}
                        />
                    </div>
                </div>

                {/* Data de Vencimento */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Data de Vencimento</label>
                    <input
                        type="date"
                        className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
                        value={dataVencimento}
                        onChange={e => setDataVencimento(e.target.value)}
                    />
                </div>

                {/* Parcelamento/Recorrência */}
                {!lancamentoEditando && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                            <input
                                type="checkbox"
                                className="size-4 rounded accent-primary"
                                checked={repetir}
                                onChange={e => setRepetir(e.target.checked)}
                            />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Este lançamento se repete ou é parcelado</span>
                        </label>

                        {repetir && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Repetições / Parcelas</label>
                                    <input
                                        type="number"
                                        min="2"
                                        max="60"
                                        className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-sm font-bold text-primary"
                                        value={parcelas}
                                        onChange={e => setParcelas(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Frequência</label>
                                    <select
                                        className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-sm font-bold"
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
                )}

                {/* Status */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                    <div className="flex gap-2 flex-wrap">
                        {(tipo === 'receita'
                            ? [['recebido', 'Recebido', 'text-emerald-600 bg-emerald-50 border-emerald-400'], ['pendente', 'Pendente', 'text-amber-600 bg-amber-50 border-amber-400']]
                            : [['pago', 'Pago', 'text-slate-600 bg-slate-100 border-slate-400'], ['pendente', 'Pendente', 'text-amber-600 bg-amber-50 border-amber-400']]
                        ).map(([v, label, cls]) => (
                            <button
                                key={v}
                                onClick={() => setStatus(v)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${status === v ? cls : 'border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-800'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Forma de Pagamento */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Forma de Pagamento</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { v: 'pix', l: 'PIX', i: 'qr_code' },
                            { v: 'cartao', l: 'Cartão', i: 'credit_card' },
                            { v: 'dinheiro', l: 'Dinheiro', i: 'payments' },
                            { v: 'transferencia', l: 'TED/DOC', i: 'account_balance' },
                        ].map(f => (
                            <button
                                key={f.v}
                                onClick={() => setFormaPag(f.v)}
                                className={`flex flex-col items-center gap-1 py-2 rounded-xl border-2 text-xs font-bold transition-all ${formaPag === f.v ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/40'}`}
                            >
                                <span className="material-symbols-outlined text-lg">{f.i}</span>
                                {f.l}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 shrink-0">
                <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors">
                    Cancelar
                </button>
                <button
                    onClick={handleSalvar}
                    className={`flex items-center gap-2 px-7 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] ${tipo === 'receita' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-red-500 hover:bg-red-600 shadow-red-200'}`}
                >
                    <span className="material-symbols-outlined text-base">save</span>
                    {lancamentoEditando ? 'Salvar Alterações' : 'Salvar Lançamento'}
                </button>
            </div>
        </Modal>
    );
};

export default NovoLancamentoModal;
