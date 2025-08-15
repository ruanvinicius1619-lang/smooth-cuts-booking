# 🔧 Criação Manual do Usuário Barbeiro

Como você não consegue fazer login com as credenciais do barbeiro, precisamos criar o usuário manualmente no Supabase.

## 📋 Opção 1: Via Dashboard do Supabase (Recomendado)

### Passo 1: Acesse o Dashboard
1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `smooth-cuts-booking`

### Passo 2: Criar o Usuário
1. No menu lateral, clique em **"Authentication"**
2. Clique na aba **"Users"**
3. Clique no botão **"Add user"** (ou "Invite user")
4. Preencha os dados:
   - **Email**: `barbeiro@smoothcuts.com`
   - **Password**: `123456`
   - **Confirm Password**: `123456`
   - **Auto Confirm User**: ✅ (marque esta opção)

### Passo 3: Adicionar Metadados (Opcional)
1. Após criar o usuário, clique nele na lista
2. Na seção **"User Metadata"**, adicione:
   ```json
   {
     "full_name": "Barbeiro Principal",
     "phone": "(11) 99999-9999"
   }
   ```
3. Clique em **"Update user"**

## 📋 Opção 2: Via SQL Editor

### Passo 1: Acesse o SQL Editor
1. No dashboard do Supabase, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 2: Execute o SQL
```sql
-- Criar usuário barbeiro
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'barbeiro@smoothcuts.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Barbeiro Principal", "phone": "(11) 99999-9999"}'
);
```

## ✅ Verificação

Após criar o usuário:

1. **Teste o Login**:
   - Acesse: http://localhost:8080/auth
   - Email: `barbeiro@smoothcuts.com`
   - Senha: `123456`

2. **Acesse o Painel**:
   - Após o login, vá para: http://localhost:8080/barber
   - Você deve ver o painel de agendamentos do barbeiro

## 🔍 Solução de Problemas

### Se ainda não conseguir fazer login:

1. **Verifique se o usuário foi criado**:
   - No dashboard do Supabase > Authentication > Users
   - Procure por `barbeiro@smoothcuts.com`

2. **Verifique se o email está confirmado**:
   - O usuário deve ter `email_confirmed_at` preenchido
   - Se não, clique no usuário e marque "Email confirmed"

3. **Teste com outro email**:
   - Tente criar com um email diferente, como `teste@barbeiro.com`

4. **Limpe o cache do navegador**:
   - Pressione `Ctrl + Shift + R` para recarregar sem cache

## 📞 Credenciais Finais

```
Email: barbeiro@smoothcuts.com
Senha: 123456
```

**Importante**: Após o primeiro login, você pode alterar a senha nas configurações do perfil.