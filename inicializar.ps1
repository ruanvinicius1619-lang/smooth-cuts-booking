# Script de Inicialização Automática - Smooth Cuts Booking
# Execute com: .\inicializar.ps1

Write-Host "🚀 Inicializando Smooth Cuts Booking..." -ForegroundColor Cyan
Write-Host ""

# Função para verificar se um comando existe
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Verificar Node.js
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Instalando Node.js..." -ForegroundColor Yellow
    
    # Tentar instalar via winget
    if (Test-Command "winget") {
        Write-Host "🔧 Instalando via winget..." -ForegroundColor Blue
        try {
            winget install OpenJS.NodeJS
            Write-Host "✅ Node.js instalado com sucesso!" -ForegroundColor Green
            Write-Host "🔄 Reinicie o terminal e execute este script novamente." -ForegroundColor Yellow
            pause
            exit
        } catch {
            Write-Host "❌ Falha na instalação via winget" -ForegroundColor Red
        }
    }
    
    # Se winget falhar, orientar instalação manual
    Write-Host "📖 Instalação Manual Necessária:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Baixe a versão LTS" -ForegroundColor White
    Write-Host "3. Execute o instalador" -ForegroundColor White
    Write-Host "4. Reinicie o terminal" -ForegroundColor White
    Write-Host "5. Execute este script novamente" -ForegroundColor White
    Write-Host ""
    pause
    exit
}

# Verificar npm
Write-Host "📦 Verificando npm..." -ForegroundColor Yellow
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm não encontrado! Reinstale o Node.js." -ForegroundColor Red
    pause
    exit
}

Write-Host ""

# Verificar se package.json existe
if (Test-Path "package.json") {
    Write-Host "✅ Projeto encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ package.json não encontrado! Execute este script na pasta do projeto." -ForegroundColor Red
    pause
    exit
}

# Verificar node_modules
Write-Host "📁 Verificando dependências..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ Dependências já instaladas" -ForegroundColor Green
} else {
    Write-Host "📥 Instalando dependências..." -ForegroundColor Blue
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
        pause
        exit
    }
}

Write-Host ""

# Verificar configuração do Supabase
Write-Host "🔧 Verificando configuração do banco de dados..." -ForegroundColor Yellow
if ($env:SUPABASE_SERVICE_KEY) {
    Write-Host "✅ Chave do Supabase configurada" -ForegroundColor Green
    
    # Executar setup do banco
    Write-Host "🗄️ Configurando banco de dados..." -ForegroundColor Blue
    npm run setup-db
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Banco de dados configurado!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Erro na configuração do banco (pode já estar configurado)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Chave do Supabase não configurada" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Para configurar:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "2. Vá em Settings > API" -ForegroundColor White
    Write-Host "3. Copie a 'service_role' key" -ForegroundColor White
    Write-Host "4. Execute: `$env:SUPABASE_SERVICE_KEY=\"sua_chave_aqui\"" -ForegroundColor White
    Write-Host "5. Execute este script novamente" -ForegroundColor White
    Write-Host ""
    
    $key = Read-Host "Cole sua chave do Supabase aqui (ou pressione Enter para pular)"
    if ($key) {
        $env:SUPABASE_SERVICE_KEY = $key
        Write-Host "✅ Chave configurada temporariamente" -ForegroundColor Green
        
        # Tentar configurar banco
        Write-Host "🗄️ Configurando banco de dados..." -ForegroundColor Blue
        npm run setup-db
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Banco de dados configurado!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Erro na configuração do banco (pode já estar configurado)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# Iniciar aplicação
Write-Host "🚀 Iniciando aplicação..." -ForegroundColor Cyan
Write-Host "📱 A aplicação será aberta em: http://localhost:5173" -ForegroundColor Green
Write-Host "⏹️ Para parar, pressione Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Aguardar um momento antes de iniciar
Start-Sleep -Seconds 2

# Iniciar servidor de desenvolvimento
npm run dev