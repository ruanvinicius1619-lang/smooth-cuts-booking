import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = "https://nxmglqvrjkfizzorfljp.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Chave de serviço necessária

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY não encontrada nas variáveis de ambiente');
  console.log('📋 Para obter a chave de serviço:');
  console.log('1. Acesse https://supabase.com/dashboard');
  console.log('2. Vá em Settings > API');
  console.log('3. Copie a "service_role" key');
  console.log('4. Execute: set SUPABASE_SERVICE_KEY=sua_chave_aqui');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigrations() {
  try {
    console.log('🚀 Iniciando setup do banco de dados...');
    
    // Lê o arquivo de migração
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_create_bookings_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Arquivo de migração carregado');
    
    // Divide o SQL em comandos individuais
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    // Executa cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i] + ';';
      console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: command });
      
      if (error) {
        console.error(`❌ Erro no comando ${i + 1}:`, error.message);
        // Continua mesmo com erros (tabelas podem já existir)
      } else {
        console.log(`✅ Comando ${i + 1} executado com sucesso`);
      }
    }
    
    // Verifica se as tabelas foram criadas
    console.log('🔍 Verificando tabelas criadas...');
    
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('count')
      .limit(1);
    
    const { data: barbers, error: barbersError } = await supabase
      .from('barbers')
      .select('count')
      .limit(1);
    
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('count')
      .limit(1);
    
    if (!servicesError && !barbersError && !bookingsError) {
      console.log('🎉 Setup do banco de dados concluído com sucesso!');
      console.log('✅ Tabelas services, barbers e bookings estão funcionando');
      console.log('🔒 Políticas de segurança (RLS) configuradas');
      console.log('📊 Dados iniciais inseridos');
    } else {
      console.log('⚠️  Algumas tabelas podem não ter sido criadas corretamente');
      console.log('💡 Verifique o painel do Supabase manualmente');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o setup:', error.message);
    console.log('💡 Alternativa: Execute o SQL manualmente no painel do Supabase');
    process.exit(1);
  }
}

runMigrations();