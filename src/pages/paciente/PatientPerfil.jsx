import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../contexts/UserContext';
import { showToast } from '../../components/Toast';

const PatientPerfil = () => {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [paciente, setPaciente] = useState(null);
    const [terapeuta, setTerapeuta] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            const { data: p } = await supabase
                .from('patients')
                .select('*')
                .eq('patient_profile_id', user.id)
                .single();
            if (!p) { setLoading(false); return; }
            setPaciente(p);

            if (p.user_id) {
                const { data: prof } = await supabase
                    .from('profiles')
                    .select('full_name, clinic_name, phone, avatar_url')
                    .eq('id', p.user_id)
                    .single();
                setTerapeuta(prof);
            }
            setLoading(false);
        };
        fetchData();
    }, [user?.id]);

    const handleLogout = async () => {
        await logout();
        navigate('/paciente/login');
    };

    const initials = (name) => name ? name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : '?';

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f1f5f9' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#7c3aed', animation: 'spin 1s linear infinite' }}>autorenew</span>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );

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
                        <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 22 }}>person</span>
                    </div>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>Meu Perfil</h1>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 600, letterSpacing: '0.05em' }}>
                            SUAS INFORMAÇÕES E CONEXÃO
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
                {/* Patient info card */}
                <div style={{
                    background: '#fff', borderRadius: 20,
                    padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                }}>
                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 16 }}>
                        SEUS DADOS
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 16,
                            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>
                                {initials(paciente?.name || user?.nome || user?.name)}
                            </span>
                        </div>
                        <div>
                            <p style={{ fontWeight: 800, fontSize: 16, color: '#1e1b4b', margin: 0 }}>
                                {paciente?.name || user?.nome || 'Paciente'}
                            </p>
                            <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>
                                {user?.email || paciente?.email || '—'}
                            </p>
                        </div>
                    </div>

                    {paciente?.phone && (
                        <InfoRow icon="phone" label="Telefone" value={paciente.phone} />
                    )}
                    {paciente?.status && (
                        <InfoRow icon="verified" label="Status"
                            value={<span style={{
                                background: '#f0fdf4', border: '1px solid #bbf7d0',
                                color: '#16a34a', borderRadius: 8, padding: '2px 10px',
                                fontSize: 11, fontWeight: 700,
                            }}>{paciente.status}</span>}
                        />
                    )}
                </div>

                {/* Therapist connection card */}
                <div style={{
                    background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 60%, #9333ea 100%)',
                    borderRadius: 20, padding: '24px',
                    boxShadow: '0 8px 24px rgba(109,40,217,0.3)',
                }}>
                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 16 }}>
                        SEU TERAPEUTA
                    </p>
                    {terapeuta ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {terapeuta.avatar_url ? (
                                <img src={terapeuta.avatar_url} alt="avatar" style={{
                                    width: 52, height: 52, borderRadius: 14,
                                    objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0,
                                }} />
                            ) : (
                                <div style={{
                                    width: 52, height: 52, borderRadius: 14,
                                    background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>
                                        {initials(terapeuta.full_name || terapeuta.clinic_name)}
                                    </span>
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 800, fontSize: 15, color: '#fff', margin: 0 }}>
                                    {terapeuta.full_name || 'Terapeuta'}
                                </p>
                                {terapeuta.clinic_name && (
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '2px 0 0' }}>
                                        {terapeuta.clinic_name}
                                    </p>
                                )}
                                {terapeuta.phone && (
                                    <a
                                        href={`https://wa.me/55${terapeuta.phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                            marginTop: 8, padding: '4px 12px', borderRadius: 10,
                                            background: 'rgba(255,255,255,0.15)', color: '#fff',
                                            fontSize: 12, fontWeight: 700, textDecoration: 'none',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chat</span>
                                        WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 28 }}>person_off</span>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                                Nenhum terapeuta vinculado ao seu perfil.
                            </p>
                        </div>
                    )}
                </div>

                {/* Privacy section */}
                <div style={{
                    background: '#fff', borderRadius: 20, padding: '20px 24px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                }}>
                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>
                        PRIVACIDADE E SEGURANÇA
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <PrivacyRow icon="lock" text="Seus dados são criptografados de ponta a ponta." />
                        <PrivacyRow icon="shield" text="Apenas seu terapeuta tem acesso ao seu histórico." />
                        <PrivacyRow icon="visibility_off" text="Registros de humor são privados e sigilosos." />
                    </div>
                </div>

                {/* Logout button */}
                <button onClick={handleLogout} style={{
                    width: '100%', height: 48, borderRadius: 14,
                    border: '1.5px solid #fecaca', background: '#fff',
                    color: '#dc2626', fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
                    Sair do Portal
                </button>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid #f1f5f9' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#94a3b8', flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', width: 80, flexShrink: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{value}</span>
    </div>
);

const PrivacyRow = ({ icon, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#7c3aed', flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: 13, color: '#64748b' }}>{text}</span>
    </div>
);

export default PatientPerfil;
