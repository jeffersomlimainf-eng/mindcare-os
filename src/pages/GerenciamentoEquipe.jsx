import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { showToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { sendTeamWelcomeEmail } from '../utils/notifications';

// Instância secundária para não afetar a sessão do Admin atual ao criar usuários
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseSecondary = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });

const MODULES = [
    { id: 'dashboard', label: 'Painel Inicial', icon: 'dashboard' },
    { id: 'pacientes', label: 'Pacientes', icon: 'group' },
    { id: 'agenda', label: 'Agenda', icon: 'calendar_month' },
    { id: 'prontuarios', label: 'Prontuários', icon: 'folder_open' },
    { id: 'linha-do-tempo', label: 'Linha do Tempo', icon: 'visibility' },
    { id: 'evolucoes', label: 'Evoluções', icon: 'clinical_notes' },
    { id: 'laudos', label: 'Laudos', icon: 'clinical_notes' },
    { id: 'declaracoes', label: 'Declarações', icon: 'verified' },
    { id: 'atestados', label: 'Atestados', icon: 'medical_information' },
    { id: 'anamneses', label: 'Anamneses', icon: 'assignment' },
    { id: 'encaminhamentos', label: 'Encaminhamentos', icon: 'send' },
    { id: 'tcles', label: 'TCLEs', icon: 'handshake' },
    { id: 'financeiro', label: 'Financeiro', icon: 'account_balance_wallet' },
    { id: 'relatorios', label: 'Relatórios', icon: 'bar_chart' },
    { id: 'ai-clinica', label: 'AI Clínica', icon: 'psychology_alt' },
    { id: 'configuracoes', label: 'Configurações', icon: 'settings' }
];

const ROLES = [
    { id: 'psicologo', label: 'Psicólogo Colaborador' },
    { id: 'secretaria', label: 'Secretária / Recepção' },
    { id: 'admin', label: 'Administrador (Acesso Total)' },
];

const GerenciamentoEquipe = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        role: 'psicologo',
        permissoes: []
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchMembers();
    }, [user, navigate]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_team_members');

            if (error) throw error;
            setMembers(data || []);
        } catch (error) {
            console.error('Erro ao buscar equipe:', error);
            showToast('Erro ao carregar equipe. Talvez seja necessário configurar as permissões do banco (RLS).', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (member = null) => {
        if (member) {
            setEditingMember(member);
            const configuracoes = member.configurations || {};
            setFormData({
                nome: member.full_name || '',
                email: member.email || '',
                senha: '', // Não pode editar senha assim facilmente, mas deixamos o campo oculto dps
                role: member.role || 'psicologo',
                permissoes: configuracoes.permissoes || MODULES.map(m => m.id)
            });
        } else {
            setEditingMember(null);
            setFormData({
                nome: '',
                email: '',
                senha: '',
                role: 'psicologo',
                permissoes: ['dashboard', 'pacientes', 'agenda', 'financeiro', 'configuracoes'] // default basico
            });
        }
        setIsModalOpen(true);
    };

    const togglePermission = (moduleId) => {
        setFormData(prev => {
            const hasModule = prev.permissoes.includes(moduleId);
            if (hasModule) {
                return { ...prev, permissoes: prev.permissoes.filter(id => id !== moduleId) };
            } else {
                return { ...prev, permissoes: [...prev.permissoes, moduleId] };
            }
        });
    };

    const selectAllPermissions = () => {
        setFormData(prev => ({ ...prev, permissoes: MODULES.map(m => m.id) }));
    };

    const clearPermissions = () => {
        setFormData(prev => ({ ...prev, permissoes: [] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nome || !formData.email || (!editingMember && !formData.senha)) {
            showToast('Preencha os campos obrigatórios', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingMember) {
                // Atualizar usuário existente
                const newConfigurations = {
                    ...editingMember.configurations,
                    permissoes: formData.role === 'admin' ? null : formData.permissoes
                };

                const { error } = await supabase.rpc('update_team_member', {
                    p_id: editingMember.id,
                    p_full_name: formData.nome,
                    p_role: formData.role,
                    p_configs: newConfigurations
                });

                if (error) throw error;
                showToast('Membro atualizado com sucesso!', 'success');
            } else {
                // Criar novo usuário via supabaseSecondary
                const { data: authData, error: authError } = await supabaseSecondary.auth.signUp({
                    email: formData.email,
                    password: formData.senha,
                    options: {
                        data: {
                            full_name: formData.nome,
                            role: formData.role,
                            tenant_id: user.tenant_id,
                            onboarding_completed: true,
                            cpf_cnpj: user.clinic_cnpj, // Herdando dado
                        }
                    }
                });

                if (authError) throw authError;

                const newUserId = authData.user?.id;
                if (!newUserId) throw new Error("Não foi possível gerar o ID para o novo membro.");

                const newConfigs = {
                    notifEmail: true,
                    notifWhatsapp: false,
                    notifLembrete: true,
                    permissoes: formData.role === 'admin' ? null : formData.permissoes
                };

                const { error: profileError } = await supabase.rpc('update_team_member', {
                    p_id: newUserId,
                    p_full_name: formData.nome,
                    p_role: formData.role,
                    p_configs: newConfigs
                });

                if (profileError) throw profileError;
                
                // Enviar e-mail de boas-vindas (Non-blocking)
                sendTeamWelcomeEmail(
                    { nome: formData.nome, email: formData.email, senha: formData.senha },
                    user.clinic_name || 'Nossa Clínica'
                ).catch(e => console.error('Falha ao enviar e-mail de boas-vindas:', e));

                showToast('Membro adicionado! E-mail de boas-vindas enviado.', 'success');
            }

            setIsModalOpen(false);
            fetchMembers();
        } catch (err) {
            console.error('Erro na submissão de membro:', err);
            showToast(err.message || 'Erro ao processar membro', 'error');
        } finally {
            setIsSubmitting(false);
            supabaseSecondary.auth.signOut().catch(() => {}); // cleanup silent
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">refresh</span>
                <p className="text-slate-500 font-medium">Carregando equipe...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <span className="material-symbols-outlined text-sm">shield_person</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Configurações</span>
                    </div>
                    <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black italic tracking-tight">Minha Equipe</h1>
                    <p className="text-slate-500 font-medium">Gerencie o acesso da sua secretária ou outros profissionais à sua clínica.</p>
                </div>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 shrink-0"
                >
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    Adicionar Membro
                </button>
            </div>

            {/* Lista de Membros */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map(member => (
                        <div key={member.id} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center text-center relative hover:border-primary/50 transition-colors">
                            {member.id === user.id && (
                                <span className="absolute top-4 left-4 bg-primary/10 text-primary text-[10px] font-black uppercase px-2 py-1 rounded-full">
                                    É Você
                                </span>
                            )}
                            <div className="size-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl font-black text-slate-500 mb-4 overflow-hidden">
                                {member.avatar_url ? (
                                    <img src={member.avatar_url} alt="" className="size-full object-cover" />
                                ) : (
                                    member.full_name?.charAt(0) || '?'
                                )}
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white text-lg mb-1">{member.full_name}</h3>
                            <p className="text-xs text-slate-500 font-medium mb-3">{member.email}</p>
                            
                            <div className="flex gap-2 justify-center mb-4 text-[10px] uppercase font-black tracking-widest">
                                {member.role === 'admin' ? (
                                    <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[10px]">shield</span>
                                        Administrador
                                    </span>
                                ) : member.role === 'secretaria' ? (
                                    <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[10px]">support_agent</span>
                                        Secretária
                                    </span>
                                ) : (
                                    <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[10px]">psychology</span>
                                        Psicólogo
                                    </span>
                                )}
                            </div>

                            <button 
                                onClick={() => handleOpenModal(member)}
                                className="mt-auto w-full py-2 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">settings</span>
                                Gerenciar Acesso
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Gestão */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 p-6 flex items-center justify-between z-10">
                            <h2 className="text-xl font-black italic text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">group_add</span>
                                {editingMember ? 'Editar Membro' : 'Novo Membro da Equipe'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-all">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Informações Básicas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 ml-1">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={formData.nome}
                                            onChange={(e) => setFormData({...formData, nome: e.target.value})}
                                            required
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none font-bold text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 ml-1">E-mail</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            required
                                            disabled={!!editingMember} // Não muda email de user existente pelo painel
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none font-bold text-slate-900 dark:text-white disabled:opacity-50"
                                        />
                                    </div>
                                    {!editingMember && (
                                        <div className="md:col-span-2 border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30 p-4 rounded-xl">
                                            <p className="text-xs text-amber-700 dark:text-amber-500 font-medium mb-3">
                                                <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                                                Defina uma senha inicial para o usuário. Ele poderá alterá-la depois dentro do sistema.
                                            </p>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 ml-1">Senha Inicial</label>
                                            <input
                                                type="text"
                                                value={formData.senha}
                                                onChange={(e) => setFormData({...formData, senha: e.target.value})}
                                                required={!editingMember}
                                                placeholder="Mínimo 6 caracteres"
                                                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none font-bold text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Papel na Clínica</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {ROLES.map(role => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => setFormData({...formData, role: role.id})}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                                                formData.role === role.id 
                                                ? 'border-primary bg-primary/5' 
                                                : 'border-slate-200 dark:border-slate-800 hover:border-primary/40'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-sm font-black ${formData.role === role.id ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{role.label}</span>
                                                {formData.role === role.id && <span className="material-symbols-outlined text-primary text-sm">check_circle</span>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.role !== 'admin' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Controle de Módulos (Acesso)</h3>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={selectAllPermissions} className="text-[10px] font-black text-primary uppercase hover:underline">Marcar Todos</button>
                                            <span className="text-slate-300">|</span>
                                            <button type="button" onClick={clearPermissions} className="text-[10px] font-black text-slate-500 uppercase hover:underline">Limpar</button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {MODULES.map(mod => {
                                            const isActive = formData.permissoes.includes(mod.id);
                                            return (
                                                <button
                                                    key={mod.id}
                                                    type="button"
                                                    onClick={() => togglePermission(mod.id)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                                        isActive 
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' 
                                                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500'
                                                    }`}
                                                >
                                                    <span className="material-symbols-outlined flex-shrink-0 text-[18px]">
                                                        {isActive ? 'check_box' : 'check_box_outline_blank'}
                                                    </span>
                                                    <div className="text-left leading-tight truncate">
                                                        <span className="font-bold text-xs block">{mod.label}</span>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="px-6 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <><span className="material-symbols-outlined text-sm animate-spin">refresh</span> Salvando...</>
                                    ) : (
                                        <><span className="material-symbols-outlined text-sm">save</span> Salvar Membro</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GerenciamentoEquipe;
