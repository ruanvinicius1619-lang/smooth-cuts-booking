const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugEgrinaldoAppointments() {
  console.log('🔍 Investigando agendamentos do usuário egrinaldo25@outlook.com...');
  console.log('=' .repeat(60));

  try {
    // 1. Verificar se o usuário existe na tabela profiles
    console.log('\n1. Verificando perfil do usuário...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'egrinaldo25@outlook.com');

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Perfil encontrado:');
      profiles.forEach(profile => {
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Nome: ${profile.full_name || 'Não definido'}`);
        console.log(`   - Email: ${profile.email}`);
        console.log(`   - Telefone: ${profile.phone || 'Não definido'}`);
        console.log(`   - Criado em: ${profile.created_at}`);
      });
    } else {
      console.log('⚠️  Nenhum perfil encontrado para egrinaldo25@outlook.com');
    }

    // 2. Verificar agendamentos na tabela bookings
    console.log('\n2. Verificando agendamentos na tabela bookings...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles!inner(
          id,
          email,
          full_name,
          phone
        )
      `)
      .eq('profiles.email', 'egrinaldo25@outlook.com')
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('❌ Erro ao buscar agendamentos:', bookingsError);
    } else if (bookings && bookings.length > 0) {
      console.log(`✅ ${bookings.length} agendamento(s) encontrado(s):`);
      bookings.forEach((booking, index) => {
        console.log(`\n   Agendamento ${index + 1}:`);
        console.log(`   - ID: ${booking.id}`);
        console.log(`   - User ID: ${booking.user_id}`);
        console.log(`   - Data: ${booking.date}`);
        console.log(`   - Hora: ${booking.time}`);
        console.log(`   - Serviços: ${booking.services ? booking.services.join(', ') : 'Não definido'}`);
        console.log(`   - Status: ${booking.status}`);
        console.log(`   - Criado em: ${booking.created_at}`);
        if (booking.profiles) {
          console.log(`   - Perfil: ${booking.profiles.full_name} (${booking.profiles.email})`);
          console.log(`   - Telefone: ${booking.profiles.phone || 'Não definido'}`);
        }
      });
    } else {
      console.log('⚠️  Nenhum agendamento encontrado para egrinaldo25@outlook.com');
    }

    // 3. Verificar todos os agendamentos recentes (últimas 24 horas)
    console.log('\n3. Verificando agendamentos recentes (últimas 24 horas)...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentBookings, error: recentError } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles(
          id,
          email,
          full_name,
          phone
        )
      `)
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false });

    if (recentError) {
      console.error('❌ Erro ao buscar agendamentos recentes:', recentError);
    } else if (recentBookings && recentBookings.length > 0) {
      console.log(`✅ ${recentBookings.length} agendamento(s) recente(s) encontrado(s):`);
      recentBookings.forEach((booking, index) => {
        console.log(`\n   Agendamento ${index + 1}:`);
        console.log(`   - ID: ${booking.id}`);
        console.log(`   - User ID: ${booking.user_id}`);
        console.log(`   - Data: ${booking.date}`);
        console.log(`   - Hora: ${booking.time}`);
        console.log(`   - Status: ${booking.status}`);
        console.log(`   - Criado em: ${booking.created_at}`);
        if (booking.profiles) {
          console.log(`   - Email: ${booking.profiles.email}`);
          console.log(`   - Nome: ${booking.profiles.full_name || 'Não definido'}`);
        } else {
          console.log(`   - ⚠️  Perfil não encontrado para user_id: ${booking.user_id}`);
        }
      });
    } else {
      console.log('⚠️  Nenhum agendamento recente encontrado');
    }

    // 4. Verificar se há agendamentos órfãos (sem perfil)
    console.log('\n4. Verificando agendamentos órfãos (sem perfil)...');
    const { data: orphanBookings, error: orphanError } = await supabase
      .from('bookings')
      .select('*')
      .is('user_id', null)
      .order('created_at', { ascending: false });

    if (orphanError) {
      console.error('❌ Erro ao buscar agendamentos órfãos:', orphanError);
    } else if (orphanBookings && orphanBookings.length > 0) {
      console.log(`⚠️  ${orphanBookings.length} agendamento(s) órfão(s) encontrado(s):`);
      orphanBookings.forEach((booking, index) => {
        console.log(`   - ID: ${booking.id}, Data: ${booking.date}, Hora: ${booking.time}`);
      });
    } else {
      console.log('✅ Nenhum agendamento órfão encontrado');
    }

  } catch (error) {
    console.error('❌ Erro durante a investigação:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔍 Investigação concluída!');
}

debugEgrinaldoAppointments();