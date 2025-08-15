// Configuração para integração com Google Gemini AI
// Para usar a API real do Gemini, você precisará:
// 1. Obter uma API key do Google AI Studio (https://makersuite.google.com/app/apikey)
// 2. Instalar o SDK: npm install @google/generative-ai
// 3. Configurar as variáveis de ambiente

export const GEMINI_CONFIG = {
  // Substitua pela sua API key real
  API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  
  // Modelo a ser usado
  MODEL: 'gemini-pro',
  
  // Configurações de geração
  GENERATION_CONFIG: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
  
  // Configurações de segurança
  SAFETY_SETTINGS: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ],
};

// Prompt base para o assistente da barbearia
export const BARBER_ASSISTANT_PROMPT = `
Você é um assistente virtual inteligente especializado em atendimento para uma barbearia premium.
Seu objetivo é, através de uma conversa natural e amigável, coletar informações do cliente e recomendar o(s) serviço(s) e/ou produto(s) mais adequados.

Regras e Contexto:
1. Use sempre um tom acolhedor, educado e descontraído, típico de um bom barbeiro que conhece bem seus clientes.
2. Mantenha a conversa fluida e sem jargões técnicos.
3. Seja específico nas recomendações, explicando brevemente o motivo.
4. Se não encontrar algo exato, sugira a opção mais próxima.
5. Sempre ofereça ajuda adicional ou esclarecimentos.

Serviços disponíveis: {services}
Perfil do cliente: {customerProfile}
Histórico da conversa: {conversationHistory}

Responda de forma natural e personalizada:
`;

// Função para formatar o prompt com dados dinâmicos
export const formatPrompt = (
  services: { name: string; price: number; duration_minutes: number; description: string }[],
  customerProfile: {
    name?: string;
    email?: string;
    phone?: string;
    preferences?: string[];
    lastVisit?: Date;
    favoriteServices?: string[];
  },
  conversationHistory: string[],
  userMessage: string
) => {
  const servicesText = services
    .map(s => `${s.name} - R$ ${s.price} (${s.duration_minutes} min): ${s.description}`)
    .join('\n');
  
  const profileText = Object.entries(customerProfile)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  
  const historyText = conversationHistory.slice(-5).join('\n');
  
  return BARBER_ASSISTANT_PROMPT
    .replace('{services}', servicesText)
    .replace('{customerProfile}', profileText)
    .replace('{conversationHistory}', historyText) +
    `\n\nMensagem do cliente: "${userMessage}"\n\nSua resposta:`;
};

// Exemplo de implementação real com Gemini (comentado)
/*
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(GEMINI_CONFIG.API_KEY);

export const generateGeminiResponse = async (
  prompt: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_CONFIG.MODEL,
      generationConfig: GEMINI_CONFIG.GENERATION_CONFIG,
      safetySettings: GEMINI_CONFIG.SAFETY_SETTINGS,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Erro ao gerar resposta com Gemini:', error);
    throw error;
  }
};
*/