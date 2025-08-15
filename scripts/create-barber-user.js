import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env' });

// Configuração do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://jheywkeofcttgdgquawm.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Usuário barbeiro para criar
const BARBER_USER = {
  email: 'barbeiro@smoothcuts.com',
  password: '123456',
  full_name: 'Barbeiro Principal',
  phone: '(11) 99999-9999'
};

async function createBarberUser() {
  console.log('🔧 Iniciando criação do usuário barbeiro...');
  
  // Verificar se a chave de serviço está configurada
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ ERRO: Chave de serviço do Supabase não configurada!');
    console.log('\n📋 Para configurar:');
    console.log('1. Acesse https://supabase.com/dashboard');
    console.log('2. Vá em Settings > API');
    console.log('3. Copie a "service_role" key');
    console.log('4. Adicione SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui no arquivo .env');
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
  
  try {
    console.log(`\n⏳ Criando usuário barbeiro: ${BARBER_USER.email}`);
    
    // Criar usuário usando Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: BARBER_USER.email,
      password: BARBER_USER.password,
      email_confirm: true, // Confirma o email automaticamente
      user_metadata: {
        full_name: BARBER_USER.full_name,
        phone: BARBER_USER.phone
      }
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`ℹ️  Usuário ${BARBER_USER.email} já existe`);
        console.log('✅ Você pode usar as credenciais existentes para fazer login');
      } else {
        console.error(`❌ Erro ao criar ${BARBER_USER.email}:`, error.message);
        return;
      }
    } else {
      console.log(`✅ Usuário ${BARBER_USER.email} criado com sucesso!`);
      console.log(`   ID: ${data.user.id}`);
    }
    
    console.log('\n🎉 Usuário barbeiro configurado!');
    console.log('\n📝 Credenciais de acesso:');
    console.log(`   Email: ${BARBER_USER.email}`);
    console.log(`   Senha: ${BARBER_USER.password}`);
    console.log('\n🔐 Agora você pode fazer login no painel do barbeiro!');
    console.log('\n🌐 Acesse: http://localhost:8080/auth');
    console.log('   1. Faça login com as credenciais acima');
    console.log('   2. Depois acesse: http://localhost:8080/barber');
    
  } catch (error) {
    console.error(`❌ Erro inesperado:`, error.message);
  }
}

// Executar script
createBarberUser();

export { createBarberUser };