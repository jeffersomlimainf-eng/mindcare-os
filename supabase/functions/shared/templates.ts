// supabase/functions/shared/templates.ts

const VIOLET = '#6d28d9';
const VIOLET_DARK = '#4c1d95';
const PINK = '#ff66c2';
const BG = '#f5f3ff';
const YEAR = new Date().getFullYear();

const infoRow = (label: string, value: string) => `
<tr>
    <td style="padding:6px 0;font-size:12px;color:#8b5cf6;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;white-space:nowrap;padding-right:16px;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:#1e1b4b;font-weight:600;">${value}</td>
</tr>`;

const ctaButton = (text: string, href: string, color: string = VIOLET) => `
<table border="0" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
    <tr>
        <td style="background:${color};border-radius:10px;">
            <a href="${href}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:0.02em;">${text}</a>
        </td>
    </tr>
</table>`;

const kpiTable = (items: { label: string; value: string | number; color: string; bg: string; border: string }[]) => `
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
    <tr>
        ${items.map(k => `
        <td width="${Math.floor(100 / items.length)}%" style="padding:0 6px 0 0;">
            <div style="background:${k.bg};border:1px solid ${k.border};border-radius:12px;padding:16px;text-align:center;">
                <div style="font-size:11px;font-weight:700;color:${k.color};text-transform:uppercase;letter-spacing:0.1em;">${k.label}</div>
                <div style="font-size:26px;font-weight:800;color:${k.color};margin-top:6px;">${k.value}</div>
            </div>
        </td>`).join('')}
    </tr>
</table>`;

export const baseWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Meu Sistema PSI</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:Georgia,'Times New Roman',serif;">
<table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr><td align="center" style="padding:32px 16px;">
    <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(109,40,217,0.12);">

        <!-- Accent bar -->
        <tr><td height="4" style="background:linear-gradient(90deg,${PINK},${VIOLET});font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- Header -->
        <tr>
            <td style="background:linear-gradient(160deg,${VIOLET_DARK} 0%,${VIOLET} 100%);padding:36px 40px;text-align:center;">
                <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.5);letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px;">Meu Sistema PSI</div>
                <div style="font-size:22px;font-weight:700;color:#fff;font-style:italic;letter-spacing:-0.01em;">Portal Clínico</div>
            </td>
        </tr>

        <!-- Content -->
        <tr>
            <td style="padding:40px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#3b3051;line-height:1.7;">
                ${content}
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background:#f5f3ff;border-top:1px solid #ede9fe;padding:24px 40px;text-align:center;">
                <div style="font-size:11px;color:#8b5cf6;font-family:Arial,sans-serif;">© ${YEAR} Meu Sistema PSI · Todos os direitos reservados</div>
                <div style="margin-top:8px;font-size:11px;font-family:Arial,sans-serif;">
                    <a href="https://meusistemapsi.com.br" style="color:#8b5cf6;text-decoration:none;margin:0 8px;">Home</a>
                    <span style="color:#c4b5fd;">·</span>
                    <a href="https://meusistemapsi.com.br/ajuda" style="color:#8b5cf6;text-decoration:none;margin:0 8px;">Ajuda</a>
                </div>
            </td>
        </tr>

    </table>
    </td></tr>
</table>
</body>
</html>`;

export const invoiceReminderTemplate = ({
    patientName,
    description,
    value,
    dueDate,
    paymentLink,
    stage = 'today',
    professionalName
}: any) => {
    let title: string;
    let message: string;
    let btnText: string;

    if (stage === 'overdue') {
        title = 'Pagamento em Atraso';
        message = `Olá, <strong>${patientName}</strong>.<br><br>Aqui é a <strong>Psiquê</strong>, assistente do consultório de <strong>${professionalName}</strong>. Identificamos que o pagamento referente a <strong>${description}</strong> ainda não foi processado no nosso sistema. Caso já tenha realizado o pagamento, por favor desconsidere esta mensagem.`;
        btnText = 'Regularizar Pagamento';
    } else if (stage === 'recurring') {
        title = 'Pendência Financeira';
        message = `Olá, <strong>${patientName}</strong>.<br><br>Aqui é a <strong>Psiquê</strong> acompanhando as pendências do consultório de <strong>${professionalName}</strong>. Este é um lembrete automático sobre o item em aberto descrito abaixo.`;
        btnText = 'Pagar com Pix';
    } else {
        title = 'Lembrete de Pagamento';
        message = `Olá, <strong>${patientName}</strong>!<br><br>Aqui é a <strong>Psiquê</strong>, assistente virtual do consultório de <strong>${professionalName}</strong>. Passando para lembrar que o pagamento da sua sessão vence hoje.`;
        btnText = 'Pagar Agora com Pix';
    }

    const overdueBadge = stage === 'overdue'
        ? `<div style="display:inline-block;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:0.08em;margin-bottom:20px;font-family:Arial,sans-serif;">EM ATRASO</div><br>`
        : '';

    const content = `
        ${overdueBadge}
        <div style="font-size:22px;font-weight:700;color:#1e1b4b;margin-bottom:20px;font-style:italic;">${title}</div>
        <p style="font-size:15px;color:#4b4466;line-height:1.7;margin:0 0 24px;">${message}</p>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f3ff;border-radius:14px;margin-bottom:28px;">
            <tr>
                <td style="padding:24px 28px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        ${infoRow('Descrição', description)}
                        ${infoRow('Valor', `R$ ${value}`)}
                        ${infoRow('Vencimento', dueDate)}
                    </table>
                </td>
            </tr>
        </table>

        ${ctaButton(btnText, paymentLink)}

        <p style="font-size:13px;color:#8b7aa8;margin-top:36px;line-height:1.5;font-family:Arial,sans-serif;">
            Atenciosamente,<br>
            <strong style="color:#4b4466;">Psiquê</strong><br>
            Assistente Virtual · ${professionalName || 'Sua Clínica'}
        </p>`;

    return baseWrapper(content);
};

export const dailySummaryTemplate = ({
    professionalName,
    remindersSent,
    appointmentsToday,
    appointmentListHtml
}: any) => {
    const content = `
        <div style="font-size:22px;font-weight:700;color:#1e1b4b;margin-bottom:8px;font-style:italic;">Bom dia, ${professionalName}!</div>
        <p style="color:#6d5d8a;font-size:14px;margin:0 0 28px;font-family:Arial,sans-serif;">Aqui é a <strong>Psiquê</strong>. Enquanto você descansava, organizei sua clínica para hoje. Confira o resumo:</p>

        ${kpiTable([
            { label: 'Cobranças Enviadas', value: remindersSent, color: VIOLET, bg: '#f5f3ff', border: '#ddd6fe' },
            { label: 'Agenda de Hoje',     value: appointmentsToday, color: '#065f46', bg: '#ecfdf5', border: '#a7f3d0' },
        ])}

        <div style="font-size:15px;font-weight:700;color:#1e1b4b;margin-bottom:12px;">Agenda de Hoje</div>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#fff;border:1px solid #ede9fe;border-radius:14px;overflow:hidden;margin-bottom:28px;">
            <tr>
                <td style="padding:4px 0;">
                    ${appointmentListHtml || '<div style="padding:24px;text-align:center;color:#a78bca;font-family:Arial,sans-serif;font-size:14px;">Nenhuma consulta agendada para hoje.</div>'}
                </td>
            </tr>
        </table>

        <p style="font-size:13px;color:#8b7aa8;margin:0;line-height:1.6;font-family:Arial,sans-serif;">
            Tenha um excelente dia de trabalho!<br>
            Pode deixar a burocracia comigo.<br>
            <strong style="color:#4b4466;">Sua Assistente, Psiquê</strong>
        </p>`;

    return baseWrapper(content);
};

export const referralSuccessTemplate = ({
    referralName,
    professionalName
}: any) => {
    const content = `
        <div style="font-size:22px;font-weight:700;color:#1e1b4b;margin-bottom:20px;font-style:italic;">Parabéns, ${professionalName}!</div>
        <p style="font-size:15px;color:#4b4466;line-height:1.7;margin:0 0 28px;">Temos uma ótima notícia: sua indicação <strong>${referralName}</strong> acaba de assinar um plano no <strong>Meu Sistema PSI</strong>!</p>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#f5f3ff,#fce7f3);border:1px solid #ddd6fe;border-radius:16px;margin-bottom:28px;">
            <tr>
                <td style="padding:32px;text-align:center;">
                    <div style="font-size:11px;font-weight:700;color:${VIOLET};text-transform:uppercase;letter-spacing:0.12em;margin-bottom:10px;font-family:Arial,sans-serif;">Seu Prêmio</div>
                    <div style="font-size:36px;font-weight:900;color:${VIOLET_DARK};margin-bottom:8px;">+1 Mês Grátis</div>
                    <div style="font-size:13px;color:#7c3aed;font-family:Arial,sans-serif;">O bônus foi adicionado ao seu saldo de créditos.</div>
                </td>
            </tr>
        </table>

        <p style="font-size:14px;color:#4b4466;line-height:1.7;margin:0 0 28px;">Obrigado por ajudar a fortalecer nossa comunidade de psicólogos. Continue indicando para acumular mais meses gratuitos!</p>

        ${ctaButton('Ver Meu Saldo de Prêmios', 'https://meusistemapsi.com.br/configuracoes')}

        <p style="font-size:13px;color:#8b7aa8;margin-top:36px;line-height:1.5;font-family:Arial,sans-serif;">
            Com carinho,<br>
            <strong style="color:#4b4466;">Equipe Meu Sistema PSI</strong>
        </p>`;

    return baseWrapper(content);
};

export const welcomeNewCustomerTemplate = ({
    customerName,
    email,
    password,
    planName
}: any) => {
    const content = `
        <div style="font-size:22px;font-weight:700;color:#1e1b4b;margin-bottom:10px;font-style:italic;">Seja bem-vindo, ${customerName}!</div>
        <p style="color:#6d5d8a;font-size:15px;margin:0 0 28px;line-height:1.7;">Sua assinatura do plano <strong>${planName}</strong> foi confirmada com sucesso. Abaixo estão suas credenciais de acesso.</p>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f3ff;border-radius:14px;margin-bottom:20px;">
            <tr>
                <td style="padding:24px 28px;">
                    <div style="font-size:11px;font-weight:700;color:${VIOLET};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:18px;font-family:Arial,sans-serif;">Credenciais de Acesso</div>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        ${infoRow('E-mail', email)}
                        ${infoRow('Senha Temporária', password)}
                        ${infoRow('Plano', planName)}
                    </table>
                </td>
            </tr>
        </table>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin-bottom:28px;">
            <tr>
                <td style="padding:14px 20px;font-size:13px;color:#dc2626;font-family:Arial,sans-serif;">
                    <strong>Importante:</strong> por segurança, altere sua senha no primeiro acesso em <em>Configurações do Perfil</em>.
                </td>
            </tr>
        </table>

        ${ctaButton('Acessar Meu Painel', 'https://meusistemapsi.com.br/login')}

        <p style="font-size:13px;color:#8b7aa8;margin-top:36px;line-height:1.5;font-family:Arial,sans-serif;">
            Estamos à disposição para ajudar no que for preciso.<br>
            <strong style="color:#4b4466;">Equipe Meu Sistema PSI</strong>
        </p>`;

    return baseWrapper(content);
};
