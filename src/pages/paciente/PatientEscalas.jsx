import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../contexts/UserContext';

const PatientEscalas = () => {
    const { user } = useUser();
    const [escalas, setEscalas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEscalas = async () => {
            if (!user?.id) return;
            const { data: patient } = await supabase
                .from('patients')
                .select('id')
                .eq('patient_profile_id', user.id)
                .single();
            if (!patient) { setLoading(false); return; }

            const { data } = await supabase
                .from('patient_escalas')
                .select('*')
                .eq('patient_id', patient.id)
                .order('created_at', { ascending: false });
            setEscalas(data || []);
            setLoading(false);
        };
        fetchEscalas();
    }, [user]);

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
                /* Empty state */
                <div style={{
                    background: '#fff',
                    borderRadius: 20,
                    padding: '64px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: 20,
                        background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#7c3aed' }}>
                            assignment_late
                        </span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{
                            fontSize: 11, fontWeight: 800, letterSpacing: '0.12em',
                            color: '#7c3aed', textTransform: 'uppercase', marginBottom: 8,
                        }}>
                            NENHUMA ESCALA PENDENTE
                        </p>
                        <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 320, lineHeight: 1.6 }}>
                            Quando seu terapeuta enviar uma escala para você responder, ela aparecerá aqui.
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {escalas.map(escala => (
                        <EscalaCard key={escala.id} escala={escala} />
                    ))}
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

const EscalaCard = ({ escala }) => {
    const statusColor = escala.status === 'respondida'
        ? { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', label: 'Respondida' }
        : { bg: '#fefce8', border: '#fde68a', text: '#d97706', label: 'Pendente' };

    return (
        <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
        }}>
            <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#7c3aed' }}>assignment</span>
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#1e1b4b', margin: 0 }}>{escala.nome || 'Escala'}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>
                    Enviada em {new Date(escala.created_at).toLocaleDateString('pt-BR')}
                </p>
            </div>
            <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                padding: '4px 10px', borderRadius: 8,
                background: statusColor.bg, border: `1px solid ${statusColor.border}`,
                color: statusColor.text,
            }}>
                {statusColor.label.toUpperCase()}
            </span>
        </div>
    );
};

export default PatientEscalas;
