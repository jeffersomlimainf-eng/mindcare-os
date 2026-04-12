import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { notifyAdminNewSignup } from '../utils/notifications';

const UserContext = createContext();

const defaultUser = {
    id: null,
    tenantId: null,
    nome: '',
    email: '',
    role: 'psicologo',
    crp: '',
    telefone: '',
    foto: null,
    especialidade: '',
    plan_id: '',
    plan_value: 0,
    plan_start_date: null,
    plan_billing_type: 'Pre-pago',
    plan_payment_method: 'PIX',
    plan_status: 'Ativo',
    onboardingCompleted: true,
    clinica: { nome: '', cnpjCpf: '', logo: null, assinatura: null },
    clinic_name: '',
    clinic_cnpj: '',
    isInadimplente: false,
    isClinicBlocked: false,
    consumoIA: { tokensTotal: 0, limiteMensal: 0, requisicoes: 0 },
    configuracoes: { 
        notifEmail: true, 
        notifWhatsapp: false, 
        notifLembrete: true, 
        reminders_enabled: true, 
        reminders_before_minutes: 60,
        debt_reminders_enabled: true,
        debt_reminder_stages: { day0: true, day1: true, day3: true, recurring: true },
        permissoes: null 
    }
};

const PROFILE_CACHE_KEY = 'psi_cached_profile';

const getCachedProfile = () => {
    try {
        const raw = localStorage.getItem(PROFILE_CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const setCachedProfile = (profile) => {
    try {
        if (profile?.id) {
            localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
        }
    } catch {
        // localStorage cheio ou indisponível — ignora silenciosamente
    }
};

const clearCachedProfile = () => {
    localStorage.removeItem(PROFILE_CACHE_KEY);
};

export const UserProvider = ({ children }) => {
    // Inicia com cache para renderizar imediatamente no F5
    const [user, setUser] = useState(() => getCachedProfile() || defaultUser);
    const [loading, setLoading] = useState(() => !getCachedProfile());

    // 1. Carregar perfil estendido do banco
    const fetchProfile = async (sessionUserOrId) => {
        try {
            const userId = typeof sessionUserOrId === 'string' ? sessionUserOrId : sessionUserOrId.id;
            
            // 1. Fetch user profile
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) throw error;

            let profileData = data;

            // Se o perfil não existe, cria um automaticamente (Google Auth / Race condition do email signup)
            if (!profileData && typeof sessionUserOrId === 'object' && sessionUserOrId !== null) {
                const sessionUser = sessionUserOrId;
                const newProfile = {
                    id: userId,
                    full_name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || '',
                    email: sessionUser.email || '',
                    role: 'admin',
                    onboarding_completed: false,
                    cpf_cnpj: sessionUser.user_metadata?.cpf_cnpj || '',
                    plan_id: 'trial',
                    is_trial: true,
                    plan_status: 'Ativo',
                    plan_value: 0,
                    trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                };

                const { data: insertedData, error: insertError } = await supabase
                    .from('profiles')
                    .upsert(newProfile)
                    .select()
                    .single();

                if (insertError) {
                    console.error("Erro ao inserir perfil automático:", insertError);
                    throw insertError;
                }
                profileData = insertedData;
            } else if (!profileData) {
                throw new Error("Perfil retornado vazio. Usuário não encontrado na tabela profiles.");
            }

            // 2. Decide if we need to fetch admin status
            let isClinicBlocked = false;
            let effectivePlanStatus = profileData.plan_status;
            const blockedStatuses = ['Inadimplente', 'Suspenso', 'Bloqueado', 'Cancelado'];

            if (profileData.role !== 'admin' && profileData.tenant_id) {
                // Fetch admin status in parallel if we had the tenant_id, 
                // but since we just got it, we fetch it now.
                const { data: adminData, error: adminError } = await supabase
                    .from('profiles')
                    .select('plan_status')
                    .eq('id', profileData.tenant_id)
                    .maybeSingle();
                
                if (!adminError && adminData) {
                    if (blockedStatuses.includes(adminData.plan_status)) {
                        isClinicBlocked = true;
                        effectivePlanStatus = adminData.plan_status;
                    }
                }
            } else if (profileData.role === 'admin') {
                if (blockedStatuses.includes(profileData.plan_status)) {
                    isClinicBlocked = true;
                }
            }

            const profileObj = {
                id: profileData.id,
                tenantId: profileData.tenant_id,
                nome: profileData.full_name,
                email: profileData.email,
                role: profileData.role,
                crp: profileData.crp,
                telefone: profileData.phone,
                especialidade: profileData.specialty,
                plan_id: profileData.plan_id,
                plan_value: profileData.plan_value,
                plan_start_date: profileData.plan_start_date,
                plan_billing_type: profileData.plan_billing_type,
                plan_payment_method: profileData.plan_payment_method,
                plan_status: effectivePlanStatus,
                isClinicBlocked: isClinicBlocked,
                isInadimplente: blockedStatuses.includes(effectivePlanStatus),
                is_trial: profileData.is_trial ?? true, 
                trial_end_date: profileData.trial_end_date,
                onboardingCompleted: profileData.onboarding_completed ?? true,
                cpf_cnpj: profileData.cpf_cnpj || '',
                clinic_name: profileData.clinic_name || '',
                clinic_cnpj: profileData.clinic_cnpj || '',
                avatar_url: profileData.avatar_url || null,
                configuracoes: profileData.configurations || defaultUser.configuracoes,
                clinica: { 
                    nome: profileData.clinic_name || '', 
                    cnpjCpf: profileData.clinic_cnpj || '', 
                    logo: null, 
                    assinatura: null 
                }
            };

            setUser(profileObj);
            setCachedProfile(profileObj);
            return profileObj;

        } catch (error) {
            console.error("Erro Supabase Profile:", error);
            await supabase.auth.signOut().catch(() => {});
            clearCachedProfile();
            setUser(defaultUser);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // 2. Sistema de Autenticação Centralizado
    useEffect(() => {
        let mounted = true;
        const processedUserId = { current: null };

        const handleAuth = async (event, session) => {
            if (!mounted) return;
            
            if (!session?.user) {
                clearCachedProfile();
                setUser(defaultUser);
                setLoading(false);
                processedUserId.current = null;
                return;
            }

            // Evitar reprocessar o mesmo usuário se já carregado
            if (session.user.id === processedUserId.current && event !== 'USER_UPDATED') {
                return; // Deixa o carregamento original já em andamento finalizar
            }

            processedUserId.current = session.user.id;
            setLoading(true);

            try {
                await fetchProfile(session.user);
            } catch (err) {
                console.error('[UserContext] Erro fatal ao carregar perfil:', err);
                setUser(defaultUser);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        // Inicialização robusta
        const initAuth = async () => {
            try {
                // 1. Tenta pegar sessão inicial explicitamente
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                
                if (mounted) {
                    await handleAuth('INITIAL_CHECK', session);
                }
            } catch (error) {
                console.error('[UserContext] Erro na inicialização da sessão:', error);
                if (mounted) {
                    setUser(defaultUser);
                    setLoading(false);
                }
            }
        };

        initAuth();

        // 2. Escuta mudanças subsequentes
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                handleAuth(event, session);
            }
        });

        // BUG-07 FIX: remover checagem de 'loading' no closure (sempre stale = true)
        // setLoading(false) é idempotente — não causa re-render se já for false
        const safetyTimeout = setTimeout(() => {
            if (mounted) {
                console.warn('[UserContext] Safety timeout atingido!');
                setLoading(false);
            }
        }, 8000);

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            authListener.subscription.unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            // Removida redundância de signOut() para acelerar o processo.
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            setLoading(false);
            return { success: false, message: error.message };
        }
    };

    const register = async (nome, email, password, cpfCnpj) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin + '/dashboard',
                    data: {
                        full_name: nome,
                        role: 'admin',
                        onboarding_completed: false,
                        cpf_cnpj: cpfCnpj
                    }
                }
            });

            if (error) throw error;

            // Failsafe: Garantir que o perfil existe para evitar race condition com triggers
            if (data?.user?.id) {
                await supabase
                    .from('profiles')
                    .upsert({
                        id: data.user.id,
                        full_name: nome,
                        role: 'admin',
                        onboarding_completed: false,
                        cpf_cnpj: cpfCnpj,
                        plan_id: 'trial',
                        is_trial: true,
                        plan_status: 'Ativo',
                        plan_value: 0,
                        trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    })
                    .catch(err => console.warn('[UserContext] Erro failsafe profile:', err));
            }

            // Notificar administrador sobre novo cadastro
            notifyAdminNewSignup({
                nome,
                email,
                cpfCnpj
            }).catch(err => console.warn('[UserContext] Erro ao notificar novo cadastro:', err));

            setLoading(false);
            return { success: true, data };
        } catch (error) {
            setLoading(false);
            return { success: false, message: error.message };
        }
    };

    const loginWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/dashboard'
                }
            });
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('[UserContext] Erro ao logar com Google:', error.message);
            return { success: false, message: error.message };
        }
    };

    const resetPassword = async (email) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password',
            });
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            // BUG-08 FIX: verificar senha atual antes de atualizar (reautenticação)
            const { error: reAuthError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword
            });

            if (reAuthError) {
                return { success: false, message: 'Senha atual incorreta. Verifique e tente novamente.' };
            }

            // Senha atual confirmada — agora atualiza para a nova
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) throw updateError;

            return { success: true };
        } catch (error) {
            console.error('[UserContext] Erro ao alterar senha:', error.message);
            return { success: false, message: error.message };
        }
    };


    const logout = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.warn('[UserContext] Erro ignorado durante signOut:', error.message);
        } finally {
            setUser(defaultUser);
            localStorage.clear();
            sessionStorage.clear();
            setLoading(false);
            window.location.href = '/login';
        }
    };

    const updateUser = async (data) => {
        const updatePayload = {
            full_name: data.nome !== undefined ? data.nome : user.nome,
            crp: data.crp !== undefined ? data.crp : user.crp,
            phone: data.telefone !== undefined ? data.telefone : user.telefone,
            specialty: data.especialidade !== undefined ? data.especialidade : user.especialidade,
            clinic_name: data.clinic_name !== undefined ? data.clinic_name : (data.clinica?.nome !== undefined ? data.clinica.nome : user.clinic_name),
            clinic_cnpj: data.clinic_cnpj !== undefined ? data.clinic_cnpj : (data.clinica?.cnpjCpf !== undefined ? data.clinica.cnpjCpf : user.clinic_cnpj),
            onboarding_completed: true,
            avatar_url: data.avatar_url !== undefined ? data.avatar_url : user.avatar_url,
            configurations: data.configuracoes !== undefined ? data.configuracoes : user.configuracoes
        };

        const { error } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', user.id);

        if (!error) {
            setUser(prev => ({ 
                ...prev, 
                ...data,
                clinic_name: updatePayload.clinic_name,
                clinic_cnpj: updatePayload.clinic_cnpj,
                clinica: {
                    ...prev.clinica,
                    nome: updatePayload.clinic_name,
                    cnpjCpf: updatePayload.clinic_cnpj
                }
            }));
            return { success: true };
        } else {
            console.error('[UserContext] Erro ao atualizar perfil:', error.message);
            return { success: false, message: error.message };
        }
    };

    const updateConfigs = async (configs) => {
        const newConfigs = { ...user.configuracoes, ...configs };
        const { error } = await supabase
            .from('profiles')
            .update({ configurations: newConfigs })
            .eq('id', user.id);

        if (!error) {
            setUser(prev => ({ ...prev, configuracoes: newConfigs }));
        }
    };

    const loginAs = async (profileId) => {
        setLoading(true);
        try {
            const profile = await fetchProfile(profileId);
            if (profile) {
                setUser(profile);
            }
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (moduleName) => {
        if (user?.role === 'admin') return true; // Admins veem tudo
        // Se `permissoes` é null/undefined, significa que é uma conta antiga ou psicólogo isolado (default = tudo liberado exceto áreas restritas de admin)
        if (!user?.configuracoes?.permissoes) return true; 
        return user.configuracoes.permissoes.includes(moduleName);
    };

    return (
        <UserContext.Provider value={{
            user,
            loading,
            login,
            signUp: register,
            loginAs,
            loginWithGoogle,
            resetPassword,
            changePassword,
            logout,
            updateUser,
            updateConfigs,
            hasPermission,
            isAuthenticated: !!user?.id
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};


