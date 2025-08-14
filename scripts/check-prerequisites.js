// Script para verificar pré-requisitos do projeto
// Execute com: node scripts/check-prerequisites.js

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command, name) {
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${name}: ${result.trim()}`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${name}: Não instalado`, 'red');
    return false;
  }
}

function checkFile(filePath, name) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${name}: Encontrado`, 'green');
    return true;
  } else {
    log(`❌ ${name}: Não encontrado`, 'red');
    return false;
  }
}

function checkEnvironmentVariable(varName) {
  if (process.env[varName]) {
    log(`✅ ${varName}: Configurada`, 'green');
    return true;
  } else {
    log(`❌ ${varName}: Não configurada`, 'red');
    return false;
  }
}

async function main() {
  log('🔍 Verificando Pré-requisitos do Smooth Cuts Booking\n', 'bold');
  
  let allGood = true;
  
  // Verificar Node.js e npm
  log('📦 Verificando Node.js e npm:', 'blue');
  allGood &= checkCommand('node --version', 'Node.js');
  allGood &= checkCommand('npm --version', 'npm');
  
  console.log();
  
  // Verificar arquivos do projeto
  log('📁 Verificando arquivos do projeto:', 'blue');
  allGood &= checkFile('package.json', 'package.json');
  allGood &= checkFile('src/integrations/supabase/client.ts', 'Configuração Supabase');
  allGood &= checkFile('supabase/migrations/001_create_bookings_tables.sql', 'Migração do banco');
  
  console.log();
  
  // Verificar dependências
  log('🔧 Verificando dependências:', 'blue');
  const nodeModulesExists = checkFile('node_modules', 'node_modules');
  if (!nodeModulesExists) {
    log('💡 Execute: npm install', 'yellow');
    allGood = false;
  }
  
  console.log();
  
  // Verificar variáveis de ambiente
  log('🌍 Verificando variáveis de ambiente:', 'blue');
  const hasSupabaseKey = checkEnvironmentVariable('SUPABASE_SERVICE_KEY');
  if (!hasSupabaseKey) {
    log('💡 Configure: $env:SUPABASE_SERVICE_KEY="sua_chave_aqui"', 'yellow');
    allGood = false;
  }
  
  console.log();
  
  // Resultado final
  if (allGood) {
    log('🎉 Todos os pré-requisitos estão OK!', 'green');
    log('🚀 Você pode executar: npm run dev', 'green');
  } else {
    log('⚠️  Alguns pré-requisitos precisam ser configurados.', 'yellow');
    log('📖 Consulte o arquivo GUIA_INICIALIZACAO.md para instruções detalhadas.', 'blue');
  }
  
  console.log();
  log('📋 Comandos úteis:', 'blue');
  log('  npm install          - Instalar dependências');
  log('  npm run setup-db     - Configurar banco de dados');
  log('  npm run dev          - Iniciar aplicação');
  log('  npm run build        - Gerar build de produção');
}

main().catch(console.error);