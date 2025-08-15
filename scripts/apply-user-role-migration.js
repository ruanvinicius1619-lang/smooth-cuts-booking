import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env' });

// Configuração do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://jheywkeofcttgdgquawm.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyUserRoleMigration() {
  console.log('🚀 Iniciando aplicação da migração de perfil de usuário...');
  
  try {
    // 1. Verificar se a coluna user_role já existe
    console.log('📋 Verificando estrutura atual da tabela profiles...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erro ao verificar tabela profiles:', profilesError.message);
      return;
    }
    
    // Verificar se a coluna user_role existe
    const hasUserRoleColumn = profiles && profiles.length > 0 && 'user_role' in profiles[0];
    
    if (hasUserRoleColumn) {
      console.log('✅ Coluna user_role já existe na tabela profiles');
    } else {
      console.log('⚠️  Coluna user_role não encontrada. Será necessário aplicar a migração via SQL Editor do Supabase.');
      console.log('\n📋 INSTRUÇÕES PARA APLICAR A MIGRAÇÃO:');
      console.log('1. Acesse https://supabase.com/dashboard/project/jheywkeofcttgdgquawm/sql/new');
      console.log('2. Execute o seguinte SQL:');
      console.log('\n```sql');
      console.log('-- Adicionar coluna user_role na tabela profiles');
      console.log(`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'Cliente' NOT NULL;`);
      console.log('');
      console.log('-- Criar índice para melhor performance');
      console.log('CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON public.profiles(user_role);');
      console.log('');
      console.log('-- Atualizar função handle_new_user para incluir user_role');
      console.log('CREATE OR REPLACE FUNCTION public.handle_new_user()');
      console.log('RETURNS TRIGGER AS $$');
      console.log('BEGIN');
      console.log('  INSERT INTO public.profiles (id, full_name, email, user_role)');
      console.log('  VALUES (');
      console.log('    NEW.id,');
      console.log(`    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),`);
      console.log('    NEW.email,');
      console.log(`    'Cliente'`);
      console.log('  );');
      console.log('  RETURN NEW;');
      console.log('END;');
      console.log('$$ LANGUAGE plpgsql SECURITY DEFINER;');
      console.log('```\n');
    }
    
    // 2. Atualizar usuários específicos para perfil Cliente
    console.log('\n👥 Atualizando perfil dos usuários específicos...');
    
    const targetEmails = ['egrinaldo19@gmail.com', 'egrinaldo25@outlook.com'];
    
    for (const email of targetEmails) {
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ user_role: 'Cliente' })
        .eq('email', email)
        .select();
      
      if (updateError) {
        console.error(`❌ Erro ao atualizar usuário ${email}:`, updateError.message);
      } else if (updateData && updateData.length > 0) {
        console.log(`✅ Usuário ${email} atualizado para perfil Cliente`);
      } else {
        console.log(`⚠️  Usuário ${email} não encontrado na base de dados`);
      }
    }
    
    // 3. Verificar resultado final
    console.log('\n📊 Verificando resultado final...');
    
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('email, user_role')
      .order('email');
    
    if (allProfilesError) {
      console.error('❌ Erro ao verificar perfis:', allProfilesError.message);
    } else {
      console.log('\n📋 Perfis atuais:');
      allProfiles?.forEach(profile => {
        const role = profile.user_role || 'Não definido';
        console.log(`  • ${profile.email}: ${role}`);
      });
    }
    
    console.log('\n🎉 Migração de perfil de usuário concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
  }
}

// Executar a migração
applyUserRoleMigration();