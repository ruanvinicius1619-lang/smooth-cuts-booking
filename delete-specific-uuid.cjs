const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function deleteSpecificUUID() {
  try {
    const targetUUID = '3173d3c1-4c20-4d8a-a75a-9d6635932ca9';
    
    console.log(`🔍 Verificando se o UUID ${targetUUID} existe...`);
    
    // Verificar se o perfil existe
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUUID)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar perfil:', checkError);
      return;
    }
    
    if (!existingProfile) {
      console.log('ℹ️ UUID não encontrado na tabela profiles. Nada para excluir.');
      return;
    }
    
    console.log('📋 Perfil encontrado:', {
      id: existingProfile.id,
      email: existingProfile.email,
      full_name: existingProfile.full_name,
      phone: existingProfile.phone
    });
    
    // Excluir agendamentos associados primeiro (se existirem)
    console.log('🗑️ Verificando agendamentos associados...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', targetUUID);
    
    if (bookingsError) {
      console.error('❌ Erro ao verificar agendamentos:', bookingsError);
    } else if (bookings && bookings.length > 0) {
      console.log(`📅 Encontrados ${bookings.length} agendamentos. Excluindo...`);
      const { error: deleteBookingsError } = await supabase
        .from('bookings')
        .delete()
        .eq('user_id', targetUUID);
      
      if (deleteBookingsError) {
        console.error('❌ Erro ao excluir agendamentos:', deleteBookingsError);
        return;
      }
      console.log('✅ Agendamentos excluídos com sucesso.');
    } else {
      console.log('ℹ️ Nenhum agendamento encontrado para este UUID.');
    }
    
    // Excluir o perfil
    console.log('🗑️ Excluindo perfil...');
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', targetUUID);
    
    if (deleteError) {
      console.error('❌ Erro ao excluir perfil:', deleteError);
      return;
    }
    
    console.log('✅ Perfil excluído com sucesso!');
    
    // Verificar quantos perfis restam
    const { data: remainingProfiles, error: countError } = await supabase
      .from('profiles')
      .select('id, email, full_name');
    
    if (countError) {
      console.error('❌ Erro ao contar perfis restantes:', countError);
    } else {
      console.log(`📊 Total de perfis restantes: ${remainingProfiles.length}`);
      console.log('📋 Perfis restantes:');
      remainingProfiles.forEach(profile => {
        console.log(`  - ${profile.email} (${profile.full_name || 'Sem nome'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

deleteSpecificUUID();