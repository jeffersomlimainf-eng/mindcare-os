import React, { useState, useRef, useEffect, useMemo } from 'react';
import { usePatients } from '../contexts/PatientContext';
import { useEvolutions } from '../contexts/EvolutionContext';
import { useAnamneses } from '../contexts/AnamneseContext';
import { useLaudos } from '../contexts/LaudoContext';
import { useDeclaracoes } from '../contexts/DeclaracaoContext';
import { useAtestados } from '../contexts/AtestadoContext';
import { useEncaminhamentos } from '../contexts/EncaminhamentoContext';
import { useUser } from '../contexts/UserContext';
import { checkAIAccess, trackAIConsumption } from '../utils/authMiddleware';
import { supabase } from '../lib/supabase';

import { logger } from '../utils/logger';
// AI_API_KEY removida do frontend por segurança (migrada para Edge Function)

const AIClinica = () => {
    const { patients } = usePatients();
    const { evolutions } = useEvolutions();
    const { anamneses } = useAnamneses();
    const { laudos } = useLaudos();
    const { declaracoes } = useDeclaracoes();
    const { atestados } = useAtestados();
    const { encaminhamentos } = useEncaminhamentos();
    const { user, updateUser } = useUser();
    const aiAccess = checkAIAccess(user);
    const isPlanBasic = !aiAccess.allowed;

    const [busca, setBusca] = useState('');
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    const [abaAtiva, setAbaAtiva] = useState('ficha');
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mensagens, setMensagens] = useState([
        { role: 'assistant', text: 'Olá! Sou a Psiquê, sua parceira clínica. Estou aqui para conversar sobre casos, analisar prontuários ou simplesmente trocar uma ideia sobre sua prática. Selecione um paciente ao lado para focarmos em um caso específico ou comece a falar aqui mesmo!' }
    ]);
    const scrollRef = useRef(null);

    // Consolidar a base de dados para o System Prompt (Otimizado para poupar tokens/evitar limites)
    const fullDatabaseContext = useMemo(() => {
        if (pacienteSelecionado) {
            const normalizeId = (id) => String(id || '').replace('#', '');
            const cId = normalizeId(pacienteSelecionado.id);
            
            return JSON.stringify({
                paciente_foco: {
                    id: pacienteSelecionado.id,
                    nome: pacienteSelecionado.nome,
                    idade: pacienteSelecionado.dataNascimento,
                    queixa: pacienteSelecionado.queixa,
                    historico: pacienteSelecionado.historico,
                    plano: pacienteSelecionado.plano,
                    status: pacienteSelecionado.status
                },
                evolucoes: evolutions.filter(e => normalizeId(e.pacienteId) === cId),
                anamneses: anamneses.filter(a => normalizeId(a.pacienteId) === cId),
                laudos: laudos.filter(l => normalizeId(l.pacienteId) === cId),
                declaracoes: declaracoes.filter(d => normalizeId(d.pacienteId) === cId),
                atestados: atestados.filter(a => normalizeId(a.pacienteId) === cId),
                encaminhamentos: encaminhamentos.filter(e => normalizeId(e.pacienteId) === cId)
            });
        }
        
        // Se nenhum paciente selecionado, envia apenas um resumo básico
        return JSON.stringify({
            aviso_sistema: "Para análise profunda de prontuário, peça ao psicólogo para selecionar um paciente na interface.",
            pacientes_resumo: patients.map(p => ({
                id: p.id,
                nome: p.nome,
                status: p.status
            }))
        });
    }, [patients, evolutions, anamneses, laudos, declaracoes, atestados, encaminhamentos, pacienteSelecionado]);

    const systemPrompt = useMemo(() => {
        const nomePsicologo = user?.nome || 'Psicólogo(a)';
        return `Você é a "Psiquê", a inteligência artificial parceira clínica do(a) Dr(a). ${nomePsicologo}.
Sua persona é a de um colega de trabalho sênior, experiente, ético e colaborativo. Você não apenas analisa dados, mas conversa livremente com o psicólogo como um igual.

CONTEXTO DO SISTEMA:
- Psicólogo(a) Logado(a): Dr(a). ${nomePsicologo}
- Data e Hora Atual do Sistema: ${new Date().toLocaleString('pt-BR')}

REGRAS DE OURO:
1. Você tem acesso TOTAL à base de dados da clínica em tempo real (veja os dados abaixo).
2. PACIENTE ATUALMENTE SELECIONADO NA TELA: ${pacienteSelecionado ? `${pacienteSelecionado.nome} (ID: ${pacienteSelecionado.id})` : 'NENHUM (Conversa Geral)'}.
3. Se houver um paciente selecionado (como indicado acima), foque prioritariamente nos dados dele, mas saiba sobre tudo.
4. Use um tom profissional, mas amigável e parceiro (em Português do Brasil). Enderece o psicólogo pelo nome quando adequado.
5. Ajude o psicólogo a identificar padrões, sugerir hipóteses diagnósticas (sempre citando que são hipóteses para revisão dele) e organizar ideias.
6. Se perguntado sobre algo que não está nos dados, responda com base no seu conhecimento geral de psicologia, mas sempre contextualizando com a prática clínica.
7. Mantenha as respostas concisas mas profundas.

DADOS DA CLÍNICA (BASE DE CONHECIMENTO):
${fullDatabaseContext}
`;
    }, [user?.nome, pacienteSelecionado, fullDatabaseContext]);

    const pacientesFiltrados = patients.filter(p => 
        (p.nome || '').toLowerCase().includes(busca.toLowerCase()) || 
        (p.id || '').includes(busca)
    );

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [mensagens, isLoading]);

    const typewriter = async (text, msgIndex, setMsgs) => {
        const STEP = 4;
        const DELAY = 12;
        for (let i = 0; i <= text.length; i += STEP) {
            const partial = text.slice(0, i);
            setMsgs(prev => {
                const msgs = [...prev];
                if (msgs[msgIndex]) msgs[msgIndex] = { ...msgs[msgIndex], text: partial };
                return msgs;
            });
            await new Promise(r => setTimeout(r, DELAY));
        }
        setMsgs(prev => {
            const msgs = [...prev];
            if (msgs[msgIndex]) msgs[msgIndex] = { ...msgs[msgIndex], text };
            return msgs;
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const currentInput = input;
        const placeholderIndex = mensagens.length + 1;
        setMensagens(prev => [...prev, { role: 'user', text: currentInput }, { role: 'assistant', text: '' }]);
        setInput('');
        setIsLoading(true);

        try {
            const history = mensagens.map(m => ({
                role: m.role === 'ai' ? 'assistant' : m.role,
                content: m.text
            }));

            const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
            const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-assist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                    messages: [...history, { role: 'user', content: currentInput }],
                    systemPrompt,
                    temperature: 0.7
                })
            });

            if (!response.ok) throw new Error(`Status ${response.status}: Falha de conexão na Edge Function`);
            const data = await response.json();
            
            if (data?.error) throw new Error(`Erro da IA: ${data.error}`);
            if (!data?.choices?.[0]) throw new Error('Resposta inesperada da IA.');

            const aiText = data.choices[0].message.content;

            // Efeito typewriter para parecer streaming
            await typewriter(aiText, placeholderIndex, setMensagens);

            // Tracking de consumo de tokens
            trackAIConsumption((currentInput.length + aiText.length) / 4, user, updateUser);

        } catch (error) {
            logger.error(error);
            setMensagens(prev => {
                const msgs = [...prev];
                msgs[msgs.length - 1] = { role: 'assistant', text: `Desculpe, houve um erro: ${error.message}` };
                return msgs;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const calcularIdade = (dataNasc) => {
        if (!dataNasc) return '--';
        const hoje = new Date();
        const nasc = new Date(dataNasc);
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
        return `${idade} anos`;
    };

    const getEvolucoesPaciente = () => {
        if (!pacienteSelecionado) return [];
        const normalizeId = (id) => String(id || '').replace('#', '');
        const cId = normalizeId(pacienteSelecionado.id);
        return evolutions.filter(ev => normalizeId(ev.pacienteId) === cId);
    };

    const getTimelineData = () => {
        if (!pacienteSelecionado) return [];
        const normalizeId = (id) => String(id || '').replace('#', '');
        const cId = normalizeId(pacienteSelecionado.id);

        const evs = evolutions.filter(ev => normalizeId(ev.pacienteId) === cId).map(e => ({ ...e, type: 'Evolução', icon: 'clinical_notes', color: 'text-blue-500' }));
        const anam = anamneses.filter(a => normalizeId(a.pacienteId) === cId).map(a => ({ ...a, type: 'Anamnese', icon: 'assignment', color: 'text-rose-500', data: a.criadoEm.split('T')[0] }));
        const laud = laudos.filter(l => normalizeId(l.pacienteId) === cId).map(l => ({ ...l, type: 'Laudo', icon: 'gavel', color: 'text-violet-500', data: l.criadoEm.split('T')[0] }));
        
        return [...evs, ...anam, ...laud].sort((a, b) => new Date(b.data || b.criadoEm) - new Date(a.data || a.criadoEm));
    };

    return (
        <div className="flex flex-col xl:flex-row h-auto xl:h-[calc(100vh-120px)] gap-6 antialiased relative">
            {/* Overlay de Bloqueio Plano Essencial */}
            {isPlanBasic && (
                <div className="absolute inset-0 z-[100] backdrop-blur-md bg-white/40 dark:bg-slate-900/40 flex items-center justify-center p-8">
                    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-10 text-center">
                        <div className="size-24 rounded-[2.5rem] bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-amber-500/20">
                            <span className="material-symbols-outlined text-5xl">lock</span>
                        </div>
                        <h2 className="text-3xl font-black italic tracking-tight text-slate-900 dark:text-white mb-4">Meu Sistema PSI AI Assist</h2>
                        <p className="text-slate-500 font-bold mb-8 leading-relaxed">
                            {aiAccess.reason}
                        </p>
                        <button 
                            onClick={() => window.location.hash = '#/configuracoes'} // Navegação simples se não usar react-router Link aqui
                            className="w-full py-5 bg-primary text-white rounded-3xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                        >
                            <span className="material-symbols-outlined">upgrade</span>
                            Fazer Upgrade Agora
                        </button>
                    </div>
                </div>
            )}

            {/* Coluna Central: Chat */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[550px] xl:min-h-0 overflow-hidden ${isPlanBasic ? 'opacity-20 pointer-events-none' : ''}`}>
                {/* Header do Chat */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-800/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                            <img src="/avatar_psique.png" alt="Psiquê" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Psiquê AI</h2>
                            <div className="flex items-center gap-1.5">
                                <span className={`size-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    {isLoading ? 'Pensando...' : 'Parceira Clínica Online'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Histórico do Chat */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-50/20 dark:bg-slate-900/20"
                >
                    {mensagens.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role !== 'user' && (
                                <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center mr-2 mt-1 shrink-0 overflow-hidden border border-primary/10">
                                    <img src="/avatar_psique.png" alt="Psiquê" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                                msg.role === 'user' 
                                    ? 'bg-primary text-white rounded-tr-none shadow-primary/20' 
                                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start animate-pulse">
                            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-2 mt-1">
                                <span className="material-symbols-outlined text-sm text-slate-400">more_horiz</span>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800/50 h-10 w-24 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700"></div>
                        </div>
                    )}
                </div>

                {/* Input de Mensagem */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 max-w-4xl mx-auto w-full">
                        <input 
                            type="text"
                            value={input}
                            disabled={isLoading}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={pacienteSelecionado ? `Falar sobre ${pacienteSelecionado.nome.split(' ')[0]}...` : "Pergunte algo para seu colega clínico..."}
                            className="w-full h-14 pl-5 pr-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium shadow-sm"
                        />
                        <button 
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 size-11 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-xl">send</span>
                        </button>
                    </form>
                    <p className="text-[9px] text-slate-400 text-center mt-3 font-bold uppercase tracking-[0.2em] opacity-60">
                        Inteligência Artificial Psiquê v3.0 • Ambiente Seguro • Dados Não Treinam a IA
                    </p>
                </div>
            </div>

            {/* Barra Lateral Direita */}
            <div className={`w-full xl:w-[450px] shrink-0 flex flex-col gap-6 overflow-visible xl:overflow-y-auto scrollbar-hide ${isPlanBasic ? 'opacity-20 pointer-events-none' : ''}`}>
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col max-h-[330px]">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm font-bold">search</span>
                            <input 
                                type="text"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                placeholder="Filtrar por nome ou ID..."
                                className="w-full h-9 pl-9 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs font-bold focus:border-primary transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                        {pacientesFiltrados.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPacienteSelecionado(p)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all mb-1 ${
                                    pacienteSelecionado?.id === p.id 
                                        ? 'bg-primary/10 border border-primary/20 shadow-sm' 
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent opacity-70 hover:opacity-100'
                                }`}
                            >
                                <div className={`size-8 rounded-lg flex items-center justify-center font-black text-[10px] shadow-sm ${p.cor || 'bg-slate-100 text-slate-500'}`}>
                                    {p.iniciais}
                                </div>
                                <div className="flex flex-col items-start overflow-hidden text-left">
                                    <span className={`text-xs font-black truncate w-full uppercase ${pacienteSelecionado?.id === p.id ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {p.nome}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-bold tracking-widest leading-none mt-0.5">ID: {p.id}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    {pacienteSelecionado ? (
                        <>
                            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/30">
                                {[
                                    { id: 'ficha', label: 'Ficha', icon: 'person' },
                                    { id: 'evolucoes', label: 'Evoluções', icon: 'clinical_notes' },
                                    { id: 'timeline', label: 'Timeline', icon: 'visibility' }
                                ].map(aba => (
                                    <button
                                        key={aba.id}
                                        onClick={() => setAbaAtiva(aba.id)}
                                        className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all border-b-2 ${
                                            abaAtiva === aba.id 
                                                ? 'text-primary border-primary bg-primary/[0.03]' 
                                                : 'text-slate-400 border-transparent hover:text-slate-600'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-lg leading-tight">{aba.icon}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest">{aba.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
                                {abaAtiva === 'ficha' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`size-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${pacienteSelecionado.cor}`}>
                                                {pacienteSelecionado.iniciais}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight">{pacienteSelecionado.nome}</h4>
                                                <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full font-black w-fit mt-1.5 inline-block uppercase tracking-wider">
                                                    {pacienteSelecionado.status}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Idade</p>
                                                <p className="text-xs font-black text-slate-700 dark:text-slate-300">{calcularIdade(pacienteSelecionado.dataNascimento)}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Convênio</p>
                                                <p className="text-xs font-black text-slate-700 dark:text-slate-300 truncate">{pacienteSelecionado.plano || 'Particular'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Queixa Principal</p>
                                            <div className="p-4 bg-primary/[0.03] rounded-2xl border border-primary/10 relative">
                                                <span className="material-symbols-outlined absolute right-3 top-3 text-primary/20 text-lg">format_quote</span>
                                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                                    "{pacienteSelecionado.queixa || 'Nenhuma observação registrada.'}"
                                                </p>
                                            </div>
                                            {pacienteSelecionado.historico && (
                                                <div className="mt-4">
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nota do Histórico</p>
                                                    <p className="text-xs font-medium text-slate-500 italic leading-relaxed">{pacienteSelecionado.historico}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {abaAtiva === 'evolucoes' && (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Registros de Sessão</h4>
                                        {getEvolucoesPaciente().length > 0 ? (
                                            getEvolucoesPaciente().map((ev, i) => (
                                                <div key={i} className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary/20 transition-all cursor-pointer group shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-md leading-none">{ev.data}</span>
                                                        <span className="material-symbols-outlined text-[18px] text-slate-300 group-hover:text-primary transition-colors">arrow_right_alt</span>
                                                    </div>
                                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 leading-tight">{ev.tipo}</p>
                                                    <p className="text-[11px] text-slate-500 line-clamp-3 italic leading-relaxed">"{ev.subjetivo}"</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center text-slate-300">
                                                <span className="material-symbols-outlined text-4xl mb-3 opacity-30">history_edu</span>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Sem evoluções registradas</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {abaAtiva === 'timeline' && (
                                    <div className="space-y-6 pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                                        {getTimelineData().length > 0 ? (
                                            getTimelineData().map((item, i) => (
                                                <div key={i} className="relative">
                                                    <div className={`absolute -left-[23.5px] top-0 size-4.5 rounded-full bg-white dark:bg-slate-900 border-2 border-current flex items-center justify-center p-0.5 ${item.color} shadow-sm`}>
                                                        <span className="material-symbols-outlined text-[10px] font-black tracking-tight">{item.icon}</span>
                                                    </div>
                                                    <div className="pt-0.5">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                                            {new Date(item.data || item.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                        </span>
                                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight mb-1">{item.type}: {item.tipo || item.documentoId || 'Documento'}</p>
                                                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed italic opacity-80">
                                                            "{item.subjetivo || item.demanda || item.finalidade || 'Registro clínico assinado.'}"
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 -ml-6 text-center text-slate-300">
                                                <span className="material-symbols-outlined text-4xl mb-3 opacity-30">timeline</span>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Timeline sem registros</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="size-24 rounded-full bg-primary/5 flex items-center justify-center mb-6 animate-pulse">
                                <span className="material-symbols-outlined text-5xl text-primary/20">psychology_alt</span>
                            </div>
                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                                Consultoria Clínica Ativa<br/>
                                <span className="opacity-40 text-[9px] font-bold mt-2 inline-block">Selecione um perfil paciente</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIClinica;



