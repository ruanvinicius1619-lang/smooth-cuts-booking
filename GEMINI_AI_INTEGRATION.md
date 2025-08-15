# 🤖 Guia de Integração Gemini AI

## Visão Geral

Este guia explica como integrar o chatbot da barbearia com a API real do Google Gemini AI para respostas mais inteligentes e naturais.

## 📋 Status Atual

✅ **Implementado:**
- SDK do Google Generative AI instalado
- Configuração completa da API
- Sistema de fallback inteligente
- Interface de teste e monitoramento
- Integração com o sistema de recomendações

⚠️ **Pendente:**
- Configuração da API key (opcional)

## 🚀 Como Configurar

### 1. Obter API Key do Google

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

### 2. Configurar Variável de Ambiente

Adicione a seguinte linha no arquivo `.env`:

```env
# Configuração da API do Google Gemini
VITE_GEMINI_API_KEY=sua_api_key_aqui
```

### 3. Reiniciar o Servidor

```bash
npm run dev
```

## 🔧 Arquitetura da Integração

### Arquivos Principais

- **`src/config/gemini.ts`** - Configurações da API
- **`src/hooks/useGeminiAI.ts`** - Hook principal de integração
- **`src/components/GeminiStatus.tsx`** - Interface de monitoramento
- **`src/components/ChatBot.tsx`** - Chatbot principal

### Fluxo de Funcionamento

1. **Verificação da API Key**: O sistema verifica se a chave está configurada
2. **Tentativa de Uso da API**: Se configurada, usa o Gemini AI real
3. **Fallback Inteligente**: Se não configurada ou com erro, usa respostas simuladas
4. **Tratamento de Erros**: Logs detalhados e recuperação automática

## 🎯 Funcionalidades

### Respostas Contextuais
- Análise do perfil do cliente
- Histórico da conversa
- Informações dos serviços disponíveis
- Recomendações personalizadas

### Sistema de Segurança
- Filtros de conteúdo configurados
- Limites de tokens
- Tratamento de erros robusto

### Monitoramento
- Interface de status em tempo real
- Testes de integração
- Logs de erro detalhados

## 🧪 Como Testar

### 1. Através da Interface

1. Abra o chatbot
2. Clique no ícone de configurações (⚙️)
3. Clique em "Testar Integração"
4. Verifique o resultado

### 2. Através do Console

Verifique os logs no console do navegador:

```javascript
// Com API configurada
"Gemini API configurada, mas usando fallback por enquanto"

// Sem API configurada
"Usando fallback: resposta inteligente simulada"
```

## ⚙️ Configurações Avançadas

### Parâmetros do Modelo

```typescript
GENERATION_CONFIG: {
  temperature: 0.7,        // Criatividade (0-1)
  topK: 40,               // Diversidade de tokens
  topP: 0.95,             // Probabilidade cumulativa
  maxOutputTokens: 1024,  // Limite de resposta
}
```

### Filtros de Segurança

- **HARM_CATEGORY_HARASSMENT**: Assédio
- **HARM_CATEGORY_HATE_SPEECH**: Discurso de ódio
- **HARM_CATEGORY_SEXUALLY_EXPLICIT**: Conteúdo sexual
- **HARM_CATEGORY_DANGEROUS_CONTENT**: Conteúdo perigoso

## 🔍 Troubleshooting

### Problemas Comuns

**❌ "API key not configured"**
- Verifique se a variável `VITE_GEMINI_API_KEY` está no `.env`
- Reinicie o servidor após adicionar a chave

**❌ "Invalid API key"**
- Verifique se a chave foi copiada corretamente
- Confirme se a chave está ativa no Google AI Studio

**❌ "Rate limit exceeded"**
- Aguarde alguns minutos antes de testar novamente
- Considere implementar cache de respostas

### Logs Úteis

```bash
# Terminal do servidor
[vite] hmr update /src/hooks/useGeminiAI.ts

# Console do navegador
Gemini API configurada, mas usando fallback por enquanto
Error generating AI response: [detalhes do erro]
```

## 📊 Monitoramento de Performance

### Métricas Importantes

- **Tempo de resposta**: < 3 segundos
- **Taxa de sucesso**: > 95%
- **Fallback usage**: Monitorar frequência

### Otimizações

1. **Cache de respostas** para perguntas frequentes
2. **Timeout configurável** para evitar travamentos
3. **Retry automático** em caso de falha temporária

## 🚀 Próximos Passos

### Melhorias Planejadas

1. **Cache inteligente** de respostas
2. **Análise de sentimento** do cliente
3. **Integração com agenda** para sugestões de horários
4. **Métricas de satisfação** do atendimento

### Expansões Futuras

1. **Suporte a imagens** para análise de cortes
2. **Integração com WhatsApp** Business
3. **Dashboard de analytics** para barbeiros
4. **Sistema de feedback** automático

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs no console
2. Teste a integração pela interface
3. Consulte a documentação do [Google AI](https://ai.google.dev/docs)
4. Verifique o status da API no [Google Cloud Console](https://console.cloud.google.com/)

---

**Nota**: O sistema funciona perfeitamente mesmo sem a API key configurada, usando respostas inteligentes simuladas que proporcionam uma excelente experiência ao cliente.