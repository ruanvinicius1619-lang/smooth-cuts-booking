# Configuração do EmailJS para Envio de E-mails

Este guia explica como configurar o EmailJS para enviar e-mails reais através do formulário de contato.

## 1. Criar Conta no EmailJS

1. Acesse [https://www.emailjs.com/](https://www.emailjs.com/)
2. Clique em "Sign Up" e crie uma conta gratuita
3. Confirme seu e-mail

## 2. Configurar Serviço de E-mail

1. No dashboard do EmailJS, vá para "Email Services"
2. Clique em "Add New Service"
3. Escolha seu provedor de e-mail (Gmail, Outlook, etc.)
4. Configure as credenciais do seu e-mail
5. Anote o **Service ID** gerado

## 3. Criar Template de E-mail

1. Vá para "Email Templates"
2. Clique em "Create New Template"
3. Configure o template com as seguintes variáveis:

```
Assunto: Nova mensagem de contato - {{subject}}

De: {{from_name}} ({{from_email}})
Telefone: {{phone}}

Mensagem:
{{message}}

---
Enviado através do site Smooth Cuts
```

4. Anote o **Template ID** gerado

## 4. Obter Chave Pública

1. Vá para "Account" > "General"
2. Copie a **Public Key**

## 5. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` na raiz do projeto:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=seu_service_id_aqui
VITE_EMAILJS_TEMPLATE_ID=seu_template_id_aqui
VITE_EMAILJS_PUBLIC_KEY=sua_public_key_aqui

# E-mail de destino
VITE_CONTACT_EMAIL=seu_email@dominio.com
```

## 6. Reiniciar o Servidor

Após configurar as variáveis de ambiente:

```bash
npm run dev
```

## 7. Testar o Formulário

1. Acesse a página de contato
2. Preencha e envie o formulário
3. Verifique se o e-mail foi recebido

## Limites do Plano Gratuito

- **200 e-mails por mês**
- Sem limite de templates
- Suporte básico

## Troubleshooting

### E-mail não está sendo enviado
1. Verifique se as variáveis de ambiente estão corretas
2. Confirme se o serviço de e-mail está ativo no EmailJS
3. Verifique o console do navegador para erros

### Erro de CORS
- Adicione seu domínio nas configurações de segurança do EmailJS

### Template não encontrado
- Verifique se o Template ID está correto
- Confirme se o template está ativo

## Segurança

- As chaves do EmailJS são seguras para uso no frontend
- Configure filtros de domínio no EmailJS para maior segurança
- Monitore o uso para evitar spam

---

**Nota:** Enquanto o EmailJS não estiver configurado, o formulário funcionará em modo de demonstração, exibindo uma mensagem informativa.