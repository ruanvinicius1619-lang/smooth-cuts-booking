const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente necessárias não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProfilesTable() {
  console.log('🔧 Corrigindo tabela profiles e inserindo dados de teste...');
  
  try {
    // Primeiro, vamos tentar inserir dados diretamente usando RPC
    console.log('\n📝 Tentando inserir dados usando função RPC...');
    
    const testProfiles = [
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
        user_role: 'Gerente'
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

    // Tentar inserir cada perfil individualmente
    for (const profile of testProfiles) {
      console.log(`\n📝 Inserindo perfil: ${profile.email}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'email' });

      if (error) {
        console.log(`❌ Erro ao inserir ${profile.email}: ${error.message}`);
        
        // Se falhar, vamos tentar uma abordagem diferente
        if (error.message.includes('foreign key constraint')) {
          console.log('🔧 Tentando inserção com SQL direto...');
          
          // Criar uma função SQL que desabilita temporariamente as constraints
          const sqlFunction = `
            CREATE OR REPLACE FUNCTION insert_profile_bypass_fk(
              p_id UUID,
              p_full_name TEXT,
              p_email TEXT,
              p_user_role TEXT
            ) RETURNS VOID AS $$
            BEGIN
              -- Desabilitar constraint temporariamente
              ALTER TABLE public.profiles DISABLE TRIGGER ALL;
              
              -- Inserir dados
              INSERT INTO public.profiles (id, full_name, email, user_role, created_at, updated_at)
              VALUES (p_id, p_full_name, p_email, p_user_role, NOW(), NOW())
              ON CONFLICT (email) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                user_role = EXCLUDED.user_role,
                updated_at = NOW();
              
              -- Reabilitar constraint
              ALTER TABLE public.profiles ENABLE TRIGGER ALL;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
          `;
          
          console.log('\n📋 EXECUTE O SEGUINTE SQL NO SUPABASE SQL EDITOR:');
          console.log('=' .repeat(80));
          console.log(sqlFunction);
          console.log('=' .repeat(80));
          
          console.log('\n📋 DEPOIS EXECUTE ESTAS CHAMADAS DE FUNÇÃO:');
          testProfiles.forEach(p => {
            console.log(`SELECT insert_profile_bypass_fk('${p.id}', '${p.full_name}', '${p.email}', '${p.user_role}');`);
          });
          
          return;
        }
      } else {
        console.log(`✅ Perfil inserido: ${profile.email}`);
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
      
      if (allProfiles.length > 0) {
        console.log('\n👥 Perfis por função:');
        const roleCount = {};
        allProfiles.forEach(profile => {
          roleCount[profile.user_role] = (roleCount[profile.user_role] || 0) + 1;
        });
        Object.entries(roleCount).forEach(([role, count]) => {
          console.log(`   ${role}: ${count}`);
        });
        
        console.log('\n✅ Sucesso! Agora você pode testar a aba "Gerenciar Perfis de Usuário".');
        console.log('\n🔐 Para acessar como admin, use um dos seguintes e-mails:');
        console.log('   - admin@mateusbarber.com');
        console.log('   - mateus@mateusbarber.com');
        console.log('   - gerente@mateusbarber.com');
      } else {
        console.log('\n⚠️  Nenhum perfil foi inserido. Execute o SQL fornecido acima no Supabase.');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    
    console.log('\n📋 SOLUÇÃO ALTERNATIVA - EXECUTE NO SUPABASE SQL EDITOR:');
    console.log('=' .repeat(80));
    console.log(`
-- Desabilitar RLS e constraints temporariamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE TRIGGER ALL;

-- Inserir dados de teste
INSERT INTO public.profiles (id, full_name, email, user_role, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Administrador Sistema', 'admin@mateusbarber.com', 'Admin', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Mateus Barbeiro', 'mateus@mateusbarber.com', 'Admin', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'Gerente Barbearia', 'gerente@mateusbarber.com', 'Gerente', NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'João Barbeiro', 'joao@mateusbarber.com', 'Barbeiro', NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'Carlos Cliente', 'carlos@exemplo.com', 'Cliente', NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'Ana Cliente', 'ana@exemplo.com', 'Cliente', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  user_role = EXCLUDED.user_role,
  updated_at = NOW();

-- Reabilitar RLS e constraints
ALTER TABLE public.profiles ENABLE TRIGGER ALL;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
`);
    console.log('=' .repeat(80));
  }
}

fixProfilesTable();