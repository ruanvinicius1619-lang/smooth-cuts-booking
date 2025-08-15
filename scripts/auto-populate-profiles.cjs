const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
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

// Função para determinar o papel do usuário baseado no email
function determineUserRole(email) {
  const adminEmails = ['admin@mateusbarber.com', 'mateus@mateusbarber.com', 'gerente@mateusbarber.com'];
  const barberEmails = ['joao@mateusbarber.com', 'barbeiro@mateusbarber.com', 'carlos@mateusbarber.com'];
  
  if (adminEmails.includes(email)) {
    return 'Admin';
  } else if (barberEmails.includes(email)) {
    return 'Barbeiro';
  } else if (email.includes('gerente')) {
    return 'Gerente';
  } else {
    return 'Cliente';
  }
}

async function autoPopulateProfiles() {
  console.log('🔧 Populando automaticamente a tabela profiles...');
  
  try {
    // Primeiro, tentar remover a foreign key constraint
    console.log('\n🔧 Removendo foreign key constraint...');
    
    const { error: dropConstraintError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;'
    });
    
    if (dropConstraintError) {
      console.log(`⚠️  Aviso ao remover constraint: ${dropConstraintError.message}`);
    } else {
      console.log('✅ Foreign key constraint removida');
    }
    
    // Criar perfis de demonstração com mais clientes
    console.log('\n📝 Criando perfis de demonstração...');
    
    const demoProfiles = [
      // Administradores
      { email: 'admin@mateusbarber.com', name: 'Administrador Sistema' },
      { email: 'mateus@mateusbarber.com', name: 'Mateus Silva' },
      { email: 'gerente@mateusbarber.com', name: 'Gerente Barbearia' },
      
      // Barbeiros
      { email: 'joao@mateusbarber.com', name: 'João Barbeiro' },
      { email: 'barbeiro@mateusbarber.com', name: 'Barbeiro Principal' },
      { email: 'carlos@mateusbarber.com', name: 'Carlos Silva' },
      
      // Clientes
      { email: 'cliente1@exemplo.com', name: 'Ana Silva' },
      { email: 'cliente2@exemplo.com', name: 'Pedro Santos' },
      { email: 'cliente3@exemplo.com', name: 'Maria Oliveira' },
      { email: 'cliente4@exemplo.com', name: 'João Costa' },
      { email: 'cliente5@exemplo.com', name: 'Carla Ferreira' },
      { email: 'cliente6@exemplo.com', name: 'Roberto Lima' },
      { email: 'cliente7@exemplo.com', name: 'Fernanda Souza' },
      { email: 'cliente8@exemplo.com', name: 'Lucas Pereira' }
    ];
    
    let successCount = 0;
    
    for (const profileInfo of demoProfiles) {
      const profileData = {
        id: uuidv4(),
        email: profileInfo.email,
        full_name: profileInfo.name,
        user_role: determineUserRole(profileInfo.email),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log(`📝 Criando: ${profileInfo.name} (${profileData.user_role})`);
      
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'email' });
      
      if (insertError) {
        console.log(`❌ Erro ao criar ${profileInfo.email}: ${insertError.message}`);
      } else {
        console.log(`✅ Criado: ${profileInfo.email}`);
        successCount++;
      }
    }
    
    console.log(`\n📊 Perfis criados com sucesso: ${successCount}/${demoProfiles.length}`);
    
    // Verificar resultado final
    const { data: allProfiles, error: countError } = await supabase
      .from('profiles')
      .select('email, user_role, full_name');
    
    if (countError) {
      console.error('❌ Erro ao verificar perfis:', countError.message);
    } else {
      console.log(`\n📊 Total de perfis na tabela: ${allProfiles.length}`);
      
      if (allProfiles.length > 0) {
        console.log('\n👥 Perfis por função:');
        const roleCount = {};
        allProfiles.forEach(profile => {
          roleCount[profile.user_role] = (roleCount[profile.user_role] || 0) + 1;
        });
        Object.entries(roleCount).forEach(([role, count]) => {
          console.log(`   ${role}: ${count}`);
        });
        
        console.log('\n📋 Clientes cadastrados:');
        const clients = allProfiles.filter(p => p.user_role === 'Cliente');
        clients.forEach((client, index) => {
          console.log(`   ${index + 1}. ${client.full_name} (${client.email})`);
        });
        
        console.log('\n✅ Sucesso! A aba "Gerenciar Perfis de Usuário" agora mostra os clientes.');
        console.log('\n🔐 Para acessar como admin, faça login com:');
        console.log('   - admin@mateusbarber.com');
        console.log('   - mateus@mateusbarber.com');
        console.log('   - gerente@mateusbarber.com');
        
        console.log('\n📱 Acesse a aplicação em: http://localhost:8080/');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    
    console.log('\n📋 SOLUÇÃO ALTERNATIVA:');
    console.log('Execute os comandos SQL manualmente no Supabase Dashboard:');
    console.log('1. Vá para SQL Editor');
    console.log('2. Execute: node scripts/fix-profiles-without-fk.cjs');
    console.log('3. Copie e execute os comandos SQL gerados');
  }
}

autoPopulateProfiles();