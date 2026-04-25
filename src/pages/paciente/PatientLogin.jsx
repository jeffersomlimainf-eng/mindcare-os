import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const PatientLogin = () => {
    const navigate = useNavigate();
    const { login, resetPassword, loading } = useUser();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [view, setView] = useState('login');
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [erro, setErro] = useState('');
    const [msg, setMsg] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setErro('');
        const res = await login(email, senha);
        if (res.success) navigate('/paciente/home');
        else setErro(res.message || 'E-mail ou senha incorretos.');
    };

    const handleRecovery = async (e) => {
        e.preventDefault();
        setErro('');
        const res = await resetPassword(recoveryEmail);
        if (res.success) {
            setMsg('Link enviado para o seu e-mail!');
            setTimeout(() => { setView('login'); setMsg(''); }, 3000);
        } else {
            setErro(res.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            padding: '24px',
        }}>
            {/* Card */}
            <div style={{
                background: '#fff',
                borderRadius: 24,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                padding: '40px 36px 32px',
                width: '100%',
                maxWidth: 400,
            }}>
                {/* Icon */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(109,40,217,0.35)',
                    }}>
                        <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 28 }}>
                            login
                        </span>
                    </div>
                </div>

                {/* Title */}
                <h1 style={{
                    textAlign: 'center', fontWeight: 800, fontSize: 22,
                    fontStyle: 'italic', color: '#1e1b4b', marginBottom: 6,
                }}>
                    Portal do Paciente
                </h1>
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginBottom: 28 }}>
                    Acesse seu painel de acompanhamento
                </p>

                {/* Error */}
                {erro && (
                    <div style={{
                        background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
                        padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16,
                    }}>{erro}</div>
                )}
                {msg && (
                    <div style={{
                        background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12,
                        padding: '10px 14px', color: '#16a34a', fontSize: 13, marginBottom: 16,
                    }}>{msg}</div>
                )}

                {view === 'login' ? (
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                                E-mail
                            </label>
                            <input
                                type="email" required
                                value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                autoComplete="username"
                                style={inputStyle}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: '#94a3b8', textTransform: 'uppercase' }}>
                                    Senha
                                </label>
                                <button type="button" onClick={() => setView('recovery')} style={{
                                    background: 'none', border: 0, color: '#7c3aed', fontSize: 11,
                                    fontWeight: 700, cursor: 'pointer', padding: 0, letterSpacing: '0.05em',
                                }}>
                                    ESQUECEU?
                                </button>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPass ? 'text' : 'password'} required
                                    value={senha} onChange={e => setSenha(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    style={{ ...inputStyle, paddingRight: 44 }}
                                />
                                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 0, cursor: 'pointer', color: '#94a3b8', display: 'flex',
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                                        {showPass ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading} style={primaryBtn}>
                            {loading ? 'Entrando...' : 'ENTRAR NO PORTAL'}
                        </button>

                        {/* Nota para o paciente */}
                        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>
                            Sua conta é criada pelo seu terapeuta.
                            <br />Entre em contato com ele caso não tenha recebido o acesso.
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleRecovery} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>
                            Informe seu e-mail e enviaremos um link para redefinir sua senha.
                        </p>
                        <div>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                                E-mail cadastrado
                            </label>
                            <input
                                type="email" required
                                value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)}
                                placeholder="seu@email.com"
                                style={inputStyle}
                            />
                        </div>
                        <button type="submit" disabled={loading} style={primaryBtn}>
                            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                        </button>
                        <button type="button" onClick={() => setView('login')} style={secondaryBtn}>
                            Voltar para o login
                        </button>
                    </form>
                )}
            </div>

            {/* Footer */}
            <p style={{ marginTop: 24, color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                MEU SISTEMA PSI © {new Date().getFullYear()}
            </p>
        </div>
    );
};

const inputStyle = {
    width: '100%', height: 44, padding: '0 14px',
    border: '1.5px solid #e2e8f0', borderRadius: 12,
    fontSize: 14, color: '#1e293b', background: '#f8fafc',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
};

const primaryBtn = {
    width: '100%', height: 44, borderRadius: 12, border: 0,
    background: 'linear-gradient(180deg, #7c3aed, #6d28d9)',
    color: '#fff', fontWeight: 800, fontSize: 13,
    letterSpacing: '0.06em', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(109,40,217,0.35)',
    transition: 'transform 0.15s',
};

const secondaryBtn = {
    width: '100%', height: 44, borderRadius: 12,
    border: '1.5px solid #e2e8f0', background: '#fff',
    color: '#374151', fontWeight: 600, fontSize: 14,
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8, fontFamily: 'inherit',
};

export default PatientLogin;
