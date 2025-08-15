require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteFakeRecords() {
  try {
    console.log('=== EXCLUINDO REGISTROS FAKE DO PAINEL DO BARBEIRO ===\n');
    
    // 1. Listar todos os perfis antes da exclusão
    console.log('1. Verificando perfis existentes...');
    const { data: allProfilesBefore } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, user_role')
      .order('email');
    
    console.log(`📊 Total de perfis antes da limpeza: ${allProfilesBefore?.length || 0}`);
    
    if (allProfilesBefore && allProfilesBefore.length > 0) {
      console.log('\n📋 Perfis atuais:');
      allProfilesBefore.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.email} | ${profile.full_name || 'Sem nome'} | ${profile.user_role || 'Sem role'}`);
      });
    }
    
    // 2. Identificar e excluir perfis fake/teste
    console.log('\n2. Identificando perfis fake para exclusão...');
    
    const fakeProfiles = [
      // Perfis de teste criados recentemente
      '3173d3c1-4c20-4d8a-a75a-9d6635932ca9', // UUID problemático
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    ];
    
    const fakeEmails = [
      'usuario.uuid@exemplo.com',
      'teste.11111111@exemplo.com',
      'teste.22222222@exemplo.com',
      'teste.33333333@exemplo.com',
      'teste.aaaaaaaa@exemplo.com',
      'teste.bbbbbbbb@exemplo.com',
      'cliente@exemplo.com' // Se ainda existir
    ];
    
    // Excluir por ID
    for (const fakeId of fakeProfiles) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', fakeId)
        .single();
      
      if (profile) {
        console.log(`🗑️  Excluindo perfil por ID: ${fakeId} (${profile.email})`);
        
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', fakeId);
        
        if (error) {
          console.error(`❌ Erro ao excluir ${fakeId}: ${error.message}`);
        } else {
          console.log(`✅ Perfil ${profile.email} excluído com sucesso`);
        }
      }
    }
    
    // Excluir por email
    for (const fakeEmail of fakeEmails) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('email', fakeEmail)
        .single();
      
      if (profile) {
        console.log(`🗑️  Excluindo perfil por email: ${fakeEmail}`);
        
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('email', fakeEmail);
        
        if (error) {
          console.error(`❌ Erro ao excluir ${fakeEmail}: ${error.message}`);
        } else {
          console.log(`✅ Perfil ${fakeEmail} excluído com sucesso`);
        }
      }
    }
    
    // 3. Excluir agendamentos fake do Supabase (se houver)
    console.log('\n3. Verificando agendamentos fake no Supabase...');
    
    const { data: supabaseBookings } = await supabase
      .from('bookings')
      .select('id, user_id')
      .in('user_id', [...fakeProfiles, ...fakeEmails]);
    
    if (supabaseBookings && supabaseBookings.length > 0) {
      console.log(`🗑️  Encontrados ${supabaseBookings.length} agendamentos fake no Supabase`);
      
      for (const booking of supabaseBookings) {
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', booking.id);
        
        if (error) {
          console.error(`❌ Erro ao excluir agendamento ${booking.id}: ${error.message}`);
        } else {
          console.log(`✅ Agendamento ${booking.id} excluído`);
        }
      }
    } else {
      console.log('✅ Nenhum agendamento fake encontrado no Supabase');
    }
    
    // 4. Verificar resultado final
    console.log('\n4. Verificando resultado final...');
    const { data: allProfilesAfter } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, user_role')
      .order('email');
    
    console.log(`\n📊 Total de perfis após limpeza: ${allProfilesAfter?.length || 0}`);
    
    if (allProfilesAfter && allProfilesAfter.length > 0) {
      console.log('\n📋 Perfis restantes (apenas reais):');
      allProfilesAfter.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.email} | ${profile.full_name || 'Sem nome'} | ${profile.user_role || 'Sem role'}`);
      });
    }
    
    const deletedCount = (allProfilesBefore?.length || 0) - (allProfilesAfter?.length || 0);
    console.log(`\n🗑️  Total de perfis fake excluídos: ${deletedCount}`);
    
    console.log('\n✅ Limpeza de registros fake concluída!');
    console.log('\n💡 Próximos passos:');
    console.log('   1. Limpe o localStorage usando clear-localStorage-test.html');
    console.log('   2. Teste o Painel do Barbeiro para confirmar que apenas dados reais aparecem');
    console.log('   3. Faça novos agendamentos reais se necessário');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

deleteFakeRecords();