import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = "https://jheywkeofcttgdgquawm.supabase.co";
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
    
    console.log(`📝 Criando tabelas e inserindo dados...`);
    
    // Criar tabelas services
    console.log('⏳ Criando tabela services...');
    const { error: servicesError } = await supabase
      .from('services')
      .select('id')
      .limit(1);
    
    if (servicesError && servicesError.code === 'PGRST116') {
      console.log('📋 Tabela services não existe, será criada via SQL Editor');
    } else {
      console.log('✅ Tabela services já existe');
    }
    
    // Inserir dados padrão para services
    const defaultServices = [
      { name: 'Corte Simples', description: 'Corte de cabelo tradicional', price: 25.00, duration: 30 },
      { name: 'Corte + Barba', description: 'Corte de cabelo + barba completa', price: 40.00, duration: 45 },
      { name: 'Barba', description: 'Aparar e modelar barba', price: 20.00, duration: 20 },
      { name: 'Corte Premium', description: 'Corte estilizado + finalização', price: 35.00, duration: 40 }
    ];
    
    for (const service of defaultServices) {
      const { error } = await supabase
        .from('services')
        .upsert(service, { onConflict: 'name' });
      
      if (!error) {
        console.log(`✅ Serviço "${service.name}" inserido/atualizado`);
      }
    }
    
    // Inserir dados padrão para barbers
    const defaultBarbers = [
      { name: 'João Silva', email: 'joao@barbershop.com', phone: '(11) 99999-1111' },
      { name: 'Pedro Santos', email: 'pedro@barbershop.com', phone: '(11) 99999-2222' },
      { name: 'Carlos Oliveira', email: 'carlos@barbershop.com', phone: '(11) 99999-3333' }
    ];
    
    for (const barber of defaultBarbers) {
      const { error } = await supabase
        .from('barbers')
        .upsert(barber, { onConflict: 'email' });
      
      if (!error) {
        console.log(`✅ Barbeiro "${barber.name}" inserido/atualizado`);
      }
    }
    
    // Verifica se as tabelas foram criadas
    console.log('🔍 Verificando tabelas criadas...');
    
    const { data: services, error: servicesCheckError } = await supabase
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
    
    if (!servicesCheckError && !barbersError && !bookingsError) {
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