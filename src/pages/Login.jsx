import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import AiAssistantAnimation from '../components/AiAssistantAnimation';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [view, setView] = useState('login');
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [erro, setErro] = useState('');
    const [loadingGoogle, setLoadingGoogle] = useState(false);

    const { login, loginWithGoogle, loginWithToken, resetPassword, loading } = useUser();

    const orbRef = useRef(null);

    useEffect(() => {
        document.title = "Entrar — Meu Sistema PSI";

        // Inject Font Awesome if not already present
        if (!document.getElementById('fa-cdn')) {
            const link = document.createElement('link');
            link.id = 'fa-cdn';
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
            document.head.appendChild(link);
        }

        // SEO: Meta Description
        const metaDesc = document.querySelector('meta[name="description"]');
        const originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';
        if (metaDesc) {
            metaDesc.setAttribute('content', 'Acesse sua conta no Meu Sistema Psi. Prontuário eletrônico seguro, agenda inteligente e gestão financeira para psicólogos em um só lugar. Teste grátis.');
        }

        // SEO: Canonical
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://meusistemapsi.com.br/login');

        // SEO: JSON-LD
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "LoginPage",
            "name": "Login - Meu Sistema Psi",
            "description": "Página de acesso ao sistema de gestão para psicólogos.",
            "url": "https://meusistemapsi.com.br/login",
            "potentialAction": {
                "@type": "LoginAction",
                "target": "https://meusistemapsi.com.br/login"
            }
        };
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'json-ld-login';
        script.text = JSON.stringify(jsonLd);
        document.head.appendChild(script);

        // Pointer parallax on background orb
        const orb = orbRef.current;
        const handlePointerMove = (e) => {
            if (!orb) return;
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            orb.style.transform = `translate(calc(-50% + ${x * 8}px), calc(-50% + ${y * 8}px))`;
        };
        window.addEventListener('pointermove', handlePointerMove);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            if (metaDesc) metaDesc.setAttribute('content', originalDesc);
            const existingScript = document.getElementById('json-ld-login');
            if (existingScript) existingScript.remove();
        };
    }, []);

    // One-Click Login
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        if (token) {
            (async () => {
                setErro('');
                const res = await loginWithToken(token);
                if (res.success) {
                    setMessage({ type: 'success', text: 'Acesso validado! Entrando...' });
                    setTimeout(() => navigate('/portal'), 1500);
                } else {
                    setErro('Link de acesso inválido ou expirado.');
                }
            })();
        }
    }, [window.location.search]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErro('');
        setMessage({ type: '', text: '' });
        const res = await login(email, senha);
        if (res.success) navigate('/dashboard');
        else setErro(res.message);
    };

    const handleGoogleLogin = async () => {
        setErro('');
        setLoadingGoogle(true);
        try {
            const res = await loginWithGoogle();
            if (res && !res.success) setErro(res.message);
        } finally {
            setLoadingGoogle(false);
        }
    };

    const handleRecovery = async (e) => {
        e.preventDefault();
        setErro('');
        const res = await resetPassword(recoveryEmail);
        if (res.success) {
            setMessage({ type: 'success', text: 'Link de recuperação enviado!' });
            setTimeout(() => setView('login'), 3000);
        } else {
            setErro(res.message);
        }
    };

    return (
        <div className="l2-wrap">
            {/* VISUAL */}
            <section className="l2-visual" aria-hidden="true">
                <div className="l2-orb" ref={orbRef}></div>

                <div className="l2-ring l2-r1">
                    <div className="l2-rotator">
                        <svg className="l2-ring-svg" viewBox="-600 -600 1200 1200" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <path id="r1p" d="M 0,-540 A 540,540 0 1,1 -0.01,-540" fill="none"/>
                            </defs>
                            <text>
                                <textPath href="#r1p" startOffset="0">
                                    DA SESSÃO AO PRONTUÁRIO SEM TOCAR NO TECLADO {'  '}<tspan className="l2-sep">&#xf130;</tspan>{'  '}DA SESSÃO AO PRONTUÁRIO SEM TOCAR NO TECLADO {'  '}<tspan className="l2-sep">&#xf130;</tspan>{'  '}DA SESSÃO AO PRONTUÁRIO SEM TOCAR NO TECLADO {'  '}<tspan className="l2-sep">&#xf130;</tspan>{'  '}
                                </textPath>
                            </text>
                        </svg>
                    </div>
                </div>

                <div className="l2-ring l2-r2 l2-reverse">
                    <div className="l2-rotator">
                        <svg className="l2-ring-svg" viewBox="-600 -600 1200 1200" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <path id="r2p" d="M 0,-440 A 440,440 0 1,1 -0.01,-440" fill="none"/>
                            </defs>
                            <text>
                                <textPath href="#r2p" startOffset="0">
                                    SUPORTE QUE CAMINHA COM VOCÊ {'  '}<tspan className="l2-sep">&#xf70c;</tspan>{'  '}SUPORTE QUE CAMINHA COM VOCÊ {'  '}<tspan className="l2-sep">&#xf70c;</tspan>{'  '}SUPORTE QUE CAMINHA COM VOCÊ {'  '}<tspan className="l2-sep">&#xf70c;</tspan>{'  '}SUPORTE QUE CAMINHA COM VOCÊ {'  '}<tspan className="l2-sep">&#xf70c;</tspan>{'  '}
                                </textPath>
                            </text>
                        </svg>
                    </div>
                </div>

                <div className="l2-ring l2-r3">
                    <div className="l2-rotator">
                        <svg className="l2-ring-svg" viewBox="-600 -600 1200 1200" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <path id="r3p" d="M 0,-350 A 350,350 0 1,1 -0.01,-350" fill="none"/>
                            </defs>
                            <text>
                                <textPath href="#r3p" startOffset="0">
                                    SEGURANÇA QUE INSPIRA CONFIANÇA {'  '}<tspan className="l2-sep">&#xf023;</tspan>{'  '}SEGURANÇA QUE INSPIRA CONFIANÇA {'  '}<tspan className="l2-sep">&#xf023;</tspan>{'  '}SEGURANÇA QUE INSPIRA CONFIANÇA {'  '}<tspan className="l2-sep">&#xf023;</tspan>{'  '}
                                </textPath>
                            </text>
                        </svg>
                    </div>
                </div>

                <div className="l2-ring l2-r4 l2-reverse">
                    <div className="l2-rotator">
                        <svg className="l2-ring-svg" viewBox="-600 -600 1200 1200" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <path id="r4p" d="M 0,-265 A 265,265 0 1,1 -0.01,-265" fill="none"/>
                            </defs>
                            <text>
                                <textPath href="#r4p" startOffset="0">
                                    INTUITIVA DE VERDADE {'  '}<tspan className="l2-sep">&#xf5bb;</tspan>{'  '}INTUITIVA DE VERDADE {'  '}<tspan className="l2-sep">&#xf5bb;</tspan>{'  '}INTUITIVA DE VERDADE {'  '}<tspan className="l2-sep">&#xf5bb;</tspan>{'  '}INTUITIVA DE VERDADE {'  '}<tspan className="l2-sep">&#xf5bb;</tspan>{'  '}
                                </textPath>
                            </text>
                        </svg>
                    </div>
                </div>

                <div className="l2-ai-center">
                    <AiAssistantAnimation size="large" />
                </div>
            </section>

            {/* AUTH CARD */}
            <div className="l2-auth-wrapper">
                <section className="l2-auth" aria-label="Acesso">
                    <div className="l2-panel">

                        {/* Brand */}
                        <div className="l2-brand">
                            <svg className="l2-brand-icon" viewBox="0 0 200 260" aria-hidden="true">
                                <defs>
                                    <linearGradient id="brandGrad2" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#ff66c2"/>
                                        <stop offset="100%" stopColor="#c940a8"/>
                                    </linearGradient>
                                </defs>
                                <g fill="none" stroke="url(#brandGrad2)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M 170,15 C 85,15 30,70 30,130 C 75,125 115,105 145,80 C 165,60 172,35 170,15 Z"/>
                                    <path d="M 30,245 C 115,245 170,190 170,130 C 125,135 85,155 55,180 C 35,200 28,225 30,245 Z"/>
                                </g>
                            </svg>
                            <div className="l2-wordmark">
                                <span>Meu Sistema</span><span className="l2-psi">.PSI</span>
                            </div>
                        </div>

                        {erro && (
                            <div className="l2-error">{erro}</div>
                        )}
                        {message.text && (
                            <div className={`l2-message l2-message--${message.type}`}>{message.text}</div>
                        )}

                        {view === 'login' ? (
                            <form className="l2-row" onSubmit={handleLogin} autoComplete="on" noValidate>
                                <p className="l2-muted">Faça login na sua conta e otimize sua rotina com Meu Sistema.PSI.</p>

                                <div className="l2-field">
                                    <input
                                        className="l2-input"
                                        type="email"
                                        placeholder="E-mail"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        autoComplete="username"
                                        inputMode="email"
                                        autoCapitalize="none"
                                        spellCheck="false"
                                    />
                                </div>

                                <div className="l2-field">
                                    <input
                                        className="l2-input"
                                        type="password"
                                        placeholder="Senha"
                                        required
                                        value={senha}
                                        onChange={e => setSenha(e.target.value)}
                                        autoComplete="current-password"
                                    />
                                </div>

                                <button type="button" className="l2-naked-btn" onClick={() => setView('recovery')}>
                                    Recuperar Senha
                                </button>

                                <button type="submit" className="l2-btn l2-btn--primary" disabled={loading}>
                                    {loading ? 'Entrando…' : 'Entrar'}
                                </button>

                                <button type="button" className="l2-btn l2-btn--secondary" onClick={handleGoogleLogin} disabled={loadingGoogle}>
                                    <span className="l2-btn-icon" aria-hidden="true">
                                        <svg width="16" height="16" viewBox="0 0 18 18">
                                            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.61z"/>
                                            <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z"/>
                                            <path fill="#FBBC05" d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3-2.33z"/>
                                            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"/>
                                        </svg>
                                    </span>
                                    <span>{loadingGoogle ? 'Conectando...' : 'Entrar com Google'}</span>
                                </button>
                            </form>
                        ) : (
                            <form className="l2-row" onSubmit={handleRecovery} noValidate>
                                <p className="l2-muted">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>

                                <div className="l2-field">
                                    <input
                                        className="l2-input"
                                        type="email"
                                        placeholder="E-mail cadastrado"
                                        required
                                        value={recoveryEmail}
                                        onChange={e => setRecoveryEmail(e.target.value)}
                                    />
                                </div>

                                <button type="submit" className="l2-btn l2-btn--primary" disabled={loading}>
                                    {loading ? 'Enviando…' : 'Enviar Link de Recuperação'}
                                </button>

                                <button type="button" className="l2-btn l2-btn--secondary" onClick={() => setView('login')}>
                                    Voltar para o login
                                </button>
                            </form>
                        )}

                        <div className="l2-content-bottom">
                            <button type="button" className="l2-btn l2-btn--secondary l2-btn--sm">
                                <span className="l2-btn-icon" aria-hidden="true"><i className="fa-solid fa-download"></i></span>
                                <span>Instale nosso app</span>
                            </button>

                            <div className="l2-aux">
                                <span>Primeira vez aqui?</span>
                                <Link to="/cadastrar" className="l2-aux-link">Cadastre-se Agora!</Link>
                            </div>
                            <div className="l2-aux">
                                <span>Não é psi?</span>
                                <Link to="/paciente/login" className="l2-aux-link">Sou paciente</Link>
                            </div>

                            <nav className="l2-legal" aria-label="Documentos legais">
                                <a href="/legal/">Legal</a>
                                <span aria-hidden="true">•</span>
                                <a href="/politica-de-privacidade/">Privacidade</a>
                                <span aria-hidden="true">•</span>
                                <a href="/termos-de-servico/">Termos</a>
                                <span aria-hidden="true">•</span>
                                <a href="/politica-de-uso/">Uso</a>
                            </nav>
                        </div>
                    </div>
                </section>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

                .l2-wrap {
                    position: relative; width: 100%; height: 100vh; display: flex;
                    overflow: hidden; font-family: "Poppins", sans-serif;
                    color: #2c1f3d;
                    background:
                        radial-gradient(1200px 900px at 15% 25%, #ffd3ee 0%, transparent 55%),
                        radial-gradient(1100px 900px at 85% 15%, #ffb9e3 0%, transparent 55%),
                        radial-gradient(1400px 1000px at 90% 90%, #b7c2ff 0%, transparent 60%),
                        radial-gradient(1100px 900px at 10% 90%, #e3b8ff 0%, transparent 60%),
                        linear-gradient(135deg, #ffc3e9 0%, #e8baff 50%, #b9c8ff 100%);
                }

                .l2-visual {
                    position: relative; flex: 1; overflow: hidden;
                }

                .l2-orb {
                    position: absolute; left: 50%; top: 50%;
                    transform: translate(-50%, -50%);
                    width: 160vmin; height: 160vmin; border-radius: 50%;
                    -webkit-mask-image: radial-gradient(closest-side, #000 48%, rgba(0,0,0,0.9) 62%, rgba(0,0,0,0.65) 82%, rgba(0,0,0,0) 100%);
                    mask-image: radial-gradient(closest-side, #000 48%, rgba(0,0,0,0.9) 62%, rgba(0,0,0,0.65) 82%, rgba(0,0,0,0) 100%);
                    backdrop-filter: blur(2px) saturate(130%);
                    -webkit-backdrop-filter: blur(2px) saturate(130%);
                    background: radial-gradient(circle at 50% 50%, rgba(255,200,230,0.45) 0%, rgba(255,200,230,0.18) 40%, rgba(255,255,255,0.06) 70%, transparent 100%);
                }

                .l2-ring {
                    position: absolute; left: 50%; top: 50%;
                    transform: translate(-50%, -50%);
                    border-radius: 50%;
                    width: var(--l2-size); height: var(--l2-size);
                    pointer-events: none;
                }
                .l2-ring::before {
                    content: ''; position: absolute; inset: 0; border-radius: 50%;
                    background: var(--l2-band);
                    -webkit-mask-image: radial-gradient(circle, transparent calc(50% - var(--l2-thickness)), #000 calc(50% - var(--l2-thickness) + 0.5px), #000 calc(50% - 0.5px), transparent 50%);
                    mask-image: radial-gradient(circle, transparent calc(50% - var(--l2-thickness)), #000 calc(50% - var(--l2-thickness) + 0.5px), #000 calc(50% - 0.5px), transparent 50%);
                    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.28);
                }
                .l2-ring::after {
                    content: ''; position: absolute; inset: 0; border-radius: 50%;
                    border: 1px solid rgba(255,255,255,0.45);
                    box-shadow: inset 0 0 28px rgba(255,255,255,0.22), 0 0 28px -6px rgba(255,255,255,0.25);
                }

                .l2-r1 { --l2-size: 128vmin; --l2-thickness: 11vmin; --l2-band: rgba(255,255,255,0.06); --l2-spin: 220s; }
                .l2-r2 { --l2-size: 104vmin; --l2-thickness: 10vmin; --l2-band: rgba(255,255,255,0.08); --l2-spin: 170s; }
                .l2-r3 { --l2-size:  82vmin; --l2-thickness:  9vmin; --l2-band: rgba(255,255,255,0.11); --l2-spin: 130s; }
                .l2-r4 { --l2-size:  62vmin; --l2-thickness:  8vmin; --l2-band: rgba(255,255,255,0.14); --l2-spin:  95s; }

                .l2-rotator {
                    position: absolute; inset: 0; border-radius: 50%;
                    animation: l2-ring-spin var(--l2-spin) linear infinite;
                }
                .l2-reverse .l2-rotator { animation-direction: reverse; }
                @keyframes l2-ring-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

                .l2-ring-svg {
                    position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible;
                }
                .l2-ring-svg text {
                    fill: rgba(255,255,255,0.92);
                    font-family: "Poppins", sans-serif;
                    font-weight: 500;
                    letter-spacing: 0.34em;
                    text-transform: uppercase;
                    text-shadow: 0 0 12px rgba(255,255,255,0.35);
                    opacity: 0;
                    animation: l2-text-fade 1.6s ease forwards 0.2s;
                }
                .l2-r1 .l2-ring-svg text { font-size: 1.85vmin; }
                .l2-r2 .l2-ring-svg text { font-size: 1.7vmin; }
                .l2-r3 .l2-ring-svg text { font-size: 1.6vmin; }
                .l2-r4 .l2-ring-svg text { font-size: 1.45vmin; }
                .l2-sep {
                    font-family: "Font Awesome 6 Free", "FontAwesome";
                    font-weight: 900;
                    fill: rgba(255,255,255,0.85);
                    font-size: 1.25em;
                    letter-spacing: 0;
                }
                @keyframes l2-text-fade { to { opacity: 1; } }

                .l2-ai-center {
                    position: absolute; left: 50%; top: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 3;
                    display: flex; align-items: center; justify-content: center;
                }

                .l2-auth-wrapper {
                    position: absolute;
                    right: clamp(20px, 4vw, 80px);
                    top: 50%; transform: translateY(-50%);
                    z-index: 5;
                    width: min(420px, 90vw);
                }
                .l2-auth {
                    position: relative; width: 100%;
                    padding: clamp(24px, 3vw, 32px) clamp(22px, 3vw, 30px);
                    border-radius: 36px;
                    border: 1px solid rgba(255,255,255,0.55);
                    backdrop-filter: blur(18px) saturate(140%);
                    -webkit-backdrop-filter: blur(18px) saturate(140%);
                    background: linear-gradient(160deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.18) 100%);
                    box-shadow:
                        inset 0 1px 0 rgba(255,255,255,0.7),
                        inset 0 -1px 0 rgba(255,255,255,0.25),
                        0 20px 50px -18px rgba(140,60,160,0.35),
                        0 6px 18px -10px rgba(90,30,120,0.18);
                    animation: l2-card-float 8s ease-in-out infinite;
                }
                @keyframes l2-card-float {
                    0%,100% { transform: translateY(0); }
                    50%     { transform: translateY(-4px); }
                }

                .l2-panel { display: flex; flex-direction: column; flex: 1; }

                .l2-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
                .l2-brand-icon { width: 36px; height: 36px; flex: 0 0 36px; }
                .l2-wordmark {
                    font-size: 28px; font-weight: 700; color: #1a1530;
                    letter-spacing: -0.01em; line-height: 1;
                    display: flex; align-items: baseline; gap: 2px;
                }
                .l2-psi { font-size: 14px; font-weight: 500; color: #1a1530; letter-spacing: 0; }

                .l2-muted { color: rgba(40,25,55,0.78); font-size: 13px; line-height: 1.5; margin-bottom: 14px; font-weight: 400; }
                .l2-row { display: flex; flex-direction: column; gap: 10px; }
                .l2-field { position: relative; }
                .l2-input {
                    width: 100%; height: 44px; padding: 0 18px;
                    font-size: 13.5px; color: #1a1530;
                    background: rgba(255,255,255,0.55);
                    border: 1px solid rgba(255,255,255,0.7);
                    border-radius: 14px; outline: none;
                    font-family: inherit;
                    transition: border-color .2s, background .2s, box-shadow .2s;
                }
                .l2-input::placeholder { color: rgba(40,25,55,0.55); font-weight: 400; }
                .l2-input:hover { background: rgba(255,255,255,0.7); }
                .l2-input:focus {
                    border-color: rgba(188,116,255,0.75);
                    background: rgba(255,255,255,0.85);
                    box-shadow: 0 0 0 3px rgba(188,116,255,0.22);
                }

                .l2-naked-btn {
                    background: none; border: 0; padding: 4px 0;
                    color: rgba(40,25,55,0.72); font-size: 12.5px;
                    align-self: flex-end; font-family: inherit; cursor: pointer;
                }
                .l2-naked-btn:hover { color: #1a1530; }

                .l2-btn {
                    appearance: none; border: 0;
                    width: 100%; height: 44px; padding: 0 18px;
                    border-radius: 14px; font-family: inherit; font-size: 14px; font-weight: 500;
                    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
                    transition: transform .15s ease, box-shadow .2s ease; cursor: pointer;
                }
                .l2-btn:disabled { opacity: 0.65; cursor: not-allowed; }
                .l2-btn--primary {
                    color: #fff;
                    background: linear-gradient(180deg, #b18bff 0%, #8659e8 100%);
                    box-shadow:
                        inset 0 1px 0 rgba(255,255,255,0.4),
                        inset 0 -1px 0 rgba(0,0,0,0.08),
                        0 10px 26px -10px rgba(134,89,232,0.7),
                        0 2px 4px rgba(0,0,0,0.08);
                }
                .l2-btn--primary:hover:not(:disabled) { transform: translateY(-1px); }
                .l2-btn--secondary {
                    background: rgba(255,255,255,0.65); color: #1a1530;
                    border: 1px solid rgba(255,255,255,0.8);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 12px -6px rgba(90,30,120,0.18);
                }
                .l2-btn--secondary:hover:not(:disabled) { background: rgba(255,255,255,0.8); }
                .l2-btn--sm { height: 40px; font-size: 13px; }
                .l2-btn-icon { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; }

                .l2-content-bottom { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }

                .l2-aux {
                    display: flex; justify-content: center; align-items: baseline;
                    gap: 6px; font-size: 13px; color: rgba(40,25,55,0.75);
                }
                .l2-aux-link {
                    color: #8659e8; font-size: 13px; font-weight: 600; text-decoration: none;
                }
                .l2-aux-link:hover { color: #6a3dd0; text-decoration: underline; }

                .l2-legal {
                    display: flex; justify-content: center; align-items: center;
                    gap: 8px; padding: 8px 14px; margin-top: 6px;
                    border-radius: 99px;
                    background: rgba(255,255,255,0.4);
                    border: 1px solid rgba(255,255,255,0.55);
                    font-size: 11px; color: rgba(40,25,55,0.62);
                }
                .l2-legal a { color: inherit; text-decoration: none; font-weight: 500; }
                .l2-legal a:hover { color: #1a1530; }

                .l2-error {
                    padding: 10px 14px; border-radius: 12px; margin-bottom: 10px;
                    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
                    color: #c0392b; font-size: 13px;
                }
                .l2-message {
                    padding: 10px 14px; border-radius: 12px; margin-bottom: 10px; font-size: 13px;
                }
                .l2-message--success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); color: #16a34a; }

                @media (max-width: 800px) {
                    .l2-auth-wrapper {
                        position: static; transform: none; width: 100%;
                        padding: 24px 16px; display: flex; align-items: flex-end; min-height: 100vh;
                    }
                    .l2-auth { border-radius: 28px; }
                    .l2-visual { position: absolute; inset: 0; opacity: 0.9; }
                }
            `}</style>
        </div>
    );
};

export default Login;
