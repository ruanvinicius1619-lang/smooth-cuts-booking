const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e uma chave do Supabase são obrigatórias');
  console.log('Certifique-se de que o arquivo .env contém:');
  console.log('VITE_SUPABASE_URL=sua_url_do_supabase');
  console.log('VITE_SUPABASE_ANON_KEY=sua_anon_key (ou SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

console.log(`🔑 Usando chave: ${supabaseKey.substring(0, 20)}...`);

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function populateProfilesWithBypassRLS() {
  console.log('🔧 Iniciando população da tabela profiles com bypass do RLS...');
  
  try {
    // 1. Verificar se a tabela profiles existe
    console.log('\n📋 Verificando se a tabela profiles existe...');
    const { data: tables, error: tableError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erro ao verificar tabela profiles:', tableError.message);
      console.log('\n📝 Execute primeiro o script create-profiles-table-direct.cjs para criar a tabela.');
      return;
    }
    
    console.log('✅ Tabela profiles encontrada!');
    
    // 2. Verificar quantos perfis já existem
    const { data: existingProfiles, error: countError } = await supabase
      .from('profiles')
      .select('id, email, user_role');
    
    if (countError) {
      console.error('❌ Erro ao contar perfis existentes:', countError.message);
      return;
    }
    
    console.log(`\n📊 Perfis existentes: ${existingProfiles?.length || 0}`);
    if (existingProfiles && existingProfiles.length > 0) {
      console.log('Perfis atuais:');
      existingProfiles.forEach(profile => {
        console.log(`  - ${profile.email}: ${profile.user_role}`);
      });
    }
    
    // 3. Definir perfis de exemplo para inserir
    const sampleProfiles = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        full_name: 'Administrador Sistema',
        email: 'admin@mateusbarber.com',
        user_role: 'Admin'
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        full_name: 'Mateus Barbeiro',
        email: 'mateus@mateusbarber.com',
        user_role: 'Admin'
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        full_name: 'Gerente Barbearia',
        email: 'gerente@mateusbarber.com',
        user_role: 'Admin'
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        full_name: 'João Barbeiro',
        email: 'joao@mateusbarber.com',
        user_role: 'Barbeiro'
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        full_name: 'Carlos Cliente',
        email: 'carlos@exemplo.com',
        user_role: 'Cliente'
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        full_name: 'Ana Cliente',
        email: 'ana@exemplo.com',
        user_role: 'Cliente'
      }
    ];
    
    // 4. Filtrar perfis que ainda não existem
    const existingEmails = existingProfiles?.map(p => p.email) || [];
    const profilesToInsert = sampleProfiles.filter(profile => 
      !existingEmails.includes(profile.email)
    );
    
    if (profilesToInsert.length === 0) {
      console.log('\n✅ Todos os perfis de exemplo já existem na tabela!');
      return;
    }
    
    console.log(`\n📝 Inserindo ${profilesToInsert.length} novos perfis...`);
    
    // 5. Inserir perfis usando service role (bypass RLS)
    const { data: insertedProfiles, error: insertError } = await supabase
      .from('profiles')
      .insert(profilesToInsert)
      .select();
    
    if (insertError) {
      console.error('❌ Erro ao inserir perfis:', insertError.message);
      console.error('Detalhes:', insertError);
      return;
    }
    
    console.log(`\n✅ ${insertedProfiles?.length || 0} perfis inseridos com sucesso!`);
    
    // 6. Mostrar resumo final
    const { data: finalProfiles, error: finalError } = await supabase
      .from('profiles')
      .select('email, user_role')
      .order('user_role', { ascending: true });
    
    if (finalError) {
      console.error('❌ Erro ao buscar perfis finais:', finalError.message);
      return;
    }
    
    console.log('\n📊 Resumo final dos perfis por função:');
    const roleCount = {};
    finalProfiles?.forEach(profile => {
      roleCount[profile.user_role] = (roleCount[profile.user_role] || 0) + 1;
    });
    
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} usuário(s)`);
    });
    
    console.log('\n📋 Lista completa de perfis:');
    finalProfiles?.forEach(profile => {
      console.log(`  - ${profile.email}: ${profile.user_role}`);
    });
    
    console.log('\n✅ População da tabela profiles concluída com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Verifique a aplicação para confirmar que os perfis estão visíveis');
    console.log('2. Teste o login com os e-mails administrativos:');
    console.log('   - admin@mateusbarber.com');
    console.log('   - mateus@mateusbarber.com');
    console.log('   - gerente@mateusbarber.com');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Executar o script
populateProfilesWithBypassRLS();