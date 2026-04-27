import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { showToast } from './Toast';
import { ESCALAS_RAPIDAS, ESCALAS_CATALOG } from '../data/escalasData';
import { logger } from '../utils/logger';

const MOOD_MAP = {
    1: { emoji: '😢', label: 'Muito mal' },
    2: { emoji: '😐', label: 'Mal' },
    3: { emoji: '🙂', label: 'Neutro' },
    4: { emoji: '😊', label: 'Bem' },
    5: { emoji: '🤩', label: 'Muito bem' },
};

const PortalPacienteTab = ({ paciente }) => {
    const { user } = useUser();
    const [portalAtivo, setPortalAtivo] = useState(null);
    const [profileId, setProfileId] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [moods, setMoods] = useState([]);
    const [escalas, setEscalas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showEnviarEscala, setShowEnviarEscala] = useState(false);
    const [enviandoEscala, setEnviandoEscala] = useState(false);
    const [escalaSelecionada, setEscalaSelecionada] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [taskForm, setTaskForm] = useState({ title: '', description: '', due_date: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (paciente?.id) fetchPortalData();
    }, [paciente?.id]);

    const fetchPortalData = async () => {
        setLoading(true);
        try {
            const { data: pat } = await supabase
                .from('patients')
                .select('patient_profile_id')
                .eq('id', paciente.id)
                .single();

            const pid = pat?.patient_profile_id || null;
            setProfileId(pid);
            setPortalAtivo(!!pid);

            if (pid) {
                const [{ data: tData }, { data: mData }] = await Promise.all([
                    supabase.from('patient_tasks').select('*').eq('patient_profile_id', pid).order('created_at', { ascending: false }),
                    supabase.from('patient_mood_logs').select('*').eq('patient_profile_id', pid).order('created_at', { ascending: false }).limit(20),
                ]);
                setTasks(tData || []);
                setMoods(mData || []);
            }

            // Escalas: busca pelo patient_id (não precisa do portal ativo)
            const { data: eData } = await supabase
                .from('patient_escalas')
                .select('id, nome, escala_id, status, created_at, answered_at')
                .eq('patient_id', paciente.id)
                .order('created_at', { ascending: false });
            setEscalas(eData || []);
        } catch (err) {
            logger.error('[PortalPacienteTab] fetchPortalData:', err.message);
            setPortalAtivo(false);
        } finally {
            setLoading(false);
        }
    };

    const handleAtivarPortal = async () => {
        if (!paciente.email) {
            showToast('Este paciente não tem e-mail cadastrado.', 'error');
            return;
        }
        setActivating(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-patient-auth', {
                body: { email: paciente.email, patient_id: paciente.id }
            });
            if (error || !data?.success) throw new Error(data?.error || 'Erro ao ativar portal');
            setPortalAtivo(true);
            showToast('Portal ativado! Senha inicial: 123456', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setActivating(false);
        }
    };

    const openNew = () => {
        setEditingTask(null);
        setTaskForm({ title: '', description: '', due_date: '' });
        setShowModal(true);
    };

    const openEdit = (task) => {
        setEditingTask(task);
        setTaskForm({
            title: task.title,
            description: task.description || '',
            due_date: task.due_date || '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTask(null);
        setTaskForm({ title: '', description: '', due_date: '' });
    };

    const handleSaveTask = async () => {
        if (!taskForm.title.trim()) { showToast('Informe um título.', 'error'); return; }
        setSaving(true);
        try {
            const payload = {
                title: taskForm.title.trim(),
                description: taskForm.description.trim(),
                due_date: taskForm.due_date || null,
            };
            if (editingTask) {
                const { error } = await supabase.from('patient_tasks').update(payload).eq('id', editingTask.id);
                if (error) throw error;
                showToast('Tarefa atualizada!', 'success');
            } else {
                const { error } = await supabase.from('patient_tasks').insert({
                    ...payload,
                    patient_profile_id: profileId,
                    therapist_id: user?.id,
                });
                if (error) throw error;
                showToast('Tarefa enviada!', 'success');
            }
            closeModal();
            fetchPortalData();
        } catch {
            showToast('Erro ao salvar tarefa.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Excluir esta tarefa?')) return;
        const { error } = await supabase.from('patient_tasks').delete().eq('id', taskId);
        if (error) { showToast('Erro ao excluir.', 'error'); return; }
        setTasks(prev => prev.filter(t => t.id !== taskId));
        showToast('Tarefa removida.', 'success');
    };

    const handleEnviarEscala = async () => {
        if (!escalaSelecionada) return;
        const cat = ESCALAS_CATALOG.find(e => e.id === escalaSelecionada);
        if (!cat) return;
        setEnviandoEscala(true);
        try {
            const { error } = await supabase.from('patient_escalas').insert([{
                patient_id: paciente.id,
                escala_id: cat.id,
                nome: cat.nome,
                instrucoes: cat.instrucoes,
                questions: cat.questions.map(q => typeof q === 'string' ? { text: q } : q),
                response_options: cat.response_options,
                response_labels: cat.response_labels,
                status: 'pendente',
            }]);
            if (error) throw error;
            showToast(`Escala ${cat.nome} enviada!`, 'success');
            setShowEnviarEscala(false);
            setEscalaSelecionada('');
            // Atualiza lista local otimisticamente
            setEscalas(prev => [{
                id: Date.now().toString(),
                nome: cat.nome,
                escala_id: cat.id,
                status: 'pendente',
                created_at: new Date().toISOString(),
                answered_at: null,
            }, ...prev]);
        } catch {
            showToast('Erro ao enviar escala.', 'error');
        } finally {
            setEnviandoEscala(false);
        }
    };

    const handleCancelarEscala = async (escalaId) => {
        if (!confirm('Cancelar o envio desta escala? O paciente não poderá mais respondê-la.')) return;
        const { error } = await supabase.from('patient_escalas').delete().eq('id', escalaId);
        if (error) { showToast('Erro ao cancelar escala.', 'error'); return; }
        setEscalas(prev => prev.filter(e => e.id !== escalaId));
        showToast('Envio cancelado.', 'success');
    };

    const handleToggleTask = async (task) => {
        const newCompleted = !task.completed;
        await supabase.from('patient_tasks').update({ completed: newCompleted }).eq('id', task.id);
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: newCompleted } : t));
    };

    if (loading) return (
        <div className="flex justify-center items-center py-24">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Status do Portal */}
            {!portalAtivo ? (
                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-5">
                    <div className="size-14 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-violet-600 text-3xl">hub</span>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <p className="font-black text-violet-900 dark:text-violet-200 text-base">Portal ainda não ativado</p>
                        <p className="text-sm text-violet-600 dark:text-violet-400 mt-1">
                            {paciente.email
                                ? `Ao ativar, ${paciente.email} receberá acesso com senha 123456.`
                                : 'Cadastre um e-mail para este paciente para ativar o portal.'}
                        </p>
                    </div>
                    <button
                        onClick={handleAtivarPortal}
                        disabled={activating || !paciente.email}
                        className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all"
                    >
                        <span className={`material-symbols-outlined text-sm ${activating ? 'animate-spin' : ''}`}>
                            {activating ? 'autorenew' : 'check_circle'}
                        </span>
                        {activating ? 'Ativando...' : 'Ativar Portal'}
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl w-fit">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Portal Ativo</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-500">— {paciente.email}</span>
                </div>
            )}

            {/* Grid: Humor + Tarefas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monitor de Humor */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <span className="material-symbols-outlined text-violet-500 text-xl">monitoring</span>
                        <h3 className="font-black text-slate-900 dark:text-white text-sm">Monitor de Humor</h3>
                    </div>
                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                        {moods.length === 0 ? (
                            <div className="flex flex-col items-center py-10 gap-3">
                                <span className="material-symbols-outlined text-4xl text-slate-200">mood_bad</span>
                                <p className="text-xs text-slate-400 font-medium">Nenhum registro de humor ainda.</p>
                            </div>
                        ) : moods.map(log => {
                            const mood = MOOD_MAP[log.mood_level] || { emoji: '😐', label: String(log.mood_level) };
                            const date = new Date(log.created_at);
                            return (
                                <div key={log.id} className="flex gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="text-2xl leading-none mt-0.5">{mood.emoji}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                                            {date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' }).toUpperCase()}
                                        </p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{mood.emoji} {mood.label}</p>
                                        {log.note && (
                                            <p className="text-xs text-slate-400 italic mt-0.5 truncate">"{log.note}"</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tarefas & Atividades */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-violet-500 text-xl">task_alt</span>
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white text-sm">Tarefas & Atividades</h3>
                                <p className="text-[10px] text-slate-400">As tarefas enviadas aqui aparecem no calendário do paciente.</p>
                            </div>
                        </div>
                        <button
                            onClick={openNew}
                            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">add_task</span>
                            Nova Tarefa
                        </button>
                    </div>
                    <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                        {tasks.length === 0 ? (
                            <div className="flex flex-col items-center py-10 gap-3">
                                <span className="material-symbols-outlined text-4xl text-slate-200">task_alt</span>
                                <p className="text-xs text-slate-400 font-medium">Nenhuma tarefa enviada ainda.</p>
                            </div>
                        ) : tasks.map(task => (
                            <div key={task.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                                <button
                                    onClick={() => handleToggleTask(task)}
                                    className={`size-8 rounded-full flex items-center justify-center shrink-0 transition-all ${task.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {task.completed ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {task.title}
                                    </p>
                                    {task.due_date && (
                                        <p className="text-[10px] text-slate-400">
                                            Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                                        </p>
                                    )}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shrink-0 ${task.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {task.completed ? 'Concluída' : 'Pendente'}
                                </span>
                                <button
                                    onClick={() => openEdit(task)}
                                    className="size-7 rounded-lg flex items-center justify-center hover:bg-violet-50 dark:hover:bg-violet-900/30 text-slate-400 hover:text-violet-600 transition-all shrink-0"
                                    title="Editar tarefa"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="size-7 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-all shrink-0"
                                    title="Excluir tarefa"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Escalas Clínicas ── */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-violet-500 text-xl">assignment_turned_in</span>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white text-sm">Escalas Clínicas</h3>
                            <p className="text-[10px] text-slate-400">Instrumentos enviados para avaliação deste paciente.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowEnviarEscala(true)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition-all"
                    >
                        <span className="material-symbols-outlined text-sm">send</span>
                        Enviar Escala
                    </button>
                </div>
                <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                    {escalas.length === 0 ? (
                        <div className="flex flex-col items-center py-10 gap-3">
                            <span className="material-symbols-outlined text-4xl text-slate-200">assignment_late</span>
                            <p className="text-xs text-slate-400 font-medium">Nenhuma escala enviada ainda.</p>
                        </div>
                    ) : escalas.map(e => {
                        const isPendente = e.status !== 'respondida';
                        const cat = ESCALAS_RAPIDAS.find(c => c.id === e.escala_id);
                        return (
                            <div key={e.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="size-9 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-lg shrink-0">
                                    {cat?.emoji || '📋'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{e.nome}</p>
                                    <p className="text-[10px] text-slate-400">
                                        Enviada em {new Date(e.created_at).toLocaleDateString('pt-BR')}
                                        {e.answered_at && ` · Respondida em ${new Date(e.answered_at).toLocaleDateString('pt-BR')}`}
                                    </p>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shrink-0 ${
                                    isPendente
                                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                }`}>
                                    {isPendente ? 'Pendente' : 'Respondida'}
                                </span>
                                {isPendente && (
                                    <button
                                        onClick={() => handleCancelarEscala(e.id)}
                                        title="Cancelar envio"
                                        className="size-7 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 transition-all shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal Enviar Escala */}
            {showEnviarEscala && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowEnviarEscala(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-slate-900 dark:text-white text-lg">Enviar Escala</h3>
                                <button
                                    onClick={() => setShowEnviarEscala(false)}
                                    className="size-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    <span className="material-symbols-outlined text-slate-400 text-lg">close</span>
                                </button>
                            </div>

                            <div className="px-3 py-2 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-violet-500 text-base">person</span>
                                <span className="text-sm font-bold text-violet-800 dark:text-violet-300">{paciente.nome || paciente.name}</span>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Selecionar Escala
                                </label>
                                <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
                                    {ESCALAS_RAPIDAS.map(esc => (
                                        <button
                                            key={esc.id}
                                            onClick={() => setEscalaSelecionada(esc.id)}
                                            className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                                                escalaSelecionada === esc.id
                                                    ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/30'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                            }`}
                                        >
                                            <span className="text-xl">{esc.emoji}</span>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{esc.nome}</p>
                                                <p className="text-[10px] text-slate-400">{esc.questions} itens · {esc.opcoes} opções de resposta</p>
                                            </div>
                                            {escalaSelecionada === esc.id && (
                                                <span className="material-symbols-outlined text-violet-500 text-lg">check_circle</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEnviarEscala(false)}
                                    className="flex-1 h-11 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleEnviarEscala}
                                    disabled={!escalaSelecionada || enviandoEscala}
                                    className="flex-1 h-11 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    {enviandoEscala
                                        ? <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>
                                        : <span className="material-symbols-outlined text-sm">send</span>}
                                    {enviandoEscala ? 'Enviando...' : 'Enviar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Modal Nova Tarefa */}
            {showModal && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-40" onClick={closeModal} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-slate-900 dark:text-white text-lg">
                                    {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="size-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    <span className="material-symbols-outlined text-slate-400 text-lg">close</span>
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Título *</label>
                                    <input
                                        type="text"
                                        value={taskForm.title}
                                        onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))}
                                        placeholder="Ex: Praticar respiração diafragmática"
                                        autoFocus
                                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-violet-400 text-sm font-medium dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descrição</label>
                                    <textarea
                                        value={taskForm.description}
                                        onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))}
                                        placeholder="Detalhes ou instruções para o paciente..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-violet-400 text-sm font-medium resize-none dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prazo (opcional)</label>
                                    <input
                                        type="date"
                                        value={taskForm.due_date}
                                        onChange={e => setTaskForm(f => ({ ...f, due_date: e.target.value }))}
                                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-violet-400 text-sm font-medium dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 h-11 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveTask}
                                    disabled={saving}
                                    className="flex-1 h-11 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    {saving
                                        ? <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>
                                        : <span className="material-symbols-outlined text-sm">{editingTask ? 'save' : 'send'}</span>}
                                    {saving ? 'Salvando...' : editingTask ? 'Salvar' : 'Enviar Tarefa'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PortalPacienteTab;
