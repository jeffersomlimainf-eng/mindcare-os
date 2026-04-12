// supabase/functions/shared/templates.ts

export const baseWrapper = (content: string, primaryColor: string = '#1392ec') => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: ${primaryColor}; padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; background: #f1f5f9; }
        .btn { display: inline-block; padding: 14px 28px; background: ${primaryColor}; color: white !important; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 20px 0; }
        .footer-links { margin-top: 10px; }
        .footer-links a { color: #64748b; text-decoration: none; margin: 0 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0; font-size: 24px; font-weight: 800; font-style: italic;">Meu Sistema PSI</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Meu Sistema PSI. Todos os direitos reservados.</p>
            <div class="footer-links">
                <a href="https://meusistemapsi.com.br">Home</a>
                <a href="https://meusistemapsi.com.br/ajuda">Ajuda</a>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const invoiceReminderTemplate = ({
    patientName,
    description,
    value,
    dueDate,
    paymentLink,
    stage = 'today',
    professionalName
}: any) => {
    let title = "Lembrete de Pagamento";
    let message = `Olá, <strong>${patientName}</strong>!<br><br>Aqui é a <strong>Psiquê</strong>, a assistente virtual do consultório de <strong>${professionalName}</strong>. Passando para lembrar que o pagamento da sua sessão vence hoje.`;
    let btnText = "Pagar Agora com Pix";

    if (stage === 'overdue') {
        title = "⚠️ Pagamento em Atraso 🧠";
        message = `Olá, <strong>${patientName}</strong>.<br><br>Aqui é a <strong>Psiquê</strong>, assistente do consultório de <strong>${professionalName}</strong>. Identificamos que o pagamento referente a <strong>${description}</strong> ainda não foi processado no nosso sistema. Caso já tenha feito, por favor desconsidere!`;
        btnText = "Regularizar Agora";
    } else if (stage === 'recurring') {
        title = "Pendência Financeira 🧠";
        message = `Olá, <strong>${patientName}</strong>.<br><br>Aqui é a <strong>Psiquê</strong> acompanhando as pendências do consultório de <strong>${professionalName}</strong>. Este é um lembrete automático sobre: <strong>${description}</strong>.`;
        btnText = "Pagar com Pix";
    }

    const content = `
        <h2 style="color: #1e293b; font-size: 22px; margin-bottom: 20px;">${title}</h2>
        <p style="font-size: 16px; color: #475569; line-height: 1.6;">${message}</p>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 5px 0; font-size: 14px; color: #64748b;">Descrição:</p>
            <p style="margin: 0; font-weight: bold; color: #1e293b;">${description}</p>
            <p style="margin: 15px 0 5px 0; font-size: 14px; color: #64748b;">Valor:</p>
            <p style="margin: 0; font-weight: bold; color: #1e293b; font-size: 20px;">R$ ${value}</p>
            <p style="margin: 15px 0 5px 0; font-size: 14px; color: #64748b;">Vencimento:</p>
            <p style="margin: 0; font-weight: bold; color: #1e293b;">${dueDate}</p>
        </div>

        <div style="text-align: center;">
            <a href="${paymentLink}" class="btn">${btnText}</a>
        </div>
        
        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            Atenciosamente,<br>
            <strong>Psiquê</strong><br>
            <span style="font-size: 12px;">Assistente Virtual de ${professionalName || 'Sua Clínica'}</span>
        </p>
    `;

    return baseWrapper(content);
};

export const dailySummaryTemplate = ({
    professionalName,
    remindersSent,
    appointmentsToday,
    appointmentListHtml
}: any) => {
    const content = `
        <h2 style="color: #1e293b; font-size: 22px; margin-bottom: 5px;">Bom dia, ${professionalName}! ☀️</h2>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 25px;">Aqui é a <strong>Psiquê</strong>. Enquanto você descansava, eu organizei sua clínica para hoje. Veja o resumo:</p>
        
        <div style="display: flex; gap: 10px; margin-bottom: 25px;">
            <div style="flex: 1; background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 12px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #0369a1; font-weight: bold; text-transform: uppercase;">Cobranças Enviadas</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 800; color: #0369a1;">${remindersSent}</p>
            </div>
            <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 12px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #15803d; font-weight: bold; text-transform: uppercase;">Agenda de Hoje</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 800; color: #15803d;">${appointmentsToday}</p>
            </div>
        </div>

        <h3 style="color: #1e293b; font-size: 16px; margin-bottom: 10px;">Agenda de Hoje:</h3>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            ${appointmentListHtml || '<p style="padding: 20px; text-align: center; color: #94a3b8;">Nenhuma consulta agendada para hoje.</p>'}
        </div>

        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            Tenha um excelente dia de trabalho!<br>
            Pode deixar a burocracia comigo. 🧠<br>
            <strong>Sua Assistente, Psiquê</strong>
        </p>
    `;

    return baseWrapper(content);
};

export const referralSuccessTemplate = ({
    referralName,
    professionalName
}: any) => {
    const content = `
        <h2 style="color: #1e293b; font-size: 22px; margin-bottom: 20px;">Parabéns, ${professionalName}! 🎉</h2>
        <p style="font-size: 16px; color: #475569; line-height: 1.6;">Temos uma ótima notícia: a sua indicação (<strong>${referralName}</strong>) acaba de assinar um plano no <strong>Meu Sistema PSI</strong>!</p>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #15803d; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Seu Prêmio</p>
            <p style="margin: 10px 0; font-size: 32px; font-weight: 900; color: #166534;">+1 Mês Grátis 🎁</p>
            <p style="margin: 0; font-size: 13px; color: #166534; opacity: 0.8;">O bônus foi adicionado ao seu saldo.</p>
        </div>

        <p style="font-size: 15px; color: #475569;">Obrigado por ajudar a fortalecer nossa comunidade de psicólogos. Continue indicando para acumular mais meses gratuitos!</p>

        <div style="text-align: center; margin-top: 30px;">
            <a href="https://meusistemapsi.com.br/configuracoes" class="btn" style="background: #10b981;">Ver Meu Saldo de Prêmios</a>
        </div>
        
        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            Com carinho,<br>
            <strong>Equipe Meu Sistema PSI</strong>
        </p>
    `;

    return baseWrapper(content, '#10b981');
};

export const welcomeNewCustomerTemplate = ({
    customerName,
    email,
    password,
    planName
}: any) => {
    const content = `
        <h2 style="color: #1e293b; font-size: 22px; margin-bottom: 10px;">Seja bem-vindo, ${customerName}! 🚀</h2>
        <p style="color: #64748b; font-size: 16px; margin-bottom: 25px;">Sua assinatura do plano <strong>${planName}</strong> foi confirmada com sucesso.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #64748b; font-weight: bold; text-transform: uppercase;">Suas Credenciais de Acesso:</p>
            
            <div style="margin-bottom: 15px;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">E-mail:</p>
                <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1e293b;">${email}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">Senha Temporária:</p>
                <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1e293b; letter-spacing: 1px;">${password}</p>
            </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="https://meusistemapsi.com.br/login" class="btn">Acessar Meu Painel</a>
        </div>

        <p style="font-size: 14px; color: #e11d48; font-weight: bold; margin-top: 20px;">
            ⚠️ IMPORTANTE: Por segurança, altere sua senha no primeiro acesso em "Configurações do Perfil".
        </p>

        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            Estamos à disposição para ajudar no que for preciso.<br>
            <strong>Equipe Meu Sistema PSI</strong>
        </p>
    `;

    return baseWrapper(content);
};
