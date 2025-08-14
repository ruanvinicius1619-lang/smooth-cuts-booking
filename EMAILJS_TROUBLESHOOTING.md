# Troubleshooting EmailJS

Este guia ajuda a resolver problemas comuns com o envio de e-mails através do EmailJS.

## Problemas Mais Comuns

### 1. E-mails não são enviados

**Possíveis causas:**
- Service ID incorreto
- Template ID incorreto
- Public Key incorreta
- Template mal configurado no EmailJS
- Serviço de e-mail não autorizado

**Soluções:**
1. Verifique as configurações no `.env.local`:
   ```env
   VITE_EMAILJS_SERVICE_ID=gmailMessage
   VITE_EMAILJS_TEMPLATE_ID=template_fj5luot
   VITE_EMAILJS_PUBLIC_KEY=2xNo3p1NTSk0-1Goa
   VITE_CONTACT_EMAIL=egrinaldo19@gmail.com
   ```

2. Confirme no dashboard do EmailJS:
   - Service está ativo
   - Template existe e está configurado
   - Public Key está correta

### 2. Erro 403 (Forbidden)

**Causa:** Public Key incorreta ou serviço não autorizado

**Solução:**
1. Verifique a Public Key no dashboard do EmailJS
2. Confirme que o domínio está autorizado (para produção)

### 3. Erro 404 (Not Found)

**Causa:** Service ID ou Template ID incorretos

**Solução:**
1. Verifique os IDs no dashboard do EmailJS
2. Confirme que estão exatamente iguais no `.env.local`

### 4. Template Variables não funcionam

**Causa:** Nomes das variáveis não coincidem

**Solução:**
Confirme que o template no EmailJS usa estas variáveis:
- `{{from_name}}` - Nome do remetente
- `{{from_email}}` - E-mail do remetente
- `{{phone}}` - Telefone
- `{{subject}}` - Assunto
- `{{message}}` - Mensagem
- `{{to_email}}` - E-mail de destino

## Como Testar

### 1. Teste Básico
Abra o arquivo `test-emailjs.html` no navegador e teste o envio.

### 2. Teste na Aplicação
1. Abra o console do navegador (F12)
2. Vá para a página de contato
3. Preencha e envie o formulário
4. Verifique os logs no console

### 3. Verificar Configurações
No console, você deve ver:
```
Configurações EmailJS: {
  serviceId: "gmailMessage",
  templateId: "template_fj5luot", 
  publicKey: "2xNo3p1NTS..."
}
```

## Logs Úteis

### Sucesso
```
E-mail enviado com sucesso: {status: 200, text: "OK"}
```

### Erro Comum
```
Erro específico do EmailJS: {status: 403, text: "Forbidden"}
```

## Configuração do Template no EmailJS

Template de exemplo:
```
Assunto: Nova mensagem de contato - {{subject}}

De: {{from_name}} ({{from_email}})
Telefone: {{phone}}

Mensagem:
{{message}}

---
Enviado através do site Smooth Cuts
Para: {{to_email}}
```

## Verificação Rápida

1. ✅ Service ID correto: `gmailMessage`
2. ✅ Template ID correto: `template_fj5luot`
3. ✅ Public Key configurada
4. ✅ Template criado no EmailJS
5. ✅ Serviço de e-mail conectado
6. ✅ Variáveis do template corretas

## Contato para Suporte

Se o problema persistir:
1. Verifique os logs do console
2. Teste com o arquivo `test-emailjs.html`
3. Confirme as configurações no dashboard do EmailJS
4. Verifique se o e-mail de destino está correto