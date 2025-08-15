const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAutoSyncProfiles() {
  console.log('🔧 Configurando sincronização automática de perfis...');
  
  try {
    // SQL para criar/atualizar a função e trigger de sincronização automática
    const setupSQL = `
      -- Criar ou atualizar a função handle_new_user
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id, full_name, email, user_role, created_at, updated_at)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
          NEW.email,
          'Cliente',
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
      
      -- Remover trigger existente se houver
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      
      -- Criar trigger para sincronização automática
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      
      -- Verificar se o trigger foi criado
      SELECT 
        trigger_name,
        event_manipulation,
        event_object_table,
        action_statement
      FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created';
    `;
    
    console.log('📝 Executando SQL para configurar sincronização automática...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: setupSQL
    });
    
    if (error) {
      console.error('❌ Erro ao executar SQL:', error.message);
      
      // Tentar executar manualmente cada comando
      console.log('\n🔄 Tentando executar comandos individualmente...');
      
      // Criar função
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.profiles (id, full_name, email, user_role, created_at, updated_at)
          VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            NEW.email,
            'Cliente',
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
      `;
      
      const { error: funcError } = await supabase.rpc('exec_sql', {
        sql: createFunctionSQL
      });
      
      if (funcError) {
        console.error('❌ Erro ao criar função:', funcError.message);
        console.log('\n📋 Execute manualmente no SQL Editor do Supabase:');
        console.log(createFunctionSQL);
        return;
      }
      
      console.log('✅ Função handle_new_user criada com sucesso!');
      
      // Criar trigger
      const createTriggerSQL = `
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `;
      
      const { error: triggerError } = await supabase.rpc('exec_sql', {
        sql: createTriggerSQL
      });
      
      if (triggerError) {
        console.error('❌ Erro ao criar trigger:', triggerError.message);
        console.log('\n📋 Execute manualmente no SQL Editor do Supabase:');
        console.log(createTriggerSQL);
        return;
      }
      
      console.log('✅ Trigger on_auth_user_created criado com sucesso!');
    } else {
      console.log('✅ Sincronização automática configurada com sucesso!');
    }
    
    // Verificar se o trigger está ativo
    console.log('\n🔍 Verificando se o trigger está ativo...');
    
    const { data: triggerData, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, event_object_table')
      .eq('trigger_name', 'on_auth_user_created');
    
    if (triggerError) {
      console.log('⚠️  Não foi possível verificar o trigger automaticamente');
    } else if (triggerData && triggerData.length > 0) {
      console.log('✅ Trigger encontrado e ativo:');
      triggerData.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name} em ${trigger.event_object_table}`);
      });
    } else {
      console.log('⚠️  Trigger não encontrado. Execute manualmente:');
      console.log(`
-- Criar função
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, user_role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'Cliente',
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

-- Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`);
    }
    
    console.log('\n🎉 Configuração concluída!');
    console.log('\n📋 A partir de agora, todos os novos usuários que se cadastrarem');
    console.log('   serão automaticamente adicionados à tabela profiles como "Cliente".');
    console.log('\n💡 Para testar:');
    console.log('   1. Cadastre um novo usuário na aplicação');
    console.log('   2. Verifique se ele aparece automaticamente na aba "Gerenciar Perfis"');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    console.log('\n📋 Execute manualmente no SQL Editor do Supabase:');
    console.log(`
-- Função para sincronização automática
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, user_role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'Cliente',
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

-- Trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`);
  }
}

setupAutoSyncProfiles();