/**
 * Biblioteca de Templates de E-mail Premium para o Meu Sistema PSI.
 * Design focado em profissionalismo, clareza e estética premium.
 */

const EMAIL_COLORS = {
    primary: '#1392ec',
    background: '#f8fafc',
    white: '#ffffff',
    text: '#1e293b',
    textLight: '#64748b',
    slate200: '#e2e8f0',
    slate100: '#f1f5f9'
};

const baseWrapper = (content) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${EMAIL_COLORS.background}; padding: 40px 20px;">
    <div style="background-color: ${EMAIL_COLORS.white}; border-radius: 24px; overflow: hidden; border: 1px solid ${EMAIL_COLORS.slate200}; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
        <!-- Cabeçalho -->
        <div style="background-color: ${EMAIL_COLORS.primary}; padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Meu Sistema PSI</h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 40px; color: ${EMAIL_COLORS.text};">
            ${content}
        </div>

        <!-- Rodapé -->
        <div style="background-color: ${EMAIL_COLORS.slate100}; padding: 20px; text-align: center; font-size: 11px; color: ${EMAIL_COLORS.textLight};">
            Este é um e-mail automático enviado pelo seu profissional de saúde através da plataforma Meu Sistema PSI. <br>
            &copy; 2026 MindCare OS - Tecnologia para Psicologia.
        </div>
    </div>
</div>
`;

/**
 * Template para Lembrete de Consulta Agendada.
 */
export const appointmentReminderTemplate = ({ pacienteNome, data, hora, tipo, profissionalNome, profissionalCrp, profissionalTelefone }) => {
    const isTeleconsulta = tipo?.toLowerCase().includes('tele');
    
    return baseWrapper(`
        <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Lembrete de Consulta</h2>
        <p style="font-size: 15px; line-height: 1.6; color: ${EMAIL_COLORS.textLight};">
            Olá, <strong>${pacienteNome}</strong>. <br>Passando para confirmar nossa próxima sessão. Veja os detalhes abaixo:
        </p>
        
        <div style="background-color: ${EMAIL_COLORS.slate100}; border-radius: 16px; padding: 24px; margin: 32px 0; border: 1px solid ${EMAIL_COLORS.slate200};">
            <div style="margin-bottom: 20px;">
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${EMAIL_COLORS.textLight}; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">Data e Horário</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <p style="font-size: 18px; font-weight: 800; color: ${EMAIL_COLORS.text}; margin: 0;">${data} às ${hora}</p>
                </div>
            </div>
            
            <div>
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${EMAIL_COLORS.textLight}; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">Tipo de Atendimento</span>
                <p style="font-size: 16px; font-weight: 700; color: ${EMAIL_COLORS.text}; margin: 0;">${tipo}</p>
            </div>

            ${isTeleconsulta ? `
                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px dashed ${EMAIL_COLORS.slate200};">
                    <p style="font-size: 13px; color: #0369a1; background-color: #f0f9ff; padding: 12px; border-radius: 8px; font-weight: 500; margin: 0;">
                        💻 O link da videochamada será enviado pelo seu profissional minutos antes do horário agendado.
                    </p>
                </div>
            ` : ''}
        </div>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid ${EMAIL_COLORS.slate100};">
            <p style="margin: 0; font-size: 14px; font-weight: 700; color: ${EMAIL_COLORS.text};">${profissionalNome}</p>
            <p style="margin: 4px 0; font-size: 12px; color: ${EMAIL_COLORS.textLight}; font-weight: 500;">Psicólogo(a) · CRP ${profissionalCrp}</p>
            ${profissionalTelefone ? `<p style="margin: 4px 0; font-size: 12px; color: ${EMAIL_COLORS.textLight};">📞 ${profissionalTelefone}</p>` : ''}
        </div>
    `);
};

/**
 * Template para Novos Membros da Equipe (Welcome).
 */
export const teamWelcomeTemplate = ({ nome, email, senha, clinicName, loginUrl }) => {
    return baseWrapper(`
        <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Seja Bem-vindo(a) à Equipe! 👋</h2>
        <p style="font-size: 15px; line-height: 1.6; color: ${EMAIL_COLORS.textLight};">
            Olá, <strong>${nome}</strong>! <br>Você foi convidado(a) pela clínica <strong>${clinicName}</strong> para utilizar o <strong>Meu Sistema PSI</strong>.
        </p>

        <div style="background-color: ${EMAIL_COLORS.slate100}; border-radius: 16px; padding: 24px; margin: 32px 0; border: 1px solid ${EMAIL_COLORS.slate200};">
            <h3 style="margin-top: 0; font-size: 12px; text-transform: uppercase; color: ${EMAIL_COLORS.textLight}; letter-spacing: 0.1em; margin-bottom: 16px;">Suas Credenciais de Acesso</h3>
            <p style="margin: 8px 0; font-size: 15px;"><strong>E-mail:</strong> ${email}</p>
            <p style="margin: 8px 0; font-size: 15px;"><strong>Senha Temporária:</strong> <span style="background-color: #cbd5e1; padding: 2px 8px; border-radius: 4px; font-family: monospace;">${senha}</span></p>
            <p style="font-size: 11px; color: #ef4444; margin-top: 12px; font-weight: 600;">* Recomendamos a alteração da senha no primeiro acesso.</p>
        </div>

        <a href="${loginUrl}" style="display: block; width: fit-content; margin: 0 auto; background-color: ${EMAIL_COLORS.primary}; color: #ffffff; text-align: center; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(19, 146, 236, 0.3);">
            Acessar Meu Painel
        </a>
    `);
};

/**
 * Template para Indicação de Amigos (Referral).
 */
export const referralInviteTemplate = ({ profNome, referralLink }) => {
    return baseWrapper(`
        <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Convite Especial: Conheça o Meu Sistema PSI 🚀</h2>
        <p style="font-size: 15px; line-height: 1.6; color: ${EMAIL_COLORS.textLight};">
            Olá! <br><strong>${profNome}</strong> está usando o <strong>Meu Sistema PSI</strong> para gerenciar sua clínica e acredita que ele pode ser transformador para o seu trabalho também.
        </p>

        <div style="background-color: #f1f5f9; padding: 24px; border-radius: 16px; margin: 32px 0; border: 1px solid ${EMAIL_COLORS.slate200};">
            <p style="margin-top: 0; font-weight: 700; color: ${EMAIL_COLORS.text}; font-size: 14px; margin-bottom: 12px;">Por que usar o Meu Sistema PSI?</p>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: ${EMAIL_COLORS.textLight}; line-height: 1.8;">
                <li>Agenda Inteligente e Intuitiva</li>
                <li>Prontuário Eletrônico Seguro (Padrão CRP)</li>
                <li>Gestão Financeira Completa</li>
                <li>Inteligência Artificial para Evoluções</li>
            </ul>
        </div>

        <div style="text-align: center;">
            <a href="${referralLink}" style="display: inline-block; background-color: ${EMAIL_COLORS.primary}; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(19, 146, 236, 0.2);">
                Conhecer a Plataforma
            </a>
            <p style="font-size: 13px; color: ${EMAIL_COLORS.textLight}; margin-top: 24px;">Simplifique sua rotina clínica hoje mesmo.</p>
        </div>
    `);
};

/**
 * Template para Cobrança / Fatura Financeira (Régua de Cobrança).
 * Suporta 3 fases: 'today', 'overdue', 'recurring'.
 */
export const invoiceReminderTemplate = ({ fase, pacienteNome, valor, vencimento, descricao, profissionalNome, linkPagamento }) => {
    let title = "Lembrete de Pagamento";
    let icon = "💰";
    let message = `Olá, <strong>${pacienteNome}</strong>. <br>Seguem as informações da sua fatura pendente.`;
    let accentColor = EMAIL_COLORS.primary;
    let badge = "";

    if (fase === 'today') {
        title = "Vence Hoje";
        icon = "📅";
        message = `Olá, <strong>${pacienteNome}</strong>! <br>Lembrando que sua fatura vence hoje. Que tal agilizar o pagamento?`;
        badge = `<p style="font-size: 12px; font-weight: 700; color: #ca8a04; margin-top: 8px; text-transform: uppercase;">⏰ Vencimento: Hoje</p>`;
    } else if (fase === 'overdue') {
        title = "Atenção: Fatura em Atraso";
        icon = "⚠️";
        message = `Olá, <strong>${pacienteNome}</strong>. <br>Não identificamos o pagamento da sua fatura. Por favor, regularize para manter seu histórico em dia.`;
        accentColor = "#ef4444";
        badge = `<p style="font-size: 12px; font-weight: 700; color: #ef4444; margin-top: 8px; text-transform: uppercase;">🚨 Atrasado há 3 dias</p>`;
    } else if (fase === 'recurring') {
        title = "Aviso de Débito Pendente";
        icon = "📌";
        message = `Olá, <strong>${pacienteNome}</strong>. <br>Reforçamos a necessidade de regularização do seu débito pendente. Caso já tenha pago, favor desconsiderar.`;
        accentColor = "#7f1d1d";
        badge = `<p style="font-size: 12px; font-weight: 700; color: #7f1d1d; margin-top: 8px; text-transform: uppercase;">⚠️ Cobrança Recorrente</p>`;
    }

    return baseWrapper(`
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 40px; margin-bottom: 8px;">${icon}</div>
            <h2 style="font-size: 22px; font-weight: 800; margin: 0; color: ${accentColor};">${title}</h2>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; color: ${EMAIL_COLORS.textLight}; text-align: center;">
            ${message}
        </p>

        <div style="background-color: ${EMAIL_COLORS.slate100}; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid ${EMAIL_COLORS.slate200}; text-align: center;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${EMAIL_COLORS.textLight}; letter-spacing: 0.1em; display: block; margin-bottom: 8px;">Valor Total</span>
            <p style="font-size: 32px; font-weight: 900; color: ${accentColor}; margin: 0;">${valor}</p>
            ${badge}
        </div>

        <div style="margin: 24px 0; padding: 16px; border-radius: 12px; background-color: #ffffff; border: 1px solid ${EMAIL_COLORS.slate200};">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${EMAIL_COLORS.textLight}; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">Descrição do Serviço</span>
            <p style="font-size: 14px; font-weight: 600; color: ${EMAIL_COLORS.text}; margin: 0;">${descricao}</p>
        </div>

        <div style="text-align: center; margin-top: 32px;">
            <a href="${linkPagamento}" style="display: inline-block; background-color: ${accentColor}; color: #ffffff; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                Visualizar e Pagar com Pix
            </a>
        </div>
    `);
};
