import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useModels } from '../contexts/ModelContext';
import { showToast } from './Toast';

const CATEGORIAS = ['Laudos', 'Declarações', 'Atestados', 'Formulários', 'Encaminhamento', 'Evolução', 'Outros'];
const ICONES = [
    { name: 'article', label: 'Documento' },
    { name: 'verified', label: 'Verificado' },
    { name: 'medical_information', label: 'Saúde' },
    { name: 'patient_list', label: 'Lista' },
    { name: 'send', label: 'Envio' },
    { name: 'edit_note', label: 'Nota' },
    { name: 'description', label: 'Texto' },
    { name: 'history_edu', label: 'Manuscrito' },
    { name: 'psychology', label: 'Mental' },
];

const CORES = [
    { bg: 'bg-primary/10', text: 'text-primary', label: 'Azul' },
    { bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Verde' },
    { bg: 'bg-violet-100', text: 'text-violet-600', label: 'Violeta' },
    { bg: 'bg-amber-100', text: 'text-amber-600', label: 'Âmbar' },
    { bg: 'bg-rose-100', text: 'text-rose-600', label: 'Rosa' },
    { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Ciano' },
];

const NovoModeloModal = ({ isOpen, onClose, modeloExistente }) => {
    const { addModel, updateModel } = useModels();
    const [nome, setNome] = useState('');
    const [categoria, setCategoria] = useState(CATEGORIAS[0]);
    const [icone, setIcone] = useState(ICONES[0].name);
    const [cor, setCor] = useState(CORES[0]);
    const [conteudo, setConteudo] = useState('');

    useEffect(() => {
        if (modeloExistente) {
            setNome(modeloExistente.nome || '');
            setCategoria(modeloExistente.categoria || CATEGORIAS[0]);
            setIcone(modeloExistente.ícone || ICONES[0].name);
            setConteudo(modeloExistente.conteudo || '');
            
            // Tentar encontrar a cor correspondente
            const corEncontrada = CORES.find(c => `${c.bg} ${c.text}` === modeloExistente.cor);
            if (corEncontrada) setCor(corEncontrada);
        } else {
            reset();
        }
    }, [modeloExistente, isOpen]);

    const handleSalvar = () => {
        if (!nome) {
            showToast('Dê um nome ao seu modelo.', 'error');
            return;
        }

        const dados = {
            nome,
            categoria,
            ícone: icone,
            cor: `${cor.bg} ${cor.text}`,
            conteudo
        };

        if (modeloExistente) {
            updateModel(modeloExistente.id, dados);
            showToast('Modelo atualizado com sucesso!', 'success');
        } else {
            addModel(dados);
            showToast('Modelo criado com sucesso!', 'success');
        }
        
        onClose();
        if (!modeloExistente) reset();
    };

    const reset = () => {
        setNome('');
        setCategoria(CATEGORIAS[0]);
        setIcone(ICONES[0].name);
        setCor(CORES[0]);
        setConteudo('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modeloExistente ? 'Editar Modelo' : 'Criar Novo Modelo'} icon="dashboard_customize" maxWidth="max-w-3xl">
            <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nome e Categoria */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Nome do Modelo</label>
                            <input
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-900 dark:text-white"
                                placeholder="Ex: Laudo Psicológico Infantil"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Categoria</label>
                            <select
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-900 dark:text-white appearance-none cursor-pointer"
                                value={categoria}
                                onChange={e => setCategoria(e.target.value)}
                            >
                                {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Ícone e Cor */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Ícone e Estilo</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {ICONES.map(ico => (
                                    <button
                                        key={ico.name}
                                        onClick={() => setIcone(ico.name)}
                                        className={`size-10 rounded-lg flex items-center justify-center transition-all ${icone === ico.name ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'}`}
                                        title={ico.label}
                                    >
                                        <span className="material-symbols-outlined text-sm">{ico.name}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                {CORES.map((c, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCor(c)}
                                        className={`size-8 rounded-full border-4 transition-all ${c.bg} ${cor.bg === c.bg ? 'border-primary scale-110' : 'border-transparent'}`}
                                        title={c.label}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conteúdo Padrão */}
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Conteúdo Padrão (Texto)</label>
                    <textarea
                        className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium leading-relaxed min-h-[160px] resize-none"
                        placeholder="Texto que aparecerá automaticamente quando você usar este modelo..."
                        value={conteudo}
                        onChange={e => setConteudo(e.target.value)}
                    />
                </div>

                {/* Preview */}
                <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-4">Preview do Card</p>
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 p-6 flex items-center gap-4 max-w-sm">
                        <div className={`size-14 rounded-2xl ${cor.bg} ${cor.text} flex items-center justify-center shadow-inner shrink-0`}>
                            <span className="material-symbols-outlined text-3xl">{icone}</span>
                        </div>
                        <div>
                            <h4 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{nome || 'Nome do Modelo'}</h4>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{categoria}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 rounded-b-[2rem]">
                <button
                    onClick={onClose}
                    className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSalvar}
                    className="px-8 py-3 bg-primary text-white text-sm font-black rounded-xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5"
                >
                    {modeloExistente ? 'SALVAR ALTERAÇÕES' : 'CRIAR MODELO'}
                </button>
            </div>
        </Modal>
    );
};

export default NovoModeloModal;
