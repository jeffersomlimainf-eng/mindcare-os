import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NovoDocumentoModal from '../components/NovoDocumentoModal';
import AgendaSettingsModal from '../components/AgendaSettingsModal';
import { usePatients } from '../contexts/PatientContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { useEvolutions } from '../contexts/EvolutionContext';
import { useLaudos } from '../contexts/LaudoContext';
import { useAtestados } from '../contexts/AtestadoContext';
import { useDeclaracoes } from '../contexts/DeclaracaoContext';
import { useAnamneses } from '../contexts/AnamneseContext';
import { useEncaminhamentos } from '../contexts/EncaminhamentoContext';
import { useFinance } from '../contexts/FinanceContext';
import { useTcles } from '../contexts/TcleContext';
import { useUser } from '../contexts/UserContext';
import { handleNavegacaoDocumento } from '../utils/navigation';
import { formatDateLocal } from '../utils/date';
import { safeRender } from '../utils/render';
import { supabase } from '../lib/supabase';
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts';
import { INSIGHTS_PSICOLOGICOS } from '../data/insights';

const Dashboard = () => {
    const navigate = useNavigate();
    const [notas, setNotas] = useState(() => {
        const salva = localStorage.getItem('mindcare_dashboard_notes_v2');
        if (salva) {
            try { return JSON.parse(salva); } catch(e) { console.error(e); }
        }
        return [{ id: '1', titulo: 'Geral', texto: '' }];
    });
    const [ativaNotaId, setAtivaNotaId] = useState(() => {
        const salva = localStorage.getItem('mindcare_dashboard_notes_v2');
        if (salva) {
            try { return JSON.parse(salva)[0]?.id || '1'; } catch(e) {}
        }
        return '1';
    });

    useEffect(() => {
        localStorage.setItem('mindcare_dashboard_notes_v2', JSON.stringify(notas));
    }, [notas]);

    const ativoNota = notas.find(n => n.id === ativaNotaId) || notas[0] || { texto: '' };
    const { patients } = usePatients();
    const [loadingInsight, setLoadingInsight] = useState(false);
    
    // Estados do Clima Tempo
    const [cidade, setCidade] = useState(() => localStorage.getItem('dashboard_clima_cidade') || 'São Paulo, SP');
    const [dadosClima, setDadosClima] = useState({ temp: 26, condicao: 'Ensolarado', icone: 'wb_sunny', umidade: 60, vento: 12 });
    const [loadingClima, setLoadingClima] = useState(false);
    const [editandoCidade, setEditandoCidade] = useState(false);
    
    // Estado do Relógio
    const [hora, setHora] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setHora(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchClima = async () => {
            if (!cidade.trim()) return;
            setLoadingClima(true);
            try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cidade)}&format=json`, {
                    headers: { 'User-Agent': 'MindCareOS/1.0' }
                });
                const geoData = await geoRes.json();
                if (geoData && geoData.length > 0) {
                    const { lat, lon } = geoData[0];
                    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m`);
                    const weatherData = await weatherRes.json();
                    
                    if (weatherData.current_weather) {
                        const current = weatherData.current_weather;
                        const horaAtual = new Date().toISOString().substring(0, 13) + ":00";
                        const indexHora = weatherData.hourly?.time.indexOf(horaAtual) ?? -1;
                        const umidade = indexHora >= 0 ? weatherData.hourly.relative_humidity_2m[indexHora] : 60;

                        const code = current.weathercode;
                        let condicao = 'Ensolarado';
                        let icone = 'wb_sunny';
                        
                        if (code === 0) { condicao = 'Ensolarado'; icone = 'wb_sunny'; }
                        else if ([1, 2, 3].includes(code)) { condicao = 'Parcialmente Nublado'; icone = 'partly_cloudy_day'; }
                        else if ([45, 48].includes(code)) { condicao = 'Névoa'; icone = 'foggy'; }
                        else if ([51, 53, 55, 61, 63, 65].includes(code)) { condicao = 'Chuva'; icone = 'rainy'; }
                        else if ([95].includes(code)) { condicao = 'Tempestade'; icone = 'thunderstorm'; }

                        setDadosClima({
                            temp: Math.round(current.temperature),
                            condicao,
                            icone,
                            umidade,
                            vento: Math.round(current.windspeed)
                        });
                    }
                }
            } catch (e) {
                console.error("Erro ao buscar clima:", e);
            } finally {
                setLoadingClima(false);
            }
        };

        fetchClima();
    }, [cidade]);
    
    const textareaRef = useRef(null);

    const aplicarFormatacao = (prefixo, sufixo = '') => {
        const el = textareaRef.current;
        if (!el) return;
        const { selectionStart, selectionEnd, value } = el;
        const selecionado = value.substring(selectionStart, selectionEnd);
        const novoTexto = value.substring(0, selectionStart) + prefixo + selecionado + sufixo + value.substring(selectionEnd);
        
        setNotas(prev => prev.map(n => n.id === ativaNotaId ? { ...n, texto: novoTexto } : n));
        
        setTimeout(() => {
            if (el) {
                el.focus();
                el.setSelectionRange(selectionStart + prefixo.length, selectionEnd + prefixo.length);
            }
        }, 10);
    };

    const handleGerarInsights = async () => {
        const original = ativoNota?.texto || '';
        if (!original.trim()) {
            const estrutura = `\n🧠 [Sugestão de Estrutura]:\n• Queixa Principal/Sintomas: \n• Dinâmica/Mecanismos Ativados: \n• Intervenção/Conduta Adotada: \n• Plano para Próxima Sessão: \n---`;
            setNotas(prev => prev.map(n => n.id === ativaNotaId ? { ...n, texto: original + estrutura } : n));
            return;
        }

        setLoadingInsight(true);
        try {
            const systemPrompt = `Você é o "MindCare AI Assist", um consultor clínico para psicólogos. 
Seu trabalho é ler as notas rápidas (rascunhos) que o psicólogo anotou sobre uma sessão ou paciente e estruturar insights clínicos úteis.
Retorne SEMPRE no seguinte formato (Markdown):

---
🧠 **[Análise Clínico-IA]**

**🔍 Hipóteses Táticas:**
• [Sua análise médica/psicológica]

**🛠️ Conduta Recomendada:**
• [Sugestões de intervenção em TCC ou geral]

**❓ Perguntas Chaves:**
• [O que investigar na próxima sessão]
---`;

            const { data, error } = await supabase.functions.invoke('ai-assist', {
                body: {
                    messages: [
                        { role: 'user', content: `Aqui está o meu rascunho de nota:\n\n"${original}"\n\nPor favor, gere os insights clínicos.` }
                    ],
                    systemPrompt: systemPrompt,
                    temperature: 0.5
                }
            });

            if (error) throw error;

            const aiText = data.choices[0]?.message?.content || 'Não foi possível gerar insights.';
            setNotas(prev => prev.map(n => n.id === ativaNotaId ? { ...n, texto: original + `\n\n${aiText}` } : n));
        } catch (error) {
            console.error('Erro ao gerar insights:', error);
            const estrutura = `\n🧠 [Sugestão de Estrutura]:\n• Queixa Principal/Sintomas: \n• Dinâmica/Mecanismos Ativados: \n• Intervenção/Conduta Adotada: \n• Plano para Próxima Sessão: \n--- (Erro ao conectar com AI)`;
            setNotas(prev => prev.map(n => n.id === ativaNotaId ? { ...n, texto: original + estrutura } : n));
        } finally {
            setLoadingInsight(false);
        }
    };
    const { appointments, agendaSettings } = useAppointments();
    const { evolutions } = useEvolutions();
    const { laudos } = useLaudos();
    const { atestados } = useAtestados();
    const { declaracoes } = useDeclaracoes();
    const { anamneses } = useAnamneses();
    const { encaminhamentos } = useEncaminhamentos();
    const { user } = useUser();
    const { getContasVencidas } = useFinance();
    const { tcles } = useTcles();
    const [modalDoc, setModalDoc] = useState(false);
    const [tipoDocInicial, setTipoDocInicial] = useState(null);
    const [tarefasManuais, setTarefasManuais] = useState(() => {
        try {
            const salvas = localStorage.getItem('tarefasManuais');
            return salvas ? JSON.parse(salvas) : [];
        } catch (e) { return []; }
    });
    const [completadas, setCompletadas] = useState(() => {
        try {
            const salvas = localStorage.getItem('tarefasCompletadas');
            return salvas ? JSON.parse(salvas) : {};
        } catch (e) { return {}; }
    });
    const [novaTarefa, setNovaTarefa] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('tarefasManuais', JSON.stringify(tarefasManuais));
    }, [tarefasManuais]);

    useEffect(() => {
        localStorage.setItem('tarefasCompletadas', JSON.stringify(completadas));
    }, [completadas]);

    // Fechar modais locais do Dashboard com Esc
    useGlobalShortcuts({
        isModalOpen: modalDoc,
        closeModal: () => setModalDoc(false),
        priority: 1
    });

    const totalDocumentos = (evolutions?.length || 0) + (laudos?.length || 0) + (atestados?.length || 0) + (declaracoes?.length || 0) + (anamneses?.length || 0) + (encaminhamentos?.length || 0);

    const todosDocumentosRecentes = [
        ...(evolutions || []).map(ev => ({
            id: ev.id,
            type: 'evolucao',
            name: `Evolução_${(ev.pacienteNome || '').split(' ')[0]}.pdf`,
            patient: ev.pacienteNome,
            status: ev.status || 'Finalizado',
            statusColor: 'bg-green-100 text-green-700',
            date: ev.criadoEm ? new Date(ev.criadoEm).toLocaleDateString('pt-BR') : 'Hoje',
            icon: 'clinical_notes'
        })),
        ...(laudos || []).map(doc => ({
            id: doc.id,
            type: 'laudo',
            name: `Laudo_${(doc.pacienteNome || '').split(' ')[0]}.pdf`,
            patient: doc.pacienteNome,
            status: doc.status || 'Finalizado',
            statusColor: doc.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary',
            date: doc.criadoEm ? new Date(doc.criadoEm).toLocaleDateString('pt-BR') : 'Hoje',
            icon: 'description'
        })),
        ...(atestados || []).map(doc => ({
            id: doc.id,
            type: 'atestado',
            name: `Atestado_${(doc.pacienteNome || '').split(' ')[0]}.pdf`,
            patient: doc.pacienteNome,
            status: doc.status || 'Finalizado',
            statusColor: doc.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary',
            date: doc.criadoEm ? new Date(doc.criadoEm).toLocaleDateString('pt-BR') : 'Hoje',
            icon: 'medical_information'
        }))
    ].sort((a, b) => {
        const dateA = a.date === 'Hoje' ? new Date() : new Date(a.date.split('/').reverse().join('-') || a.date);
        const dateB = b.date === 'Hoje' ? new Date() : new Date(b.date.split('/').reverse().join('-') || b.date);
        return dateB - dateA;
    }).slice(0, 5);

    const abrirModal = (tipo) => {
        setTipoDocInicial(tipo);
        setModalDoc(true);
    };

    const stats = [
        { title: 'Total de Prontuários', value: totalDocumentos.toLocaleString(), trend: '+12.5%', icon: 'folder_shared', color: 'text-primary', bgColor: 'bg-primary/10', rota: '/prontuarios' },
        { 
            title: 'Pacientes Ativos', 
            value: (patients || []).length.toString(), 
            trend: 'Total', icon: 'group', color: 'text-amber-500', bgColor: 'bg-amber-500/10', rota: '/pacientes' 
        },
        { title: 'Laudos Emitidos', value: laudos.length.toString(), trend: '+5.2%', icon: 'history_edu', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', rota: '/laudos' },
        { title: 'Declarações', value: declaracoes.length.toString(), trend: '-2.4%', icon: 'assignment_ind', color: 'text-indigo-500', bgColor: 'bg-indigo-500/10', rota: '/declaracoes' },
    ];

    const quickActions = [
        { 
            title: 'Criar Novo Laudo', 
            desc: 'Relatório psicológico', 
            icon: 'article', 
            color: 'text-primary', 
            bgColor: 'bg-primary/10', 
            count: laudos.length, 
            path: '/laudos/novo',
            categoria: 'Laudos'
        },
        { 
            title: 'Nova Declaração', 
            desc: 'Comprovante de comparecimento', 
            icon: 'verified', 
            color: 'text-emerald-500', 
            bgColor: 'bg-emerald-100', 
            count: declaracoes.length, 
            path: '/declaracoes/novo',
            categoria: 'Declarações'
        },
        { 
            title: 'Emitir Atestado', 
            desc: 'Certificado clínico', 
            icon: 'medical_information', 
            color: 'text-orange-500', 
            bgColor: 'bg-orange-100', 
            count: atestados.length, 
            path: '/atestados/novo',
            categoria: 'Atestados'
        },
        { 
            title: 'Ficha de Anamnese', 
            desc: 'Formulário detalhado', 
            icon: 'patient_list', 
            color: 'text-purple-500', 
            bgColor: 'bg-purple-100', 
            count: anamneses.length, 
            path: '/anamneses/novo',
            categoria: 'Anamneses'
        },
        { 
            title: 'Novo Encaminhamento', 
            desc: 'Encaminhar paciente', 
            icon: 'send', 
            color: 'text-sky-500', 
            bgColor: 'bg-sky-100', 
            count: encaminhamentos.length, 
            path: '/encaminhamentos/novo',
            categoria: 'Encaminhamentos'
        },
    ];

    // Jarvis Mode: Alerta de Risco Clínico
    const pacientesEmRisco = useMemo(() => {
        const riscos = (evolutions || [])
            .filter(ev => ev.nivelRisco === 'Alto' || ev.nivelRisco === 'Crítico')
            .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
        
        // Pegar apenas o risco mais recente por paciente
        const unicos = {};
        riscos.forEach(r => {
            if (!unicos[r.pacienteId]) unicos[r.pacienteId] = r;
        });
        return Object.values(unicos);
    }, [evolutions]);

    // Lógica para Próxima Sessão e Agenda de Hoje
    const hojeISO = useMemo(() => formatDateLocal(new Date()), []);

    const dataHojeFormatada = useMemo(() => {
        const d = new Date();
        const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        return `${String(d.getDate()).padStart(2, '0')} ${meses[d.getMonth()]}`;
    }, []);
    const atendimentosHoje = useMemo(() => {
        return (appointments || [])
            .filter(a => a.data === hojeISO)
            .sort((a, b) => a.timeStart - b.timeStart);
    }, [appointments, hojeISO]);

    const proximaSessao = useMemo(() => {
        try {
            const agora = new Date();
            const horaAtual = agora.getHours() + agora.getMinutes() / 60;
            const proxima = atendimentosHoje.find(a => a.timeStart + a.duracao/60 > horaAtual && a.status !== 'cancelado') || atendimentosHoje[0];
            
            if (!proxima) {
                console.log('[Dashboard] Nenhuma próxima sessão identificada para hoje.');
            }
            return proxima;
        } catch (error) {
            console.error('[Dashboard] Erro ao calcular próxima sessão:', error);
            return null;
        }
    }, [atendimentosHoje]);

    const tempoRestante = useMemo(() => {
        try {
            if (!proximaSessao) return null;
            const agora = new Date();
            const horaAtual = agora.getHours() + agora.getMinutes() / 60;
            const diff = (proximaSessao.timeStart - horaAtual) * 60;
            if (diff < 0) {
                const fimSessao = proximaSessao.timeStart + proximaSessao.duracao/60;
                if (horaAtual < fimSessao) return 'Em andamento';
                return 'Sessão encerrada';
            }
            if (diff > 60) {
                const horas = Math.floor(diff / 60);
                const mins = Math.round(diff % 60);
                return `${horas}h ${mins}min`;
            }
            return `${Math.round(diff)} min`;
        } catch (error) {
            console.error('[Dashboard] Erro ao calcular tempo restante:', error);
            return 'Erro no cálculo';
        }
    }, [proximaSessao]);

    const pendenciasDinâmicas = useMemo(() => {
        const automáticas = [];
        
        // 1. Verificar Evoluções faltantes para sessões finalizadas de hoje
        atendimentosHoje.forEach(a => {
            if (a.status === 'finalizado') {
                const temEvolucao = (evolutions || []).some(ev => 
                    ev.pacienteId === a.pacienteId && 
                    ev.criadoEm && ev.criadoEm.startsWith(hojeISO)
                );
                if (!temEvolucao) {
                    automáticas.push({
                        id: `ev-${a.id}`,
                        text: `Escrever evolução de ${a.paciente}`,
                        type: 'evolucao',
                        rota: '/prontuarios/evolucao/novo',
                        state: { pacienteId: a.pacienteId }
                    });
                }
            }
        });

        // 2. Contas a Receber Vencidas (Financeiro)
        try {
            const vencidas = getContasVencidas();
            vencidas.filter(v => v.tipo === 'receita').forEach(v => {
                automáticas.push({
                    id: `fin-${v.id}`,
                    text: `Cobrar ${v.descricao || 'Paciente'} (R$ ${Math.abs(v.valor)})`,
                    type: 'financeiro',
                    rota: '/financeiro'
                });
            });
        } catch (e) {}

        // 3. Aniversariantes de Hoje
        (patients || []).forEach(p => {
            if (p.dataNascimento) {
                const [ano, mes, dia] = p.dataNascimento.split('-');
                const hoje = new Date();
                if (parseInt(mes) === hoje.getMonth() + 1 && parseInt(dia) === hoje.getDate()) {
                    automáticas.push({
                        id: `niver-${p.id}`,
                        text: `Parabéns para ${p.nome} 🎂`,
                        type: 'niver'
                    });
                }
            }
        });

        // 4. Falta TCLE (Se for novo paciente)
        (patients || []).filter(p => {
            const criado = new Date(p.criadoEm || Date.now());
            const diffDias = (new Date() - criado) / (1000 * 60 * 60 * 24);
            return diffDias <= 7; // Criado nos últimos 7 dias
        }).forEach(p => {
            const temTcle = (tcles || []).some(t => t.pacienteId === p.id);
            if (!temTcle) {
                automáticas.push({
                    id: `tcle-${p.id}`,
                    text: `Emitir TCLE para ${p.nome}`,
                    type: 'tcle',
                    rota: '/tcles/novo',
                    state: { pacienteId: p.id }
                });
            }
        });

        // 5. Alerta de Burnout (Agenda Cheia)
        if (atendimentosHoje.length >= 6) {
            automáticas.unshift({
                id: 'burnout-alert',
                text: `⚠ï¸ Alerta: Agenda Cheia hoje (${atendimentosHoje.length} sessões). Lembre-se de respirar!`,
                type: 'alerta'
            });
        }

        // 6. Preparação (Warm-up)
        if (proximaSessao) {
            automáticas.push({
                id: `warmup-${proximaSessao.id}`,
                text: `Revisar notas da sessão de ${proximaSessao.paciente} 📖`,
                type: 'warmup',
                rota: `/prontuarios/paciente/${proximaSessao.pacienteId || proximaSessao.paciente}`
            });
        }

        // 7. Prevenção de Abandono (Churn)
        try {
            const trintaDiasAtras = new Date();
            trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
            const hojeDate = new Date();

            (patients || []).forEach(p => {
                const consultasPaciente = (appointments || []).filter(a => a.pacienteId === p.id || a.paciente === p.nome);
                const passadas = consultasPaciente.filter(a => new Date(a.data) < hojeDate);
                const futuras = consultasPaciente.filter(a => new Date(a.data) >= hojeDate);

                if (passadas.length > 0 && futuras.length === 0) {
                    const maiorData = Math.max(...passadas.map(a => new Date(a.data).getTime()));
                    if (maiorData && new Date(maiorData) >= trintaDiasAtras) {
                        automáticas.push({
                            id: `churn-${p.id}`,
                            text: `Remarcar ${p.nome} (Sem sessões futuras)`,
                            type: 'churn',
                            rota: `/prontuarios/paciente/${p.id}`
                        });
                    }
                }
            });
        } catch (e) {}

        return automáticas;
    }, [atendimentosHoje, evolutions, hojeISO, getContasVencidas, patients, tcles, proximaSessao, appointments]);

    const insightsAgenda = useMemo(() => {
        const hInicio = agendaSettings?.hInicio || 8;
        const hFim = agendaSettings?.hFim || 18;
        const horasDia = hFim - hInicio;
        const totalVagasSemana = horasDia * 5;

        const hojeDate = new Date();
        const diaSemana = hojeDate.getDay();
        const diffSegunda = hojeDate.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1);
        const segunda = new Date(hojeDate);
        segunda.setDate(diffSegunda);
        segunda.setHours(0, 0, 0, 0);

        const sexta = new Date(segunda);
        sexta.setDate(segunda.getDate() + 4);
        sexta.setHours(23, 59, 59, 999);

        const ocupados = (appointments || []).filter(a => {
            if (a.status === 'cancelado' || a.status === 'faltou') return false;
            const d = new Date(a.data);
            return d >= segunda && d <= sexta;
        }).length;

        const vagasSemana = Math.max(0, totalVagasSemana - ocupados);
        const percentualOcupado = totalVagasSemana > 0 ? Math.round((ocupados / totalVagasSemana) * 100) : 0;

        return {
            vagasSemana,
            percentualOcupado,
            horasExpediente: `${hInicio}h-${hFim}h`
        };
    }, [appointments, agendaSettings]);

    const todasPendencias = useMemo(() => {
        const ordem = { alerta: 1, warmup: 2, niver: 3, evolucao: 4, financeiro: 5, tcle: 6, churn: 7, manual: 8 };
        return [
            ...pendenciasDinâmicas.map(p => ({ ...p, completed: completadas[p.id] || false })),
            ...tarefasManuais.map(p => ({ ...p, completed: completadas[p.id] || false }))
        ].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return (ordem[a.type] || 99) - (ordem[b.type] || 99);
        });
    }, [pendenciasDinâmicas, tarefasManuais, completadas]);

    const formatarHora = (h) => {
        try {
            const numH = Number(h);
            if (isNaN(numH)) return '--:--';
            const hh = Math.floor(numH);
            const mm = Math.round((numH - hh) * 60);
            return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
        } catch (e) {
            return '--:--';
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <NovoDocumentoModal
                isOpen={modalDoc}
                onClose={() => setModalDoc(false)}
                tipoInicial={tipoDocInicial}
            />

            {/* Welcome Area Re-designed */}
            <div className="flex flex-col gap-8 px-1">
                <div>
                    <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold tracking-tight">Olá, {safeRender(user.nome, 'Doutor(a)')}</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Você tem <span className="text-primary font-bold">{atendimentosHoje.length} sessões</span> agendadas para hoje. Sua manhã está tranquila.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Próxima Sessão Card */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative overflow-hidden group min-h-[220px]">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all">
                            <span className="material-symbols-outlined text-[100px] text-primary rotate-12">calendar_today</span>
                        </div>
                        
                        <div className="flex-1 text-left w-full flex flex-col justify-center">
                            <div className="flex flex-col items-start gap-2 mb-3">
                                <span className="inline-flex px-3 py-1 bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Próxima Sessão • {proximaSessao ? formatarHora(proximaSessao.timeStart) : '--:--'}
                                </span>
                                <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wide">Tempo restante: <span className="text-slate-900 dark:text-white font-black italic">{tempoRestante || '---'}</span></span>
                            </div>
                            
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
                                {safeRender(proximaSessao?.paciente, 'Nenhum agendamento')}
                                {proximaSessao?.pacienteId && (
                                    <span className="text-slate-400 font-medium ml-2">
                                        , {(() => {
                                            const p = patients.find(pat => pat.id === proximaSessao.pacienteId);
                                            if (!p?.dataNascimento) return '29';
                                            const birth = new Date(p.dataNascimento);
                                            const age = new Date().getFullYear() - birth.getFullYear();
                                            return age;
                                        })()}
                                    </span>
                                )}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-base mb-6 capitalize">
                                {proximaSessao?.tipo || 'Sessão'} • {proximaSessao?.duracao || '50'} min
                            </p>

                            <div className="flex flex-wrap justify-start gap-3">
                                <button 
                                    onClick={() => proximaSessao && navigate('/prontuarios/evolucao/novo', { state: { pacienteId: proximaSessao.pacienteId || proximaSessao.paciente } })}
                                    className="h-10 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-orange-500/25 active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-xl">play_circle</span>
                                    Iniciar Sessão
                                </button>
                                <button 
                                    onClick={() => proximaSessao && navigate(`/linha-do-tempo/${proximaSessao.pacienteId?.replace('#', '') || proximaSessao.paciente}`)}
                                    className="h-10 px-6 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                                >
                                    Ver Prontuário
                                </button>
                            </div>
                        </div>

                        {/* Clima Tempo Widget */}
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 w-full md:w-auto md:self-center justify-center shadow-lg shadow-slate-100/50 dark:shadow-none hover:shadow-xl transition-all relative z-10">
                            <div className="flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined text-4xl text-amber-500 animate-pulse">{dadosClima.icone}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dadosClima.condicao}</span>
                            </div>
                            <div className="h-12 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-0.5 relative">
                                    {loadingClima && <span className="absolute -left-5 top-2 size-3 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>}
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">{dadosClima.temp}°</span>
                                    <span className="text-sm font-bold text-slate-400">C</span>

                                    <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>

                                    <div className="flex items-baseline gap-0.5" title="Hora atual">
                                        <span className="text-2xl font-black text-slate-700 dark:text-slate-300">
                                            {hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 ml-0.5 animate-pulse">
                                            :{String(hora.getSeconds()).padStart(2, '0')}
                                        </span>
                                    </div>
                                </div>
                                
                                {editandoCidade ? (
                                    <input 
                                        type="text"
                                        defaultValue={cidade}
                                        autoFocus
                                        onBlur={(e) => {
                                            const nova = e.target.value.trim();
                                            if (nova) {
                                                setCidade(nova);
                                                localStorage.setItem('dashboard_clima_cidade', nova);
                                            }
                                            setEditandoCidade(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const nova = e.target.value.trim();
                                                if (nova) {
                                                    setCidade(nova);
                                                    localStorage.setItem('dashboard_clima_cidade', nova);
                                                }
                                                setEditandoCidade(false);
                                            }
                                        }}
                                        className="text-[10px] font-black text-slate-900 dark:text-white uppercase bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1 max-w-[110px] outline-none focus:border-primary"
                                    />
                                ) : (
                                    <span 
                                        onClick={() => setEditandoCidade(true)}
                                        className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:text-primary transition-colors group"
                                        title="Clique para mudar a cidade"
                                    >
                                        <span className="material-symbols-outlined text-[12px] text-primary">location_on</span>
                                        {cidade}
                                        <span className="material-symbols-outlined text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                                    </span>
                                )}
                                
                                <div className="flex gap-3 mt-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                    <span>💧 {dadosClima.umidade}%</span>
                                    <span>💨 {dadosClima.vento} km/h</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Agenda de Hoje SideBlock */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-slate-900 dark:text-white font-black text-lg uppercase tracking-tight">Agenda de Hoje</h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded">{dataHojeFormatada}</span>
                        </div>

                        <div className="space-y-6 flex-1 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
                            {atendimentosHoje.map((a, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => navigate(`/prontuarios/paciente/${a.pacienteId?.replace('#', '') || a.paciente}`)}
                                    className="flex gap-4 relative cursor-pointer group/item"
                                >
                                    {/* Timeline line */}
                                    {i !== atendimentosHoje.length - 1 && <div className="absolute left-[7px] top-4 bottom-[-24px] w-0.5 bg-slate-100 dark:bg-slate-700"></div>}
                                    
                                    <div className={`size-4 rounded-full border-4 border-white dark:border-slate-800 shrink-0 z-10 mt-1 transition-transform group-hover/item:scale-125 ${a.status === 'finalizado' ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-600'}`}></div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[11px] font-bold ${a.status === 'finalizado' ? 'text-orange-500' : 'text-slate-500'}`}>
                                                {formatarHora(a.timeStart)} - {formatarHora(a.timeStart + a.duracao/60)}
                                            </span>
                                            {a.status === 'finalizado' ? (
                                                <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-slate-200 dark:text-slate-700 text-lg group-hover/item:text-primary transition-colors">arrow_forward</span>
                                            )}
                                        </div>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight mt-0.5 group-hover/item:text-primary transition-colors">{safeRender(a.paciente)}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                                            {a.tipo === 'teleconsulta' ? 'Teleconsulta' : 'Presencial'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {atendimentosHoje.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                    <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                                    <p className="text-xs font-bold uppercase">Nenhuma sessão hoje</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Jarvis Mode: Alertas Críticos */}
            {pacientesEmRisco.length > 0 && (
                <div className="px-1">
                    <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/50 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                            <span className="material-symbols-outlined text-6xl text-red-500 animate-pulse">monitoring</span>
                        </div>
                        <div className="size-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                            <span className="material-symbols-outlined text-2xl animate-pulse">warning</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                Jarvis Mode: Alerta de Segurança Clínica
                                <span className="size-1.5 rounded-full bg-red-500 animate-ping"></span>
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {pacientesEmRisco.map(r => (
                                    <button 
                                        key={r.id}
                                        onClick={() => navigate(`/prontuarios/paciente/${r.pacienteId.replace('#', '')}`)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-red-200 dark:border-red-800 hover:border-red-500 transition-all shadow-sm"
                                    >
                                        <div className="size-2 rounded-full bg-red-500"></div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-red-200">{safeRender(r.pacienteNome)}</span>
                                        <span className="text-[9px] font-black text-red-600 dark:text-red-400 uppercase">{r.nivelRisco}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
                {stats.map((stat, index) => (
                    <button
                        key={index}
                        onClick={() => navigate(stat.rota)}
                        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all text-left group relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`size-12 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.color} transition-transform`}>
                                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide ${stat.trend.includes('+') ? 'bg-green-500/10 text-green-600' : stat.trend.includes('-') ? 'bg-red-500/10 text-red-600' : 'bg-slate-500/10 text-slate-400'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.title}</p>
                        <p className="text-slate-900 dark:text-white text-3xl font-bold">{stat.value}</p>
                    </button>
                ))}
            </div>


            {/* Quick Actions */}
            <section className="px-1">
                <div className="flex items-center gap-2 mb-6 opacity-60">
                    <span className="material-symbols-outlined text-primary text-base">bolt</span>
                    <h3 className="text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest">Ações Rápidas</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(action.path, { state: { categoria: action.categoria } })}
                            className="bg-white dark:bg-slate-800 flex items-center gap-4 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left group"
                        >
                            <div className={`size-12 rounded-lg ${action.bgColor} flex items-center justify-center ${action.color} shrink-0 relative`}>
                                <span className="material-symbols-outlined text-xl">{action.icon}</span>
                                {action.count >= 0 && (
                                    <span className="absolute -top-1 -right-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                                        {action.count}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-slate-900 dark:text-white font-bold text-sm truncate">{action.title}</p>
                                <p className="text-slate-500 text-[10px] uppercase truncate">{action.desc}</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-all">chevron_right</span>
                        </button>
                    ))}
                </div>
            </section>


            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Coluna 1: Pendências e Ocupação */}
                <div className="flex flex-col gap-6">
                    {/* Pendências do Dia */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2 opacity-60">
                                <span className="material-symbols-outlined text-primary text-base">fact_check</span>
                                <h3 className="text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest">Pendências do Dia</h3>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                            {/* Input para Adicionar */}
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (!novaTarefa.trim()) return;
                                setTarefasManuais([...tarefasManuais, { id: `manual-${Date.now()}`, text: novaTarefa.trim(), type: 'manual' }]);
                                setNovaTarefa('');
                            }} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={novaTarefa} 
                                    onChange={e => setNovaTarefa(e.target.value)} 
                                    placeholder="Adicionar lembrete..." 
                                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-xs rounded-lg border border-slate-100 dark:border-slate-700 focus:outline-none focus:border-primary text-slate-900 dark:text-white"
                                />
                                <button type="submit" className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                            </form>

                            {/* Lista de Tarefas */}
                            <div className="space-y-3 max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
                                {todasPendencias.length > 0 ? todasPendencias.map((task) => (
                                    <div key={task.id} className="flex items-start gap-2 group">
                                        <button 
                                            onClick={() => setCompletadas(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                                            className="mt-0.5 size-4 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-primary shrink-0"
                                        >
                                            {task.completed && <span className="material-symbols-outlined text-xs text-primary font-bold">check</span>}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                                                {task.text}
                                            </p>
                                            {task.rota && !task.completed && (
                                                <button 
                                                    onClick={() => navigate(task.rota, task.state ? { state: task.state } : {})} 
                                                    className="text-[9px] font-bold text-primary hover:underline mt-0.5 inline-flex items-center gap-0.5"
                                                >
                                                    <span className="material-symbols-outlined text-[11px]">{task.type === 'evolucao' ? 'edit_note' : 'east'}</span>
                                                    {task.type === 'evolucao' ? 'Escrever agora' : task.type === 'financeiro' ? 'Ir para Financeiro' : 'Emitir agora'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center py-6 opacity-30">
                                        <span className="material-symbols-outlined text-3xl mb-1">check_circle</span>
                                        <p className="text-[10px] font-bold uppercase">Tudo em dia!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Insights de Agenda */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2 opacity-60">
                                <span className="material-symbols-outlined text-primary text-base">calendar_view_week</span>
                                <h3 className="text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest">Ocupação da Semana</h3>
                            </div>
                            <button 
                                onClick={() => setIsSettingsOpen(true)} 
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-primary transition-all flex items-center justify-center" 
                                title="Configurar Expediente"
                            >
                                <span className="material-symbols-outlined text-base">settings</span>
                            </button>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{insightsAgenda.vagasSemana} <span className="text-xs text-slate-400 font-medium">vagas</span></p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Expediente: {insightsAgenda.horasExpediente}</p>
                                </div>
                                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-2xl">event_available</span>
                                </div>
                            </div>
                            
                            {/* Barra de Progresso */}
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all" style={{ width: `${insightsAgenda.percentualOcupado}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">{insightsAgenda.percentualOcupado}% da sua agenda preenchida</p>

                            {insightsAgenda.vagasSemana > 0 && (
                                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">lightbulb</span>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                        Você tem <span className="font-bold text-primary">{insightsAgenda.vagasSemana} horários</span> livres para encaixe. Que tal mandar um lembrete para sua fila de espera?
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tip Area - Reflexão Dinâmica */}
                    {(() => {
                        const today = new Date();
                        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
                        const h = today.getHours();
                        const index = (dayOfYear * 24 + h) % INSIGHTS_PSICOLOGICOS.length;
                        const insight = INSIGHTS_PSICOLOGICOS[index] || { frase: "Carregando reflexão...", autor: "" };
                        return (
                            <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-900 rounded-xl p-6 border border-white/10 relative overflow-hidden group shadow-md hover:shadow-lg transition-all">
                                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform text-white">
                                    <span className="material-symbols-outlined text-8xl">format_quote</span>
                                </div>
                                <div className="relative z-10 flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-white/90">
                                        <span className="material-symbols-outlined text-lg">psychology</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Reflexão do Momento</span>
                                    </div>
                                    
                                    <p className="text-base text-white leading-relaxed font-bold italic">
                                        "{insight.frase}"
                                    </p>
                                    
                                    {insight.autor && (
                                        <div className="text-[10px] text-white/80 font-semibold uppercase tracking-wider text-right border-t border-white/10 pt-2">
                                            — {insight.autor}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Coluna 2: Bloco de Notas Rápidas */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 opacity-60">
                            <span className="material-symbols-outlined text-primary text-base">edit_note</span>
                            <h3 className="text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest">Anotações Gerais</h3>
                        </div>
                    </div>

                    {/* Barra de Abas */}
                    <div className="flex items-center gap-1.5 px-1 overflow-x-auto scrollbar-none max-w-full">
                        {notas.map(n => (
                            <button 
                                key={n.id} 
                                onClick={() => setAtivaNotaId(n.id)}
                                onDoubleClick={() => {
                                    const novoTitulo = prompt("Renomear nota para:", n.titulo);
                                    if (novoTitulo && novoTitulo.trim()) {
                                        setNotas(prev => prev.map(no => no.id === n.id ? { ...no, titulo: novoTitulo.trim() } : no));
                                    }
                                }}
                                className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border transition-all flex items-center gap-1 shrink-0 hover:scale-95 ${ativaNotaId === n.id ? `bg-primary/10 border-primary/20 text-primary` : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-100'}`}
                                title="Dois cliques para renomear"
                            >
                                <span className={`material-symbols-outlined text-[11px] ${n.cor === 'red' ? 'text-red-500' : n.cor === 'green' ? 'text-green-500' : n.cor === 'orange' ? 'text-orange-500' : n.cor === 'purple' ? 'text-purple-500' : n.cor === 'pink' ? 'text-pink-500' : n.cor === 'cyan' ? 'text-cyan-500' : n.cor === 'yellow' ? 'text-yellow-500' : ''}`}>description</span>
                                <span className="truncate max-w-[65px]">{n.titulo}</span>

                                {notas.length > 1 && (
                                    <span 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Evitar trocar de aba
                                            const filtrado = notas.filter(no => no.id !== n.id);
                                            setNotas(filtrado);
                                            if (ativaNotaId === n.id) {
                                                // Definir a próxima nota ativa
                                                const proxima = filtrado[0]?.id || '1';
                                                setAtivaNotaId(proxima);
                                            }
                                        }}
                                        className="material-symbols-outlined text-[10px] ml-0.5 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-500 rounded-full p-0.5 transition-all cursor-pointer"
                                        title="Excluir nota"
                                    >
                                        close
                                    </span>
                                )}
                            </button>
                        ))}
                        <button 
                            onClick={() => {
                                // Inteligência: Renomear nota anterior se for "Nota X"
                                const novo = { id: `n-${Date.now()}`, titulo: `Nota ${notas.length + 1}`, texto: '', cor: 'primary' };
                                setNotas(prev => {
                                    const atualizado = prev.map(n => {
                                        if (n.id === ativaNotaId && n.titulo.startsWith('Nota ') && n.texto.trim()) {
                                            const primeiraLinha = n.texto.split('\n')[0].substring(0, 15).trim();
                                            if (primeiraLinha) return { ...n, titulo: primeiraLinha };
                                        }
                                        return n;
                                    });
                                    return [...atualizado, novo];
                                });
                                setAtivaNotaId(novo.id);
                            }}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-all flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 shrink-0"
                            title="Nova Nota"
                        >
                            <span className="material-symbols-outlined text-xs">add</span>
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3 min-h-[220px] h-full">
                        {/* Barra de Ferramentas de Formatação */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 flex-wrap gap-2">
                            {/* Seletor de Cores */}
                            <div className="flex items-center gap-1 opacity-80 flex-wrap max-w-[150px]">
                                {['primary', 'red', 'green', 'orange', 'purple', 'pink', 'cyan', 'yellow'].map(cor => (
                                    <button 
                                        key={cor}
                                        onClick={() => setNotas(prev => prev.map(n => n.id === ativaNotaId ? { ...n, cor } : n))}
                                        className={`size-2.5 rounded-full border transition-all ${cor === 'red' ? 'bg-red-500' : cor === 'green' ? 'bg-green-500' : cor === 'orange' ? 'bg-orange-400' : cor === 'purple' ? 'bg-purple-500' : cor === 'pink' ? 'bg-pink-500' : cor === 'cyan' ? 'bg-cyan-500' : cor === 'yellow' ? 'bg-yellow-400' : 'bg-primary'} ${ativoNota?.cor === cor ? 'border-white dark:border-slate-900 ring-2 ring-primary ring-offset-1' : 'border-transparent'}`}
                                        title={cor === 'primary' ? 'Padrão' : cor.toUpperCase()}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-1">

                                <button onClick={() => aplicarFormatacao('\n• ')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 flex items-center justify-center" title="Lista de Marcadores"><span className="material-symbols-outlined text-sm">format_list_bulleted</span></button>
                            </div>
                            
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <button 
                                    onClick={handleGerarInsights}
                                    disabled={loadingInsight}
                                    className="px-2 py-1 bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded text-[9px] font-black flex items-center gap-1 shadow-sm hover:scale-95 transition-all disabled:opacity-50"
                                    title="Gerar insights clínicos com IA"
                                >
                                    <span className={`material-symbols-outlined text-[11px] ${loadingInsight ? 'animate-spin' : ''}`}>{loadingInsight ? 'sync' : 'auto_awesome'}</span>
                                    {loadingInsight ? 'Gerando...' : 'Gerar Ideias'}
                                </button>

                                {/* Vincular a Paciente */}
                                <select 
                                    className="text-[9px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-slate-600 dark:text-slate-300 outline-none max-w-[90px] truncate hover:border-primary transition-all cursor-pointer"
                                    onChange={(e) => {
                                        const pId = e.target.value;
                                        if (!pId) return;
                                        
                                        // Navegar para prontuário com o texto como rascunho
                                        navigate(`/prontuarios/paciente/${pId.replace('#', '')}`, { 
                                            state: { evolucaoInicial: ativoNota?.texto } 
                                        });
                                        
                                        // Resetar select
                                        e.target.value = "";
                                    }}
                                >
                                    <option value="">🔗 Vincular</option>
                                    {patients?.map(p => (
                                        <option key={p.id} value={p.id}>{p.nome || p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <textarea 
                            ref={textareaRef}
                            value={ativoNota?.texto || ''}
                            onChange={(e) => {
                                setNotas(prev => prev.map(n => n.id === ativaNotaId ? { ...n, texto: e.target.value } : n));
                            }}
                            placeholder="Clique para digitar seus lembretes e notas do dia (salva automático)..."
                            className="bg-transparent text-xs text-slate-600 dark:text-slate-300 resize-none outline-none flex-1 min-h-[140px] leading-relaxed placeholder:italic"
                        />
                        <div className="flex items-center justify-end gap-1.5 opacity-40 mt-auto border-t border-slate-100 dark:border-slate-800 pt-2">
                            <span className="material-symbols-outlined text-xs">sync</span>
                            <span className="text-[8px] font-bold uppercase tracking-wider">Salvo Localmente</span>
                        </div>
                    </div>
                </div>

                {/* Coluna 3: Documentos Recentes */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 opacity-60">
                            <span className="material-symbols-outlined text-primary text-base">description</span>
                            <h3 className="text-slate-900 dark:text-white font-bold text-[10px] uppercase tracking-widest">Documentos Recentes</h3>
                        </div>
                        <button onClick={() => navigate('/prontuarios')} className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline transition-all">
                            Ver todos
                        </button>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documento</th>
                                        <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paciente</th>
                                        <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-4 md:px-6 py-3 md:py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {todosDocumentosRecentes.length > 0 ? (
                                        todosDocumentosRecentes.map((doc, i) => (
                                            <tr 
                                                key={i} 
                                                onDoubleClick={() => handleNavegacaoDocumento(doc, navigate)} 
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
                                            >
                                                <td className="px-4 md:px-6 py-3 md:py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
                                                            <span className="material-symbols-outlined text-lg">{doc.icon}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-slate-900 dark:text-white uppercase truncate max-w-[150px]">{doc.name}</span>
                                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{doc.date}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4">
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{safeRender(doc.patient)}</span>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4">
                                                    <span className={`px-2.5 py-1 inline-flex items-center rounded-full text-[10px] font-bold uppercase tracking-wide ${doc.status === 'Assinado' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                                                        {doc.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                                                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-xs italic">Nenhuma atividade recente encontrada.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


            </div>

            {/* Modais */}
            {modalDoc && <NovoDocumentoModal isOpen={modalDoc} onClose={() => setModalDoc(false)} tipo={tipoDocInicial} />}
            <AgendaSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};

export default Dashboard;
