-- Script SQL para configurar sincronização automática de perfis
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar ou atualizar a função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir novo usuário na tabela profiles automaticamente
  INSERT INTO public.profiles (id, full_name, email, user_role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'Cliente', -- Todos os novos usuários são criados como Cliente por padrão
    NEW.created_at,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', profiles.full_name),
    email = NEW.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Criar trigger para sincronização automática
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verificar se o trigger foi criado com sucesso
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
AND event_object_table = 'users';

-- 5. Testar a função manualmente (opcional)
-- Você pode executar este comando para testar se a função está funcionando:
-- SELECT public.handle_new_user();

/*
APÓS EXECUTAR ESTE SCRIPT:

✅ FUNCIONALIDADE ATIVADA:
- Todos os novos usuários que se cadastrarem na aplicação serão automaticamente
  adicionados à tabela 'profiles' com o perfil 'Cliente'
- Não será mais necessário sincronizar manualmente

🧪 COMO TESTAR:
1. Cadastre um novo usuário na aplicação
2. Faça login como administrador
3. Vá para a aba "Gerenciar Perfis de Usuário"
4. O novo usuário deve aparecer automaticamente na lista

⚙️ CONFIGURAÇÃO:
- Novos usuários são criados como 'Cliente' por padrão
- Administradores podem alterar o perfil depois se necessário
- O nome completo é extraído dos metadados do usuário (se fornecido)

🔧 MANUTENÇÃO:
- Este trigger permanecerá ativo até ser removido manualmente
- Para desativar: DROP TRIGGER on_auth_user_created ON auth.users;
- Para reativar: Execute novamente os comandos 2 e 3 deste script
*/