import OpenAI from "openai";
import { logger } from '../utils/logger';

// Configuração do cliente OpenAI
// O uso de dangerouslyAllowBrowser é necessário para rodar diretamente no Vite/React,
// mas em produção o ideal é fazer essas chamadas via Edge Functions ou Backend para segurança da chave.
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Função genérica para enviar prompts para a OpenAI.
 * @param {string} prompt - O comando ou texto para a IA processar.
 * @param {string} systemMessage - Instruções de comportamento para a IA.
 * @returns {Promise<string>} - A resposta da IA.
 */
export async function perguntarIA(prompt, systemMessage = "Você é um assistente especializado em gestão clínica e psicologia.") {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error("API Key da OpenAI não encontrada no arquivo .env");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Você pode mudar para "gpt-4" se tiver acesso
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    logger.error('[OpenAI] Erro na chamada:', error?.message);
    throw error;
  }
}

/**
 * Exemplo de função especializada para resumir prontuários.
 */
export async function resumirSessao(textoBruto) {
  const systemPrompt = "Você é um assistente clínico. Resuma os pontos principais desta sessão de terapia em tópicos claros e profissionais.";
  return perguntarIA(textoBruto, systemPrompt);
}

export default openai;
