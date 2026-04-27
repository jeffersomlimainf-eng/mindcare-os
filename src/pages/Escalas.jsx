import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { usePatients } from '../contexts/PatientContext';
import { showToast } from '../components/Toast';
import { ESCALAS_CATALOG } from '../data/escalasData';

// ─────────────────────────────────────────────────────────────────────────────
// SCORING ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function calcScore(escalaId, answers) {
    const cat = ESCALAS_CATALOG.find(c => c.id === escalaId);
    if (!cat || !answers) return null;

    const s    = cat.scoring;
    const opts = cat.response_options || [];

    const getVal = (idx) => {
        const str = opts[idx];
        if (str !== undefined) { const n = Number(str); return isNaN(n) ? idx : n; }
        return idx;
    };

    const minOpt     = getVal(0);
    const maxOpt     = opts.length > 0 ? getVal(opts.length - 1) : 0;
    const revVal     = (v) => maxOpt + minOpt - v;
    const sortedKeys = Object.keys(answers).sort((a, b) => Number(a) - Number(b));
    const numVals    = sortedKeys.map(k => getVal(Number(answers[k])));

    const subSum   = (indices) => indices.reduce((a, i) => a + (numVals[i] ?? 0), 0);
    const revSum   = (rev = []) => numVals.reduce((a, v, i) => a + (rev.includes(i) ? revVal(v) : v), 0);
    const getRange = (ranges, v) => ranges.find(r => v >= r.min && v <= r.max) || ranges[ranges.length - 1];
    const simple   = (total) => ({ tipo: 'simples', total, max: s.max, range: getRange(s.ranges, total) });

    switch (s.method) {
        case 'sum':
        case 'k10':
        case 'mdq':
            return simple(numVals.reduce((a, b) => a + b, 0));

        case 'cesd':
        case 'rses':
        case 'pss10':
        case 'dast10':
        case 'bis11':
            return simple(revSum(s.reverseItems || []));

        case 'aq10': {
            const scoreIf01 = [0, 6, 7, 9];
            let total = 0;
            sortedKeys.forEach((k, i) => {
                const idx = Number(answers[k]);
                if (scoreIf01.includes(i)) { if (idx <= 1) total++; }
                else { if (idx >= 2) total++; }
            });
            return simple(total);
        }

        case 'dass21': {
            const dep = subSum(s.depressao) * 2;
            const anx = subSum(s.ansiedade) * 2;
            const str = subSum(s.estresse)  * 2;
            return {
                tipo: 'dass21',
                dominios: [
                    { nome: 'Depressão', valor: dep, range: getRange(s.ranges.depressao, dep) },
                    { nome: 'Ansiedade', valor: anx, range: getRange(s.ranges.ansiedade, anx) },
                    { nome: 'Estresse',  valor: str, range: getRange(s.ranges.estresse,  str) },
                ],
            };
        }

        case 'asrs18': {
            const des = subSum(s.desatencao);
            const hip = subSum(s.hiperatividade);
            return {
                tipo: 'dominios',
                dominios: [
                    { nome: 'Desatenção',                  valor: des, max: s.maxDominio, cutoff: 18, acima: des >= 18 },
                    { nome: 'Hiperatividade/Impulsividade', valor: hip, max: s.maxDominio, cutoff: 18, acima: hip >= 18 },
                ],
            };
        }

        case 'snapiv': {
            const avg = (items) => (subSum(items) / items.length).toFixed(2);
            const des = parseFloat(avg(s.desatencao));
            const hip = parseFloat(avg(s.hiperatividade));
            const ops = parseFloat(avg(s.oposicao));
            return {
                tipo: 'dominios',
                dominios: [
                    { nome: 'Desatenção',                  valor: des, max: 3, cutoff: s.cutoff, acima: des >= s.cutoff },
                    { nome: 'Hiperatividade/Impulsividade', valor: hip, max: 3, cutoff: s.cutoff, acima: hip >= s.cutoff },
                    { nome: 'Desafio/Oposição',            valor: ops, max: 3, cutoff: s.cutoff, acima: ops >= s.cutoff },
                ],
            };
        }

        case 'audit': {
            let total = 0;
            cat.questions.forEach((q, i) => {
                const idx = Number(answers[i]);
                if (isNaN(idx) || answers[i] == null) return;
                total += q.option_values ? (q.option_values[idx] ?? 0) : idx;
            });
            return simple(total);
        }

        case 'pcl5': {
            const total = numVals.reduce((a, b) => a + b, 0);
            return {
                tipo: 'subscalas', total, max: s.max, range: getRange(s.ranges, total),
                subscalas: [
                    { nome: 'Reexperiência',  valor: subSum(s.reexperiencia) },
                    { nome: 'Esquiva',         valor: subSum(s.esquiva) },
                    { nome: 'Cognições/Humor', valor: subSum(s.cognicoes) },
                    { nome: 'Hiperexcitação',  valor: subSum(s.hiperexcitacao) },
                ],
            };
        }

        case 'iesr': {
            const total = numVals.reduce((a, b) => a + b, 0);
            return {
                tipo: 'subscalas', total, max: s.max, range: getRange(s.ranges, total),
                subscalas: [
                    { nome: 'Intrusão',       valor: subSum(s.intrusao) },
                    { nome: 'Esquiva',        valor: subSum(s.esquiva) },
                    { nome: 'Hiperexcitação', valor: subSum(s.hiperexcit) },
                ],
            };
        }

        case 'ocir': {
            const total = numVals.reduce((a, b) => a + b, 0);
            return {
                tipo: 'subscalas', total, max: s.max, range: getRange(s.ranges, total),
                subscalas: [
                    { nome: 'Lavagem',     valor: subSum(s.lavagem) },
                    { nome: 'Verificação', valor: subSum(s.verificacao) },
                    { nome: 'Ordenação',   valor: subSum(s.ordenacao) },
                    { nome: 'Obsessão',    valor: subSum(s.obsessao) },
                    { nome: 'Acumulação',  valor: subSum(s.acumulacao) },
                ],
            };
        }

        case 'whoqol': {
            const revSet = new Set(s.reverseItems || []);
            const domScore = (indices) => {
                const n = indices.length;
                const sum = indices.reduce((a, i) => {
                    const v = numVals[i] ?? minOpt;
                    return a + (revSet.has(i) ? revVal(v) : v);
                }, 0);
                return Math.round((sum - n * minOpt) / (n * (maxOpt - minOpt)) * 100);
            };
            return {
                tipo: 'whoqol',
                dominios: [
                    { nome: 'Físico',          valor: domScore(s.fisico) },
                    { nome: 'Psicológico',      valor: domScore(s.psicologico) },
                    { nome: 'Relações Sociais', valor: domScore(s.social) },
                    { nome: 'Meio Ambiente',    valor: domScore(s.ambiente) },
                ],
            };
        }

        default:
            return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTES AUXILIARES
// ─────────────────────────────────────────────────────────────────────────────
const ScoreDisplay = ({ escalaId, answers }) => {
    const score = calcScore(escalaId, answers);
    if (!score) return null;

    if (score.tipo === 'simples') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    background: score.range.bg, border: `1px solid ${score.range.color}20`,
                    borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: score.range.color }}>{score.total}</span>
                    <div>
                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>de {score.max} pontos</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: score.range.color }}>{score.range.label}</div>
                    </div>
                </div>
                <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', borderRadius: 99, background: score.range.color,
                        width: `${(score.total / score.max) * 100}%`,
                    }} />
                </div>
            </div>
        );
    }

    if (score.tipo === 'subscalas') {
        return (
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{
                        background: score.range.bg, border: `1px solid ${score.range.color}20`,
                        borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <span style={{ fontSize: 22, fontWeight: 900, color: score.range.color }}>{score.total}</span>
                        <div>
                            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>de {score.max} pontos</div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: score.range.color }}>{score.range.label}</div>
                        </div>
                    </div>
                    <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: 99, background: score.range.color,
                            width: `${(score.total / score.max) * 100}%`,
                        }} />
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {score.subscalas.map(sub => (
                        <span key={sub.nome} style={{
                            fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 8,
                            background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ede9fe',
                        }}>
                            {sub.nome}: {sub.valor}
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    if (score.tipo === 'whoqol') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {score.dominios.map(d => {
                    const color = d.valor >= 60 ? '#16a34a' : d.valor >= 40 ? '#d97706' : '#dc2626';
                    return (
                        <div key={d.nome} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', width: 160, flexShrink: 0 }}>{d.nome}</span>
                            <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: 99, background: color, width: `${d.valor}%` }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 800, color, width: 40, textAlign: 'right' }}>{d.valor}%</span>
                        </div>
                    );
                })}
            </div>
        );
    }

    if (score.tipo === 'dass21' || score.tipo === 'dominios') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {score.dominios.map(d => (
                    <div key={d.nome} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', width: 200, flexShrink: 0 }}>{d.nome}</span>
                        {score.tipo === 'dass21' ? (
                            <span style={{
                                fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 8,
                                background: d.range.bg, color: d.range.color, border: `1px solid ${d.range.color}30`,
                            }}>
                                {d.valor} — {d.range.label}
                            </span>
                        ) : (
                            <span style={{
                                fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 8,
                                background: d.acima ? '#fef2f2' : '#f0fdf4',
                                color: d.acima ? '#dc2626' : '#16a34a',
                                border: `1px solid ${d.acima ? '#dc262620' : '#16a34a20'}`,
                            }}>
                                {d.valor}{d.max === 3 ? '' : `/${d.max}`} {d.acima ? '— Acima do corte' : '— Dentro do esperado'}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DE PREVIEW
// ─────────────────────────────────────────────────────────────────────────────
const PreviewModal = ({ escala, onClose }) => (
    <div style={overlayStyle} onClick={onClose}>
        <div style={{ ...modalStyle, maxWidth: 560, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                    <h2 style={{ fontWeight: 800, fontSize: 18, color: '#1e1b4b', margin: 0 }}>{escala.nome}</h2>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>{escala.categoria}</p>
                </div>
                <button onClick={onClose} style={closeBtnStyle}>✕</button>
            </div>

            {escala.instrucoes && (
                <div style={{
                    background: '#f5f3ff', borderRadius: 10, padding: '12px 14px', marginBottom: 20,
                    border: '1px solid #ede9fe',
                }}>
                    <p style={{ fontSize: 13, color: '#4c1d95', lineHeight: 1.6, margin: 0 }}>{escala.instrucoes}</p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {escala.questions.map((q, i) => {
                    const qText   = typeof q === 'string' ? q : q.text;
                    const qOpts   = ((typeof q === 'object' && q.options) ? q.options : escala.response_options) || [];
                    const qLabels = (typeof q === 'object' && q.options) ? q.options : escala.response_labels;
                    return (
                        <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 10px' }}>
                                <span style={{ color: '#7c3aed', marginRight: 6 }}>{i + 1}.</span>{qText}
                            </p>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {qOpts.map((opt, oi) => (
                                    <span key={oi} style={{
                                        padding: '4px 12px', borderRadius: 8, fontSize: 12,
                                        background: '#fff', border: '1.5px solid #e2e8f0', color: '#64748b', fontWeight: 600,
                                    }}>
                                        {opt}{qLabels[oi] && qLabels[oi] !== opt ? ` — ${qLabels[oi]}` : ''}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DE SOLICITAÇÃO
// ─────────────────────────────────────────────────────────────────────────────
const SolicitarModal = ({ escala, patients, onClose, onSent }) => {
    const [patientId, setPatientId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEnviar = async () => {
        if (!patientId) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('patient_escalas').insert([{
                patient_id: patientId,
                nome: escala.nome,
                escala_id: escala.id,
                instrucoes: escala.instrucoes,
                questions: escala.questions.map(q => typeof q === 'string' ? { text: q } : q),
                response_options: escala.response_options,
                response_labels: escala.response_labels,
                status: 'pendente',
            }]);
            if (error) throw error;
            showToast('Escala enviada ao paciente!', 'success');
            onSent();
        } catch {
            showToast('Erro ao enviar escala.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={{ ...modalStyle, maxWidth: 440 }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontWeight: 800, fontSize: 16, color: '#1e1b4b', margin: 0 }}>
                        Solicitar Preenchimento
                    </h2>
                    <button onClick={onClose} style={closeBtnStyle}>✕</button>
                </div>

                <div style={{
                    background: '#f5f3ff', borderRadius: 12, padding: '14px 16px', marginBottom: 20,
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <span style={{ fontSize: 28 }}>{escala.emoji}</span>
                    <div>
                        <p style={{ fontWeight: 800, fontSize: 14, color: '#1e1b4b', margin: 0 }}>{escala.nome}</p>
                        <p style={{ fontSize: 12, color: '#7c3aed', margin: '2px 0 0' }}>
                            {escala.questions.length} perguntas
                        </p>
                    </div>
                </div>

                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Selecionar Paciente
                </label>
                <select
                    value={patientId}
                    onChange={e => setPatientId(e.target.value)}
                    style={{
                        width: '100%', height: 44, marginTop: 8, marginBottom: 20,
                        borderRadius: 12, border: '1.5px solid #e2e8f0',
                        padding: '0 14px', fontSize: 13, color: '#374151',
                        background: '#f8fafc', outline: 'none', fontFamily: 'inherit',
                        boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                >
                    <option value="">— Escolha um paciente —</option>
                    {patients
                        .filter(p => (p.status || '').toLowerCase() === 'ativo')
                        .sort((a, b) => (a.nome || a.name || '').localeCompare(b.nome || b.name || ''))
                        .map(p => (
                            <option key={p.id} value={p.id}>{p.nome || p.name}</option>
                        ))
                    }
                </select>

                <button
                    onClick={handleEnviar}
                    disabled={!patientId || loading}
                    style={{
                        width: '100%', height: 46, borderRadius: 12, border: 0,
                        background: patientId ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#e2e8f0',
                        color: patientId ? '#fff' : '#94a3b8',
                        fontWeight: 800, fontSize: 13, letterSpacing: '0.04em',
                        cursor: patientId ? 'pointer' : 'not-allowed',
                        boxShadow: patientId ? '0 4px 16px rgba(109,40,217,0.35)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontFamily: 'inherit',
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        {loading ? 'autorenew' : 'send'}
                    </span>
                    {loading ? 'Enviando...' : 'Enviar Escala'}
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DE ENVIOS (respostas dos pacientes)
// ─────────────────────────────────────────────────────────────────────────────
const EnviosModal = ({ escalaId, escalaNome, envios: enviosProp, patients, onClose }) => {
    const [selectedEnvio, setSelectedEnvio] = useState(null);
    const [envios, setEnvios] = useState(enviosProp);
    const cat = ESCALAS_CATALOG.find(c => c.id === escalaId);

    const handleCancelar = async (envioId) => {
        if (!confirm('Cancelar o envio desta escala? O paciente não poderá mais respondê-la.')) return;
        const { error } = await supabase.from('patient_escalas').delete().eq('id', envioId);
        if (error) { showToast('Erro ao cancelar.', 'error'); return; }
        setEnvios(prev => prev.filter(e => e.id !== envioId));
        showToast('Envio cancelado.', 'success');
    };

    const getPatient = (pid) => patients.find(x => x.id === pid) || null;

    const PatientAvatar = ({ patient }) => {
        const nome  = patient?.nome || patient?.name || '?';
        const cor   = patient?.cor   || patient?.color || '#7c3aed';
        const ini   = nome.replace(/^Dr\.?\s*/i, '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
        const bg    = cor.startsWith('#') ? cor : '#7c3aed';

        if (patient?.avatar_url) {
            return (
                <img src={patient.avatar_url} alt={nome}
                    style={{ width: 42, height: 42, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
            );
        }
        return (
            <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{ini}</span>
            </div>
        );
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={{ ...modalStyle, maxWidth: 680, maxHeight: '85vh', overflowY: 'auto', width: '90vw' }}
                onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <h2 style={{ fontWeight: 800, fontSize: 18, color: '#1e1b4b', margin: 0 }}>
                            Envios — {escalaNome}
                        </h2>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
                            {envios.length} registro(s) · {envios.filter(e => e.status === 'respondida').length} respondida(s)
                        </p>
                    </div>
                    <button onClick={onClose} style={closeBtnStyle}>✕</button>
                </div>

                {envios.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 40, display: 'block', marginBottom: 12, color: '#e2e8f0' }}>
                            inbox
                        </span>
                        <p style={{ fontWeight: 700, fontSize: 13 }}>Nenhuma resposta recebida ainda.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {envios.map(envio => {
                            const isSelected = selectedEnvio?.id === envio.id;
                            const isPendente = envio.status !== 'respondida';
                            const patient   = getPatient(envio.patient_id);
                            const nomePac   = patient?.nome || patient?.name || 'Paciente desconhecido';
                            return (
                                <div key={envio.id} style={{
                                    borderRadius: 14, border: `1.5px solid ${isSelected ? '#7c3aed' : '#f1f5f9'}`,
                                    overflow: 'hidden', transition: 'border-color 0.15s', background: '#fff',
                                }}>
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: isPendente ? 'default' : 'pointer' }}
                                        onClick={() => !isPendente && setSelectedEnvio(isSelected ? null : envio)}
                                    >
                                        <PatientAvatar patient={patient} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 800, fontSize: 14, color: '#1e1b4b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {nomePac}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>send</span>
                                                    Enviado em {new Date(envio.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                                {envio.answered_at && (
                                                    <span style={{ fontSize: 11, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span>
                                                        Respondido em {new Date(envio.answered_at).toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                            {isPendente ? (
                                                <>
                                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: '#fefce8', border: '1px solid #fde68a', color: '#d97706' }}>
                                                        PENDENTE
                                                    </span>
                                                    <button
                                                        onClick={e => { e.stopPropagation(); handleCancelar(envio.id); }}
                                                        title="Cancelar envio"
                                                        style={{
                                                            width: 28, height: 28, borderRadius: 8, border: '1px solid #fee2e2',
                                                            background: '#fff5f5', cursor: 'pointer', display: 'flex',
                                                            alignItems: 'center', justifyContent: 'center',
                                                            color: '#fca5a5', transition: 'all 0.15s',
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.color = '#fca5a5'; }}
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
                                                        RESPONDIDA
                                                    </span>
                                                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#94a3b8', transition: 'transform 0.2s', transform: isSelected ? 'rotate(180deg)' : 'none' }}>
                                                        expand_more
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {isSelected && envio.answers && (
                                        <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px', background: '#fafbff' }}>
                                            <div style={{ marginBottom: 16 }}>
                                                <p style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                                                    Pontuação
                                                </p>
                                                <ScoreDisplay escalaId={envio.escala_id || escalaId} answers={envio.answers} />
                                            </div>

                                            {cat && (
                                                <div>
                                                    <p style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                                                        Respostas Detalhadas
                                                    </p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                        {cat.questions.map((q, i) => {
                                                            const qText = typeof q === 'string' ? q : q.text;
                                                            const answerIdx = envio.answers[i];
                                                            let displayLabel;
                                                            if (typeof q === 'object' && q.options && answerIdx != null) {
                                                                displayLabel = q.options[answerIdx] || '—';
                                                            } else {
                                                                const optLabels = envio.response_labels || cat.response_labels;
                                                                displayLabel = answerIdx != null ? (optLabels?.[answerIdx] ?? '—') : '—';
                                                            }
                                                            return (
                                                                <div key={i} style={{
                                                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                                                    padding: '8px 12px', borderRadius: 10, background: '#fff',
                                                                    border: '1px solid #f1f5f9',
                                                                }}>
                                                                    <span style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', minWidth: 20 }}>{i + 1}.</span>
                                                                    <p style={{ flex: 1, fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.4 }}>{qText}</p>
                                                                    <span style={{
                                                                        fontSize: 11, fontWeight: 700, padding: '2px 8px',
                                                                        borderRadius: 6, background: '#f5f3ff', color: '#7c3aed',
                                                                        whiteSpace: 'nowrap', flexShrink: 0,
                                                                    }}>
                                                                        {answerIdx != null ? answerIdx : '—'} — {displayLabel}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const Escalas = () => {
    const { user } = useUser();
    const { patients } = usePatients();
    const [envios, setEnvios] = useState([]);
    const [loadingEnvios, setLoadingEnvios] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('Todas');

    const [previewEscala, setPreviewEscala] = useState(null);
    const [sendModal, setSendModal] = useState(null);
    const [enviosModal, setEnviosModal] = useState(null);

    useEffect(() => {
        if (!user?.id) return;
        fetchEnvios();
    }, [user?.id]);

    const fetchEnvios = async () => {
        setLoadingEnvios(true);
        try {
            const patientIds = patients.map(p => p.id);
            if (patientIds.length === 0) { setEnvios([]); setLoadingEnvios(false); return; }
            const { data } = await supabase
                .from('patient_escalas')
                .select('*')
                .in('patient_id', patientIds)
                .order('created_at', { ascending: false });
            setEnvios(data || []);
        } catch {
            setEnvios([]);
        } finally {
            setLoadingEnvios(false);
        }
    };

    const getEnviosCount = (escalaId) => {
        const cat = ESCALAS_CATALOG.find(c => c.id === escalaId);
        return envios.filter(e => e.escala_id === escalaId || e.nome === cat?.nome).length;
    };
    const getEnviosPorEscala = (escalaId) => {
        const cat = ESCALAS_CATALOG.find(c => c.id === escalaId);
        return envios.filter(e => e.escala_id === escalaId || e.nome === cat?.nome);
    };

    const categorias = ['Todas', ...new Set(ESCALAS_CATALOG.map(c => c.categoria))];
    const filtered = ESCALAS_CATALOG.filter(c => {
        const matchSearch = c.nome.toLowerCase().includes(search.toLowerCase()) || c.descricao.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCat === 'Todas' || c.categoria === filterCat;
        return matchSearch && matchCat;
    });

    const totalRespondidas = envios.filter(e => e.status === 'respondida').length;
    const totalPendentes   = envios.filter(e => e.status !== 'respondida').length;

    return (
        <div style={{ padding: '28px 32px', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1e1b4b', margin: 0 }}>
                            Escalas Clínicas
                        </h1>
                        <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
                            Instrumentos validados para avaliação psicológica · {ESCALAS_CATALOG.length} escalas disponíveis
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ ...statPill, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>task_alt</span>
                            {totalRespondidas} respondidas
                        </div>
                        <div style={{ ...statPill, background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>pending_actions</span>
                            {totalPendentes} pendentes
                        </div>
                    </div>
                </div>
            </div>

            {/* Busca + Filtros */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{
                        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                        color: '#cbd5e1', fontSize: 18,
                    }}>search</span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar escala..."
                        style={{
                            width: '100%', height: 42, paddingLeft: 38, paddingRight: 14,
                            border: '1.5px solid #e2e8f0', borderRadius: 12,
                            background: '#fff', fontSize: 13, color: '#374151',
                            outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                        }}
                        onFocus={e => e.target.style.borderColor = '#7c3aed'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {categorias.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCat(cat)}
                            style={{
                                height: 36, padding: '0 14px', borderRadius: 10,
                                fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                                background: filterCat === cat ? '#7c3aed' : '#fff',
                                color: filterCat === cat ? '#fff' : '#64748b',
                                border: `1.5px solid ${filterCat === cat ? '#7c3aed' : '#e2e8f0'}`,
                                transition: 'all 0.15s',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grade de Escalas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.map(escala => {
                    const count = getEnviosCount(escala.id);
                    return (
                        <div key={escala.id} style={{
                            background: '#fff', borderRadius: 18,
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                            padding: '20px 24px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                    background: `${escala.color}15`, border: `1.5px solid ${escala.color}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                                }}>
                                    {escala.emoji}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        <h3 style={{ fontWeight: 800, fontSize: 15, color: '#1e1b4b', margin: 0 }}>
                                            {escala.nome}
                                        </h3>
                                        <span style={{
                                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                                            background: `${escala.color}15`, color: escala.color,
                                            letterSpacing: '0.05em', textTransform: 'uppercase',
                                        }}>
                                            {escala.categoria}
                                        </span>
                                        <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                            {escala.questions.length} itens · {escala.response_options.length} opções
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 0', lineHeight: 1.5 }}>
                                        {escala.descricao}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                    {count > 0 && (
                                        <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700 }}>
                                            {count} envio{count > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                                <ActionBtn icon="visibility" label="Visualizar" onClick={() => setPreviewEscala(escala)} />
                                <ActionBtn icon="send" label="Solicitar Preenchimento" primary onClick={() => setSendModal(escala)} />
                                <ActionBtn icon="inbox" label={`Ver Envios${count > 0 ? ` (${count})` : ''}`}
                                    onClick={() => setEnviosModal({ escala })} disabled={count === 0} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {previewEscala && (
                <PreviewModal escala={previewEscala} onClose={() => setPreviewEscala(null)} />
            )}
            {sendModal && (
                <SolicitarModal
                    escala={sendModal}
                    patients={patients}
                    onClose={() => setSendModal(null)}
                    onSent={() => { setSendModal(null); fetchEnvios(); }}
                />
            )}
            {enviosModal && (
                <EnviosModal
                    escalaId={enviosModal.escala.id}
                    escalaNome={enviosModal.escala.nome}
                    envios={getEnviosPorEscala(enviosModal.escala.id)}
                    patients={patients}
                    onClose={() => setEnviosModal(null)}
                />
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS UTILITÁRIOS
// ─────────────────────────────────────────────────────────────────────────────
const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, backdropFilter: 'blur(4px)', padding: 16,
};

const modalStyle = {
    background: '#fff', borderRadius: 20, padding: '28px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.2)', width: '100%',
};

const closeBtnStyle = {
    width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0',
    background: '#f8fafc', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 14,
    color: '#64748b', fontFamily: 'inherit',
};

const statPill = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
};

const ActionBtn = ({ icon, label, onClick, primary, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{
            height: 34, padding: '0 14px', borderRadius: 10,
            border: primary ? 'none' : '1.5px solid #e2e8f0',
            background: disabled ? '#f8fafc' : primary ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#fff',
            color: disabled ? '#cbd5e1' : primary ? '#fff' : '#7c3aed',
            fontWeight: 700, fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: primary && !disabled ? '0 4px 12px rgba(109,40,217,0.3)' : 'none',
            transition: 'all 0.15s', fontFamily: 'inherit', letterSpacing: '0.02em',
        }}
    >
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{icon}</span>
        {label}
    </button>
);

export default Escalas;
