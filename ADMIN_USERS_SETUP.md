# Configuração de Usuários Administradores

Este guia explica como criar automaticamente os usuários administradores no Supabase para evitar erros de cadastro manual.

## 🎯 Objetivo

O script `create-admin-users.js` cria automaticamente os usuários administradores no Supabase com as credenciais padrão, evitando o erro "Email address is invalid" durante o cadastro manual.

## 📋 Pré-requisitos

### 1. Chave de Serviço do Supabase

Você precisa da chave de serviço (service_role key) do seu projeto Supabase:

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings → API**
4. Copie a chave **service_role** (não a anon key)

### 2. Configurar Variável de Ambiente

**Windows (PowerShell):**
```powershell
$env:SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZXl3a2VvZmN0dGdkZ3F1YXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyNzYyMCwiZXhwIjoyMDcwNzAzNjIwfQ.894mOBJuGwWSoCkJOdBSud_-bh5luqz_etjepH-HVjw
```

**Windows (CMD):**
```cmd
set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZXl3a2VvZmN0dGdkZ3F1YXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyNzYyMCwiZXhwIjoyMDcwNzAzNjIwfQ.894mOBJuGwWSoCkJOdBSud_-bh5luqz_etjepH-HVjw
```

**Linux/Mac:**
```bash
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZXl3a2VvZmN0dGdkZ3F1YXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyNzYyMCwiZXhwIjoyMDcwNzAzNjIwfQ.894mOBJuGwWSoCkJOdBSud_-bh5luqz_etjepH-HVjw
```

## 🚀 Como Executar

### Método 1: Via npm script
```bash
npm run create-admins
```

### Método 2: Diretamente
```bash
node scripts/create-admin-users.js
```

## 👥 Usuários que serão criados

O script criará automaticamente os seguintes usuários:

| Email | Senha | Nome | Telefone |
|-------|-------|------|----------|
| admin@mateusbarber.com | 1233 | Administrador Principal | (11) 99999-9999 |
| mateus@mateusbarber.com | 1233 | Mateus - Proprietário | (11) 98888-8888 |
| gerente@mateusbarber.com | 1233 | Gerente da Barbearia | (11) 97777-7777 |

## ✅ Vantagens do Script

- ✅ **Evita erros de validação**: Usa a API administrativa do Supabase
- ✅ **Confirma email automaticamente**: Não precisa verificar email
- ✅ **Detecta usuários existentes**: Não tenta recriar usuários já existentes
- ✅ **Seguro**: Usa chave de serviço com permissões administrativas
- ✅ **Relatório detalhado**: Mostra sucessos e erros

## 🔧 Exemplo de Execução

```bash
$ npm run create-admins

🚀 Script de Criação de Usuários Administradores

📋 Usuários que serão criados:
   - admin@mateusbarber.com (Administrador Principal)
   - mateus@mateusbarber.com (Mateus - Proprietário)
   - gerente@mateusbarber.com (Gerente da Barbearia)

❓ Deseja continuar? (s/N): s

🔧 Iniciando criação de usuários administradores...
✅ Cliente Supabase configurado com chave de serviço

⏳ Criando usuário: admin@mateusbarber.com
✅ Usuário admin@mateusbarber.com criado com sucesso!
   ID: 12345678-1234-1234-1234-123456789abc

⏳ Criando usuário: mateus@mateusbarber.com
✅ Usuário mateus@mateusbarber.com criado com sucesso!
   ID: 87654321-4321-4321-4321-cba987654321

⏳ Criando usuário: gerente@mateusbarber.com
ℹ️  Usuário gerente@mateusbarber.com já existe

📊 RESUMO:
✅ Sucessos: 3
❌ Erros: 0

🎉 Usuários administradores criados!

📝 Credenciais de acesso:
   Email: admin@mateusbarber.com
   Senha: 1233

   Email: mateus@mateusbarber.com
   Senha: 1233

   Email: gerente@mateusbarber.com
   Senha: 1233

🔐 IMPORTANTE: Altere as senhas após o primeiro login!
```

## 🔒 Segurança

### ⚠️ Importante:
- A chave de serviço tem permissões administrativas completas
- Nunca compartilhe ou commite a chave de serviço no código
- Use apenas em ambiente de desenvolvimento/configuração
- Altere as senhas padrão após o primeiro login

### 🛡️ Boas Práticas:
1. Configure a chave de serviço apenas quando necessário
2. Remova a variável de ambiente após usar o script
3. Use senhas fortes em produção
4. Configure autenticação de dois fatores se disponível

## 🐛 Solução de Problemas

### Erro: "Chave de serviço não configurada"
```bash
❌ ERRO: Chave de serviço do Supabase não configurada!
```
**Solução:** Configure a variável de ambiente `SUPABASE_SERVICE_ROLE_KEY`

### Erro: "Invalid API key"
```bash
❌ Erro ao criar admin@mateusbarber.com: Invalid API key
```
**Solução:** Verifique se você copiou a chave **service_role** (não a anon key)

### Erro: "User already registered"
```bash
ℹ️  Usuário admin@mateusbarber.com já existe
```
**Solução:** Este não é um erro, o usuário já foi criado anteriormente

## 📞 Suporte

Se encontrar problemas:
1. Verifique se a chave de serviço está correta
2. Confirme que o projeto Supabase está ativo
3. Verifique a conexão com a internet
4. Consulte os logs detalhados do script

---

**Após executar o script com sucesso, você poderá fazer login normalmente com qualquer um dos emails de administrador usando a senha `1233`.**