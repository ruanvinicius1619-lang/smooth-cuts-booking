const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e uma chave do Supabase são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUsersAndProfiles() {
  console.log('🚀 Criando usuários e perfis de exemplo...');
  
  const testUsers = [
    {
      email: 'admin@mateusbarber.com',
      password: 'admin123456',
      full_name: 'Administrador',
      user_role: 'Admin'
    },
    {
      email: 'mateus@mateusbarber.com',
      password: 'mateus123456',
      full_name: 'Mateus Silva',
      user_role: 'Admin'
    },
    {
      email: 'gerente@mateusbarber.com',
      password: 'gerente123456',
      full_name: 'Gerente',
      user_role: 'Gerente'
    },
    {
      email: 'joao@mateusbarber.com',
      password: 'joao123456',
      full_name: 'João Barbeiro',
      user_role: 'Barbeiro'
    },
    {
      email: 'maria@cliente.com',
      password: 'maria123456',
      full_name: 'Maria Cliente',
      user_role: 'Cliente'
    },
    {
      email: 'pedro@cliente.com',
      password: 'pedro123456',
      full_name: 'Pedro Cliente',
      user_role: 'Cliente'
    }
  ];

  try {
    for (const userData of testUsers) {
      console.log(`\n📝 Criando usuário: ${userData.email}`);
      
      // Primeiro, tentar criar o usuário na auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  Usuário ${userData.email} já existe na auth`);
          
          // Tentar buscar o usuário existente
          const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
          if (listError) {
            console.log(`❌ Erro ao buscar usuários existentes: ${listError.message}`);
            continue;
          }
          
          const existingUser = existingUsers.users.find(u => u.email === userData.email);
          if (existingUser) {
            console.log(`✅ Usuário encontrado: ${existingUser.id}`);
            
            // Criar perfil para usuário existente
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: existingUser.id,
                email: userData.email,
                full_name: userData.full_name,
                user_role: userData.user_role
              }, { onConflict: 'id' });

            if (profileError) {
              console.log(`❌ Erro ao criar perfil: ${profileError.message}`);
            } else {
              console.log(`✅ Perfil criado para ${userData.email}`);
            }
          }
        } else {
          console.log(`❌ Erro ao criar usuário ${userData.email}: ${authError.message}`);
        }
        continue;
      }

      if (authData.user) {
        console.log(`✅ Usuário criado: ${authData.user.id}`);
        
        // Criar perfil correspondente
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: userData.email,
            full_name: userData.full_name,
            user_role: userData.user_role
          });

        if (profileError) {
          console.log(`❌ Erro ao criar perfil: ${profileError.message}`);
        } else {
          console.log(`✅ Perfil criado para ${userData.email}`);
        }
      }
    }

    // Verificar resultado final
    const { data: allProfiles, error: countError } = await supabase
      .from('profiles')
      .select('email, user_role');
    
    if (countError) {
      console.error('❌ Erro ao contar perfis:', countError.message);
    } else {
      console.log(`\n📊 Total de perfis na tabela: ${allProfiles.length}`);
      console.log('\n👥 Perfis por função:');
      const roleCount = {};
      allProfiles.forEach(profile => {
        roleCount[profile.user_role] = (roleCount[profile.user_role] || 0) + 1;
      });
      Object.entries(roleCount).forEach(([role, count]) => {
        console.log(`   ${role}: ${count}`);
      });
    }
    
    console.log('\n✅ Processo concluído! Agora você pode testar a aba "Gerenciar Perfis de Usuário".');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

createUsersAndProfiles();