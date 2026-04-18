import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { showToast } from '../components/Toast';
import { supabase } from '../lib/supabase';

import { logger } from '../utils/logger';
const Register = () => {
    const navigate = useNavigate();
    const { signUp, loginWithGoogle } = useUser();

    useEffect(() => {
        document.title = "Cadastre-se Grátis | Meu Sistema Psi - 30 Dias de Teste";
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', 'Crie sua conta no Meu Sistema Psi e teste grátis por 30 dias. Prontuário eletrônico, agenda inteligente e gestão financeira para psicólogos.');

        // Add canonical tag
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://meusistemapsi.com.br/cadastrar');

        // Capturar ref da indicação
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            sessionStorage.setItem('referral_code', ref);
        }
    }, []);
    
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loadingGoogle, setLoadingGoogle] = useState(false);
    
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccessWithEmail, setIsSuccessWithEmail] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setErro('');

        if (senha.length < 6) {
            setErro('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        const res = await signUp('', email, senha, '');
        
        if (res.success) {
            // Tentar vincular indicação
            try {
                const { error: refError } = await supabase
                    .from('referrals')
                    .update({ status: 'Cadastrado' })
                    .eq('referral_contact', email)
                    .eq('status', 'Pendente');
                
                if (refError) logger.warn('[Register] Erro ao atualizar indicação:', refError);
            } catch (e) {
                logger.error('[Register] Erro no vínculo de indicação:', e);
            }

            if (res.data?.session) {
                showToast('Cadastro realizado com sucesso!', 'success');
                navigate('/dashboard');
            } else {
                setIsSuccessWithEmail(true);
                setLoading(false);
            }
        } else {
            let userFriendlyMsg = res.message;
            if (res.message.includes('User already registered') || res.message.includes('already_exists')) {
                userFriendlyMsg = 'Este e-mail já possui uma conta. Tente fazer login!';
            } else if (res.message.includes('Signup is disabled')) {
                userFriendlyMsg = 'O cadastro está temporariamente desativado. Entre em contato com o suporte.';
            }
            
            setErro(userFriendlyMsg);
            setLoading(false);
            showToast(userFriendlyMsg, 'error');
        }
    };

    const handleGoogleRegister = async () => {
        setErro('');
        setLoadingGoogle(true);
        try {
            const res = await loginWithGoogle();
            if (res && !res.success) {
                setErro(res.message);
            }
        } finally {
            setLoadingGoogle(false);
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

                    {isSuccessWithEmail ? (
                        <div className="text-center">
                            <div className="size-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-4xl text-emerald-600">mail</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Conta Criada!</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-medium leading-relaxed">
                                Enviamos um link de confirmação para <br/><b className="text-slate-800 dark:text-slate-200">{email}</b>.<br/> Acesse seu e-mail para ativar sua conta.
                            </p>
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl text-left mb-6">
                                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">settings</span> Dica do Sistema
                                </p>
                                <p className="text-[11px] text-indigo-600 dark:text-indigo-300 leading-relaxed">
                                    Para o cadastro <b>entrar direto sem confirmação</b>, acesse o painel do Supabase em <i>Authentication &rarr; Providers &rarr; Email</i> e desative a opção <b>"Confirm email"</b>.
                                </p>
                            </div>
                            <Link to="/login" className="inline-flex items-center justify-center w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all">
                                Ir para o Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                    Cadastro — Criar sua conta grátis
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    Comece a gerenciar sua clínica de forma inteligente.
                                </p>
                            </div>

                            {erro && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="material-symbols-outlined text-red-500">error</span>
                                        <span className="text-sm font-bold text-red-600 dark:text-red-400">{erro}</span>
                                    </div>
                                    {erro.includes('já possui uma conta') && (
                                        <Link 
                                            to="/login" 
                                            className="block w-full text-center py-2 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all shadow-sm"
                                        >
                                            Ir para o Login Agora
                                        </Link>
                                    )}
                                </div>
                            )}

                            {/* Google Signup */}
                            <button
                                type="button"
                                onClick={handleGoogleRegister}
                                disabled={loadingGoogle || loading}
                                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 mb-6"
                            >
                                {loadingGoogle ? (
                                    <span className="animate-spin size-5 border-2 border-violet-500 border-t-transparent rounded-full"></span>
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                )}
                                {loadingGoogle ? 'Conectando...' : 'Cadastrar com Google'}
                            </button>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-gradient-to-br from-violet-50 via-purple-50/50 to-fuchsia-50/30 dark:bg-slate-950 px-4 text-slate-400 font-bold tracking-widest">ou use seu e-mail</span>
                                </div>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-4">

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


                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3.5 text-sm font-bold leading-6 text-white shadow-xl shadow-purple-100 hover:from-purple-700 hover:to-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group items-center gap-2"
                                >
                                    {loading ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Criar Minha Conta Grátis
                                            <span className="material-symbols-outlined text-transparent group-hover:text-white group-hover:translate-x-1 transition-all text-sm font-bold">arrow_forward</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="mt-8 text-center text-sm text-slate-500 font-medium">
                                Já tem uma conta?{' '}
                                <Link to="/login" className="font-bold text-violet-600 hover:underline transition-all">Faça login</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Right: Visual */}
            <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-300 via-purple-300 to-fuchsia-300" />
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)'}} />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                    <div className="max-w-md text-center">
                        <div className="size-24 rounded-3xl bg-white/50 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 shadow-lg shadow-purple-400/20 border border-white/40">
                            <img src="/favicon.png" alt="Meu Sistema Psi" className="w-14 h-14" />
                        </div>
                        <h2 className="text-3xl font-bold text-purple-900 mb-4 tracking-tight">Comece sua jornada com o Meu Sistema Psi</h2>
                        <p className="text-purple-800/70 text-lg font-medium leading-relaxed">
                            30 dias grátis para experimentar tudo. Sem compromisso.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;



