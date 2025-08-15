const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jheywkeofcttgdgquawm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZXl3a2VvZmN0dGdkZ3F1YXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMjc2MjAsImV4cCI6MjA3MDcwMzYyMH0.6vOdNR1-h0ac_STZFp4ITuI8p5fjEVlnZkUT2hSxKX0'
);

async function checkProfilesData() {
  console.log('🔍 Verificando dados na tabela profiles...');
  
  try {
    // Buscar todos os perfis
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error('❌ Erro ao buscar perfis:', error);
      return;
    }
    
    console.log(`✅ Perfis encontrados: ${profiles?.length || 0}`);
    
    if (profiles && profiles.length > 0) {
      console.log('\n📋 Lista de perfis:');
      profiles.forEach((profile, index) => {
        console.log(`\n${index + 1}. Perfil:`);
        console.log(`   ID: ${profile.id}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Nome: ${profile.full_name || 'Não informado'}`);
        console.log(`   Telefone: ${profile.phone || 'Não informado'}`);
        console.log(`   Criado em: ${profile.created_at}`);
      });
    } else {
      console.log('\n⚠️ Nenhum perfil encontrado na tabela profiles.');
      console.log('\n💡 Isso explica por que os agendamentos mostram "Nome não configurado".');
      console.log('\n🔧 Soluções possíveis:');
      console.log('   1. Criar perfis automaticamente quando usuários se registram');
      console.log('   2. Criar perfis manualmente para usuários existentes');
      console.log('   3. Modificar a lógica para buscar dados de auth.users diretamente');
    }
    
    // Verificar também usuários na tabela auth.users (se possível)
    console.log('\n🔍 Tentando verificar usuários na tabela auth.users...');
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email, created_at');
    
    if (authError) {
      console.log('⚠️ Não foi possível acessar auth.users (normal para usuários não-admin)');
    } else {
      console.log(`✅ Usuários auth encontrados: ${authUsers?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkProfilesData();