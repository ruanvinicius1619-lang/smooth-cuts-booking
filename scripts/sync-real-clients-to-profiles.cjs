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

async function syncRealClientsToProfiles() {
  console.log('🔄 Sincronizando clientes reais do sistema...');
  
  try {
    // Primeiro, verificar usuários autenticados
    let realUsers = [];
    
    if (supabaseServiceKey) {
      console.log('\n📋 Buscando usuários autenticados com service role...');
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.log(`⚠️  Erro ao listar usuários: ${usersError.message}`);
      } else {
        realUsers = usersData.users || [];
        console.log(`✅ Encontrados ${realUsers.length} usuários autenticados`);
      }
    }
    
    // Verificar sessão ativa
    console.log('\n📋 Verificando sessão ativa...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log(`⚠️  Erro ao verificar sessão: ${sessionError.message}`);
    } else if (sessionData.session?.user) {
      console.log(`✅ Usuário logado encontrado: ${sessionData.session.user.email}`);
      // Adicionar usuário da sessão se não estiver na lista
      const sessionUser = sessionData.session.user;
      if (!realUsers.find(u => u.id === sessionUser.id)) {
        realUsers.push(sessionUser);
      }
    } else {
      console.log('⚠️  Nenhuma sessão ativa encontrada.');
    }
    
    if (realUsers.length > 0) {
      console.log('\n📝 Sincronizando usuários reais com tabela profiles...');
      
      let syncedCount = 0;
      
      for (const user of realUsers) {
        const userEmail = user.email;
        const userName = user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0];
        const userRole = determineUserRole(userEmail);
        
        console.log(`\n📝 Processando usuário: ${userEmail} (${userRole})`);
        
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
          
          // Se falhar por foreign key, tentar sem a constraint
          if (upsertError.message.includes('foreign key')) {
            console.log(`🔧 Tentando inserir sem foreign key constraint...`);
            
            // Gerar novo UUID se necessário
            const newProfileData = {
              ...profileData,
              id: uuidv4()
            };
            
            const { error: insertError } = await supabase
              .from('profiles')
              .upsert(newProfileData, { onConflict: 'email' });
            
            if (insertError) {
              console.log(`❌ Erro ao inserir ${userEmail}: ${insertError.message}`);
            } else {
              console.log(`✅ Perfil criado: ${userEmail} - ${userRole}`);
              syncedCount++;
            }
          }
        } else {
          console.log(`✅ Perfil sincronizado: ${userEmail} - ${userRole}`);
          syncedCount++;
        }
      }
      
      console.log(`\n📊 Total de perfis sincronizados: ${syncedCount}`);
      
    } else {
      console.log('\n⚠️  Nenhum usuário real encontrado.');
      console.log('\n💡 Possíveis soluções:');
      console.log('1. Cadastre usuários no sistema de autenticação');
      console.log('2. Faça login no sistema para criar uma sessão');
      console.log('3. Configure a SUPABASE_SERVICE_ROLE_KEY no .env');
    }
    
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
        
        console.log('\n📋 Lista de usuários:');
        allProfiles.forEach(profile => {
          console.log(`   📧 ${profile.email} - ${profile.full_name} (${profile.user_role})`);
        });
        
        console.log('\n✅ Sincronização concluída! A aba "Gerenciar Perfis de Usuário" agora mostra os dados.');
        console.log('\n🔐 Para acessar como admin, faça login com um email administrativo.');
      } else {
        console.log('\n⚠️  A tabela profiles ainda está vazia.');
        console.log('\n📋 Execute os comandos SQL do script fix-profiles-without-fk.cjs se necessário.');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

syncRealClientsToProfiles();