import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';

const TenantSwitcher = () => {
    const { user, loginAs } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [availableProfiles, setAvailableProfiles] = useState([]);

    const safeRender = (val, fallback = '') => {
        if (!val) return fallback;
        if (typeof val === 'object') return val.nome || val.name || val.full_name || 'Usuário';
        return val;
    };

    React.useEffect(() => {
        const loadProfiles = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, role, tenant_id')
                .limit(10);
            
            if (data) {
                setAvailableProfiles(data.map(p => ({
                    id: p.id,
                    nome: p.full_name || 'Sem Nome',
                    clinica: `Tenant: ${p.tenant_id}`,
                    avatar: (p.full_name || '??').split(' ').map(n => n[0]).join('').substr(0, 2).toUpperCase()
                })));
            }
        };
        if (isOpen) loadProfiles();
    }, [isOpen]);

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-1.5 bg-rose-500/10 text-rose-600 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-all group"
                title="Mudar de Conta (Debug Multi-Tenancy)"
            >
                <div className="size-8 rounded-lg bg-rose-500 text-white flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform">
                    {user?.nome ? user.nome.split(' ').map(n => n[0]).join('').substr(0, 2) : '??'}
                </div>
                <div className="text-left hidden lg:block">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Mudar Conta</p>
                    <p className="text-xs font-bold truncate max-w-[120px]">{safeRender(user?.nome, 'Usuário')}</p>
                </div>
                <span className={`material-symbols-outlined text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contas Disponíveis (QA)</p>
                            <p className="text-[9px] text-rose-500 font-bold uppercase italic mt-1">Teste o isolamento de dados trocando de usuário</p>
                        </div>
                        {availableProfiles.map((u) => (
                            <button
                                key={u.id}
                                onClick={() => {
                                    loginAs(u.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${user.id === u.id ? 'bg-primary/5 text-primary border border-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                            >
                                <div className={`size-10 rounded-lg flex items-center justify-center text-xs font-black ${user.id === u.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                    {u.avatar}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold truncate">{u.nome}</p>
                                    <p className="text-[10px] font-black uppercase opacity-60 tracking-tighter">{u.clinica}</p>
                                </div>
                                {user.id === u.id && (
                                    <span className="material-symbols-outlined text-sm ml-auto">check_circle</span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default TenantSwitcher;


