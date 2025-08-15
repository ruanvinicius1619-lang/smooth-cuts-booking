# 🤖 Assistente Virtual da Barbearia

Sistema de chat inteligente integrado à aplicação da barbearia para atendimento personalizado e recomendações de serviços.

## 📋 Funcionalidades

### ✨ Características Principais
- **Chat Interativo**: Interface de chat moderna e responsiva
- **Questionário Inteligente**: Coleta informações do cliente de forma natural
- **Recomendações Personalizadas**: Análise do perfil para sugerir serviços ideais
- **Integração com Agendamento**: Redirecionamento direto para booking
- **IA Conversacional**: Respostas inteligentes baseadas no contexto

### 🎯 Fluxo de Atendimento
1. **Ativação**: Cliente clica no ícone flutuante de chat
2. **Apresentação**: Bot se apresenta e explica o processo
3. **Questionário**: 6 perguntas estratégicas sobre:
   - Nome do cliente
   - Frequência de cortes
   - Estilo preferido
   - Ocasiões especiais
   - Preferência de atendimento
   - Interesse em produtos
4. **Análise**: IA processa respostas e dados dos serviços
5. **Recomendações**: Sugestões personalizadas com justificativas
6. **Ação**: Opções para agendar, esclarecer dúvidas ou finalizar

## 🛠️ Implementação Técnica

### Componentes Criados
- `ChatBot.tsx` - Componente principal do chat
- `useGeminiAI.ts` - Hook para integração com IA
- `gemini.ts` - Configurações para API do Gemini

### Tecnologias Utilizadas
- **React** + **TypeScript**
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **React Router** para navegação
- **Supabase** para dados dos serviços

## 🔧 Configuração

### Integração Atual
O sistema funciona com IA simulada que:
- Analisa o perfil do cliente
- Compara com serviços disponíveis
- Gera recomendações inteligentes
- Responde perguntas comuns

### Integração Real com Gemini AI (Opcional)
Para usar a API real do Google Gemini:

1. **Obter API Key**:
   ```bash
   # Visite: https://makersuite.google.com/app/apikey
   # Crie sua conta e gere uma API key
   ```

2. **Instalar SDK**:
   ```bash
   npm install @google/generative-ai
   ```

3. **Configurar Variáveis de Ambiente**:
   ```bash
   # Crie um arquivo .env.local
   REACT_APP_GEMINI_API_KEY=sua_api_key_aqui
   ```

4. **Ativar Integração**:
   - Descomente o código em `src/config/gemini.ts`
   - Atualize `useGeminiAI.ts` para usar a API real

## 📱 Interface do Usuário

### Ícone Flutuante
- Posicionado no canto inferior direito
- Animação pulsante para chamar atenção
- Design moderno com gradiente

### Janela de Chat
- Dimensões: 384px × 600px
- Header com título e botão fechar
- Área de mensagens com scroll automático
- Campo de input com botão enviar
- Botões de opções para respostas rápidas

### Experiência do Usuário
- **Indicador de digitação**: Animação de pontos
- **Mensagens diferenciadas**: Cores distintas para bot e usuário
- **Opções clicáveis**: Botões para respostas predefinidas
- **Scroll automático**: Sempre mostra a mensagem mais recente
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

## 🎨 Personalização

### Modificar Perguntas
Edite o array `questions` em `ChatBot.tsx`:
```typescript
const questions = [
  {
    text: "Sua pergunta aqui",
    field: 'campo_perfil',
    type: 'text' | 'options',
    options: ['Opção 1', 'Opção 2'] // apenas para type: 'options'
  }
];
```

### Ajustar Lógica de Recomendação
Modifique as funções em `useGeminiAI.ts`:
- `analyzeProfileAndRecommend()` - Lógica de análise
- `formatRecommendationsWithAI()` - Formatação das respostas
- `generateIntelligentResponse()` - Respostas para perguntas livres

### Customizar Aparência
Altere as classes CSS em `ChatBot.tsx`:
- Cores do gradiente
- Tamanhos e posicionamento
- Animações e transições

## 🔍 Monitoramento e Analytics

### Dados Coletados
- Perfil completo do cliente
- Histórico de conversas
- Serviços recomendados
- Ações tomadas (agendamento, etc.)

### Possíveis Integrações
- Google Analytics para tracking
- Supabase para armazenar conversas
- Métricas de conversão
- Feedback dos clientes

## 🚀 Próximos Passos

### Melhorias Sugeridas
1. **Persistência de Dados**:
   - Salvar conversas no Supabase
   - Histórico de clientes
   - Preferências salvas

2. **Funcionalidades Avançadas**:
   - Upload de fotos para análise
   - Integração com calendário
   - Notificações push
   - Chat em tempo real

3. **Analytics e BI**:
   - Dashboard de métricas
   - Relatórios de conversão
   - Análise de satisfação
   - Otimização de recomendações

4. **Integrações Externas**:
   - WhatsApp Business API
   - Facebook Messenger
   - Instagram Direct
   - SMS/Telegram

## 📞 Suporte

Para dúvidas sobre implementação ou customização:
- Consulte a documentação do React
- Verifique a documentação do Supabase
- Consulte a API do Google Gemini
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ para proporcionar a melhor experiência de atendimento na barbearia!**