const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
  console.error('❌ Erro: Variáveis de ambiente necessárias não encontradas');
  process.exit(1);
}

// Usar service role key se disponível, senão usar anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfilesTable() {
  console.log('🔍 Verificando tabela profiles...');
  
  try {
    // Verificar se a tabela profiles tem dados
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('❌ Erro ao consultar tabela profiles:', profilesError.message);
      return;
    }
    
    console.log(`\n📊 Total de perfis na tabela: ${profiles.length}`);
    
    if (profiles.length === 0) {
      console.log('\n⚠️  A tabela profiles está vazia!');
      console.log('\n📋 SOLUÇÃO:');
      console.log('1. Execute: node scripts/fix-profiles-without-fk.cjs');
      console.log('2. Copie os comandos SQL gerados');
      console.log('3. Vá para o Supabase Dashboard > SQL Editor');
      console.log('4. Execute os comandos SQL');
      console.log('\nApós isso, a aba "Gerenciar Perfis de Usuário" mostrará os usuários.');
    } else {
      console.log('\n👥 Perfis encontrados:');
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name} (${profile.email}) - ${profile.user_role}`);
      });
      
      console.log('\n✅ A tabela profiles tem dados!');
      console.log('\n🔍 Se os usuários não aparecem na aba, verifique:');
      console.log('1. Se você está logado como administrador');
      console.log('2. Se a aba "Gerenciar Perfis de Usuário" está visível');
      console.log('3. Se há erros no console do navegador');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

checkProfilesTable();