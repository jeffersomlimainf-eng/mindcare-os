import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { showToast } from '../components/Toast';

const maskCpfCnpj = (value) => {
    if (!value) return '';
    let r = value.replace(/\D/g, '');
    if (r.length > 14) r = r.substring(0, 14);
    if (r.length <= 11) {
        return r.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return r.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})/, '$1-$2');
};

const maskCrp = (value) => {
    if (!value) return '';
    let cleaned = value.replace(/\D/g, '');
    return cleaned.length > 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 9)}` : cleaned;
};

const Onboarding = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useUser();
    const [passo, setPasso] = useState(1);
    
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        nomeClinica: user.clinica?.nome || '',
        cnpjCpf: maskCpfCnpj(user.clinica?.cnpjCpf || user.cpf_cnpj || ''),
        nomeProfissional: user.nome || '',
        crp: maskCrp(user.crp || ''),
        logo: null,
        assinatura: null
    });

    useEffect(() => {
        setFormData({
            nomeClinica: user.clinica?.nome || '',
            cnpjCpf: maskCpfCnpj(user.clinica?.cnpjCpf || user.cpf_cnpj || ''),
            nomeProfissional: user.nome || '',
            crp: maskCrp(user.crp || ''),
            logo: null,
            assinatura: null
        });
    }, [user]);

    const handleNext = () => {
        if (passo < 2) {
            setPasso(passo + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        setLoading(true);
        const res = await updateUser({
            nome: formData.nomeProfissional,
            crp: formData.crp,
            clinica: {
                ...user.clinica,
                nome: formData.nomeClinica,
                cnpjCpf: formData.cnpjCpf,
            },
            onboardingCompleted: true
        });

        if (res.success) {
            showToast('Configuração concluída com sucesso!', 'success');
            navigate('/dashboard');
        } else {
            showToast('Erro ao salvar: ' + res.message, 'error');
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        setLoading(true);
        const res = await updateUser({ onboardingCompleted: true });
        if (res.success) {
            navigate('/dashboard');
        } else {
            showToast('Erro ao salvar: ' + res.message, 'error');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 antialiased">
            {/* Logo do Header */}
            <div className="absolute top-8 left-8 flex items-center gap-3">
                <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-white">psychology</span>
                </div>
                <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white italic">Meu Sistema Psi</span>
            </div>

            <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="p-10 md:p-16">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tight mb-2">Bem-vindo ao Meu Sistema Psi</h1>
                            <p className="text-slate-500 font-medium text-lg">Vamos configurar sua clínica para você começar seus atendimentos.</p>
                        </div>
                        <div className="text-right">
                            <p className="text-primary font-black text-sm uppercase tracking-widest mb-1">Passo {passo} de 2</p>
                            <div className="w-48 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all rounded-full shadow-sm" 
                                    style={{ width: `${(passo / 2) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Conteúdo dos Passos */}
                    <div className="space-y-12 min-h-[400px]">
                        {passo === 1 && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-3xl">domain</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">1. Informações da Clínica</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nome da Clínica</label>
                                        <input 
                                            type="text" 
                                            value={formData.nomeClinica}
                                            onChange={(e) => setFormData({...formData, nomeClinica: e.target.value})}
                                            className="w-full h-16 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-900 dark:text-white font-bold transition-all"
                                            placeholder="Ex: Clínica de Psicologia Equilíbrio"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">CNPJ ou CPF (Principal)</label>
                                        <input 
                                            type="text" 
                                            value={formData.cnpjCpf}
                                            onChange={(e) => setFormData({...formData, cnpjCpf: maskCpfCnpj(e.target.value)})}
                                            className="w-full h-16 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-900 dark:text-white font-bold transition-all"
                                            placeholder="00.000.000/0000-00"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {passo === 2 && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-3xl">badge</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">2. Dados Profissionais</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nome Completo do Psicólogo</label>
                                        <input 
                                            type="text" 
                                            value={formData.nomeProfissional}
                                            onChange={(e) => setFormData({...formData, nomeProfissional: e.target.value})}
                                            className="w-full h-16 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-900 dark:text-white font-bold transition-all"
                                            placeholder="Seu nome completo aqui"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Registro (CRP)</label>
                                        <input 
                                            type="text" 
                                            value={formData.crp}
                                            onChange={(e) => setFormData({...formData, crp: maskCrp(e.target.value)})}
                                            className="w-full h-16 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-900 dark:text-white font-bold transition-all"
                                            placeholder="Ex: 06/123456"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}


                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-slate-100 dark:border-slate-800">
                        <button 
                            onClick={handleSkip}
                            className="text-sm font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-[0.2em] transition-colors"
                        >
                            Pular por enquanto
                        </button>
                        <div className="flex gap-4">
                            {passo > 1 && (
                                <button 
                                    onClick={() => setPasso(passo - 1)}
                                    className="px-10 py-5 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    Voltar
                                </button>
                            )}
                            <button 
                                onClick={handleNext}
                                disabled={loading}
                                className={`px-12 py-5 bg-primary text-white rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Salvando...' : (passo === 2 ? 'Concluir Configuração' : 'Próximo Passo')}
                                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="mt-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">
                Â© 2026 Meu Sistema Psi • Gestão Clínica Inteligente
            </p>
        </div>
    );
};

export default Onboarding;


