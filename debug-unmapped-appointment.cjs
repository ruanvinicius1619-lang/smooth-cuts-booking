require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUnmappedAppointment() {
  try {
    console.log('=== DEBUG: AGENDAMENTO NÃO MAPEADO ===\n');
    
    // 1. Verificar agendamentos no localStorage (simulando o que o componente faz)
    console.log('1. Simulando busca no localStorage...');
    // Como não podemos acessar localStorage diretamente, vamos buscar no Supabase
    
    // 2. Buscar todos os agendamentos do Supabase
    console.log('2. Buscando agendamentos do Supabase...');
    const { data: supabaseBookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_date,
        booking_time,
        status,
        notes,
        created_at,
        user_id,
        services (name, price, duration),
        barbers (name)
      `);
    
    if (error) {
      console.error('❌ Erro ao buscar agendamentos:', error.message);
      return;
    }
    
    console.log(`📊 Agendamentos encontrados no Supabase: ${supabaseBookings?.length || 0}`);
    
    if (supabaseBookings && supabaseBookings.length > 0) {
      console.log('\n📋 Agendamentos do Supabase:');
      supabaseBookings.forEach((booking, index) => {
        console.log(`  ${index + 1}. ID: ${booking.id}`);
        console.log(`     User ID: ${booking.user_id}`);
        console.log(`     Data: ${booking.booking_date}`);
        console.log(`     Hora: ${booking.booking_time}`);
        console.log(`     Status: ${booking.status}`);
        console.log(`     Serviço: ${booking.services?.name || 'N/A'}`);
        console.log(`     Barbeiro: ${booking.barbers?.name || 'N/A'}`);
        console.log('');
      });
    }
    
    // 3. Buscar todos os perfis
    console.log('3. Buscando todos os perfis...');
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone')
      .order('email');
    
    console.log(`📊 Perfis encontrados: ${allProfiles?.length || 0}`);
    
    if (allProfiles && allProfiles.length > 0) {
      console.log('\n📋 Perfis disponíveis:');
      allProfiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ID: ${profile.id}`);
        console.log(`     Email: ${profile.email}`);
        console.log(`     Nome: ${profile.full_name || 'Sem nome'}`);
        console.log(`     Telefone: ${profile.phone || 'Sem telefone'}`);
        console.log('');
      });
    }
    
    // 4. Verificar mapeamento
    if (supabaseBookings && allProfiles) {
      console.log('4. Verificando mapeamento user_id -> profile...');
      
      const uniqueUserIds = [...new Set(supabaseBookings.map(booking => booking.user_id).filter(Boolean))];
      console.log(`\n🔍 User IDs únicos nos agendamentos: ${uniqueUserIds.length}`);
      
      uniqueUserIds.forEach(userId => {
        console.log(`\n🔍 Verificando user_id: ${userId}`);
        
        // Buscar por email
        const profileByEmail = allProfiles.find(p => p.email === userId);
        if (profileByEmail) {
          console.log(`  ✅ Encontrado por EMAIL: ${profileByEmail.full_name} (${profileByEmail.email})`);
        } else {
          console.log(`  ❌ NÃO encontrado por EMAIL`);
        }
        
        // Buscar por ID
        const profileById = allProfiles.find(p => p.id === userId);
        if (profileById) {
          console.log(`  ✅ Encontrado por ID: ${profileById.full_name} (${profileById.email})`);
        } else {
          console.log(`  ❌ NÃO encontrado por ID`);
        }
        
        if (!profileByEmail && !profileById) {
          console.log(`  🚨 PROBLEMA: User ID ${userId} não tem perfil correspondente!`);
          console.log(`  💡 Este é provavelmente o agendamento com "Nome não configurado"`);
        }
      });
    }
    
    console.log('\n✅ Debug concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugUnmappedAppointment();