-- Comandos SQL para inserir usuários reais na tabela profiles
-- Execute estes comandos no SQL Editor do Supabase

-- Primeiro, verificar se os usuários existem na tabela auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email IN ('egrinaldo19@gmail.com', 'egrinaldo25@outlook.com');

-- Se os usuários existem na auth.users, inserir na tabela profiles
-- Substitua os UUIDs pelos IDs reais retornados na consulta acima

-- Inserir egrinaldo19@gmail.com (substitua o UUID pelo ID real)
INSERT INTO public.profiles (id, full_name, email, user_role, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', 'Egrinaldo Silva') as full_name,
  email,
  'Cliente' as user_role,
  created_at,
  now() as updated_at
FROM auth.users 
WHERE email = 'egrinaldo19@gmail.com'
ON CONFLICT (email) DO UPDATE SET
  user_role = 'Cliente',
  updated_at = now();

-- Inserir egrinaldo25@outlook.com (substitua o UUID pelo ID real)
INSERT INTO public.profiles (id, full_name, email, user_role, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', 'Egrinaldo Oliveira') as full_name,
  email,
  'Cliente' as user_role,
  created_at,
  now() as updated_at
FROM auth.users 
WHERE email = 'egrinaldo25@outlook.com'
ON CONFLICT (email) DO UPDATE SET
  user_role = 'Cliente',
  updated_at = now();

-- Verificar se os perfis foram inseridos
SELECT id, email, full_name, user_role, created_at 
FROM public.profiles 
WHERE email IN ('egrinaldo19@gmail.com', 'egrinaldo25@outlook.com')
ORDER BY email;