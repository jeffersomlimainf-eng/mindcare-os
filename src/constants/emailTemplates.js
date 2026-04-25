/**
 * Biblioteca de Templates de E-mail — Meu Sistema PSI
 * Design premium, email-safe (sem flexbox/grid), paleta on-brand.
 */

// ─── Paleta ────────────────────────────────────────────────────
const C = {
    violet:     '#6d28d9',
    violetDark: '#4c1d95',
    violetLight:'#ede9fe',
    pink:       '#ff66c2',
    bg:         '#f5f3ff',
    white:      '#ffffff',
    ink:        '#1a1428',
    inkSoft:    '#4b3b5f',
    muted:      '#8b7a9e',
    line:       '#e9d5ff',
    lineLight:  '#f3e8ff',
    green:      '#1f8a4d',
    greenBg:    '#ecfdf5',
    greenLine:  '#bbf7d0',
    amber:      '#b68515',
    amberBg:    '#fffbeb',
    amberLine:  '#fde68a',
    red:        '#dc2626',
    redBg:      '#fef2f2',
    redLine:    '#fecaca',
};

// ─── Wrapper base ───────────────────────────────────────────────
const baseWrapper = (content) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Meu Sistema PSI</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:${C.white};border-radius:24px;overflow:hidden;border:1px solid ${C.line};box-shadow:0 8px 32px rgba(109,40,217,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="background-color:${C.violetDark};padding:32px 40px 28px;text-align:center;">
              <!-- Brand icon (text fallback) -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:14px;">
                    <div style="display:inline-block;width:44px;height:50px;line-height:50px;font-size:32px;color:${C.pink};font-weight:900;font-style:italic;">S</div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Meu Sistema</span>
                    <span style="font-size:22px;font-weight:300;color:rgba(255,255,255,0.55);letter-spacing:-0.02em;"> PSI</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:6px;">
                    <span style="font-size:11px;font-weight:500;color:rgba(255,255,255,0.45);letter-spacing:0.12em;text-transform:uppercase;">Portal Clínico</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Accent bar -->
          <tr>
            <td height="3" style="background:linear-gradient(90deg,${C.pink},${C.violet});font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:${C.lineLight};padding:20px 40px;text-align:center;border-top:1px solid ${C.line};">
              <p style="margin:0;font-size:11px;color:${C.muted};line-height:1.6;">
                Este e-mail foi enviado automaticamente pelo sistema do seu profissional de saúde.
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:${C.muted};">
                &copy; ${new Date().getFullYear()} Meu Sistema PSI &mdash; Tecnologia para Psicologia
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Helper: info card ──────────────────────────────────────────
const infoCard = (rows, accentColor = C.violet) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0"
  style="background-color:${C.lineLight};border-radius:16px;border:1px solid ${C.line};margin:24px 0;">
  ${rows.map(({ label, value }, i) => `
  <tr>
    <td style="padding:${i === 0 ? '20px' : '0'} 24px ${i === rows.length - 1 ? '20px' : '16px'};">
      <p style="margin:0 0 3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${C.muted};">${label}</p>
      <p style="margin:0;font-size:16px;font-weight:700;color:${accentColor};">${value}</p>
    </td>
  </tr>`).join('')}
</table>`;

// ─── Helper: CTA button ─────────────────────────────────────────
const ctaButton = (href, text, color = C.violet) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
  <tr>
    <td align="center">
      <a href="${href}"
        style="display:inline-block;background-color:${color};color:#ffffff;text-decoration:none;padding:15px 36px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.02em;box-shadow:0 4px 16px rgba(109,40,217,0.3);">
        ${text}
      </a>
    </td>
  </tr>
</table>`;

// ─── Helper: label chip ─────────────────────────────────────────
const chip = (text, bg, color) =>
  `<span style="display:inline-block;background-color:${bg};color:${color};font-size:11px;font-weight:700;padding:4px 12px;border-radius:99px;letter-spacing:0.06em;text-transform:uppercase;">${text}</span>`;

// ════════════════════════════════════════════════════════════════
// 1. LEMBRETE DE CONSULTA
// ════════════════════════════════════════════════════════════════
export const appointmentReminderTemplate = ({
    pacienteNome, data, hora, tipo, profissionalNome, profissionalCrp, profissionalTelefone
}) => {
    const isOnline = tipo?.toLowerCase().includes('tele') || tipo?.toLowerCase().includes('online');

    return baseWrapper(`
      <!-- Greeting -->
      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${C.muted};text-transform:uppercase;letter-spacing:0.1em;">Lembrete de Sessão</p>
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:${C.ink};line-height:1.2;">
        Olá, ${pacienteNome}! 👋
      </h1>
      <p style="margin:0 0 0;font-size:15px;line-height:1.7;color:${C.inkSoft};">
        Passando para confirmar sua próxima sessão. Veja os detalhes abaixo e qualquer dúvida, entre em contato.
      </p>

      <!-- Info card -->
      ${infoCard([
          { label: 'Data e Horário', value: `${data} às ${hora}` },
          { label: 'Modalidade',     value: `${isOnline ? '💻 ' : '🏢 '}${tipo}` },
      ])}

      ${isOnline ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#f0f9ff;border-radius:12px;border:1px solid #bae6fd;margin:0 0 24px;">
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0;font-size:13px;font-weight:500;color:#0369a1;line-height:1.5;">
              🔗 O link da videochamada será enviado pelo seu profissional alguns minutos antes do horário agendado.
            </p>
          </td>
        </tr>
      </table>` : ''}

      <!-- Divider -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 24px;">
        <tr><td height="1" style="background-color:${C.line};font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>

      <!-- Professional signature -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:0;">
            <p style="margin:0;font-size:14px;font-weight:700;color:${C.ink};">${profissionalNome}</p>
            <p style="margin:3px 0 0;font-size:12px;color:${C.muted};">Psicólogo(a) &middot; CRP ${profissionalCrp}</p>
            ${profissionalTelefone ? `<p style="margin:3px 0 0;font-size:12px;color:${C.muted};">📞 ${profissionalTelefone}</p>` : ''}
          </td>
        </tr>
      </table>
    `);
};

// ════════════════════════════════════════════════════════════════
// 2. BOAS-VINDAS À EQUIPE
// ════════════════════════════════════════════════════════════════
export const teamWelcomeTemplate = ({ nome, email, senha, clinicName, loginUrl }) => {
    return baseWrapper(`
      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${C.muted};text-transform:uppercase;letter-spacing:0.1em;">Acesso Liberado</p>
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:${C.ink};line-height:1.2;">
        Bem-vindo(a), ${nome}! 🎉
      </h1>
      <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:${C.inkSoft};">
        A clínica <strong>${clinicName}</strong> te convidou para o <strong>Meu Sistema PSI</strong>. Use as credenciais abaixo para fazer seu primeiro acesso.
      </p>

      <!-- Credentials card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:${C.lineLight};border-radius:16px;border:1px solid ${C.line};margin:0 0 8px;">
        <tr>
          <td style="padding:20px 24px 12px;">
            <p style="margin:0 0 3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${C.muted};">E-mail</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:${C.ink};">${email}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 20px;">
            <p style="margin:0 0 3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${C.muted};">Senha Temporária</p>
            <p style="margin:0;font-size:18px;font-weight:800;color:${C.violet};font-family:monospace;letter-spacing:0.08em;">${senha}</p>
          </td>
        </tr>
      </table>
      <p style="margin:8px 0 0;font-size:11px;font-weight:600;color:${C.red};">
        ⚠️ Recomendamos alterar a senha no primeiro acesso.
      </p>

      ${ctaButton(loginUrl, 'Acessar Meu Painel →')}
    `);
};

// ════════════════════════════════════════════════════════════════
// 3. CONVITE DE INDICAÇÃO
// ════════════════════════════════════════════════════════════════
export const referralInviteTemplate = ({ profNome, referralLink }) => {
    return baseWrapper(`
      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${C.muted};text-transform:uppercase;letter-spacing:0.1em;">Convite Especial</p>
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:${C.ink};line-height:1.2;">
        Você foi indicado(a)! 🚀
      </h1>
      <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:${C.inkSoft};">
        <strong>${profNome}</strong> usa o <strong>Meu Sistema PSI</strong> para gerenciar sua clínica e acredita que pode transformar o seu trabalho também.
      </p>

      <!-- Benefits -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:${C.lineLight};border-radius:16px;border:1px solid ${C.line};margin:0 0 28px;">
        <tr>
          <td style="padding:20px 24px 6px;">
            <p style="margin:0 0 14px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${C.muted};">Por que usar o Meu Sistema PSI?</p>
          </td>
        </tr>
        ${[
            ['📅', 'Agenda inteligente com lembretes automáticos'],
            ['📋', 'Prontuário eletrônico seguro (padrão CRP)'],
            ['💰', 'Gestão financeira e cobranças automatizadas'],
            ['🤖', 'Inteligência Artificial para evoluções clínicas'],
        ].map(([icon, text]) => `
        <tr>
          <td style="padding:0 24px 14px;">
            <p style="margin:0;font-size:14px;color:${C.inkSoft};line-height:1.5;">${icon}&nbsp; ${text}</p>
          </td>
        </tr>`).join('')}
        <tr><td style="padding:0 0 6px;">&nbsp;</td></tr>
      </table>

      ${ctaButton(referralLink, 'Conhecer a Plataforma →')}

      <p style="margin:20px 0 0;font-size:13px;color:${C.muted};text-align:center;">
        Simplifique sua rotina clínica. Comece grátis por 30 dias.
      </p>
    `);
};

// ════════════════════════════════════════════════════════════════
// 4. COBRANÇA / FATURA  (fases: today | overdue | recurring)
// ════════════════════════════════════════════════════════════════
export const invoiceReminderTemplate = ({
    fase = 'today', pacienteNome, valor, vencimento, descricao, profissionalNome, linkPagamento
}) => {
    const CFGS = {
        today: {
            badge:   chip('Vence Hoje', C.amberBg, C.amber),
            title:   'Lembrete de Pagamento',
            msg:     `Olá, <strong>${pacienteNome}</strong>! Sua fatura vence hoje. Que tal agilizar o pagamento e manter tudo em dia?`,
            accent:  C.amber,
            btnText: 'Pagar Agora com Pix',
        },
        overdue: {
            badge:   chip('Em Atraso', C.redBg, C.red),
            title:   'Fatura em Atraso',
            msg:     `Olá, <strong>${pacienteNome}</strong>. Identificamos que a sua fatura ainda não foi paga. Por favor, regularize para manter seu histórico em dia.`,
            accent:  C.red,
            btnText: 'Regularizar Pagamento',
        },
        recurring: {
            badge:   chip('Pendência Recorrente', C.redBg, C.red),
            title:   'Débito Pendente',
            msg:     `Olá, <strong>${pacienteNome}</strong>. Este é um lembrete sobre um débito pendente em seu histórico. Caso já tenha realizado o pagamento, por favor desconsidere este aviso.`,
            accent:  '#7f1d1d',
            btnText: 'Pagar com Pix',
        },
    };
    const cfg = CFGS[fase] || CFGS.today;

    const { badge, title, msg, accent, btnText } = cfg;

    return baseWrapper(`
      <!-- Badge -->
      <p style="margin:0 0 12px;">${badge}</p>

      <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:${C.ink};line-height:1.2;">${title}</h1>
      <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:${C.inkSoft};">${msg}</p>

      <!-- Invoice card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:${C.lineLight};border-radius:16px;border:1px solid ${C.line};margin:0 0 8px;text-align:center;">
        <tr>
          <td style="padding:24px 24px 8px;">
            <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${C.muted};">Valor Total</p>
            <p style="margin:0;font-size:36px;font-weight:900;color:${accent};">${valor}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 20px;">
            <p style="margin:6px 0 0;font-size:13px;color:${C.muted};">${descricao}</p>
            ${vencimento ? `<p style="margin:4px 0 0;font-size:12px;font-weight:600;color:${accent};">Vencimento: ${vencimento}</p>` : ''}
          </td>
        </tr>
      </table>

      ${ctaButton(linkPagamento, btnText, accent)}

      <!-- Signature -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 0;">
        <tr>
          <td style="border-top:1px solid ${C.line};padding-top:20px;">
            <p style="margin:0;font-size:13px;color:${C.inkSoft};line-height:1.6;">
              Atenciosamente,<br>
              <strong>Psiquê</strong><br>
              <span style="font-size:12px;color:${C.muted};">Assistente Virtual de ${profissionalNome || 'Sua Clínica'}</span>
            </p>
          </td>
        </tr>
      </table>
    `);
};
