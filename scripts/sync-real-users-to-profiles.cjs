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

async function syncRealUsersToProfiles() {
  console.log('🔄 Sincronizando usuários reais do sistema...');
  
  try {
    // Primeiro, verificar se há uma sessão ativa
    console.log('\n📋 Verificando sessão ativa...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    let realUsers = [];
    
    if (sessionError) {
      console.log(`⚠️  Erro ao verificar sessão: ${sessionError.message}`);
    } else if (sessionData.session?.user) {
      console.log(`✅ Usuário logado encontrado: ${sessionData.session.user.email}`);
      realUsers.push(sessionData.session.user);
    } else {
      console.log('⚠️  Nenhuma sessão ativa encontrada.');
    }
    
    // Tentar listar usuários se temos service role
    if (supabaseServiceKey) {
      console.log('\n📋 Tentando listar usuários com service role...');
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.log(`⚠️  Erro ao listar usuários: ${usersError.message}`);
      } else {
        const authUsers = usersData.users || [];
        console.log(`✅ Encontrados ${authUsers.length} usuários autenticados`);
        realUsers = authUsers;
      }
    }
    
    // Se temos usuários reais, sincronizar com profiles
    if (realUsers.length > 0) {
      console.log('\n📝 Sincronizando usuários reais...');
      
      for (const user of realUsers) {
        const userEmail = user.email;
        const userName = user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0];
        const userRole = determineUserRole(userEmail);
        
        console.log(`\n📝 Processando usuário real: ${userEmail}`);
        
        const profileData = {
          id: user.id,
          email: userEmail,
          full_name: userName,
          user_role: userRole,
          created_at: user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'id' });
        
        if (upsertError) {
          console.log(`❌ Erro ao sincronizar ${userEmail}: ${upsertError.message}`);
        } else {
          console.log(`✅ Perfil sincronizado: ${userEmail} - ${userRole}`);
        }
      }
    } else {
      console.log('\n⚠️  Nenhum usuário real encontrado.');
      console.log('\n📝 Criando perfis de demonstração com UUIDs válidos...');
      
      const demoProfiles = [
        { email: 'admin@mateusbarber.com', name: 'Administrador Sistema' },
        { email: 'mateus@mateusbarber.com', name: 'Mateus Silva' },
        { email: 'gerente@mateusbarber.com', name: 'Gerente Barbearia' },
        { email: 'joao@mateusbarber.com', name: 'João Barbeiro' },
        { email: 'barbeiro@mateusbarber.com', name: 'Barbeiro Principal' },
        { email: 'cliente1@exemplo.com', name: 'Cliente Exemplo 1' },
        { email: 'cliente2@exemplo.com', name: 'Cliente Exemplo 2' }
      ];
      
      for (const profileInfo of demoProfiles) {
        const profileData = {
          id: uuidv4(), // Gerar UUID válido
          email: profileInfo.email,
          full_name: profileInfo.name,
          user_role: determineUserRole(profileInfo.email),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log(`\n📝 Criando perfil demo: ${profileInfo.email}`);
        
        const { error: insertError } = await supabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'email' });
        
        if (insertError) {
          console.log(`❌ Erro ao criar perfil ${profileInfo.email}: ${insertError.message}`);
        } else {
          console.log(`✅ Perfil criado: ${profileInfo.email} - ${profileData.user_role}`);
        }
      }
    }
    
    // Verificar resultado final
    const { data: allProfiles, error: countError } = await supabase
      .from('profiles')
      .select('email, user_role, full_name');
    
    if (countError) {
      console.error('❌ Erro ao verificar perfis:', countError.message);
    } else {
      console.log(`\n📊 Total de perfis: ${allProfiles.length}`);
      
      if (allProfiles.length > 0) {
        console.log('\n👥 Perfis por função:');
        const roleCount = {};
        allProfiles.forEach(profile => {
          roleCount[profile.user_role] = (roleCount[profile.user_role] || 0) + 1;
        });
        Object.entries(roleCount).forEach(([role, count]) => {
          console.log(`   ${role}: ${count}`);
        });
        
        console.log('\n📋 Lista de usuários:');
        allProfiles.forEach(profile => {
          console.log(`   📧 ${profile.email} - ${profile.full_name} (${profile.user_role})`);
        });
        
        console.log('\n✅ Sincronização concluída! A aba "Gerenciar Perfis de Usuário" agora tem dados para exibir.');
        console.log('\n🔐 Para testar como admin, faça login com:');
        console.log('   - admin@mateusbarber.com');
        console.log('   - mateus@mateusbarber.com');
        console.log('   - gerente@mateusbarber.com');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

syncRealUsersToProfiles();