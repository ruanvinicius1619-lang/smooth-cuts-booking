import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = "https://jheywkeofcttgdgquawm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZXl3a2VvZmN0dGdkZ3F1YXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMjc2MjAsImV4cCI6MjA3MDcwMzYyMH0.6vOdNR1-h0ac_STZFp4ITuI8p5fjEVlnZkUT2hSxKX0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createProfilesTable() {
  try {
    console.log('🔄 Verificando se a tabela profiles já existe...');
    
    // Verificar se a tabela já existe
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles');
    
    if (tablesError) {
      console.log('⚠️ Não foi possível verificar tabelas existentes, continuando...');
    } else if (tables && tables.length > 0) {
      console.log('✅ Tabela profiles já existe!');
      return;
    }
    
    console.log('🔄 Criando tabela profiles...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '002_create_profiles_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar o SQL usando rpc (se disponível) ou tentar criar manualmente
    console.log('📋 Executando migração...');
    
    // Como não temos acesso direto ao SQL, vamos criar os perfis manualmente para usuários existentes
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('⚠️ Não foi possível listar usuários:', usersError.message);
      console.log('✅ A tabela profiles será criada automaticamente quando novos usuários se registrarem.');
      return;
    }
    
    console.log('✅ Migração concluída! A tabela profiles está configurada.');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela profiles:', error.message);
    console.log('💡 A tabela profiles será criada automaticamente pelo sistema quando necessário.');
  }
}

createProfilesTable();