import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { showToast } from '../components/Toast';
import { logger } from '../utils/logger';

const PortalPaciente = () => {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pacienteData, setPacienteData] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [moodLogs, setMoodLogs] = useState([]);
    const [newMood, setNewMood] = useState({ mood: 'neutro', note: '' });
    const [savingMood, setSavingMood] = useState(false);

    useEffect(() => {
        if (!user) return;
        fetchPacienteData();
    }, [user?.id]);

    const fetchPacienteData = async () => {
        setLoading(true);
        try {
            // Busca dados do paciente vinculado ao perfil
            const { data: paciente, error: pError } = await supabase
                .from('patients')
                .select('*')
                .eq('patient_profile_id', user.id)
                .single();

            if (pError) throw pError;
            setPacienteData(paciente);

            // Busca tarefas
            const { data: pTasks, error: tError } = await supabase
                .from('patient_tasks')
                .select('*')
                .eq('patient_profile_id', user.id)
                .order('created_at', { ascending: false });

            if (tError) throw tError;
            setTasks(pTasks || []);

            // Busca logs de humor
            const { data: pMoods, error: mError } = await supabase
                .from('patient_mood_logs')
                .select('*')
                .eq('patient_profile_id', user.id)
                .order('created_at', { ascending: false })
                .limit(7);

            if (mError) throw mError;
            setMoodLogs(pMoods || []);

        } catch (error) {
            logger.error('[PortalPaciente] Erro ao buscar dados:', error.message);
            showToast('Erro ao carregar seus dados.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleMoodSubmit = async (e) => {
        e.preventDefault();
        if (!pacienteData) return;
        setSavingMood(true);
        try {
            const { error } = await supabase
                .from('patient_mood_logs')
                .insert([{
                    patient_profile_id: user.id,
                    mood: newMood.mood,
                    note: newMood.note
                }]);

            if (error) throw error;
            showToast('Humor registrado com sucesso!', 'success');
            setNewMood({ mood: 'neutro', note: '' });
            fetchPacienteData();
        } catch (error) {
            logger.error('[PortalPaciente] Erro ao salvar humor:', error.message);
            showToast('Erro ao salvar humor.', 'error');
        } finally {
            setSavingMood(false);
        }
    };

    const toggleTask = async (taskId, currentStatus) => {
        try {
            const { error } = await supabase
                .from('patient_tasks')
                .update({ status: currentStatus === 'completed' ? 'pending' : 'completed' })
                .eq('id', taskId);

            if (error) throw error;
            fetchPacienteData();
        } catch (error) {
            showToast('Erro ao atualizar tarefa.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <span className="material-symbols-outlined animate-spin text-primary text-4xl mb-4">autorenew</span>
                    <p className="text-slate-500 font-medium">Preparando seu portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Olá, {pacienteData?.name?.split(' ')[0]}!</h1>
                        <p className="text-slate-500">Bem-vindo ao seu espaço de cuidado.</p>
                    </div>
                    <button 
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span> Sair
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mood Tracker */}
                    <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-primary">mood</span>
                            <h2 className="font-bold text-slate-900 dark:text-white">Como você está hoje?</h2>
                        </div>

                        <form onSubmit={handleMoodSubmit} className="space-y-4">
                            <div className="flex justify-between gap-2">
                                {[
                                    { v: 'muito_baixo', icon: 'sentiment_very_dissatisfied', color: 'text-red-500' },
                                    { v: 'baixo', icon: 'sentiment_dissatisfied', color: 'text-orange-500' },
                                    { v: 'neutro', icon: 'sentiment_neutral', color: 'text-slate-400' },
                                    { v: 'bom', icon: 'sentiment_satisfied', color: 'text-emerald-500' },
                                    { v: 'muito_bom', icon: 'sentiment_very_satisfied', color: 'text-green-500' },
                                ].map(m => (
                                    <button 
                                        key={m.v}
                                        type="button"
                                        onClick={() => setNewMood({ ...newMood, mood: m.v })}
                                        className={`flex-1 py-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${newMood.mood === m.v ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800 opacity-50'}`}
                                    >
                                        <span className={`material-symbols-outlined text-2xl ${m.color}`}>{m.icon}</span>
                                    </button>
                                ))}
                            </div>
                            <textarea 
                                value={newMood.note}
                                onChange={e => setNewMood({ ...newMood, note: e.target.value })}
                                placeholder="Quer escrever algo sobre como se sente?"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24"
                            />
                            <button 
                                type="submit" 
                                disabled={savingMood}
                                className="w-full py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                            >
                                {savingMood ? 'Salvando...' : 'Registrar Humor'}
                            </button>
                        </form>
                    </section>

                    {/* Tasks */}
                    <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-primary">task_alt</span>
                            <h2 className="font-bold text-slate-900 dark:text-white">Minhas Tarefas</h2>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {tasks.length === 0 ? (
                                <p className="text-center text-slate-400 py-8 text-sm italic">Nenhuma tarefa pendente por enquanto.</p>
                            ) : tasks.map(task => (
                                <div 
                                    key={task.id} 
                                    onClick={() => toggleTask(task.id, task.status)}
                                    className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${task.status === 'completed' ? 'bg-slate-50 dark:bg-slate-800 border-transparent opacity-60' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700'}`}
                                >
                                    <span className={`material-symbols-outlined text-xl ${task.status === 'completed' ? 'text-emerald-500' : 'text-slate-300'}`}>
                                        {task.status === 'completed' ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                    <div>
                                        <p className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {task.title}
                                        </p>
                                        {task.description && <p className="text-xs text-slate-500 mt-1">{task.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* History / Mood Chart Summary */}
                    <section className="md:col-span-2 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-3xl border border-primary/10 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">timeline</span>
                                <h2 className="font-bold text-slate-900 dark:text-white">Últimos Registros</h2>
                            </div>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {moodLogs.map((log, i) => (
                                <div key={log.id} className="flex-shrink-0 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 w-32 text-center shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                                        {new Date(log.created_at).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })}
                                    </p>
                                    <span className={`material-symbols-outlined text-2xl ${
                                        log.mood === 'muito_bom' ? 'text-green-500' : 
                                        log.mood === 'bom' ? 'text-emerald-500' : 
                                        log.mood === 'neutro' ? 'text-slate-400' : 
                                        log.mood === 'baixo' ? 'text-orange-500' : 'text-red-500'
                                    }`}>
                                        {
                                            log.mood === 'muito_bom' ? 'sentiment_very_satisfied' : 
                                            log.mood === 'bom' ? 'sentiment_satisfied' : 
                                            log.mood === 'neutro' ? 'sentiment_neutral' : 
                                            log.mood === 'baixo' ? 'sentiment_dissatisfied' : 'sentiment_very_dissatisfied'
                                        }
                                    </span>
                                </div>
                            ))}
                            {moodLogs.length === 0 && (
                                <p className="text-slate-400 text-sm italic w-full text-center">Comece a registrar seu humor para ver seu histórico aqui.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Professional Info */}
                <footer className="mt-8 p-6 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {pacienteData?.tenant_id?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Seu Profissional</p>
                            <p className="font-bold">Equipe MindCare</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 max-w-xs text-center md:text-right italic">
                        Este portal é um canal seguro entre você e seu terapeuta. Seus dados são protegidos por criptografia.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default PortalPaciente;
