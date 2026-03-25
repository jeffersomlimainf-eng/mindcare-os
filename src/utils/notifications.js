import { supabase } from '../lib/supabase';

/**
 * Notifica o administrador sobre um novo cadastro no sistema.
 * @param {Object} userData - Dados do usuário cadastrado (nome, email, cpfCnpj)
 */
export const notifyAdminNewSignup = async (userData) => {
    const adminEmail = 'jeffersomlima.inf@gmail.com';
    const { nome, email, cpfCnpj } = userData;

    try {
        const { data, error } = await supabase.functions.invoke('send-invoice-email', {
            body: {
                to: adminEmail,
                subject: `🚀 Novo Cadastro: ${nome}`,
                fromName: 'MindCare OS Alertas',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; padding: 24px;">
                        <h2 style="color: #4F46E5;">Novo Psicólogo Cadastrado! 🚀</h2>
                        <p>Um novo usuário acaba de criar uma conta no <strong>MindCare OS</strong>.</p>
                        
                        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 4px 0;"><strong>Nome:</strong> ${nome}</p>
                            <p style="margin: 4px 0;"><strong>E-mail:</strong> ${email}</p>
                            <p style="margin: 4px 0;"><strong>CPF/CNPJ:</strong> ${cpfCnpj || 'Não informado'}</p>
                            <p style="margin: 4px 0;"><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #6b7280;">
                            Você pode gerenciar este usuário através do <a href="${window.location.origin}/admin" style="color: #4F46E5; text-decoration: none; font-weight: bold;">Painel Admin</a>.
                        </p>
                    </div>
                `
            }
        });

        if (error) {
            console.warn('[Notification] Erro ao notificar admin:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        console.error('[Notification] Erro crítico na notificação:', err);
        return { success: false, error: err };
    }
};
