-- Script SQL para excluir usuários de exemplo com domínio 'exemplo.com'
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Primeiro, verificar quais usuários de exemplo existem
SELECT 'auth.users' as tabela, id, email, created_at 
FROM auth.users 
WHERE email LIKE '%@exemplo.com'
UNION ALL
SELECT 'public.profiles' as tabela, id, email, created_at 
FROM public.profiles 
WHERE email LIKE '%@exemplo.com'
ORDER BY tabela, email;

-- 2. Excluir da tabela public.profiles primeiro (devido às foreign keys)
DELETE FROM public.profiles 
WHERE email LIKE '%@exemplo.com';

-- 3. Excluir da tabela auth.users
DELETE FROM auth.users 
WHERE email LIKE '%@exemplo.com';

-- 4. Verificar se a exclusão foi bem-sucedida
SELECT 'Usuários restantes em auth.users' as status, COUNT(*) as total
FROM auth.users 
WHERE email LIKE '%@exemplo.com'
UNION ALL
SELECT 'Usuários restantes em public.profiles' as status, COUNT(*) as total
FROM public.profiles 
WHERE email LIKE '%@exemplo.com';

-- 5. Listar todos os usuários reais restantes
SELECT 
  p.email,
  p.full_name,
  p.user_role,
  p.created_at
FROM public.profiles p
WHERE p.email NOT LIKE '%@exemplo.com'
ORDER BY p.user_role, p.email;

/*
ESTES USUÁRIOS SERÃO EXCLUÍDOS:
- carlos@exemplo.com
- ana@exemplo.com
- cliente1@exemplo.com até cliente10@exemplo.com
- Qualquer outro usuário com domínio @exemplo.com

⚠️ ATENÇÃO:
- Esta operação é IRREVERSÍVEL
- Certifique-se de que estes são realmente usuários de teste
- Execute primeiro a consulta de verificação (item 1) para confirmar

✅ APÓS A EXECUÇÃO:
- Todos os usuários de exemplo serão removidos
- Apenas usuários reais permanecerão no sistema
- A aplicação funcionará normalmente
*/