import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModels } from '../contexts/ModelContext';
import NovoModeloModal from '../components/NovoModeloModal';

const MODEL_COLORS_CFG = {
    'Laudos': { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', icon: 'history_edu', gradient: 'from-violet-500 to-violet-600' },
    'Laudo': { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', icon: 'history_edu', gradient: 'from-violet-500 to-violet-600' },
    'Declarações': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: 'verified', gradient: 'from-emerald-500 to-emerald-600' },
    'Declaração': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: 'verified', gradient: 'from-emerald-500 to-emerald-600' },
    'Atestados': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: 'medical_information', gradient: 'from-amber-500 to-amber-600' },
    'Atestado': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: 'medical_information', gradient: 'from-amber-500 to-amber-600' },
    'Formulários': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', icon: 'patient_list', gradient: 'from-rose-500 to-rose-600' },
    'Formulário': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', icon: 'patient_list', gradient: 'from-rose-500 to-rose-600' },
    'Encaminhamento': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', icon: 'forward_to_inbox', gradient: 'from-indigo-500 to-indigo-600' },
    'Evolução': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: 'clinical_notes', gradient: 'from-blue-500 to-blue-600' },
};

const Modelos = () => {
    const navigate = useNavigate();
    const { models, deleteModel } = useModels();
    const [modalAberto, setModalAberto] = useState(false);
    const [modeloEditando, setModeloEditando] = useState(null);

    const handleEditar = (modelo) => {
        setModeloEditando(modelo);
        setModalAberto(true);
    };

    const handleUsar = (modelo) => {
        const routes = {
            'Laudos': '/laudos/novo',
            'Laudo': '/laudos/novo',
            'Declarações': '/declaracoes/novo',
            'Declaração': '/declaracoes/novo',
            'Atestados': '/atestados/novo',
            'Atestado': '/atestados/novo',
            'Formulários': '/anamneses/novo',
            'Formulário': '/anamneses/novo',
            'Encaminhamento': '/encaminhamentos/novo',
            'Evolução': '/prontuarios/evolucao/novo'
        };

        const route = routes[modelo.categoria];
        if (route) {
            navigate(route, { state: { modelo } });
        } else {
            navigate('/prontuarios', { state: { abrirNovo: true, modelo } });
        }
    };

    const sugeridos = [
        {
            nome: 'Prontuário Psicológico Estruturado',
            descricao: 'Conforme Resolução CFP nº 01/2009',
            ícone: 'menu_book',
            categoria: 'Evolução',
            cor: 'bg-blue-50 text-blue-600',
            conteudo: 'S) \nO) \nA) \nP) '
        },
        {
            nome: 'Relatório Psicológico Multipessoal',
            descricao: 'Diretrizes da Resolução CFP nº 06/2019',
            ícone: 'verified',
            categoria: 'Laudos',
            cor: 'bg-emerald-50 text-emerald-600',
            conteudo: 'I. Identificação\n\nII. Descrição da Demanda\n\nIII. Procedimento\n\nIV. Análise e Conclusão'
        },
        {
            nome: 'Parecer Psicológico Institucional',
            descricao: 'Modelo técnico para fins de perícia ou justiça',
            ícone: 'description',
            categoria: 'Laudos',
            cor: 'bg-slate-50 text-slate-600',
            conteudo: 'Parecer técnico fundamentado...'
        },
        {
            nome: 'Termo de Consentimento Informado (TCLE)',
            descricao: 'Proteção ética e jurídica para o profissional',
            ícone: 'security',
            categoria: 'Formulários',
            cor: 'bg-sky-50 text-sky-600',
            conteudo: 'Eu, [Nome do Paciente], declaro que fui informado...'
        }
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            <NovoModeloModal 
                isOpen={modalAberto} 
                onClose={() => { setModalAberto(false); setModeloEditando(null); }} 
                modeloExistente={modeloEditando}
            />

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div>
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <span className="material-symbols-outlined text-sm">library_add_check</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Biblioteca</span>
                    </div>
                    <h1 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">Modelos Clínicos</h1>
                    <p className="text-slate-500 font-medium mt-1">Padronize seus documentos com excelência técnica.</p>
                </div>
            </div>

            {/* Grid de Modelos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1">
                {models.map((m, i) => {
                    const cfg = MODEL_COLORS_CFG[m.categoria] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', icon: 'description', gradient: 'from-slate-400 to-slate-500' };
                    return (
                        <div 
                            key={m.id} 
                            onClick={() => handleEditar(m)}
                            className="glass dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary/30 transition-all flex flex-col group overflow-hidden" 
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className={`h-24 flex items-center justify-center bg-gradient-to-br ${cfg.gradient} relative overflow-hidden`}>
                                <div className="absolute inset-0 opacity-10 flex items-center justify-center scale-150 transform -rotate-12">
                                    <span className="material-symbols-outlined text-9xl text-white">{cfg.icon}</span>
                                </div>
                                <span className="material-symbols-outlined text-4xl text-white relative z-10">{cfg.icon}</span>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                        {m.categoria}
                                    </span>
                                </div>
                                <h3 className="font-bold text-base text-slate-800 dark:text-white mb-6 leading-tight flex-1 uppercase tracking-tight">
                                    {m.nome}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUsar(m)}
                                        className="flex-[2] h-10 bg-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md shadow-primary/10"
                                    >
                                        Utilizar
                                    </button>
                                    <button
                                        onClick={() => handleEditar(m)}
                                        className="size-10 bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center rounded-lg text-amber-600 hover:bg-amber-500 hover:text-white transition-all border border-amber-100 dark:border-amber-800/50"
                                        title="Editar Modelo"
                                    >
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                    </button>
                                    <button
                                        onClick={() => deleteModel(m.id)}
                                        className="size-10 bg-slate-50 dark:bg-slate-700 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                        title="Excluir Modelo"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sugestões */}
            <div className="mt-12">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 px-1 uppercase tracking-tight">Sugestões de Especialistas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
                    {sugeridos.map((s, i) => {
                        const cfg = MODEL_COLORS_CFG[s.categoria] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', icon: 'description' };
                        return (
                            <div
                                key={s.nome}
                                onClick={() => handleUsar(s)}
                                className="glass dark:bg-slate-800/50 p-6 rounded-2xl flex items-center gap-4 border border-slate-200 dark:border-slate-700 hover:border-primary transition-all cursor-pointer group"
                                style={{ animationDelay: `${i * 150}ms` }}
                            >
                                <div className={`size-14 rounded-xl ${cfg.bg} ${cfg.text} border ${cfg.border} flex items-center justify-center transition-all group-hover:scale-110 shadow-sm`}>
                                    <span className="material-symbols-outlined text-2xl">{cfg.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm leading-tight mb-1">{s.nome}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.descricao}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {models.length === 0 && (
                <div className="py-20 text-center text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-4">description</span>
                    <p className="font-bold uppercase tracking-widest text-xs">Nenhum modelo cadastrado</p>
                </div>
            )}
        </div>
    );
};

export default Modelos;
