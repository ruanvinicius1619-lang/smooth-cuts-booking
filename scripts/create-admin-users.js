import { createClient } from '@supabase/supabase-js';
import readline from 'readline';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env.local
dotenv.config({ path: '.env.local' });

// Configuração do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://jheywkeofcttgdgquawm.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Chave de serviço necessária

// Lista de administradores para criar
const ADMIN_USERS = [
  {
    email: 'admin@mateusbarber.com',
    password: '1233',
    full_name: 'Administrador Principal',
    phone: '(11) 99999-9999'
  },
  {
    email: 'mateus@mateusbarber.com',
    password: '1233',
    full_name: 'Mateus - Proprietário',
    phone: '(11) 98888-8888'
  },
  {
    email: 'gerente@mateusbarber.com',
    password: '1233',
    full_name: 'Gerente da Barbearia',
    phone: '(11) 97777-7777'
  }
];

async function createAdminUsers() {
  console.log('🔧 Iniciando criação de usuários administradores...');
  
  // Verificar se a chave de serviço está configurada
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ ERRO: Chave de serviço do Supabase não configurada!');
    console.log('\n📋 Para configurar:');
    console.log('1. Acesse https://supabase.com/dashboard');
    console.log('2. Vá em Settings > API');
    console.log('3. Copie a "service_role" key');
    console.log('4. Execute: set SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui');
    console.log('5. Execute novamente este script');
    return;
  }
  
  // Criar cliente com chave de serviço (permite criar usuários)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  console.log('✅ Cliente Supabase configurado com chave de serviço');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const admin of ADMIN_USERS) {
    try {
      console.log(`\n⏳ Criando usuário: ${admin.email}`);
      
      // Criar usuário usando Admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true, // Confirma o email automaticamente
        user_metadata: {
          full_name: admin.full_name,
          phone: admin.phone
        }
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`ℹ️  Usuário ${admin.email} já existe`);
          successCount++;
        } else {
          console.error(`❌ Erro ao criar ${admin.email}:`, error.message);
          errorCount++;
        }
      } else {
        console.log(`✅ Usuário ${admin.email} criado com sucesso!`);
        console.log(`   ID: ${data.user.id}`);
        successCount++;
      }
      
    } catch (error) {
      console.error(`❌ Erro inesperado ao criar ${admin.email}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 RESUMO:');
  console.log(`✅ Sucessos: ${successCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  
  if (successCount > 0) {
    console.log('\n🎉 Usuários administradores criados!');
    console.log('\n📝 Credenciais de acesso:');
    ADMIN_USERS.forEach(admin => {
      console.log(`   Email: ${admin.email}`);
      console.log(`   Senha: ${admin.password}`);
      console.log('');
    });
    console.log('\n🔐 IMPORTANTE: Altere as senhas após o primeiro login!');
  }
}

// Função para solicitar confirmação
function askConfirmation() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('🚀 Script de Criação de Usuários Administradores');
  console.log('\n📋 Usuários que serão criados:');
  ADMIN_USERS.forEach(admin => {
    console.log(`   - ${admin.email} (${admin.full_name})`);
  });
  
  rl.question('\n❓ Deseja continuar? (s/N): ', (answer) => {
    if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
      rl.close();
      createAdminUsers();
    } else {
      console.log('❌ Operação cancelada.');
      rl.close();
    }
  });
}

// Executar script
askConfirmation();

export { createAdminUsers };