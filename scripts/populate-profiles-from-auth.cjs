require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('Verifique se VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateProfilesFromAuth() {
  console.log('🚀 Populando tabela profiles com usuários existentes...');
  
  try {
    // Primeiro, vamos verificar se a tabela profiles existe
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Tabela profiles não encontrada:', profilesError.message);
      console.log('\n📋 Execute primeiro o SQL para criar a tabela profiles no Supabase SQL Editor:');
      console.log(`
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_role TEXT DEFAULT 'Cliente' NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN ('admin@mateusbarber.com', 'mateus@mateusbarber.com', 'gerente@mateusbarber.com')
  );

CREATE POLICY "Admin can update all profiles" ON public.profiles
  FOR UPDATE USING (
    auth.jwt() ->> 'email' IN ('admin@mateusbarber.com', 'mateus@mateusbarber.com', 'gerente@mateusbarber.com')
  );

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);`);
      return;
    }
    
    console.log('✅ Tabela profiles encontrada!');
    
    // Vamos criar alguns perfis de exemplo para teste
    const testProfiles = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        full_name: 'Administrador',
        email: 'admin@mateusbarber.com',
        user_role: 'Admin'
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        full_name: 'Mateus Silva',
        email: 'mateus@mateusbarber.com',
        user_role: 'Admin'
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        full_name: 'Gerente',
        email: 'gerente@mateusbarber.com',
        user_role: 'Gerente'
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        full_name: 'João Barbeiro',
        email: 'joao@mateusbarber.com',
        user_role: 'Barbeiro'
      },
      {
        id: '00000000-0000-0000-0000-000000000005',
        full_name: 'Maria Cliente',
        email: 'maria@cliente.com',
        user_role: 'Cliente'
      },
      {
        id: '00000000-0000-0000-0000-000000000006',
        full_name: 'Pedro Cliente',
        email: 'pedro@cliente.com',
        user_role: 'Cliente'
      }
    ];
    
    console.log('📝 Inserindo perfis de exemplo...');
    
    for (const profile of testProfiles) {
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'email' });
      
      if (insertError) {
        console.log(`⚠️  Erro ao inserir ${profile.email}:`, insertError.message);
      } else {
        console.log(`✅ Perfil criado: ${profile.email} - ${profile.user_role}`);
      }
    }
    
    // Verificar quantos perfis temos agora
    const { data: allProfiles, error: countError } = await supabase
      .from('profiles')
      .select('email, user_role');
    
    if (countError) {
      console.error('❌ Erro ao contar perfis:', countError.message);
    } else {
      console.log(`\n📊 Total de perfis na tabela: ${allProfiles.length}`);
      console.log('\n👥 Perfis por função:');
      const roleCount = {};
      allProfiles.forEach(profile => {
        roleCount[profile.user_role] = (roleCount[profile.user_role] || 0) + 1;
      });
      Object.entries(roleCount).forEach(([role, count]) => {
        console.log(`   ${role}: ${count}`);
      });
    }
    
    console.log('\n✅ Processo concluído! Agora você pode testar a aba "Gerenciar Perfis de Usuário".');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

populateProfilesFromAuth();