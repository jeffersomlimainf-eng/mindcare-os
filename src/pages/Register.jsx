import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { showToast } from '../components/Toast';

const Register = () => {
    const navigate = useNavigate();
    const { signUp } = useUser();
    
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmaSenha, setConfirmaSenha] = useState('');
    const [cpfCnpj, setCpfCnpj] = useState('');
    const [showPass, setShowPass] = useState(false);
    
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccessWithEmail, setIsSuccessWithEmail] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setErro('');

        if (senha !== confirmaSenha) {
            setErro('As senhas não coincidem.');
            return;
        }

        if (senha.length < 6) {
            setErro('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        const res = await signUp(nome, email, senha, cpfCnpj);
        
        if (res.success) {
            if (res.data?.session) {
                showToast('Cadastro realizado com sucesso!', 'success');
                navigate('/dashboard');
            } else {
                setIsSuccessWithEmail(true);
                setLoading(false);
            }
        } else {
            setErro(res.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
            {/* Left: Form */}
            <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-24">
                <div className="mx-auto w-full max-w-sm">
                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-primary p-2 rounded-xl text-white shadow-md shadow-primary/10">
                            <span className="material-symbols-outlined text-3xl">psychology</span>
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
                                    Crie sua conta
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    Comece a gerenciar sua clínica de forma inteligente.
                                </p>
                            </div>

                            {erro && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                                    <span className="material-symbols-outlined text-red-500">error</span>
                                    <span className="text-sm font-bold text-red-600 dark:text-red-400">{erro}</span>
                                </div>
                            )}

                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                     <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 uppercase tracking-wider opacity-60">Nome Completo</label>
                                     <input
                                         type="text"
                                         value={nome}
                                         onChange={e => setNome(e.target.value)}
                                         className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 text-sm font-medium text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                         placeholder="Seu nome completo"
                                         required
                                     />
                                 </div>
 
                                 <div>
                                     <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 uppercase tracking-wider opacity-60">CPF / CNPJ</label>
                                     <input
                                         type="text"
                                         value={cpfCnpj}
                                         onChange={e => setCpfCnpj(e.target.value)}
                                         className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 text-sm font-medium text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                         placeholder="000.000.000-00 ou CNPJ"
                                         required
                                     />
                                 </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 uppercase tracking-wider opacity-60">E-mail</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 text-sm font-medium text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
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
                                            className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 pr-12 text-sm font-medium text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined">{showPass ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 uppercase tracking-wider opacity-60">Confirmar Senha</label>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        value={confirmaSenha}
                                        onChange={e => setConfirmaSenha(e.target.value)}
                                        className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 text-sm font-medium text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-4 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.99] uppercase tracking-widest text-xs disabled:opacity-50"
                                >
                                    {loading ? 'Cadastrando...' : 'Criar minha conta'}
                                </button>
                            </form>

                            <p className="mt-8 text-center text-sm text-slate-500 font-medium">
                                Já tem uma conta?{' '}
                                <Link to="/login" className="font-bold text-primary hover:underline transition-all">Faça login</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Right: Visual */}
            <div className="hidden lg:block lg:flex-1 relative overflow-hidden bg-slate-100 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                    <div className="max-w-md text-center">
                        <div className="size-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-8 shadow-sm">
                            <span className="material-symbols-outlined text-6xl">psychology</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Sistema Completo para Psicólogos</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                            Gerencie pacientes, agenda, prontuários e financeiro em um só lugar, com segurança e eficiência.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
