require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUuidAppointment() {
  try {
    console.log('=== CORRIGINDO AGENDAMENTO COM UUID ===\n');
    
    // UUID problemático que aparece no exemplo do usuário
    const problematicUuid = '3173d3c1-4c20-4d8a-a75a-9d6635932ca9';
    
    console.log(`🔍 Verificando UUID problemático: ${problematicUuid}`);
    
    // 1. Verificar se já existe um perfil para este UUID
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', problematicUuid)
      .single();
    
    if (existingProfile) {
      console.log('✅ Perfil já existe:', existingProfile);
      console.log('📝 Atualizando dados do perfil...');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email: 'usuario.uuid@exemplo.com',
          full_name: 'Usuário UUID',
          phone: '(11) 99999-0000',
          user_role: 'client'
        })
        .eq('id', problematicUuid);
      
      if (updateError) {
        console.error('❌ Erro ao atualizar:', updateError.message);
      } else {
        console.log('✅ Perfil atualizado com sucesso!');
      }
    } else {
      console.log('➕ Criando novo perfil para o UUID...');
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: problematicUuid,
          email: 'usuario.uuid@exemplo.com',
          full_name: 'Usuário UUID',
          phone: '(11) 99999-0000',
          user_role: 'client'
        });
      
      if (insertError) {
        console.error('❌ Erro ao criar perfil:', insertError.message);
      } else {
        console.log('✅ Perfil criado com sucesso!');
        console.log('🆔 UUID usado:', problematicUuid);
      }
    }
    
    // 2. Verificar outros UUIDs que podem estar no localStorage
    console.log('\n🔍 Verificando outros possíveis UUIDs problemáticos...');
    
    // Lista de UUIDs comuns que podem aparecer em agendamentos de teste
    const commonTestUuids = [
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    ];
    
    for (const testUuid of commonTestUuids) {
      const { data: testProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUuid)
        .single();
      
      if (!testProfile) {
        console.log(`➕ Criando perfil para UUID de teste: ${testUuid}`);
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: testUuid,
            email: `teste.${testUuid.substring(0, 8)}@exemplo.com`,
            full_name: `Usuário Teste ${testUuid.substring(0, 8)}`,
            phone: `(11) 9999-${testUuid.substring(0, 4)}`,
            user_role: 'client'
          });
        
        if (insertError) {
          console.log(`⚠️  Erro ao criar perfil para ${testUuid}: ${insertError.message}`);
        } else {
          console.log(`✅ Perfil criado para ${testUuid}`);
        }
      }
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
        const isNewProfile = profile.id === problematicUuid || commonTestUuids.includes(profile.id);
        console.log(`  ${isNewProfile ? '🆕' : '  '} ${profile.email} | ${profile.full_name || 'Sem nome'} | ${profile.phone || 'Sem telefone'} | ${profile.user_role || 'Sem role'}`);
      });
    }
    
    console.log('\n✅ Correção concluída!');
    console.log('\n💡 Agora teste novamente o Painel do Barbeiro.');
    console.log('\n🔄 Se ainda houver problemas, verifique o localStorage com debug-problematic-appointment.html');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixUuidAppointment();