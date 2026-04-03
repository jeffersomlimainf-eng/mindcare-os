import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const PasswordReset = () => {
    useEffect(() => {
        document.title = "Redefinir Senha | Meu Sistema Psi";
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', 'Redefina sua senha de acesso ao Meu Sistema Psi com segurança.');
        
        // Add canonical tag
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://meusistemapsi.com.br/reset-password');
    }, []);
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Senha alterada com sucesso! Redirecionando para o login...' });
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-8 justify-center">
                        <div className="bg-primary p-2 rounded-xl text-white shadow-md">
                            <span className="material-symbols-outlined text-3xl">lock_reset</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Meu Sistema Psi</span>
                    </div>

                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">Redefinir sua Senha</h1>

                    <p className="text-slate-500 dark:text-slate-400 text-center mb-8">
                        Digite sua nova senha de acesso abaixo.
                    </p>

                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
                            message.type === 'success' 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                                : 'bg-red-50 border-red-200 text-red-600'
                        }`}>
                            <span className="material-symbols-outlined">
                                {message.type === 'success' ? 'check_circle' : 'error'}
                            </span>
                            <span className="text-sm font-bold">{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleReset} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 opacity-60">NOVA SENHA</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 opacity-60">CONFIRME A SENHA</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all active:scale-[0.99] uppercase tracking-widest text-xs disabled:opacity-50"
                        >
                            {loading ? 'Alterando...' : 'Redefinir Senha'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PasswordReset;


