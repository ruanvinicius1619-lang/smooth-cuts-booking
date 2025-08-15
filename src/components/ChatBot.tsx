import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';
import { Input } from './ui/input';
import { MessageCircle, X, Send, User, Bot, Scissors, Settings, UserCircle } from 'lucide-react';
import { useGeminiAI } from '../hooks/useGeminiAI';
import { supabase } from '../integrations/supabase/client';
import { GeminiStatus } from './GeminiStatus';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  options?: string[];
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface CustomerProfile {
  hairType: string;
  preferredStyle: string;
  budget: string;
  frequency: string;
  specialNeeds: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>({
    hairType: '',
    preferredStyle: '',
    budget: '',
    frequency: '',
    specialNeeds: ''
  });
  const [services, setServices] = useState<Service[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showGeminiStatus, setShowGeminiStatus] = useState(false);
  const [isConsultantMode, setIsConsultantMode] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { generateResponse, generateRecommendations: generateAIRecommendations } = useGeminiAI();

  const questions = React.useMemo(() => [
    {
      text: "Olá! Sou o assistente virtual da nossa barbearia! 👋 Para te ajudar melhor, vou fazer algumas perguntas. Qual é o seu tipo de cabelo?",
      options: ['Liso', 'Ondulado', 'Cacheado', 'Crespo', 'Não sei'],
      field: 'hairType' as keyof CustomerProfile
    },
    {
      text: "Perfeito! Que tipo de corte você prefere ou está procurando?",
      options: ['Clássico/Tradicional', 'Moderno/Estiloso', 'Degradê', 'Social', 'Criativo/Diferente'],
      field: 'preferredStyle' as keyof CustomerProfile
    },
    {
      text: "Ótima escolha! Qual é o seu orçamento aproximado para o serviço?",
      options: ['Até R$ 30', 'R$ 30 - R$ 50', 'R$ 50 - R$ 80', 'Acima de R$ 80', 'Flexível'],
      field: 'budget' as keyof CustomerProfile
    },
    {
      text: "Com que frequência você costuma cortar o cabelo?",
      options: ['Toda semana', 'A cada 15 dias', 'Mensalmente', 'A cada 2-3 meses', 'Raramente'],
      field: 'frequency' as keyof CustomerProfile
    },
    {
      text: "Por último, você tem alguma necessidade especial ou preferência adicional?",
      options: ['Barba também', 'Cabelo sensível', 'Alergia a produtos', 'Pressa (serviço rápido)', 'Nenhuma'],
      field: 'specialNeeds' as keyof CustomerProfile
    }
  ], []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: questions[0].text,
        sender: 'bot',
        timestamp: new Date(),
        options: questions[0].options
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, questions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
      }
    };

    fetchServices();
  }, []);

  // Monitor user authentication state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOptionClick = (option: string) => {
    const currentQuestion = questions[currentStep];
    if (!currentQuestion || !currentQuestion.field) {
      console.error('Current question or field is undefined');
      return;
    }
    setCustomerProfile(prev => ({
      ...prev,
      [currentQuestion.field]: option
    }));

    const userMessage: Message = {
      id: Date.now().toString(),
      text: option,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    setTimeout(() => {
      if (nextStep < questions.length) {
        const nextMessage: Message = {
          id: Date.now().toString(),
          text: questions[nextStep].text,
          sender: 'bot',
          timestamp: new Date(),
          options: questions[nextStep].options
        };
        setMessages(prev => [...prev, nextMessage]);
      } else {
        const completionMessage: Message = {
          id: Date.now().toString(),
          text: "Perfeito! Com base nas suas respostas, vou analisar nossos serviços e te dar as melhores recomendações! ✨",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, completionMessage]);
        
        setTimeout(() => {
          processRecommendations();
        }, 1500);
      }
    }, 1000);
  };

  const processRecommendations = async () => {
    setIsTyping(true);
    
    try {
      const aiResponse = await generateAIRecommendations(customerProfile, services.map(service => ({
        ...service,
        duration_minutes: service.duration // Map duration to duration_minutes
      })));
      
      const recommendationMessage: Message = {
        id: Date.now().toString(),
        text: aiResponse.text,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, recommendationMessage]);
        
        setTimeout(() => {
          const bookingMessage: Message = {
            id: Date.now().toString(),
            text: "Gostaria de agendar algum desses serviços? Posso te direcionar para nossa página de agendamento! 📅",
            sender: 'bot',
            timestamp: new Date(),
            options: ['Sim, quero agendar!', 'Preciso pensar mais', 'Tenho outras dúvidas']
          };
          setMessages(prev => [...prev, bookingMessage]);
        }, 2000);
      }, 2000);
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
      setIsTyping(false);
      
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        text: "Com base no seu perfil, recomendo nossos serviços de corte clássico e moderno. Nossa equipe está preparada para atender suas necessidades! Entre em contato para mais informações.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const userMessage = inputValue.trim();
      setInputValue('');
      
      const userMsg: Message = {
        id: Date.now().toString(),
        text: userMessage,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg]);
      
      if (currentStep >= questions.length || isConsultantMode) {
        setIsTyping(true);
        
        try {
          let aiResponse;
          
          if (isConsultantMode) {
            // Modo consultor especializado em barbearia
            const consultantPrompt = `Você é um agente de barbearia especializado com anos de experiência. Responda de forma calorosa, humana e prestativa, mantendo sempre uma postura respeitosa e profissional. 
            
            Você deve conhecer profundamente:
            - Procedimentos de atendimento em barbearia (corte de cabelo, barba, hidratação, pigmentação, etc.)
            - Produtos de higiene pessoal e produtos utilizados em barbearias (shampoo, pomada, óleo para barba, toalhas aquecidas, ceras modeladoras, produtos pós-barba, etc.)
            - Técnicas de corte e estilização modernas e clássicas
            - Cuidados pós-corte e manutenção capilar
            - Tendências e estilos masculinos atuais
            - Tipos de cabelo e suas necessidades específicas
            
            Seu objetivo é oferecer suporte de forma acolhedora, engajando o usuário em uma conversa mais próxima e personalizada. Tente responder e sanar todas as dúvidas do cliente sobre serviços e produtos, sempre mantendo um tom amigável e profissional. Use emojis quando apropriado para tornar a conversa mais calorosa.
            
            Pergunta do cliente: ${userMessage}`;
            
            aiResponse = await generateResponse(consultantPrompt, {
              customerProfile,
              services: services.map(service => ({
                ...service,
                duration_minutes: service.duration
              })),
              conversationHistory: messages.map(m => m.text)
            });
          } else {
            // Modo normal
            aiResponse = await generateResponse(userMessage, {
              customerProfile,
              services: services.map(service => ({
                ...service,
                duration_minutes: service.duration
              })),
              conversationHistory: messages.map(m => m.text)
            });
          }
          
          const botMessage: Message = {
            id: Date.now().toString(),
            text: aiResponse.text,
            sender: 'bot',
            timestamp: new Date()
          };
          
          setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, botMessage]);
          }, 1500);
        } catch (error) {
          console.error('Erro ao gerar resposta:', error);
          setIsTyping(false);
          
          const fallbackMessage: Message = {
            id: Date.now().toString(),
            text: isConsultantMode 
              ? "Desculpe, estou com dificuldades técnicas no momento. Mas posso te ajudar com informações básicas! Nossa barbearia oferece cortes clássicos e modernos, cuidados com barba, tratamentos capilares e usamos produtos de alta qualidade. O que gostaria de saber especificamente? 😊"
              : "Obrigado pela sua mensagem! Nossa equipe está sempre pronta para ajudar. Para mais informações, entre em contato conosco.",
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, fallbackMessage]);
        }
      }
    }
  };

  const handleBookingRedirect = () => {
    window.location.href = '/booking';
  };

  const handleThinkingMore = async () => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: 'Preciso pensar mais',
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Prompt específico para "Preciso pensar mais"
      const thinkingPrompt = `Você é um assistente de barbearia caloroso e humano. O cliente disse que "precisa pensar mais" sobre agendar um serviço. 
      
      Responda com uma mensagem breve e acolhedora que:
      - Mostre compreensão e gratidão pelo interesse
      - Convide o cliente a voltar quando estiver pronto
      - Encerre a conversa de forma cordial
      - Use um tom caloroso, humano e prestativo
      - Mantenha uma postura respeitosa e profissional
      
      Máximo 2-3 frases.`;
      
      const aiResponse = await generateResponse(thinkingPrompt, {
        customerProfile,
        services: services.map(service => ({
          ...service,
          duration_minutes: service.duration
        })),
        conversationHistory: messages.map(m => m.text)
      });
      
      setTimeout(() => {
        setIsTyping(false);
        const responseMessage: Message = {
          id: Date.now().toString(),
          text: aiResponse.text,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, responseMessage]);
        
        // Encerrar a conversa após 3 segundos
        setTimeout(() => {
          setIsOpen(false);
        }, 3000);
      }, 1500);
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      setIsTyping(false);
      
      setTimeout(() => {
        const fallbackMessage: Message = {
          id: Date.now().toString(),
          text: "Entendo perfeitamente! 😊 Tomar uma decisão sobre seu visual é algo importante e merece reflexão. Fico muito grato pelo seu interesse em nossos serviços. Quando estiver pronto para dar esse passo, estaremos aqui de braços abertos para cuidar de você com todo carinho e profissionalismo que merece. Até breve! 👋✨",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMessage]);
        
        // Encerrar a conversa após 3 segundos
        setTimeout(() => {
          setIsOpen(false);
        }, 3000);
      }, 1000);
    }
  };

  const handleOtherQuestions = async () => {
     const userMessage: Message = {
       id: Date.now().toString(),
       text: 'Tenho outras dúvidas',
       sender: 'user',
       timestamp: new Date()
     };
     setMessages(prev => [...prev, userMessage]);
     setIsConsultantMode(true);
     setIsTyping(true);
 
     try {
       // Prompt específico para ativar o agente especializado
       const consultantPrompt = `Você é um agente de barbearia especializado que foi ativado para responder dúvidas. O cliente disse que "tem outras dúvidas".
       
       Você deve conhecer profundamente:
       - Procedimentos de atendimento em barbearia (corte de cabelo, barba, hidratação, etc.)
       - Produtos de higiene pessoal e produtos utilizados em barbearias (shampoo, pomada, óleo para barba, toalhas aquecidas, etc.)
       - Técnicas de corte e estilização
       - Cuidados pós-corte e manutenção
       - Tendências e estilos masculinos
       
       Responda de forma acolhedora, engajando o usuário em uma conversa mais próxima e personalizada. Use um tom amigável e profissional. Apresente-se como consultor especializado e convide o cliente a fazer perguntas sobre serviços e produtos.
       
       Máximo 3-4 frases.`;
       
       const aiResponse = await generateResponse(consultantPrompt, {
         customerProfile,
         services: services.map(service => ({
           ...service,
           duration_minutes: service.duration
         })),
         conversationHistory: messages.map(m => m.text)
       });
       
       setTimeout(() => {
         setIsTyping(false);
         const responseMessage: Message = {
           id: Date.now().toString(),
           text: aiResponse.text,
           sender: 'bot',
           timestamp: new Date()
         };
         setMessages(prev => [...prev, responseMessage]);
       }, 1500);
     } catch (error) {
       console.error('Erro ao gerar resposta:', error);
       setIsTyping(false);
       
       setTimeout(() => {
         const fallbackMessage: Message = {
           id: Date.now().toString(),
           text: "Que ótimo! 😊 Agora sou seu consultor pessoal especializado em barbearia! Estou aqui para esclarecer todas suas dúvidas sobre nossos serviços, produtos e procedimentos. Pode perguntar à vontade sobre cortes, barbas, tratamentos, produtos que usamos, cuidados pós-corte, ou qualquer coisa relacionada ao mundo da barbearia. Como posso te ajudar? 💬✨",
           sender: 'bot',
           timestamp: new Date()
         };
         setMessages(prev => [...prev, fallbackMessage]);
       }, 1000);
     }
   };

  const resetChat = () => {
    setMessages([]);
    setCurrentStep(0);
    setIsConsultantMode(false);
    setCustomerProfile({
      hairType: '',
      preferredStyle: '',
      budget: '',
      frequency: '',
      specialNeeds: ''
    });
    setInputValue('');
    
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: '1',
        text: questions[0].text,
        sender: 'bot',
        timestamp: new Date(),
        options: questions[0].options
      };
      setMessages([welcomeMessage]);
    }, 500);
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-3 left-3 sm:bottom-6 sm:left-6 z-50 group max-w-[calc(100vw-24px)]">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Botão Principal com Animações Avançadas */}
            <div className="relative">
              {/* Anel de Pulso Animado */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse opacity-75 blur-sm"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-ping opacity-50"></div>
              
              <Button
                onClick={() => setIsOpen(true)}
                className="relative w-12 h-12 sm:w-17 sm:h-17 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 hover:rotate-3 p-2 sm:p-4 border-0"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
                <img 
                  src="/barber-icon.svg" 
                  alt="Assistente Virtual" 
                  className="relative z-10 w-5 h-5 sm:w-8.5 sm:h-8.5 object-contain drop-shadow-lg filter brightness-110 contrast-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.innerHTML = '<svg class="relative z-10 w-5 h-5 sm:w-8.5 sm:h-8.5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                    target.parentElement?.appendChild(fallback);
                  }}
                />
                {/* Brilho Interno */}
                <div className="absolute inset-1 sm:inset-2 rounded-full bg-gradient-to-tr from-white/30 to-transparent opacity-60 blur-sm"></div>
              </Button>
            </div>
            
            {/* Texto Melhorado com Animações - Alinhado Horizontalmente */}
            <div className="relative transform transition-all duration-300 group-hover:scale-105 max-w-[153px] sm:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl sm:rounded-2xl blur-md"></div>
              <div className="relative bg-white/95 backdrop-blur-md px-2 py-1 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-xl border border-white/30 group-hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse shadow-lg flex-shrink-0"></div>
                  <span className="text-[9px] sm:text-xs font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent tracking-wide leading-tight">
                    Converse com o James
                  </span>
                  <MessageCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-blue-500 animate-bounce flex-shrink-0" />
                </div>
                <div className="text-[7px] sm:text-[9px] text-gray-500 text-center mt-0.5 sm:mt-1 font-medium leading-tight">
                  ✨ Assistente IA Premium
                </div>
              </div>
            </div>
            
            {/* Partículas Flutuantes - Ajustadas para layout horizontal */}
            <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-blue-400 rounded-full animate-ping opacity-60"></div>
            <div className="absolute -top-0.5 -right-2 sm:-top-1 sm:-right-3 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-purple-400 rounded-full animate-pulse opacity-70"></div>
            <div className="absolute -bottom-0.5 left-8 sm:-bottom-1 sm:left-12 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-pink-400 rounded-full animate-bounce opacity-50"></div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-2 sm:bottom-6 sm:left-6 sm:right-auto sm:top-auto sm:inset-auto z-50 sm:w-96 sm:h-[600px] bg-white rounded-lg sm:rounded-xl shadow-2xl border border-gray-200 flex flex-col max-h-[calc(100vh-16px)] sm:max-h-[600px]">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-t-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                 <Scissors className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                 <h3 className="font-semibold text-sm sm:text-base">Assistente Virtual</h3>
               </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {user?.email === 'egrinaldo19@gmail.com' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGeminiStatus(true)}
                    className="text-white hover:bg-white/20 p-1 h-7 w-7 sm:h-8 sm:w-8"
                    title="Status do Gemini AI"
                  >
                    <Settings className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetChat}
                  className="text-white hover:bg-white/20 p-1 h-7 w-7 sm:h-8 sm:w-8"
                >
                  <span className="text-sm sm:text-base">↻</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 p-1 h-7 w-7 sm:h-8 sm:w-8"
                >
                  <X className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                   <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                     <img 
                       src="/barber-icon.svg" 
                       alt="Bot" 
                       className="w-3.5 h-3.5 sm:w-5 sm:h-5 object-contain"
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none';
                         const fallback = document.createElement('div');
                         fallback.innerHTML = '<svg class="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                         target.parentElement?.appendChild(fallback);
                       }}
                     />
                   </div>
                 )}
                <div
                  className={`max-w-[80%] p-2 sm:p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-white ml-auto'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.text}</p>
                  {message.options && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (option === 'Sim, quero agendar!') {
                              handleBookingRedirect();
                            } else if (option === 'Preciso pensar mais') {
                              handleThinkingMore();
                            } else if (option === 'Tenho outras dúvidas') {
                              handleOtherQuestions();
                            } else {
                              handleOptionClick(option);
                            }
                          }}
                          className="w-full text-left justify-start text-xs h-6 sm:h-8 bg-white hover:bg-gray-50 border-gray-300 px-2 sm:px-3"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                {message.sender === 'user' && (
                  <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start gap-2">
                 <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                   <img 
                     src="/barber-icon.svg" 
                     alt="Bot" 
                     className="w-3.5 h-3.5 sm:w-5 sm:h-5 object-contain"
                     onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.style.display = 'none';
                       const fallback = document.createElement('div');
                       fallback.innerHTML = '<svg class="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                       target.parentElement?.appendChild(fallback);
                     }}
                   />
                 </div>
                <div className="bg-gray-100 p-2 sm:p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {currentStep >= questions.length && (
            <div className="p-3 sm:p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  size="sm"
                  className="px-2 sm:px-3"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {showGeminiStatus && (
        <GeminiStatus 
          isOpen={showGeminiStatus} 
          onClose={() => setShowGeminiStatus(false)} 
        />
      )}
    </>
  );
};

export default ChatBot;