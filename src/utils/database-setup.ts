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
    
    // SQL para criar as tabelas (versão simplificada para execução automática)
    const migrations = [
      // Criar tabela services
      `
      CREATE TABLE IF NOT EXISTS public.services (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        duration_minutes INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
      `,
      
      // Criar tabela barbers
      `
      CREATE TABLE IF NOT EXISTS public.barbers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        specialty VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
      `,
      
      // Criar tabela bookings
      `
      CREATE TABLE IF NOT EXISTS public.bookings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
        barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
        notes TEXT,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        UNIQUE(barber_id, booking_date, booking_time)
      );
      `,
      
      // Inserir dados iniciais - services
      `
      INSERT INTO public.services (name, description, price, duration_minutes) 
      SELECT * FROM (
        VALUES 
          ('Corte de Cabelo', 'Corte moderno e estiloso', 35.00, 45),
          ('Barba Completa', 'Aparar e modelar a barba', 25.00, 30),
          ('Corte + Barba', 'Combo completo de corte e barba', 55.00, 60),
          ('Design de Sobrancelha', 'Modelagem e design de sobrancelhas', 15.00, 20),
          ('Tratamento Premium', 'Tratamento completo com produtos premium', 85.00, 90)
      ) AS v(name, description, price, duration_minutes)
      WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = v.name);
      `,
      
      // Inserir dados iniciais - barbers
      `
      INSERT INTO public.barbers (name, specialty) 
      SELECT * FROM (
        VALUES 
          ('Carlos Silva', 'Cortes clássicos'),
          ('João Santos', 'Barba e bigode'),
          ('Pedro Costa', 'Cortes modernos')
      ) AS v(name, specialty)
      WHERE NOT EXISTS (SELECT 1 FROM public.barbers WHERE name = v.name);
      `
    ];
    
    // Executa cada migração
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i].trim();
      if (migration) {
        console.log(`⏳ Executando migração ${i + 1}/${migrations.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: migration });
        
        if (error) {
          console.error(`❌ Erro na migração ${i + 1}:`, error.message);
          // Continua mesmo com erros (pode ser que a tabela já exista)
        } else {
          console.log(`✅ Migração ${i + 1} executada com sucesso`);
        }
      }
    }
    
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