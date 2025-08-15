import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env' });

// Configuração do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://jheywkeofcttgdgquawm.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupCompleteProfiles() {
  console.log('🚀 Iniciando configuração completa da tabela profiles...');
  
  try {
    // Ler o conteúdo das migrações
    const migration002Path = path.join(process.cwd(), 'supabase', 'migrations', '002_create_profiles_table.sql');
    const migration003Path = path.join(process.cwd(), 'supabase', 'migrations', '003_add_user_role_column.sql');
    
    let migration002Content = '';
    let migration003Content = '';
    
    try {
      migration002Content = fs.readFileSync(migration002Path, 'utf8');
      console.log('✅ Migração 002 (create_profiles_table) carregada');
    } catch (error) {
      console.error('❌ Erro ao ler migração 002:', error.message);
    }
    
    try {
      migration003Content = fs.readFileSync(migration003Path, 'utf8');
      console.log('✅ Migração 003 (add_user_role_column) carregada');
    } catch (error) {
      console.error('❌ Erro ao ler migração 003:', error.message);
    }
    
    console.log('\n📋 INSTRUÇÕES PARA CONFIGURAÇÃO COMPLETA:');
    console.log('1. Acesse https://supabase.com/dashboard/project/jheywkeofcttgdgquawm/sql/new');
    console.log('2. Execute PRIMEIRO o SQL da migração 002:');
    console.log('\n--- MIGRAÇÃO 002 (Criar tabela profiles) ---');
    console.log(migration002Content);
    
    console.log('\n3. Depois execute o SQL da migração 003:');
    console.log('\n--- MIGRAÇÃO 003 (Adicionar coluna user_role) ---');
    console.log(migration003Content);
    
    console.log('\n4. Após executar as migrações, execute novamente este script para verificar:');
    console.log('   node scripts/apply-user-role-migration.js');
    
    // Tentar verificar se conseguimos acessar alguma tabela para confirmar conexão
    console.log('\n🔍 Testando conexão com Supabase...');
    
    const { data: testData, error: testError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);
    
    if (testError) {
      if (testError.message.includes('relation "public.bookings" does not exist')) {
        console.log('⚠️  Tabela bookings também não existe. Execute primeiro as migrações básicas.');
        console.log('   Consulte SETUP_DATABASE.md para instruções completas.');
      } else {
        console.log('⚠️  Erro de conexão:', testError.message);
      }
    } else {
      console.log('✅ Conexão com Supabase funcionando');
    }
    
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Execute as migrações SQL no painel do Supabase');
    console.log('2. Verifique se as tabelas foram criadas corretamente');
    console.log('3. Execute: node scripts/apply-user-role-migration.js');
    console.log('4. Teste o sistema de perfis na aplicação');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
  }
}

// Executar a configuração
setupCompleteProfiles();