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

async function fixProfilesWithoutFK() {
  console.log('🔧 Resolvendo problema da foreign key constraint...');
  
  try {
    // Gerar comandos SQL para executar no Supabase SQL Editor
    console.log('\n📋 COMANDOS SQL PARA EXECUTAR NO SUPABASE SQL EDITOR:');
    console.log('\n-- 1. Remover temporariamente a foreign key constraint');
    console.log('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;');
    
    console.log('\n-- 2. Inserir dados de demonstração');
    
    const demoProfiles = [
      { email: 'admin@mateusbarber.com', name: 'Administrador Sistema' },
      { email: 'mateus@mateusbarber.com', name: 'Mateus Silva' },
      { email: 'gerente@mateusbarber.com', name: 'Gerente Barbearia' },
      { email: 'joao@mateusbarber.com', name: 'João Barbeiro' },
      { email: 'barbeiro@mateusbarber.com', name: 'Barbeiro Principal' },
      { email: 'cliente1@exemplo.com', name: 'Cliente Exemplo 1' },
      { email: 'cliente2@exemplo.com', name: 'Cliente Exemplo 2' }
    ];
    
    demoProfiles.forEach(profile => {
      const uuid = uuidv4();
      const role = determineUserRole(profile.email);
      console.log(`INSERT INTO public.profiles (id, email, full_name, user_role, created_at, updated_at)`);
      console.log(`VALUES ('${uuid}', '${profile.email}', '${profile.name}', '${role}', NOW(), NOW());`);
      console.log('');
    });
    
    console.log('-- 3. Recriar a foreign key constraint (OPCIONAL - apenas se necessário)');
    console.log('-- ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);');
    
    console.log('\n📋 INSTRUÇÕES:');
    console.log('1. Copie os comandos SQL acima');
    console.log('2. Vá para o Supabase Dashboard > SQL Editor');
    console.log('3. Cole e execute os comandos');
    console.log('4. Após executar, a aba "Gerenciar Perfis de Usuário" terá dados para exibir');
    
    console.log('\n🔐 Para testar como admin, faça login com:');
    console.log('   - admin@mateusbarber.com');
    console.log('   - mateus@mateusbarber.com');
    console.log('   - gerente@mateusbarber.com');
    
    console.log('\n⚠️  IMPORTANTE: Estes são perfis de demonstração.');
    console.log('Para usar dados reais, você precisa primeiro cadastrar usuários no sistema de autenticação.');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

fixProfilesWithoutFK();