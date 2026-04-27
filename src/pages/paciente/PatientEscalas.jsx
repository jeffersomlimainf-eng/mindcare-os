import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../contexts/UserContext';
import { showToast } from '../../components/Toast';
import { ESCALAS_CATALOG } from '../../data/escalasData';

// Fallback genérico caso a escala não tenha response_labels definidos
const LIKERT_FALLBACK = ['0', '1', '2', '3'];

// Traduz categorias clínicas para rótulos neutros/acolhedores para o paciente
const CATEGORIA_NEUTRA = {
    'Depressão':              'Bem-estar emocional',
    'Ansiedade':              'Bem-estar emocional',
    'Depressão/Ansiedade/Estresse': 'Bem-estar emocional',
    'Trauma':                 'Experiências difíceis',
    'Sono':                   'Qualidade do sono',
    'Estresse':               'Gestão do estresse',
    'Álcool':                 'Hábitos de saúde',
    'Substâncias':            'Hábitos de saúde',
    'Qualidade de Vida':      'Qualidade de vida',
    'Saúde Mental':           'Saúde e bem-estar',
    'Humor/Bipolaridade':     'Variações de humor',
    'Impulsividade':          'Autoconhecimento',
    'Autismo':                'Perfil cognitivo',
    'TDAH':                   'Atenção e foco',
    'TDAH/TOD':               'Atenção e comportamento',
    'Alimentar':              'Relação com a alimentação',
    'Autoestima':             'Autoconhecimento',
    'TOC':                    'Bem-estar emocional',
};

// Estima o tempo de preenchimento baseado no número de questões
const estimaTempo = (n) => {
    if (!n) return null;
    const min = Math.max(2, Math.round(n * 0.4));
    return `~${min} min`;
};

const PatientEscalas = () => {
    const { user } = useUser();
    const [escalas, setEscalas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [respondendoId, setRespondendoId] = useState(null);

    useEffect(() => {
        if (!user?.id) return;
        fetchEscalas();
    // PERF-01 FIX: user?.id em vez de user (objeto)
    }, [user?.id]);

    const fetchEscalas = async () => {
        try {
            const { data: patient } = await supabase
                .from('patients')
                .select('id')
                .eq('patient_profile_id', user.id)
                .single();
            if (!patient) return;

            const { data } = await supabase
                .from('patient_escalas')
                .select('*')
                .eq('patient_id', patient.id)
                .order('created_at', { ascending: false });
            setEscalas(data || []);
        } catch (err) {
            console.error('[PatientEscalas] fetchEscalas:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRespondida = (escalaId, answers) => {
        setEscalas(prev => prev.map(e =>
            e.id === escalaId ? { ...e, status: 'respondida', answers } : e
        ));
        setRespondendoId(null);
    };

    return (
        <div style={{ padding: '32px 28px', minHeight: '100vh', background: '#f1f5f9' }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(109,40,217,0.3)',
                    }}>
                        <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 22 }}>assignment</span>
                    </div>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                            Suas Escalas
                        </h1>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 600, letterSpacing: '0.05em' }}>
                            INSTRUMENTOS ENVIADOS PELO SEU TERAPEUTA
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#7c3aed', animation: 'spin 1s linear infinite' }}>
                        autorenew
                    </span>
                </div>
            ) : escalas.length === 0 ? (
                <div style={{
                    background: '#fff', borderRadius: 20, padding: '64px 32px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: 20,
                        background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#7c3aed' }}>assignment_late</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: '#7c3aed', textTransform: 'uppercase', marginBottom: 8 }}>
                            TUDO EM DIA!
                        </p>
                        <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 320, lineHeight: 1.6 }}>
                            Nenhum questionário pendente no momento. Seu terapeuta enviará instrumentos de avaliação quando necessário.
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {escalas.map(escala => (
                        <EscalaCard
                            key={escala.id}
                            escala={escala}
                            isResponding={respondendoId === escala.id}
                            onStartResponder={() => setRespondendoId(escala.id)}
                            onCancelar={() => setRespondendoId(null)}
                            onRespondida={handleRespondida}
                        />
                    ))}
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

const EscalaCard = ({ escala, isResponding, onStartResponder, onCancelar, onRespondida }) => {
    const isPendente = escala.status !== 'respondida';

    // Lookup catalog para dados enriquecidos (descricao, emoji, categoria)
    const cat = ESCALAS_CATALOG.find(c => c.id === escala.escala_id);
    const emoji = cat?.emoji || '📋';
    const descricao = cat?.descricao || escala.instrucoes || null;
    const categoria = cat?.categoria ? CATEGORIA_NEUTRA[cat.categoria] ?? cat.categoria : null;

    // Normaliza questions: aceita array de strings ou array de objetos { text }
    const rawQuestions = escala.questions || escala.perguntas || null;
    const questions = rawQuestions
        ? (Array.isArray(rawQuestions) ? rawQuestions : []).map(q =>
            typeof q === 'string' ? { text: q } : q
          )
        : null;

    const nQuestoes = questions?.length ?? 0;
    const tempo = estimaTempo(nQuestoes);

    return (
        <div style={{
            background: '#fff', borderRadius: 20,
            boxShadow: isPendente ? '0 4px 20px rgba(109,40,217,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            border: isResponding
                ? '1.5px solid rgba(109,40,217,0.4)'
                : isPendente ? '1.5px solid rgba(109,40,217,0.15)' : '1px solid #f0fdf4',
            transition: 'all 0.2s',
        }}>
            {/* Faixa superior colorida para escalas pendentes */}
            {isPendente && !isResponding && (
                <div style={{
                    height: 4,
                    background: 'linear-gradient(90deg, #7c3aed, #a855f7, #ec4899)',
                }} />
            )}

            {/* Cabeçalho */}
            <div style={{ padding: '20px 20px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {/* Emoji / ícone */}
                    <div style={{
                        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                        background: isPendente
                            ? 'linear-gradient(135deg, #ede9fe, #ddd6fe)'
                            : 'linear-gradient(135deg, #f0fdf4, #bbf7d0)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 26,
                    }}>
                        {emoji}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Categoria + nome técnico */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                            {categoria && (
                                <span style={{
                                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                                    textTransform: 'uppercase', color: '#7c3aed',
                                    background: '#f5f3ff', padding: '2px 8px', borderRadius: 6,
                                }}>
                                    {categoria}
                                </span>
                            )}
                            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                                {escala.nome}
                            </span>
                        </div>

                        {/* Título amigável */}
                        <p style={{ fontWeight: 800, fontSize: 15, color: '#1e1b4b', margin: 0, lineHeight: 1.3 }}>
                            {cat ? friendlyTitle(cat) : escala.nome}
                        </p>

                        {/* Descrição curta */}
                        {descricao && (
                            <p style={{
                                fontSize: 12, color: '#64748b', margin: '5px 0 0',
                                lineHeight: 1.5, display: '-webkit-box',
                                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                                {descricao}
                            </p>
                        )}

                        {/* Metadados: questões + tempo + data */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                            {nQuestoes > 0 && (
                                <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>format_list_numbered</span>
                                    {nQuestoes} questões
                                </span>
                            )}
                            {tempo && (
                                <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
                                    {tempo}
                                </span>
                            )}
                            <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>calendar_today</span>
                                Enviada em {new Date(escala.created_at).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Rodapé do cabeçalho: status + botão */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, gap: 12 }}>
                    {isPendente ? (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 12, fontWeight: 700, color: '#7c3aed',
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>pending_actions</span>
                            Aguardando seu preenchimento
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 12, fontWeight: 700, color: '#16a34a',
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>task_alt</span>
                            Respondida em {escala.answered_at ? new Date(escala.answered_at).toLocaleDateString('pt-BR') : '—'}
                        </div>
                    )}

                    {isPendente && !isResponding && (
                        <button
                            onClick={onStartResponder}
                            style={{
                                height: 38, padding: '0 20px', borderRadius: 10, border: 0,
                                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                color: '#fff', fontWeight: 700, fontSize: 13,
                                cursor: 'pointer', letterSpacing: '0.02em',
                                boxShadow: '0 4px 14px rgba(109,40,217,0.35)',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(109,40,217,0.45)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(109,40,217,0.35)'; }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit_note</span>
                            Responder Agora
                        </button>
                    )}
                    {isResponding && (
                        <button
                            onClick={onCancelar}
                            style={{
                                height: 36, padding: '0 16px', borderRadius: 10,
                                border: '1.5px solid #e2e8f0', background: '#fff',
                                color: '#94a3b8', fontWeight: 600, fontSize: 12,
                                cursor: 'pointer', fontFamily: 'inherit',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>close</span>
                            Cancelar
                        </button>
                    )}
                </div>
            </div>

            {/* Painel de resposta */}
            {isResponding && (
                <EscalaRespostaForm
                    escala={escala}
                    questions={questions}
                    onRespondida={onRespondida}
                />
            )}
        </div>
    );
};

// Gera um título amigável para o paciente a partir dos dados do catálogo
function friendlyTitle(cat) {
    const map = {
        'phq9':    'Como está seu humor nas últimas 2 semanas?',
        'cesd':    'Como você se sentiu na última semana?',
        'dass21':  'Sintomas de depressão, ansiedade e estresse',
        'gad7':    'Como está sua ansiedade ultimamente?',
        'spin':    'Situações sociais te causam desconforto?',
        'ocir':    'Pensamentos repetitivos e comportamentos compulsivos',
        'pcl5':    'Sintomas relacionados a eventos traumáticos',
        'iesr':    'Reações a eventos estressantes',
        'isi':     'Como está a qualidade do seu sono?',
        'pss10':   'Você tem se sentido sobrecarregado(a)?',
        'k10':     'Seu bem-estar emocional nas últimas semanas',
        'audit':   'Seu consumo de álcool nos últimos 12 meses',
        'cage':    'Perguntas sobre consumo de álcool',
        'dast10':  'Perguntas sobre uso de substâncias',
        'whoqol':  'Como está sua qualidade de vida?',
        'srq20':   'Saúde mental e bem-estar geral',
        'mdq':     'Variações de humor e energia',
        'hcl32':   'Períodos de muita energia ou euforia',
        'bis11':   'Tendência a agir por impulso',
        'aq10':    'Características do espectro autista em adultos',
        'asrs18':  'Dificuldades de atenção e hiperatividade',
        'snapiv':  'Atenção, hiperatividade e comportamento',
        'cia30':   'Impacto dos hábitos alimentares no dia a dia',
        'rses':    'Como você se enxerga e se valoriza?',
    };
    return map[cat.id] || cat.nome;
}

const EscalaRespostaForm = ({ escala, questions, onRespondida }) => {
    const hasQuestions = questions && questions.length > 0;
    // Opções de resposta: usa as salvas na escala ou fallback genérico
    const opts = escala.response_options || LIKERT_FALLBACK;
    const optLabels = escala.response_labels || opts;

    const [answers, setAnswers] = useState(
        hasQuestions
            ? Object.fromEntries(questions.map((_, i) => [i, null]))
            : { texto: '' }
    );
    const [submitting, setSubmitting] = useState(false);

    const answeredCount = hasQuestions
        ? Object.values(answers).filter(v => v !== null && v !== undefined).length
        : 0;
    const isComplete = hasQuestions
        ? answeredCount === questions.length
        : answers.texto.trim().length > 0;

    const handleSubmit = async () => {
        if (!isComplete || submitting) return;
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('patient_escalas')
                .update({
                    status: 'respondida',
                    answers,
                    answered_at: new Date().toISOString(),
                })
                .eq('id', escala.id);

            if (error) throw error;
            showToast('Escala respondida com sucesso!', 'success');
            onRespondida(escala.id, answers);
        } catch {
            showToast('Erro ao enviar respostas. Tente novamente.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            borderTop: '1px solid #f1f5f9',
            padding: '20px 20px 24px',
            background: '#faf9ff',
            animation: 'slideDown 0.2s ease',
        }}>
            {escala.instrucoes && (
                <div style={{
                    background: 'rgba(109,40,217,0.06)', borderRadius: 10,
                    padding: '10px 14px', marginBottom: 20,
                    border: '1px solid rgba(109,40,217,0.12)',
                }}>
                    <p style={{ fontSize: 13, color: '#4c1d95', lineHeight: 1.5, margin: 0 }}>
                        <strong>Instruções:</strong> {escala.instrucoes}
                    </p>
                </div>
            )}

            {hasQuestions ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {questions.map((q, i) => {
                        // Per-question options (e.g. AUDIT Q9/Q10)
                        const hasCustomOpts = typeof q === 'object' && Array.isArray(q.options);
                        const qOpts   = hasCustomOpts ? q.options   : opts;
                        const qLabels = hasCustomOpts ? q.options   : optLabels;
                        return (
                            <div key={i}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b', marginBottom: 10, lineHeight: 1.5 }}>
                                    <span style={{ color: '#7c3aed', marginRight: 6 }}>{i + 1}.</span>
                                    {q.text || q.texto || q}
                                </p>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {qOpts.map((opt, oi) => {
                                        const isSelected = answers[i] === oi;
                                        return (
                                            <button
                                                key={oi}
                                                onClick={() => setAnswers(prev => ({ ...prev, [i]: oi }))}
                                                style={{
                                                    flex: '1 1 auto', minWidth: 70, padding: '10px 8px',
                                                    borderRadius: 10, border: isSelected ? 'none' : '1.5px solid #e2e8f0',
                                                    cursor: 'pointer',
                                                    background: isSelected
                                                        ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                                                        : '#fff',
                                                    color: isSelected ? '#fff' : '#64748b',
                                                    fontSize: 11, fontWeight: 700,
                                                    boxShadow: isSelected ? '0 4px 12px rgba(109,40,217,0.3)' : 'none',
                                                    transition: 'all 0.15s',
                                                    fontFamily: 'inherit',
                                                    textAlign: 'center',
                                                    lineHeight: 1.3,
                                                }}
                                            >
                                                {hasCustomOpts ? (
                                                    <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4 }}>{opt}</div>
                                                ) : (
                                                    <>
                                                        <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 3 }}>{opt}</div>
                                                        <div style={{ fontSize: 10, opacity: 0.85 }}>{qLabels[oi]}</div>
                                                    </>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b', marginBottom: 10 }}>
                        Como você está se sentindo em relação ao que foi pedido?
                    </p>
                    <textarea
                        value={answers.texto}
                        onChange={e => setAnswers({ texto: e.target.value })}
                        placeholder="Escreva sua resposta aqui..."
                        rows={4}
                        style={{
                            width: '100%', padding: '12px 14px',
                            border: '1.5px solid #e2e8f0', borderRadius: 12,
                            fontSize: 13, color: '#374151', background: '#fff',
                            outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                            boxSizing: 'border-box', lineHeight: 1.5,
                        }}
                        onFocus={e => e.target.style.borderColor = '#7c3aed'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                </div>
            )}

            {/* Progresso */}
            {hasQuestions && (
                <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Progresso</span>
                        <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700 }}>
                            {answeredCount}/{questions.length}
                        </span>
                    </div>
                    <div style={{ height: 4, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #7c3aed, #6d28d9)',
                            borderRadius: 99,
                            width: `${(answeredCount / questions.length) * 100}%`,
                            transition: 'width 0.3s',
                        }} />
                    </div>
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={!isComplete || submitting}
                style={{
                    marginTop: 20, width: '100%', height: 46, borderRadius: 12, border: 0,
                    background: isComplete
                        ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                        : '#e2e8f0',
                    color: isComplete ? '#fff' : '#94a3b8',
                    fontWeight: 800, fontSize: 13, letterSpacing: '0.06em',
                    cursor: isComplete ? 'pointer' : 'not-allowed',
                    boxShadow: isComplete ? '0 4px 16px rgba(109,40,217,0.35)' : 'none',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: 'inherit',
                }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {submitting ? 'autorenew' : 'send'}
                </span>
                {submitting ? 'Enviando...' : 'Enviar Respostas'}
            </button>
        </div>
    );
};

export default PatientEscalas;
