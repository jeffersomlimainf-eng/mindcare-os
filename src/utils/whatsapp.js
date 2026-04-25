/**
 * Utilitário para gerar links do WhatsApp (wa.me)
 */

export const generateWhatsAppLink = (phone, message) => {
  if (!phone) return null;
  
  // Limpa o número (remove +, -, espaços e parênteses)
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Se não começar com 55 (Brasil) e tiver 10 ou 11 dígitos, adiciona 55
  let finalPhone = cleanPhone;
  if (cleanPhone.length >= 10 && !cleanPhone.startsWith('55')) {
    finalPhone = `55${cleanPhone}`;
  }
  
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
};

export const messages = {
  reminder: (name, time) => 
    `Olá, ${name}! Tudo bem? Passando para confirmar nossa sessão de hoje agendada para às ${time}. Podemos confirmar? \u{1F98B}`,
  
  billing: (name, date, value, pix, paymentLink) => 
    `Olá, ${name}! Registrei aqui nossa sessão do dia ${date}. O valor é de R$ ${value}.\n\n` +
    `${paymentLink ? `Para facilitar, você pode visualizar os detalhes e realizar o pagamento por este link: ${paymentLink}\n\n` : ''}` +
    `${pix && !paymentLink ? `Você pode realizar o pagamento via PIX para a chave: ${pix}\n\n` : ''}` +
    `Abraços! \u{1F98B}`,
  
  welcome: (name, systemUrl) => 
    `Olá, ${name}! Seja bem-vindo(a). Criei seu cadastro no meu sistema de atendimento. Você pode acessar seus documentos e horários por aqui: ${systemUrl} \u{1F98B}`,

  confirmAppointment: (name, date, time) =>
    `Olá, ${name}! Agendei sua sessão para o dia ${date} às ${time}. Até lá! \u{1F98B}`
};
