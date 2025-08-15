const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente necessárias não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function disableRLSAndInsertData() {
  console.log('🔧 Iniciando processo de inserção de dados com RLS temporariamente desabilitado...');
  
  try {
    // SQL para desabilitar RLS, inserir dados e reabilitar RLS
    const sqlCommands = `
      -- Desabilitar RLS temporariamente
      ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
      
      -- Inserir dados de exemplo
      INSERT INTO public.profiles (id, full_name, email, user_role, created_at, updated_at) VALUES
      ('11111111-1111-1111-1111-111111111111', 'Administrador Sistema', 'admin@mateusbarber.com', 'Admin', NOW(), NOW()),
      ('22222222-2222-2222-2222-222222222222', 'Mateus Barbeiro', 'mateus@mateusbarber.com', 'Admin', NOW(), NOW()),
      ('33333333-3333-3333-3333-333333333333', 'Gerente Barbearia', 'gerente@mateusbarber.com', 'Admin', NOW(), NOW()),
      ('44444444-4444-4444-4444-444444444444', 'João Barbeiro', 'joao@mateusbarber.com', 'Barbeiro', NOW(), NOW()),
      ('55555555-5555-5555-5555-555555555555', 'Carlos Cliente', 'carlos@exemplo.com', 'Cliente', NOW(), NOW()),
      ('66666666-6666-6666-6666-666666666666', 'Ana Cliente', 'ana@exemplo.com', 'Cliente', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
      
      -- Reabilitar RLS
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    `;
    
    console.log('\n📝 SQL a ser executado no Supabase:');
    console.log('=' .repeat(60));
    console.log(sqlCommands);
    console.log('=' .repeat(60));
    
    console.log('\n📋 INSTRUÇÕES PARA EXECUTAR NO SUPABASE:');
    console.log('1. Acesse o painel do Supabase: https://supabase.com/dashboard');
    console.log('2. Vá para seu projeto');
    console.log('3. Clique em "SQL Editor" no menu lateral');
    console.log('4. Cole o SQL acima em uma nova query');
    console.log('5. Execute a query clicando em "Run"');
    
    console.log('\n✅ Após executar o SQL, os seguintes usuários estarão disponíveis:');
    console.log('📧 Administradores:');
    console.log('  - admin@mateusbarber.com (Admin)');
    console.log('  - mateus@mateusbarber.com (Admin)');
    console.log('  - gerente@mateusbarber.com (Admin)');
    console.log('\n👨‍💼 Barbeiro:');
    console.log('  - joao@mateusbarber.com (Barbeiro)');
    console.log('\n👥 Clientes:');
    console.log('  - carlos@exemplo.com (Cliente)');
    console.log('  - ana@exemplo.com (Cliente)');
    
    console.log('\n🔐 Após a execução, faça login com um dos e-mails administrativos para acessar a aba "Gerenciar Perfis de Usuário".');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar o script
disableRLSAndInsertData();