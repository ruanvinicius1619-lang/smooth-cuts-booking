import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env' });

// Configuração do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://jheywkeofcttgdgquawm.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function confirmBarberEmail() {
  console.log('📧 Tentando confirmar email do barbeiro...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Tentar fazer login para testar se o email já está confirmado
    console.log('🔐 Testando login com barbeiro@smoothcuts.com...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'barbeiro@smoothcuts.com',
      password: '123456'
    });
    
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        console.log('❌ Email não confirmado');
        console.log('\n📋 Para confirmar o email manualmente:');
        console.log('1. Acesse: https://supabase.com/dashboard');
        console.log('2. Vá em Authentication > Users');
        console.log('3. Encontre o usuário: barbeiro@smoothcuts.com');
        console.log('4. Clique no usuário');
        console.log('5. Marque "Email confirmed" e salve');
        console.log('\n🔄 Ou execute este comando SQL no SQL Editor:');
        console.log(`UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'barbeiro@smoothcuts.com';`);
      } else {
        console.error('❌ Erro no login:', error.message);
      }
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('✅ Email já está confirmado!');
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Nome: ${data.user.user_metadata?.full_name || 'Não definido'}`);
      
      // Fazer logout
      await supabase.auth.signOut();
      console.log('\n🎉 Tudo pronto! Você pode fazer login no painel do barbeiro.');
      console.log('\n🌐 Acesse:');
      console.log('   1. http://localhost:8080/auth (para fazer login)');
      console.log('   2. http://localhost:8080/barber (painel do barbeiro)');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar script
confirmBarberEmail();

export { confirmBarberEmail };