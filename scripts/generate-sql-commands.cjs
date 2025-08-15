const { v4: uuidv4 } = require('uuid');

// Função para determinar o papel do usuário baseado no email
function determineUserRole(email) {
  const adminEmails = ['admin@mateusbarber.com', 'mateus@mateusbarber.com', 'gerente@mateusbarber.com'];
  const barberEmails = ['joao@mateusbarber.com', 'barbeiro@mateusbarber.com', 'carlos@mateusbarber.com'];
  
  if (adminEmails.includes(email)) {
    return 'Admin';
  } else if (barberEmails.includes(email)) {
    return 'Barbeiro';
  } else if (email.includes('gerente')) {
    return 'Gerente';
  } else {
    return 'Cliente';
  }
}

function generateSQLCommands() {
  console.log('🔧 Gerando comandos SQL para popular a tabela profiles...');
  
  // Criar perfis de demonstração com mais clientes
  const demoProfiles = [
    // Administradores
    { email: 'admin@mateusbarber.com', name: 'Administrador Sistema' },
    { email: 'mateus@mateusbarber.com', name: 'Mateus Silva' },
    { email: 'gerente@mateusbarber.com', name: 'Gerente Barbearia' },
    
    // Barbeiros
    { email: 'joao@mateusbarber.com', name: 'João Barbeiro' },
    { email: 'barbeiro@mateusbarber.com', name: 'Barbeiro Principal' },
    { email: 'carlos@mateusbarber.com', name: 'Carlos Silva' },
    
    // Clientes
    { email: 'cliente1@exemplo.com', name: 'Ana Silva' },
    { email: 'cliente2@exemplo.com', name: 'Pedro Santos' },
    { email: 'cliente3@exemplo.com', name: 'Maria Oliveira' },
    { email: 'cliente4@exemplo.com', name: 'João Costa' },
    { email: 'cliente5@exemplo.com', name: 'Carla Ferreira' },
    { email: 'cliente6@exemplo.com', name: 'Roberto Lima' },
    { email: 'cliente7@exemplo.com', name: 'Fernanda Souza' },
    { email: 'cliente8@exemplo.com', name: 'Lucas Pereira' },
    { email: 'cliente9@exemplo.com', name: 'Beatriz Costa' },
    { email: 'cliente10@exemplo.com', name: 'Rafael Almeida' }
  ];
  
  console.log('\n📋 COMANDOS SQL PARA EXECUTAR NO SUPABASE SQL EDITOR:');
  console.log('\n-- 1. Primeiro, remover a foreign key constraint temporariamente');
  console.log('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;');
  
  console.log('\n-- 2. Limpar dados existentes (opcional)');
  console.log('DELETE FROM public.profiles;');
  
  console.log('\n-- 3. Inserir perfis de demonstração');
  
  demoProfiles.forEach((profileInfo, index) => {
    const profileData = {
      id: uuidv4(),
      email: profileInfo.email,
      full_name: profileInfo.name,
      user_role: determineUserRole(profileInfo.email),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log(`INSERT INTO public.profiles (id, email, full_name, user_role, created_at, updated_at)`);
    console.log(`VALUES ('${profileData.id}', '${profileData.email}', '${profileData.full_name}', '${profileData.user_role}', '${profileData.created_at}', '${profileData.updated_at}');`);
    console.log('');
  });
  
  console.log('-- 4. (OPCIONAL) Recriar a foreign key constraint se necessário');
  console.log('-- ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);');
  
  console.log('\n📊 RESUMO:');
  console.log(`- Total de perfis: ${demoProfiles.length}`);
  
  const roleCount = {};
  demoProfiles.forEach(profile => {
    const role = determineUserRole(profile.email);
    roleCount[role] = (roleCount[role] || 0) + 1;
  });
  
  console.log('\n👥 Perfis por função:');
  Object.entries(roleCount).forEach(([role, count]) => {
    console.log(`   ${role}: ${count}`);
  });
  
  const clients = demoProfiles.filter(p => determineUserRole(p.email) === 'Cliente');
  console.log('\n📋 Clientes que serão cadastrados:');
  clients.forEach((client, index) => {
    console.log(`   ${index + 1}. ${client.name} (${client.email})`);
  });
  
  console.log('\n🔐 Para acessar como admin após executar os comandos:');
  console.log('   - admin@mateusbarber.com');
  console.log('   - mateus@mateusbarber.com');
  console.log('   - gerente@mateusbarber.com');
  
  console.log('\n📱 Acesse a aplicação em: http://localhost:8080/');
  
  console.log('\n📝 INSTRUÇÕES:');
  console.log('1. Copie todos os comandos SQL acima');
  console.log('2. Vá para o Supabase Dashboard > SQL Editor');
  console.log('3. Cole e execute os comandos');
  console.log('4. Atualize a página da aplicação');
  console.log('5. A aba "Gerenciar Perfis de Usuário" mostrará os clientes!');
}

generateSQLCommands();