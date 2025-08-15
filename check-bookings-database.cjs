const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkBookings() {
  try {
    console.log('=== VERIFICANDO AGENDAMENTOS NA TABELA BOOKINGS ===');
    
    // Primeiro, verificar se há agendamentos
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        user_id,
        booking_date,
        booking_time,
        status,
        notes,
        created_at,
        services (name, price),
        barbers (name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return;
    }
    
    console.log('Total de agendamentos na tabela:', bookings?.length || 0);
    
    if (bookings && bookings.length > 0) {
      console.log('\n=== AGENDAMENTOS ENCONTRADOS ===');
      bookings.forEach((booking, index) => {
        console.log(`\nAgendamento ${index + 1}:`);
        console.log('  ID:', booking.id);
        console.log('  User ID:', booking.user_id);
        console.log('  Data:', booking.booking_date);
        console.log('  Horário:', booking.booking_time);
        console.log('  Status:', booking.status);
        console.log('  Serviço:', booking.services?.name || 'N/A');
        console.log('  Barbeiro:', booking.barbers?.name || 'N/A');
        console.log('  Criado em:', booking.created_at);
      });
      
      // Agora buscar perfis dos usuários
      console.log('\n=== BUSCANDO PERFIS DOS USUÁRIOS ===');
      const userIds = [...new Set(bookings.map(b => b.user_id))];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
      } else {
        console.log('Perfis encontrados:', profiles?.length || 0);
        
        if (profiles && profiles.length > 0) {
          profiles.forEach(profile => {
            console.log(`\nPerfil:`);
            console.log('  ID:', profile.id);
            console.log('  Email:', profile.email);
            console.log('  Nome:', profile.full_name);
            console.log('  Telefone:', profile.phone);
          });
          
          // Verificar especificamente o usuário egrinaldo19@gmail.com
          const egrinaldoProfile = profiles.find(p => p.email === 'egrinaldo19@gmail.com');
          if (egrinaldoProfile) {
            console.log('\n=== USUÁRIO EGRINALDO19@GMAIL.COM ENCONTRADO ===');
            console.log('Perfil:', egrinaldoProfile);
            
            const egrinaldoBookings = bookings.filter(b => b.user_id === egrinaldoProfile.id);
            console.log('Agendamentos do egrinaldo19@gmail.com:', egrinaldoBookings.length);
            
            egrinaldoBookings.forEach((booking, index) => {
              console.log(`\nAgendamento ${index + 1} do egrinaldo19@gmail.com:`);
              console.log('  ID:', booking.id);
              console.log('  Data:', booking.booking_date);
              console.log('  Horário:', booking.booking_time);
              console.log('  Status:', booking.status);
              console.log('  Serviço:', booking.services?.name);
              console.log('  Barbeiro:', booking.barbers?.name);
            });
          } else {
            console.log('\n❌ Usuário egrinaldo19@gmail.com NÃO encontrado na tabela profiles');
          }
        }
      }
      
      // Lista de emails administrativos para verificar filtro
      const adminEmails = [
        'admin@mateusbarber.com',
        'mateus@mateusbarber.com', 
        'gerente@mateusbarber.com',
        'barbeiro@smoothcuts.com'
      ];
      
      console.log('\n=== VERIFICANDO FILTRO DE EMAILS ADMINISTRATIVOS ===');
      if (profiles) {
        const adminProfiles = profiles.filter(p => adminEmails.includes(p.email));
        const clientProfiles = profiles.filter(p => !adminEmails.includes(p.email));
        
        console.log('Perfis administrativos:', adminProfiles.length);
        adminProfiles.forEach(p => console.log('  -', p.email));
        
        console.log('Perfis de clientes:', clientProfiles.length);
        clientProfiles.forEach(p => console.log('  -', p.email));
      }
      
    } else {
      console.log('\n❌ Nenhum agendamento encontrado na tabela bookings');
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkBookings();