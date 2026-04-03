import React from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';

const SuspendedClinic = () => {
    const { user } = useUser();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const handleSupport = () => {
        const message = encodeURIComponent(`Olá! Sou da equipe do(a) ${user.nome} e percebi que nosso acesso ao Meu Sistema PSI está suspenso. Poderiam me ajudar?`);
        window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="h-2 bg-amber-500 w-full" />
                
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="size-20 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-4xl">payments</span>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Acesso Temporariamente Suspenso</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        {user.role === 'admin' 
                            ? 'Sua assinatura possui uma pendência financeira ou foi suspensa. Regularize o pagamento para restaurar o acesso de toda a sua equipe imediatamente.'
                            : `O acesso da clínica foi temporariamente suspenso pelo administrador. Por favor, entre em contato com o responsável pela conta (${user.clinic_name || 'Dono da Clínica'}) para verificar a situação.`
                        }
                    </p>

                    <div className="w-full space-y-3">
                        {user.role === 'admin' ? (
                            <button 
                                onClick={() => window.location.href = '/configuracoes?tab=plano'}
                                className="w-full h-12 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-xl">credit_card</span>
                                Regularizar Assinatura
                            </button>
                        ) : (
                            <button 
                                onClick={handleSupport}
                                className="w-full h-12 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-xl">support_agent</span>
                                Falar com Suporte
                            </button>
                        )}

                        <button 
                            onClick={handleLogout}
                            className="w-full h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                        >
                            Sair da Conta
                        </button>
                    </div>

                    <p className="mt-8 text-xs text-slate-400">
                        Meu Sistema PSI v2.0 - Tecnologia para Psicologia
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuspendedClinic;
