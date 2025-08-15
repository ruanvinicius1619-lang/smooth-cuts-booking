require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEgrinaldoProfile() {
  try {
    console.log('=== CORRIGINDO PERFIL DO EGRINALDO25@OUTLOOK.COM ===\n');
    
    // 1. Verificar se já existe um perfil para egrinaldo25@outlook.com
    console.log('1. Verificando perfil existente para egrinaldo25@outlook.com...');
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'egrinaldo25@outlook.com')
      .single();
    
    if (existingProfile) {
      console.log('✅ Perfil encontrado:', existingProfile);
      console.log('📝 Atualizando dados do perfil...');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: 'Egrinaldo Outlook',
          phone: '(11) 98765-1234',
          user_role: 'client'
        })
        .eq('email', 'egrinaldo25@outlook.com');
      
      if (updateError) {
        console.error('❌ Erro ao atualizar:', updateError.message);
      } else {
        console.log('✅ Perfil atualizado com sucesso!');
      }
    } else {
      console.log('➕ Criando novo perfil para egrinaldo25@outlook.com...');
      
      // Gerar um UUID válido
      const newUuid = uuidv4();
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: newUuid,
          email: 'egrinaldo25@outlook.com',
          full_name: 'Egrinaldo Outlook',
          phone: '(11) 98765-1234',
          user_role: 'client'
        });
      
      if (insertError) {
        console.error('❌ Erro ao criar perfil:', insertError.message);
      } else {
        console.log('✅ Perfil criado com sucesso!');
        console.log('🆔 UUID gerado:', newUuid);
      }
    }
    
    // 2. Remover ou corrigir o perfil cliente@exemplo.com que está causando confusão
    console.log('\n2. Corrigindo perfil cliente@exemplo.com...');
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('email', 'cliente@exemplo.com');
    
    if (deleteError) {
      console.error('❌ Erro ao remover cliente@exemplo.com:', deleteError.message);
    } else {
      console.log('✅ Perfil cliente@exemplo.com removido');
    }
    
    // 3. Verificar resultado final
    console.log('\n3. Verificando todos os perfis...');
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('*')
      .order('email');
    
    console.log(`\n📊 Total de profiles: ${allProfiles?.length || 0}`);
    
    if (allProfiles && allProfiles.length > 0) {
      console.log('\n📋 Profiles atuais:');
      allProfiles.forEach(profile => {
        console.log(`  - ${profile.email} | ${profile.full_name || 'Sem nome'} | ${profile.phone || 'Sem telefone'} | ${profile.user_role || 'Sem role'}`);
      });
    }
    
    console.log('\n✅ Correção concluída!');
    console.log('\n💡 Agora teste novamente o Painel do Barbeiro.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixEgrinaldoProfile();