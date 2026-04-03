import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Login = () => {
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [view, setView] = useState('login');
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const { login, loginWithGoogle, resetPassword } = useUser();
    const [erro, setErro] = useState('');
    const [loadingGoogle, setLoadingGoogle] = useState(false);

    useEffect(() => {
        document.title = "Login | Meu Sistema Psi - Acesse sua Clínica";
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', 'Acesse o Meu Sistema Psi e gerencie sua clínica de psicologia com prontuários, agenda e financeiro. Login seguro e rápido.');
        
        // Add canonical tag
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://meusistemapsi.com.br/login');
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErro('');
        setMessage({ type: '', text: '' });
        
        const res = await login(email, senha);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setErro(res.message);
        }
    };

    const handleGoogleLogin = async () => {
        setErro('');
        setLoadingGoogle(true);
        try {
            const res = await loginWithGoogle();
            if (res && !res.success) {
                if (res.message.includes('provider is not enabled')) {
                    setErro('O login com Google ainda não foi ativado no servidor. Por favor, use e-mail e senha.');
                } else {
                    setErro(res.message);
                }
            }
        } finally {
            // No caso de sucesso, o browser redireciona, então o setLoading(false) 
            // só importa se o usuário voltar ou houver erro.
            setLoadingGoogle(false);
        }
    };

    const handleRecovery = async (e) => {
        e.preventDefault();
        setErro('');
        const res = await resetPassword(recoveryEmail);
        if (res.success) {
            setMessage({ type: 'success', text: 'E-mail de recuperação enviado! Verifique sua caixa de entrada.' });
            setTimeout(() => setView('login'), 3000);
        } else {
            setErro(res.message);
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-violet-50 via-purple-50/50 to-fuchsia-50/30 dark:bg-slate-950">
            {/* Left: Form */}
            <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-24">
                <div className="mx-auto w-full max-w-sm">
                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-gradient-to-br from-violet-400 to-purple-400 p-2.5 rounded-xl shadow-md shadow-violet-200/40">
                            <span className="material-symbols-outlined text-2xl text-white">psychology</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Meu Sistema Psi</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                            {view === 'login' ? 'Login — Bem-vindo de volta!' : 'Recuperar Acesso'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {view === 'login' 
                                ? 'Acesse sua conta para gerenciar seus atendimentos.' 
                                : 'Enviaremos um link para você redefinir sua senha.'}
                        </p>
                    </div>

                    {erro && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                            <span className="material-symbols-outlined text-red-500">error</span>
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">{erro}</span>
                        </div>
                    )}

                    {message.text && (
                        <div className={`mb-6 p-4 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-blue-50 border-blue-200 text-blue-600'} border rounded-xl flex items-center gap-3`}>
                            <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'info'}</span>
                            <span className="text-sm font-bold">{message.text}</span>
                        </div>
                    )}

                    {view === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 uppercase tracking-wider opacity-60">E-mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 text-sm font-medium text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 uppercase tracking-wider opacity-60">Senha</label>
                                <div className="relative">
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        value={senha}
                                        onChange={e => setSenha(e.target.value)}
                                        className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 pr-12 text-sm font-medium text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-violet-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">{showPass ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-violet-500 focus:ring-violet-500/20" />
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Lembrar de mim</span>
                                </label>
                                <button type="button" onClick={() => setView('recovery')} className="text-sm font-bold text-violet-600 hover:text-violet-500 transition-colors">Esqueci minha senha</button>
                            </div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3.5 text-sm font-bold leading-6 text-white shadow-xl shadow-purple-100 hover:from-purple-700 hover:to-indigo-700 transition-all active:scale-[0.98] group items-center gap-2"
                            >
                                Acessar Sistema
                                <span className="material-symbols-outlined text-transparent group-hover:text-white group-hover:translate-x-1 transition-all text-sm font-bold">arrow_forward</span>
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRecovery} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 uppercase tracking-wider opacity-60">E-mail cadastrado</label>
                                <input
                                    type="email"
                                    value={recoveryEmail}
                                    onChange={e => setRecoveryEmail(e.target.value)}
                                    className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 text-sm font-medium text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3.5 bg-gradient-to-r from-violet-400 to-purple-400 text-white font-bold rounded-xl shadow-lg shadow-violet-200/40 hover:shadow-violet-300/50 hover:from-violet-500 hover:to-purple-500 transition-all active:scale-[0.99] uppercase tracking-widest text-xs"
                            >
                                Enviar Link de Recuperação
                            </button>
                            <button type="button" onClick={() => setView('login')} className="w-full text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Voltar para o login</button>
                        </form>
                    )}

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-gradient-to-br from-violet-50 via-purple-50/50 to-fuchsia-50/30 dark:bg-slate-950 px-4 text-slate-500 font-bold tracking-widest">Ou continue com</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loadingGoogle}
                            className="mt-6 w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                            {loadingGoogle ? (
                                <span className="animate-spin size-5 border-2 border-violet-500 border-t-transparent rounded-full"></span>
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            )}
                            {loadingGoogle ? 'Conectando...' : 'Entrar com Google'}
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-slate-500 font-medium">
                        Não tem uma conta?{' '}
                        <Link to="/cadastrar" className="font-bold text-violet-600 hover:underline transition-all">Cadastre-se</Link>
                    </p>
                </div>
            </div>

            {/* Right: Visual */}
            <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-300 via-purple-300 to-fuchsia-300" />
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)'}} />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                    <div className="max-w-md text-center">
                        <div className="size-24 rounded-3xl bg-white/50 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 shadow-lg shadow-purple-400/20 border border-white/40">
                            <span className="material-symbols-outlined text-6xl text-purple-700">psychology</span>
                        </div>
                        <h2 className="text-3xl font-bold text-purple-900 mb-4 tracking-tight">Cuide da sua carreira com a mesma dedicação que cuida dos seus pacientes</h2>
                        <p className="text-purple-800/70 text-lg font-medium leading-relaxed">
                            Prontuários, agenda e financeiro — tudo em um só lugar, feito para você.
                        </p>
                        <div className="grid grid-cols-3 gap-4 mt-10">
                            {[
                                { icon: 'group', label: 'Pacientes' },
                                { icon: 'calendar_month', label: 'Agenda' },
                                { icon: 'description', label: 'Prontuários' },
                            ].map((f, i) => (
                                <div key={i} className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/50 shadow-sm transition-all hover:bg-white/60">
                                    <span className="material-symbols-outlined text-purple-700 text-3xl">{f.icon}</span>
                                    <p className="text-[10px] font-bold text-purple-800/70 mt-2 uppercase tracking-widest">{f.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;


