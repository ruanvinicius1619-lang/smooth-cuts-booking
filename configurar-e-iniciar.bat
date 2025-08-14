@echo off
echo.
echo Configurando e Inicializando Smooth Cuts Booking...
echo.

REM Verificar se Node.js esta instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js nao encontrado!
    echo.
    echo Para instalar o Node.js:
    echo 1. Acesse: https://nodejs.org/
    echo 2. Baixe a versao LTS
    echo 3. Execute o instalador
    echo 4. Reinicie este terminal
    echo 5. Execute este script novamente
    echo.
    echo Ou tente instalar via winget:
    echo    winget install OpenJS.NodeJS
    echo.
    pause
    exit /b 1
)

echo Node.js encontrado!
node --version
echo.

REM Verificar se npm esta disponivel
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo npm nao encontrado! Reinstale o Node.js.
    pause
    exit /b 1
)

echo npm encontrado!
npm --version
echo.

REM Verificar se package.json existe
if not exist "package.json" (
    echo package.json nao encontrado!
    echo Execute este script na pasta do projeto.
    pause
    exit /b 1
)

echo Projeto encontrado!
echo.

REM Instalar dependencias se necessario
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo Erro ao instalar dependencias
        pause
        exit /b 1
    )
    echo Dependencias instaladas!
) else (
    echo Dependencias ja instaladas!
)
echo.

REM Iniciar aplicacao
echo Iniciando aplicacao...
echo A aplicacao sera aberta em: http://localhost:5173
echo Para parar, pressione Ctrl+C
echo.

REM Aguardar um momento
timeout /t 2 /nobreak >nul

REM Iniciar servidor de desenvolvimento
npm run dev

pause