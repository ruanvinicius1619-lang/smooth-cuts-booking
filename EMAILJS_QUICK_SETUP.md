# Configuração Rápida do EmailJS

## ⚠️ PROBLEMA ATUAL
O EmailJS não está configurado corretamente. O Template ID precisa ser substituído por um valor válido.

## 🔧 SOLUÇÃO RÁPIDA

### 1. Acesse o Dashboard do EmailJS
- Vá para: https://dashboard.emailjs.com/admin/templates
- Faça login na sua conta

### 2. Crie um Novo Template
1. Clique em "Create New Template"
2. Escolha "Contact Us" como base
3. Configure o template com este conteúdo:

**Subject:** Nova mensagem de contato - {{subject}}

**Content:**
```
Nova mensagem recebida através do site:

Nome: {{name}}
E-mail: {{email}}
Telefone: {{phone}}
Assunto: {{subject}}

Mensagem:
{{message}}

---
Enviado através do formulário de contato do Smooth Cuts
```

**To Email:** egrinaldo19@gmail.com
**From Name:** {{name}}
**Reply-To:** {{email}}

4. Salve o template
5. **COPIE O TEMPLATE ID** que aparece (ex: template_abc123)

### 3. Atualize o .env.local
Substitua esta linha no arquivo `.env.local`:
```
VITE_EMAILJS_TEMPLATE_ID=template_SUBSTITUA_PELO_SEU_TEMPLATE_ID
```

Por:
```
VITE_EMAILJS_TEMPLATE_ID=SEU_TEMPLATE_ID_COPIADO
```

### 4. Reinicie o Servidor
```bash
npm run dev
```

## ✅ TESTE
Após configurar:
1. Acesse a página de contato
2. Preencha o formulário
3. Envie a mensagem
4. Verifique seu e-mail

## 📋 DADOS CAPTURADOS
O formulário está capturando corretamente:
- ✅ Nome: Egrinaldo Ferreira de Cerqueira Junior
- ✅ E-mail: egrinaldo19@gmail.com
- ✅ Telefone: 71993163034
- ✅ Assunto: testeA
- ✅ Mensagem: asdasdasdasdasd

**O problema é apenas a configuração do Template ID no EmailJS!**