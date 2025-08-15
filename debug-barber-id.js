// Script para debugar o problema do barber_id "barba"
console.log('=== DEBUG: Investigando problema do barber_id ===');

// Verificar localStorage
console.log('1. Verificando localStorage:');
console.log('adminBarbers:', localStorage.getItem('adminBarbers'));
console.log('userBookings:', localStorage.getItem('userBookings'));

// Verificar se há algum agendamento com barber_id "barba"
const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
console.log('2. Agendamentos encontrados:', bookings.length);
bookings.forEach((booking, index) => {
  console.log(`Agendamento ${index + 1}:`, {
    id: booking.id,
    barber_id: booking.barber_id,
    service_id: booking.service_id,
    status: booking.status
  });
  
  if (booking.barber_id === 'barba') {
    console.log('❌ PROBLEMA ENCONTRADO: barber_id = "barba"');
    console.log('Agendamento completo:', booking);
  }
});

// Verificar barbeiros disponíveis
const adminBarbers = JSON.parse(localStorage.getItem('adminBarbers') || '[]');
console.log('3. Barbeiros no localStorage:', adminBarbers);

// Verificar se há confusão entre service_id e barber_id
const adminServices = JSON.parse(localStorage.getItem('adminServices') || '[]');
console.log('4. Serviços disponíveis:');
adminServices.forEach(service => {
  console.log(`- ${service.id}: ${service.name}`);
  if (service.id === 'barba') {
    console.log('⚠️ ATENÇÃO: Existe um serviço com ID "barba"');
  }
});

console.log('=== FIM DO DEBUG ===');