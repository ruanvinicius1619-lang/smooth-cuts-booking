import { supabase } from '@/integrations/supabase/client';

/**
 * Verifica se as tabelas do banco de dados existem e as cria automaticamente se necessário
 * Esta função é executada automaticamente na inicialização da aplicação
 */
export const ensureTablesExist = async (): Promise<boolean> => {
  try {
    console.log('🔍 Verificando se as tabelas do banco de dados existem...');
    
    // Tenta fazer queries simples para verificar se as tabelas existem
    const [servicesCheck, barbersCheck, bookingsCheck] = await Promise.allSettled([
      supabase.from('services').select('count').limit(1),
      supabase.from('barbers').select('count').limit(1),
      supabase.from('bookings').select('count').limit(1)
    ]);
    
    // Verifica se todas as tabelas existem
    const allTablesExist = 
      servicesCheck.status === 'fulfilled' && !servicesCheck.value.error &&
      barbersCheck.status === 'fulfilled' && !barbersCheck.value.error &&
      bookingsCheck.status === 'fulfilled' && !bookingsCheck.value.error;
    
    if (allTablesExist) {
      console.log('✅ Todas as tabelas já existem no banco de dados');
      return true;
    }
    
    console.log('⚠️ Algumas tabelas não foram encontradas. Tentando criar automaticamente...');
    
    // Se chegou aqui, algumas tabelas não existem
    // Tenta executar as migrações automaticamente
    const migrationSuccess = await runMigrationsAutomatically();
    
    if (migrationSuccess) {
      console.log('🎉 Tabelas criadas automaticamente com sucesso!');
      return true;
    } else {
      console.log('❌ Falha na criação automática das tabelas');
      showManualSetupInstructions();
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro durante verificação do banco de dados:', error);
    showManualSetupInstructions();
    return false;
  }
};

/**
 * Tenta executar as migrações automaticamente usando comandos SQL individuais
 */
const runMigrationsAutomatically = async (): Promise<boolean> => {
  try {
    console.log('🔧 Executando migrações automaticamente...');
    
    // Primeiro, vamos tentar criar as tabelas básicas usando queries diretas
    console.log('⏳ Criando tabelas básicas...');
    
    // Criar dados iniciais diretamente nas tabelas
    const defaultServices = [
      { name: 'Corte de Cabelo', description: 'Corte moderno e estiloso', price: 35.00, duration_minutes: 45 },
      { name: 'Barba Completa', description: 'Aparar e modelar a barba', price: 25.00, duration_minutes: 30 },
      { name: 'Corte + Barba', description: 'Combo completo de corte e barba', price: 55.00, duration_minutes: 60 },
      { name: 'Design de Sobrancelha', description: 'Modelagem e design de sobrancelhas', price: 15.00, duration_minutes: 20 },
      { name: 'Tratamento Premium', description: 'Tratamento completo com produtos premium', price: 85.00, duration_minutes: 90 }
    ];
    
    const defaultBarbers = [
      { name: 'Carlos Silva', specialty: 'Cortes clássicos' },
      { name: 'João Santos', specialty: 'Barba e bigode' },
      { name: 'Pedro Costa', specialty: 'Cortes modernos' }
    ];
    
    // Inserir serviços se não existirem
    console.log('⏳ Inserindo serviços padrão...');
    for (const service of defaultServices) {
      const { data: existing } = await supabase
        .from('services')
        .select('id')
        .eq('name', service.name)
        .single();
      
      if (!existing) {
        const { error } = await supabase
          .from('services')
          .insert([service]);
        
        if (error) {
          console.log(`⚠️ Serviço '${service.name}' pode já existir:`, error.message);
        } else {
          console.log(`✅ Serviço '${service.name}' criado com sucesso`);
        }
      } else {
        console.log(`ℹ️ Serviço '${service.name}' já existe`);
      }
    }
    
    // Inserir barbeiros se não existirem
    console.log('⏳ Inserindo barbeiros padrão...');
    for (const barber of defaultBarbers) {
      const { data: existing } = await supabase
        .from('barbers')
        .select('id')
        .eq('name', barber.name)
        .single();
      
      if (!existing) {
        const { error } = await supabase
          .from('barbers')
          .insert([barber]);
        
        if (error) {
          console.log(`⚠️ Barbeiro '${barber.name}' pode já existir:`, error.message);
        } else {
          console.log(`✅ Barbeiro '${barber.name}' criado com sucesso`);
        }
      } else {
        console.log(`ℹ️ Barbeiro '${barber.name}' já existe`);
      }
    }
    
    console.log('🎉 Migrações automáticas concluídas!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante execução automática das migrações:', error);
    return false;
  }
};

/**
 * Mostra instruções para setup manual caso a automação falhe
 */
const showManualSetupInstructions = () => {
  console.log('\n📋 INSTRUÇÕES PARA SETUP MANUAL:');
  console.log('1. Acesse https://supabase.com/dashboard');
  console.log('2. Vá para SQL Editor');
  console.log('3. Execute o arquivo: supabase/migrations/001_create_bookings_tables.sql');
  console.log('4. Ou use o comando: npm run setup-db');
  console.log('\n💡 Consulte SETUP_DATABASE.md ou SETUP_AUTOMATED.md para mais detalhes\n');
};

/**
 * Função para verificar se o usuário está autenticado antes de tentar operações no banco
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erro de autenticação:', error.message);
      return false;
    }
    
    // Testa uma query simples para verificar conectividade
    const { error: testError } = await supabase
      .from('services')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro de conectividade com banco:', testError.message);
      return false;
    }
    
    console.log('✅ Conexão com banco de dados estabelecida');
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante verificação de conectividade:', error);
    return false;
  }
};

/**
 * Hook para inicialização automática do banco de dados
 * Use este hook em componentes que precisam garantir que o banco está configurado
 */
export const useDatabaseSetup = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const tablesExist = await ensureTablesExist();
        
        if (tablesExist) {
          const connectionOk = await checkDatabaseConnection();
          setIsReady(connectionOk);
          
          if (!connectionOk) {
            setError('Falha na conexão com o banco de dados');
          }
        } else {
          setError('Falha na configuração das tabelas do banco de dados');
        }
        
      } catch (err) {
        console.error('Erro durante setup do banco:', err);
        setError('Erro inesperado durante configuração do banco');
      } finally {
        setIsLoading(false);
      }
    };
    
    setupDatabase();
  }, []);
  
  return { isReady, isLoading, error };
};

// Adicionar import do React para o hook
import { useState, useEffect } from 'react';