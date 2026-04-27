import { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../components/Toast';
import { logger } from '../../utils/logger';

const MOODS = [
    { value: 1, emoji: '😢', label: 'Muito mal' },
    { value: 2, emoji: '😐', label: 'Mal' },
    { value: 3, emoji: '🙂', label: 'Neutro' },
    { value: 4, emoji: '😊', label: 'Bem' },
    { value: 5, emoji: '🤩', label: 'Muito bem' },
];

const DICAS = [
    'Pequenos passos geram grandes mudanças.',
    'Cuidar de si mesmo é um ato de coragem.',
    'Cada sessão é um passo em direção ao seu bem-estar.',
    'Você está mais forte do que imagina.',
    'O progresso, mesmo que lento, é sempre progresso.',
];

const getDayLabel = (d) => ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][d.getDay()];
const getMesLabel = (m) => ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'][m];

// Build a strip of 14 days starting from today
const buildCalendar = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push({ date: d, isToday: i === 0 });
    }
    return days;
};

const MESES_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const STATUS_APT = {
    confirmado: { label: 'Confirmado', bg: 'rgba(31,138,77,0.1)', color: '#1f8a4d' },
    aguardando:  { label: 'Aguardando', bg: 'rgba(182,133,21,0.1)', color: '#b68515' },
    em_sessao:   { label: 'Em Sessão',  bg: 'rgba(255,102,194,0.15)', color: '#c940a8' },
    concluido:   { label: 'Concluído',  bg: 'rgba(134,89,232,0.1)', color: '#8659e8' },
    cancelado:   { label: 'Cancelado',  bg: 'rgba(239,68,68,0.1)', color: '#dc2626' },
    faltou:      { label: 'Faltou',     bg: 'rgba(244,63,94,0.1)', color: '#be123c' },
};

const PatientHome = () => {
    const { user } = useUser();
    const [paciente, setPaciente] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [moodLogs, setMoodLogs] = useState([]);
    const [todayLogs, setTodayLogs] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMood, setSelectedMood] = useState(null);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);

    const today = new Date();
    const calDays = buildCalendar();
    const dica = DICAS[today.getDate() % DICAS.length];

    useEffect(() => {
        if (user?.id) fetchData();
    }, [user?.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: p } = await supabase
                .from('patients')
                .select('*')
                .eq('patient_profile_id', user.id)
                .single();
            if (!p) return;
            setPaciente(p);

            const todayISO = today.toISOString().split('T')[0];

            const [tRes, mRes, aRes, fRes] = await Promise.allSettled([
                supabase.from('patient_tasks').select('*').eq('patient_profile_id', user.id).order('created_at', { ascending: false }),
                supabase.from('patient_mood_logs').select('*').eq('patient_profile_id', user.id).order('created_at', { ascending: false }).limit(30),
                supabase.from('appointments').select('id, data, time_start, duration, status, type, patient_name').eq('patient_id', p.id).gte('data', todayISO).order('data', { ascending: true }).limit(6),
                supabase.from('finance').select('id, description, value, due_date, status, type').eq('patient_id', p.id).eq('type', 'Receita').eq('status', 'Pendente').order('due_date', { ascending: true }),
            ]);
            const tData = tRes.status === 'fulfilled' ? tRes.value.data : null;
            const mData = mRes.status === 'fulfilled' ? mRes.value.data : null;
            const aData = aRes.status === 'fulfilled' ? aRes.value.data : null;
            const fData = fRes.status === 'fulfilled' ? fRes.value.data : null;

            setTasks(tData || []);
            const all = mData || [];
            setMoodLogs(all);
            setAppointments(aData || []);
            setDebts(fData || []);

            const todayStr = today.toDateString();
            setTodayLogs(all.filter(l => new Date(l.created_at).toDateString() === todayStr));
        } catch (err) {
            logger.error('[PatientHome]', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMood = async () => {
        if (!selectedMood || !paciente) return;
        setSaving(true);

        const tempId = `temp_${Date.now()}`;
        const tempLog = {
            id: tempId,
            patient_profile_id: user.id,
            mood_level: selectedMood,
            note: note.trim() || null,
            created_at: new Date().toISOString(),
        };

        // Optimistic update
        const prevMoodLogs = moodLogs;
        const prevTodayLogs = todayLogs;
        setMoodLogs(prev => [tempLog, ...prev]);
        setTodayLogs(prev => [tempLog, ...prev]);
        setSelectedMood(null);
        setNote('');

        try {
            const { data, error } = await supabase.from('patient_mood_logs').insert([{
                patient_profile_id: user.id,
                mood_level: tempLog.mood_level,
                note: tempLog.note,
            }]).select().single();
            if (error) throw error;

            // Replace temp with real record
            const realLog = data;
            setMoodLogs(prev => prev.map(l => l.id === tempId ? realLog : l));
            setTodayLogs(prev => prev.map(l => l.id === tempId ? realLog : l));
            showToast('Registro enviado!', 'success');
        } catch (err) {
            // Rollback
            setMoodLogs(prevMoodLogs);
            setTodayLogs(prevTodayLogs);
            setSelectedMood(tempLog.mood_level);
            setNote(tempLog.note || '');
            showToast('Erro ao enviar.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggleTask = async (task) => {
        const newCompleted = !task.completed;

        // Optimistic update
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: newCompleted } : t));

        const { error } = await supabase
            .from('patient_tasks')
            .update({ completed: newCompleted })
            .eq('id', task.id);

        if (error) {
            // Rollback
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: task.completed } : t));
            showToast('Erro ao atualizar tarefa.', 'error');
        }
    };

    const firstName = paciente?.name?.split(' ')[0] || user?.nome?.split(' ')[0] || 'visitante';
    const pendingCount = tasks.filter(t => !t.completed).length;
    const completedCount = tasks.filter(t => t.completed).length;

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined animate-spin text-violet-600" style={{ fontSize: 40 }}>autorenew</span>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '36px 32px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                    <div>
                        <h1 style={{ fontSize: 36, fontWeight: 900, fontStyle: 'italic', color: '#1e1b4b', margin: 0, lineHeight: 1.1 }}>
                            {(() => {
                                const h = today.getHours();
                                if (h < 12) return 'Bom dia';
                                if (h < 18) return 'Boa tarde';
                                return 'Boa noite';
                            })()}, {firstName} ! 👋
                        </h1>
                        <p style={{ color: '#94a3b8', marginTop: 6, fontSize: 14 }}>
                            Sua jornada de hoje começa aqui. Como você está se sentindo?
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={pillStyle}>PAINEL ATIVO</span>
                        <span style={{ ...pillStyle, background: 'transparent', border: '1.5px solid #e2e8f0', color: '#64748b' }}>
                            {getMesLabel(today.getMonth())}
                        </span>
                    </div>
                </div>

                {/* Main grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>

                    {/* LEFT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                        {/* Mood card */}
                        <div style={card}>
                            <h2 style={{ fontWeight: 800, fontSize: 16, color: '#1e1b4b', marginBottom: 4 }}>
                                Como você está se sentindo agora?
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>
                                Seu terapeuta poderá acompanhar sua evolução emocional através deste registro diário.
                            </p>

                            {/* Emoji row */}
                            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                                {MOODS.map(m => (
                                    <button
                                        key={m.value}
                                        onClick={() => setSelectedMood(m.value)}
                                        title={m.label}
                                        style={{
                                            flex: 1, height: 56, borderRadius: 14, border: 'none',
                                            background: selectedMood === m.value ? '#f5f3ff' : '#f8fafc',
                                            outline: selectedMood === m.value ? '2px solid #7c3aed' : '2px solid transparent',
                                            cursor: 'pointer', fontSize: 28, transition: 'all 0.15s',
                                            filter: selectedMood && selectedMood !== m.value ? 'grayscale(1) opacity(0.45)' : 'none',
                                            transform: selectedMood === m.value ? 'scale(1.08)' : 'scale(1)',
                                        }}
                                    >
                                        {m.emoji}
                                    </button>
                                ))}
                            </div>

                            {/* Note + Send */}
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <span className="material-symbols-outlined" style={{
                                        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                                        color: '#cbd5e1', fontSize: 18,
                                    }}>stylus_note</span>
                                    <input
                                        type="text"
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        placeholder="Quer contar o porquê? Escreva algo breve aqui..."
                                        style={{
                                            width: '100%', height: 44, paddingLeft: 38, paddingRight: 14,
                                            border: '1.5px solid #e2e8f0', borderRadius: 12,
                                            background: '#f8fafc', fontSize: 13, color: '#374151',
                                            outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                                        }}
                                        onKeyDown={e => e.key === 'Enter' && handleSendMood()}
                                    />
                                </div>
                                <button
                                    onClick={handleSendMood}
                                    disabled={!selectedMood || saving}
                                    style={{
                                        height: 44, padding: '0 20px', borderRadius: 12, border: 0,
                                        background: selectedMood ? '#f1f5f9' : '#f8fafc',
                                        color: selectedMood ? '#374151' : '#cbd5e1',
                                        fontWeight: 700, fontSize: 12, letterSpacing: '0.06em',
                                        cursor: selectedMood ? 'pointer' : 'not-allowed',
                                        display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                                    MANDAR
                                </button>
                            </div>

                            {/* Today's logs */}
                            {todayLogs.length > 0 && (
                                <div style={{ marginTop: 20, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <span className="material-symbols-outlined" style={{ color: '#7c3aed', fontSize: 18 }}>history</span>
                                        <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                            Registros do dia
                                        </span>
                                        <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                            · Clique em um registro para editar ou visualizar o que foi enviado
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {todayLogs.map(log => {
                                            const m = MOODS.find(x => x.value === log.mood_level) || MOODS[2];
                                            const time = new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                            return (
                                                <div key={log.id} style={{
                                                    display: 'flex', alignItems: 'center', gap: 12,
                                                    padding: '10px 14px', borderRadius: 12, background: '#f8fafc',
                                                    border: '1px solid #f1f5f9',
                                                }}>
                                                    <span style={{ fontSize: 22 }}>{m.emoji}</span>
                                                    <div style={{ flex: 1 }}>
                                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>{time}</span>
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginLeft: 8 }}>{m.label}</span>
                                                        {log.note && <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0', fontStyle: 'italic' }}>"{log.note}"</p>}
                                                    </div>
                                                    <span className="material-symbols-outlined" style={{ color: '#cbd5e1', fontSize: 16 }}>edit_note</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Calendar strip */}
                        <div style={{ ...card, padding: '18px 20px' }}>
                            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                                {calDays.map(({ date, isToday }) => (
                                    <div key={date.toISOString()} style={{
                                        minWidth: 44, textAlign: 'center', flexShrink: 0,
                                        background: isToday ? '#1e1b4b' : 'transparent',
                                        borderRadius: 999, padding: '6px 4px',
                                    }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? '#94a3b8' : '#94a3b8', letterSpacing: '0.04em' }}>
                                            {getDayLabel(date)}
                                        </div>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: isToday ? '#fff' : '#374151', marginTop: 2 }}>
                                            {date.getDate()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Próximas consultas */}
                        <div style={card}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#7c3aed' }}>calendar_month</span>
                                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#374151' }}>
                                    Próximas Consultas
                                </span>
                            </div>

                            {appointments.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px 0', color: '#cbd5e1' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>event_available</span>
                                    <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nenhuma consulta agendada</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {appointments.map(apt => {
                                        const d = new Date(apt.data + 'T00:00:00');
                                        const isToday = apt.data === today.toISOString().split('T')[0];
                                        const hh = String(Math.floor(apt.time_start)).padStart(2, '0');
                                        const mm = String(Math.round((apt.time_start % 1) * 60)).padStart(2, '0');
                                        const sCfg = STATUS_APT[apt.status] || STATUS_APT.confirmado;
                                        const isOnline = apt.type === 'teleconsulta' || apt.type === 'online';
                                        return (
                                            <div key={apt.id} style={{
                                                display: 'flex', alignItems: 'center', gap: 14,
                                                padding: '12px 14px', borderRadius: 14,
                                                background: isToday ? 'linear-gradient(135deg,rgba(124,58,237,0.06),rgba(79,70,229,0.04))' : '#f8fafc',
                                                border: `1px solid ${isToday ? 'rgba(124,58,237,0.15)' : '#f1f5f9'}`,
                                            }}>
                                                {/* Date badge */}
                                                <div style={{
                                                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                                    background: isToday ? '#1e1b4b' : '#f1f5f9',
                                                    display: 'flex', flexDirection: 'column',
                                                    alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <span style={{ fontSize: 9, fontWeight: 700, color: isToday ? '#94a3b8' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                        {getMesLabel(d.getMonth())}
                                                    </span>
                                                    <span style={{ fontSize: 18, fontWeight: 900, color: isToday ? '#fff' : '#374151', lineHeight: 1 }}>
                                                        {d.getDate()}
                                                    </span>
                                                </div>
                                                {/* Info */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b' }}>
                                                        {hh}:{mm} · {apt.duration} min
                                                    </div>
                                                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{isOnline ? 'videocam' : 'location_on'}</span>
                                                        {isOnline ? 'Online' : 'Presencial'}
                                                    </div>
                                                </div>
                                                {/* Status */}
                                                <span style={{
                                                    fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 99,
                                                    background: sCfg.bg, color: sCfg.color,
                                                    textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                                                }}>{sCfg.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Tasks */}
                        <div style={card}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
                                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#374151' }}>
                                        Atividades Agendadas
                                    </span>
                                </div>
                                <span style={{
                                    background: '#f1f5f9', borderRadius: 99, padding: '3px 10px',
                                    fontSize: 11, fontWeight: 700, color: '#64748b',
                                }}>
                                    {pendingCount} pendências
                                </span>
                            </div>

                            {tasks.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#e2e8f0', display: 'block', marginBottom: 10 }}>
                                        bedtime
                                    </span>
                                    <p style={{ fontWeight: 800, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#cbd5e1' }}>
                                        Tempo de descanso
                                    </p>
                                    <p style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4 }}>
                                        Nenhuma tarefa para este dia. Aproveite para relaxar e cuidar de você.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {tasks.map(task => (
                                        <div
                                            key={task.id}
                                            onClick={() => toggleTask(task)}
                                            style={{
                                                display: 'flex', alignItems: 'flex-start', gap: 12,
                                                padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                                                background: task.completed ? '#f8fafc' : '#fff',
                                                border: `1px solid ${task.completed ? '#f1f5f9' : '#e2e8f0'}`,
                                                opacity: task.completed ? 0.65 : 1,
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{
                                                fontSize: 20, marginTop: 1,
                                                color: task.completed ? '#10b981' : '#cbd5e1',
                                            }}>
                                                {task.completed ? 'check_circle' : 'radio_button_unchecked'}
                                            </span>
                                            <div>
                                                <p style={{
                                                    fontSize: 13, fontWeight: 700,
                                                    color: task.completed ? '#94a3b8' : '#374151',
                                                    textDecoration: task.completed ? 'line-through' : 'none',
                                                }}>{task.title}</p>
                                                {task.description && (
                                                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{task.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Dica da semana */}
                        <div style={{
                            borderRadius: 20, padding: '22px 20px',
                            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                            color: '#fff',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <span style={{
                                    background: 'rgba(255,255,255,0.2)', borderRadius: 10,
                                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#fff' }}>auto_awesome</span>
                                </span>
                                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                                    Dica da semana
                                </span>
                            </div>
                            <p style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.3, marginBottom: 10 }}>
                                {dica}
                            </p>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                                {completedCount > 0
                                    ? `Você concluiu ${completedCount} tarefa${completedCount > 1 ? 's' : ''}. Continue assim!`
                                    : 'Explore o painel e registre seu humor diário.'}
                            </p>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div style={{ ...card, padding: '16px', textAlign: 'center' }}>
                                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>
                                    Registros
                                </p>
                                <p style={{ fontSize: 28, fontWeight: 900, color: '#1e1b4b' }}>{moodLogs.length}</p>
                            </div>
                            <div style={{ ...card, padding: '16px', textAlign: 'center' }}>
                                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>
                                    Tarefas
                                </p>
                                <p style={{ fontSize: 28, fontWeight: 900, color: '#1e1b4b' }}>
                                    {completedCount}/{tasks.length}
                                </p>
                            </div>
                        </div>

                        {/* Situação financeira */}
                        <div style={card}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: debts.length > 0 ? '#dc2626' : '#10b981' }}>
                                        {debts.length > 0 ? 'payments' : 'check_circle'}
                                    </span>
                                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#374151' }}>
                                        Situação Financeira
                                    </span>
                                </div>
                                {debts.length > 0 && (
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>
                                        {debts.length} pendência{debts.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {debts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                    <p style={{ fontSize: 28, marginBottom: 4 }}>✅</p>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Em dia!</p>
                                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Nenhum débito pendente.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {debts.map(d => {
                                        const venc = d.due_date ? new Date(d.due_date + 'T00:00:00') : null;
                                        const vencida = venc && venc < today;
                                        return (
                                            <div key={d.id} style={{
                                                padding: '11px 13px', borderRadius: 12,
                                                background: vencida ? 'rgba(239,68,68,0.05)' : '#f8fafc',
                                                border: `1px solid ${vencida ? 'rgba(239,68,68,0.2)' : '#f1f5f9'}`,
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                                    <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', flex: 1, lineHeight: 1.3 }}>
                                                        {d.description}
                                                    </p>
                                                    <span style={{ fontSize: 13, fontWeight: 800, color: vencida ? '#dc2626' : '#1e1b4b', whiteSpace: 'nowrap' }}>
                                                        R$ {Number(d.value).toFixed(2).replace('.', ',')}
                                                    </span>
                                                </div>
                                                {venc && (
                                                    <p style={{ fontSize: 10, color: vencida ? '#dc2626' : '#94a3b8', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: 11 }}>{vencida ? 'warning' : 'schedule'}</span>
                                                        {vencida ? 'Vencida em ' : 'Vence em '}
                                                        {venc.getDate()} de {MESES_FULL[venc.getMonth()]}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>
                                        Entre em contato com seu terapeuta para regularizar.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Humor history mini */}
                        {moodLogs.length > 0 && (
                            <div style={card}>
                                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: 12 }}>
                                    Histórico recente
                                </p>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {moodLogs.slice(0, 7).map(log => {
                                        const m = MOODS.find(x => x.value === log.mood_level) || MOODS[2];
                                        return (
                                            <div key={log.id} title={`${m.label} — ${new Date(log.created_at).toLocaleDateString('pt-BR')}`}
                                                style={{ textAlign: 'center', fontSize: 20 }}>
                                                {m.emoji}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const card = {
    background: '#fff', borderRadius: 20,
    border: '1px solid #f1f5f9',
    padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

const pillStyle = {
    background: '#fff', border: '1.5px solid #e2e8f0',
    borderRadius: 99, padding: '5px 14px',
    fontSize: 11, fontWeight: 800, color: '#374151',
    letterSpacing: '0.06em',
};

export default PatientHome;
