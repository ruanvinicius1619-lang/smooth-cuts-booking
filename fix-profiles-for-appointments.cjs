require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Definida' : '❌ Não definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProfilesForAppointments() {
  try {
    console.log('=== CORRIGINDO TABELA PROFILES PARA AGENDAMENTOS ===\n');
    
    // 1. Verificar se a tabela profiles existe
    console.log('1. Verificando tabela profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erro ao acessar tabela profiles:', profilesError.message);
      return;
    }
    
    console.log('✅ Tabela profiles acessível');
    
    // 2. Verificar dados existentes na tabela profiles
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (allProfilesError) {
      console.error('❌ Erro ao buscar profiles:', allProfilesError.message);
      return;
    }
    
    console.log(`📊 Profiles existentes: ${allProfiles?.length || 0}`);
    
    if (allProfiles && allProfiles.length > 0) {
      console.log('\n📋 Profiles encontrados:');
      allProfiles.forEach(profile => {
        console.log(`  - ${profile.email} | ${profile.full_name || 'Sem nome'} | ${profile.phone || 'Sem telefone'}`);
      });
    }
    
    // 3. Criar perfis de exemplo para teste
    console.log('\n2. Criando perfis de exemplo para teste...');
    
    const testProfiles = [
      {
        id: '3173d3c1-4c20-4d8a-a75a-9d6635932ca9',
        email: 'cliente@exemplo.com',
        full_name: 'João Silva',
        phone: '(11) 99999-9999',
        user_role: 'client'
      },
      {
        id: 'egrinaldo19@gmail.com',
        email: 'egrinaldo19@gmail.com',
        full_name: 'Egrinaldo Santos',
        phone: '(11) 98765-4321',
        user_role: 'client'
      },
      {
        id: 'egrinaldo25@outlook.com',
        email: 'egrinaldo25@outlook.com',
        full_name: 'Egrinaldo Outlook',
        phone: '(11) 98765-1234',
        user_role: 'client'
      }
    ];
    
    for (const profile of testProfiles) {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', profile.id)
        .single();
      
      if (existing) {
        console.log(`⚠️  Profile ${profile.email} já existe, atualizando...`);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            email: profile.email,
            full_name: profile.full_name,
            phone: profile.phone,
            user_role: profile.user_role
          })
          .eq('id', profile.id);
        
        if (updateError) {
          console.error(`❌ Erro ao atualizar ${profile.email}:`, updateError.message);
        } else {
          console.log(`✅ Profile ${profile.email} atualizado`);
        }
      } else {
        console.log(`➕ Criando profile ${profile.email}...`);
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profile);
        
        if (insertError) {
          console.error(`❌ Erro ao criar ${profile.email}:`, insertError.message);
        } else {
          console.log(`✅ Profile ${profile.email} criado`);
        }
      }
    }
    
    // 4. Verificar resultado final
    console.log('\n3. Verificando resultado final...');
    const { data: finalProfiles } = await supabase
      .from('profiles')
      .select('*');
    
    console.log(`\n📊 Total de profiles após correção: ${finalProfiles?.length || 0}`);
    
    if (finalProfiles && finalProfiles.length > 0) {
      console.log('\n📋 Profiles finais:');
      finalProfiles.forEach(profile => {
        console.log(`  - ${profile.email} | ${profile.full_name || 'Sem nome'} | ${profile.phone || 'Sem telefone'} | ${profile.user_role || 'Sem role'}`);
      });
    }
    
    console.log('\n✅ Correção da tabela profiles concluída!');
    console.log('\n💡 Agora teste o Painel do Barbeiro para ver se os dados reais aparecem.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixProfilesForAppointments();