import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env' });

// Configuração do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://jheywkeofcttgdgquawm.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Usuário barbeiro para criar
const BARBER_USER = {
  email: 'barbeiro@smoothcuts.com',
  password: '123456',
  options: {
    data: {
      full_name: 'Barbeiro Principal',
      phone: '(11) 99999-9999'
    }
  }
};

async function signUpBarberUser() {
  console.log('🔧 Tentando registrar usuário barbeiro via signup...');
  
  // Criar cliente com chave anônima (permite signup)
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  console.log('✅ Cliente Supabase configurado');
  
  try {
    console.log(`\n⏳ Registrando usuário barbeiro: ${BARBER_USER.email}`);
    
    // Tentar fazer signup do usuário
    const { data, error } = await supabase.auth.signUp({
      email: BARBER_USER.email,
      password: BARBER_USER.password,
      options: BARBER_USER.options
    });
    
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        console.log(`ℹ️  Usuário ${BARBER_USER.email} já existe`);
        console.log('✅ Você pode tentar fazer login com as credenciais');
        
        // Tentar fazer login para verificar
        console.log('\n🔐 Testando login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: BARBER_USER.email,
          password: BARBER_USER.password
        });
        
        if (loginError) {
          console.error(`❌ Erro no login:`, loginError.message);
          console.log('\n💡 Possíveis soluções:');
          console.log('1. Verifique se o email está confirmado no dashboard do Supabase');
          console.log('2. Tente resetar a senha');
          console.log('3. Crie o usuário manualmente no dashboard');
        } else {
          console.log('✅ Login realizado com sucesso!');
          console.log(`   User ID: ${loginData.user.id}`);
          console.log(`   Email: ${loginData.user.email}`);
          
          // Fazer logout
          await supabase.auth.signOut();
        }
      } else {
        console.error(`❌ Erro ao registrar ${BARBER_USER.email}:`, error.message);
        
        if (error.message.includes('Signups not allowed')) {
          console.log('\n💡 O signup está desabilitado. Soluções:');
          console.log('1. Habilite signup no dashboard do Supabase (Authentication > Settings)');
          console.log('2. Ou crie o usuário manualmente no dashboard');
          console.log('3. Consulte o arquivo: create-barber-user-manual.md');
        }
        return;
      }
    } else {
      console.log(`✅ Usuário ${BARBER_USER.email} registrado com sucesso!`);
      if (data.user) {
        console.log(`   ID: ${data.user.id}`);
        console.log(`   Email confirmado: ${data.user.email_confirmed_at ? 'Sim' : 'Não'}`);
        
        if (!data.user.email_confirmed_at) {
          console.log('\n📧 IMPORTANTE: Confirme o email antes de fazer login');
          console.log('   - Verifique sua caixa de entrada');
          console.log('   - Ou confirme manualmente no dashboard do Supabase');
        }
      }
    }
    
    console.log('\n🎉 Processo concluído!');
    console.log('\n📝 Credenciais de acesso:');
    console.log(`   Email: ${BARBER_USER.email}`);
    console.log(`   Senha: ${BARBER_USER.password}`);
    console.log('\n🌐 Para testar:');
    console.log('   1. Acesse: http://localhost:8080/auth');
    console.log('   2. Faça login com as credenciais acima');
    console.log('   3. Depois acesse: http://localhost:8080/barber');
    
  } catch (error) {
    console.error(`❌ Erro inesperado:`, error.message);
    console.log('\n📋 Consulte o arquivo create-barber-user-manual.md para criação manual');
  }
}

// Executar script
signUpBarberUser();

export { signUpBarberUser };