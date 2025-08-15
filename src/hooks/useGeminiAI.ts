import { useState } from 'react';
import { GEMINI_CONFIG, BARBER_ASSISTANT_PROMPT } from '../config/gemini';
import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

interface GeminiResponse {
  text: string;
  error?: string;
}

interface CustomerProfile {
  hairType: string;
  preferredStyle: string;
  budget: string;
  frequency: string;
  specialNeeds: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export const useGeminiAI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const generateResponse = async (
    message: string,
    context: {
      customerProfile?: CustomerProfile;
      services?: Service[];
      conversationHistory?: string[];
    }
  ): Promise<GeminiResponse> => {
    setIsLoading(true);
    
    try {
      // Verifica se a API key do Gemini está configurada
      if (GEMINI_CONFIG.API_KEY) {
        try {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const genAI = new GoogleGenerativeAI(GEMINI_CONFIG.API_KEY);
          const model = genAI.getGenerativeModel({ 
            model: GEMINI_CONFIG.MODEL,
            generationConfig: GEMINI_CONFIG.GENERATION_CONFIG,
            safetySettings: [
              {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
              },
            ]
          });
          
          const prompt = formatPromptWithContext(message, context);
          const result = await model.generateContent(prompt);
          const response = result.response.text();
          
          setIsLoading(false);
          return { text: response };
        } catch (geminiError) {
          console.error('Erro na API do Gemini, usando fallback:', geminiError);
          // Continua para o fallback em caso de erro
        }
      }
      
      // Fallback: resposta inteligente simulada
      const response = await generateIntelligentResponse(message, context);
      
      setIsLoading(false);
      return { text: response };
    } catch (error) {
      setIsLoading(false);
      console.error('Error generating AI response:', error);
      return {
        text: "Desculpe, tive um problema técnico. Mas posso te ajudar com informações sobre nossos serviços!",
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const generateRecommendations = async (
    customerProfile: CustomerProfile,
    services: Service[]
  ): Promise<GeminiResponse> => {
    setIsLoading(true);
    
    try {
      const recommendations = analyzeProfileAndRecommend(customerProfile, services);
      const response = formatRecommendationsWithAI(customerProfile, recommendations);
      
      setIsLoading(false);
      return { text: response };
    } catch (error) {
      setIsLoading(false);
      return {
        text: "Com base no seu perfil, recomendo nossos serviços mais populares!",
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  return {
    generateResponse,
    generateRecommendations,
    isLoading
  };
};

// Helper function to format prompt with context
const formatPromptWithContext = (
  message: string,
  context: {
    customerProfile?: CustomerProfile;
    services?: Service[];
    conversationHistory?: string[];
  }
): string => {
  const servicesText = context.services 
    ? context.services.map(s => `${s.name} - R$ ${s.price} (${s.duration} min): ${s.description}`).join('\n')
    : 'Serviços não disponíveis no momento';
  
  const profileText = context.customerProfile 
    ? Object.entries(context.customerProfile).map(([key, value]) => `${key}: ${value}`).join(', ')
    : 'Perfil não informado';
  
  const historyText = context.conversationHistory 
    ? context.conversationHistory.slice(-5).join('\n')
    : 'Primeira interação';
  
  return BARBER_ASSISTANT_PROMPT
    .replace('{services}', servicesText)
    .replace('{customerProfile}', profileText)
    .replace('{conversationHistory}', historyText) +
    `\n\nMensagem do cliente: "${message}"\n\nSua resposta:`;
};

// Helper function to generate intelligent responses
const generateIntelligentResponse = async (
  message: string,
  context: {
    customerProfile?: CustomerProfile;
    services?: Service[];
    conversationHistory?: string[];
  }
): Promise<string> => {
  const lowerMessage = message.toLowerCase();
  
  // Handle common questions about services
  if (lowerMessage.includes('preço') || lowerMessage.includes('valor') || lowerMessage.includes('custa')) {
    if (context.services && context.services.length > 0) {
      const serviceList = context.services
        .map(s => `• ${s.name}: R$ ${s.price} (${s.duration} min)`)
        .join('\n');
      return `Aqui estão nossos preços:\n\n${serviceList}\n\nTodos os serviços incluem produtos premium e atendimento personalizado! 💫`;
    }
  }
  
  if (lowerMessage.includes('horário') || lowerMessage.includes('funcionamento') || lowerMessage.includes('aberto')) {
    return "Funcionamos de segunda a sábado:\n• Segunda a sexta: 9h às 19h\n• Sábado: 8h às 17h\n• Domingo: Fechado\n\nVocê pode agendar pelo nosso sistema online! 📅";
  }
  
  if (lowerMessage.includes('localização') || lowerMessage.includes('endereço') || lowerMessage.includes('onde')) {
    return "Estamos localizados no coração da cidade! 📍\n\nPara mais informações sobre localização, visite nossa página de contato. Temos estacionamento próprio e fácil acesso! 🚗";
  }
  
  if (lowerMessage.includes('agend') || lowerMessage.includes('marcar')) {
    return "Para agendar é super fácil! 📱\n\n1. Clique em 'Sim, quero agendar!' quando eu oferecer\n2. Ou acesse nossa página de agendamento\n3. Escolha o serviço, barbeiro e horário\n\nPosso te direcionar agora mesmo se quiser! 😊";
  }
  
  if (lowerMessage.includes('barbeiro') || lowerMessage.includes('profissional')) {
    return "Temos uma equipe incrível de barbeiros especializados! ✂️\n\nCada um tem sua especialidade:\n• Cortes clássicos e modernos\n• Barbas e bigodes\n• Tratamentos capilares\n• Pigmentação\n\nTodos são certificados e usam apenas produtos premium! 🌟";
  }
  
  if (lowerMessage.includes('produto') || lowerMessage.includes('pomada') || lowerMessage.includes('shampoo')) {
    return "Trabalhamos com as melhores marcas do mercado! 💎\n\n• Pomadas e ceras modeladoras\n• Shampoos e condicionadores\n• Óleos para barba\n• Produtos pós-barba\n\nTodos testados e aprovados pelos nossos profissionais! Posso recomendar algo específico para seu tipo de cabelo! 🎯";
  }
  
  // Default intelligent response
  const name = 'amigo';
  return `Olá ${name}! Entendi sua pergunta. Como assistente especializado da barbearia, estou aqui para te ajudar com qualquer dúvida sobre nossos serviços, preços, agendamentos ou produtos! 😊\n\nO que mais gostaria de saber?`;
};

// Helper function to analyze profile and recommend services
const analyzeProfileAndRecommend = (profile: CustomerProfile, services: Service[]) => {
  const recommendations: Array<{ service: Service; score: number; reasons: string[] }> = [];
  
  services.forEach(service => {
    let score = 0;
    const reasons: string[] = [];
    
    // Hair type analysis
    if (profile.hairType === 'Cacheado' || profile.hairType === 'Crespo') {
      if (service.name.toLowerCase().includes('tratamento') || 
          service.name.toLowerCase().includes('hidratação')) {
        score += 4;
        reasons.push('ideal para seu tipo de cabelo');
      }
    }
    
    // Style preference analysis
    if (profile.preferredStyle === 'Clássico/Tradicional') {
      if (service.name.toLowerCase().includes('tesoura') || 
          service.name.toLowerCase().includes('barba') ||
          service.name.toLowerCase().includes('clássico')) {
        score += 4;
        reasons.push('perfeito para o estilo clássico que você busca');
      }
    } else if (profile.preferredStyle === 'Moderno/Atual') {
      if (service.name.toLowerCase().includes('degradê') || 
          service.name.toLowerCase().includes('pigmentação') ||
          service.name.toLowerCase().includes('moderno')) {
        score += 4;
        reasons.push('ideal para um visual moderno e atual');
      }
    }
    
    // Budget analysis
    if (profile.budget === 'Até R$ 30') {
      if (service.price <= 30) {
        score += 3;
        reasons.push('dentro do seu orçamento');
      }
    } else if (profile.budget === 'R$ 30-60') {
      if (service.price >= 30 && service.price <= 60) {
        score += 3;
        reasons.push('excelente custo-benefício');
      }
    } else if (profile.budget === 'Acima de R$ 60') {
      if (service.price > 60) {
        score += 3;
        reasons.push('serviço premium');
      }
    }
    
    // Frequency analysis
    if (profile.frequency === 'Semanal') {
      if (service.name.toLowerCase().includes('corte') || 
          service.name.toLowerCase().includes('barba') ||
          service.duration <= 30) {
        score += 3;
        reasons.push('ideal para sua frequência de manutenção');
      }
    }
    
    // Special needs analysis
    if (profile.specialNeeds && profile.specialNeeds !== 'Nenhuma') {
      if (service.name.toLowerCase().includes('tratamento') || 
          service.duration > 60) {
        score += 2;
        reasons.push('atende suas necessidades especiais');
      }
    }
    
    if (score > 0) {
      recommendations.push({ service, score, reasons });
    }
  });
  
  // Sort by score and return top 3
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

// Helper function to format recommendations with AI-like language
const formatRecommendationsWithAI = (
  profile: CustomerProfile,
  recommendations: Array<{ service: Service; score: number; reasons: string[] }>
): string => {
  if (recommendations.length === 0) {
    return `Analisando seu perfil, recomendo que conversemos mais para encontrar o serviço ideal! Nossos barbeiros são especialistas em criar looks personalizados. Que tal agendar uma consulta? 😊`;
  }
  
  let response = `Perfeito! 🎯 Analisei cuidadosamente suas respostas e aqui estão minhas recomendações personalizadas:\n\n`;
  
  recommendations.forEach((rec, index) => {
    const emoji = index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉';
    response += `${emoji} **${rec.service.name}**\n`;
    response += `💰 R$ ${rec.service.price} | ⏱️ ${rec.service.duration} min\n`;
    response += `💡 ${rec.reasons.join(', ')}\n\n`;
  });
  
  response += `Essas recomendações foram feitas especialmente para você com base no seu perfil! Todos os serviços incluem produtos premium e o cuidado especial que você merece. ✨\n\nGostaria de agendar algum deles?`;
  
  return response;
};