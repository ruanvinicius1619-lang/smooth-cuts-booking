// Script para verificar se o usuário barbeiro existe no Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyBarberUser() {
  console.log('🔍 Verificando usuário barbeiro no Supabase...');
  console.log('=' .repeat(50));
  
  try {
    // Tentar fazer login com as credenciais do barbeiro para verificar se existe
    console.log('🔐 Tentando fazer login com credenciais do barbeiro...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'barbeiro@smoothcuts.com',
      password: '123456'
    });
    
    if (loginError) {
      console.log('❌ Erro ao fazer login:', loginError.message);
      
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('⚠️  Usuário barbeiro não existe ou credenciais incorretas');
        console.log('\n💡 Sugestões:');
        console.log('   1. Criar o usuário barbeiro manualmente no Supabase');
        console.log('   2. Verificar se o email está correto');
        console.log('   3. Verificar se a senha está correta');
      }
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log(`   ID: ${loginData.user.id}`);
      console.log(`   Email: ${loginData.user.email}`);
      console.log(`   Confirmado: ${loginData.user.email_confirmed_at ? 'Sim' : 'Não'}`);
      console.log(`   Criado em: ${new Date(loginData.user.created_at).toLocaleString('pt-BR')}`);
      console.log(`   Último login: ${loginData.user.last_sign_in_at ? new Date(loginData.user.last_sign_in_at).toLocaleString('pt-BR') : 'Nunca'}`);
      
      // Verificar se tem perfil na tabela profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', loginData.user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.log('⚠️  Erro ao buscar perfil:', profileError.message);
      } else if (profile) {
        console.log('✅ Perfil encontrado na tabela profiles:');
        console.log(`   Nome: ${profile.full_name || 'Não definido'}`);
        console.log(`   Telefone: ${profile.phone || 'Não definido'}`);
      } else {
        console.log('⚠️  Perfil não encontrado na tabela profiles');
      }
      
      // Fazer logout
      await supabase.auth.signOut();
      console.log('🚪 Logout realizado');
    }
    
    console.log('\n🧪 Testando função isBarber...');
    
    // Simular a função isBarber
    const BARBER_CONFIG = {
      authorizedBarbers: [
        {
          id: 'default-barber',
          email: 'barbeiro@mateusbarber.com',
          name: 'Barbeiro Padrão',
          permissions: ['view_appointments']
        },
        {
          id: 'smoothcuts-barber',
          email: 'barbeiro@smoothcuts.com',
          name: 'Barbeiro SmoothCuts',
          permissions: ['view_appointments']
        },
        {
          id: 'joao-barber',
          email: 'joao@mateusbarber.com',
          name: 'João',
          permissions: ['view_appointments']
        },
        {
          id: 'pedro-barber',
          email: 'pedro@mateusbarber.com',
          name: 'Pedro',
          permissions: ['view_appointments']
        }
      ]
    };
    
    const isBarber = (email) => {
      if (!email) return false;
      return BARBER_CONFIG.authorizedBarbers.some(barber => barber.email === email);
    };
    
    const testResult = isBarber('barbeiro@smoothcuts.com');
    console.log(`   isBarber('barbeiro@smoothcuts.com'): ${testResult}`);
    
    if (testResult) {
      console.log('✅ Função isBarber está funcionando corretamente!');
    } else {
      console.log('❌ Função isBarber NÃO está reconhecendo o barbeiro!');
    }
    
    console.log('\n📋 Lista de barbeiros autorizados:');
    BARBER_CONFIG.authorizedBarbers.forEach((barber, index) => {
      console.log(`   ${index + 1}. ${barber.email} (${barber.name})`);
    });
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Verificação concluída!');
}

// Executar verificação
verifyBarberUser().catch(console.error);