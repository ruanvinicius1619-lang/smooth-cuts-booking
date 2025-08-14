# 🚀 Guia de Inicialização - Smooth Cuts Booking

Este guia irá te ajudar a configurar e inicializar a aplicação de agendamento da barbearia do zero.

## 📋 Pré-requisitos

### 1. Instalar Node.js e npm

**Node.js não está instalado no seu sistema.** Você precisa instalá-lo primeiro:

#### Opção A: Download Direto (Recomendado)
1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (Long Term Support)
3. Execute o instalador e siga as instruções
4. Reinicie o terminal/PowerShell

#### Opção B: Via Chocolatey (se disponível)
```powershell
choco install nodejs
```

#### Opção C: Via Winget
```powershell
winget install OpenJS.NodeJS
```

### 2. Verificar Instalação
Após instalar, abra um novo terminal e execute:
```powershell
node --version
npm --version
```

## 🔧 Configuração do Projeto

### Passo 1: Instalar Dependências
```powershell
npm install
```

### Passo 2: Configurar Banco de Dados Supabase

#### 2.1 Obter Chave de Serviço
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: `jheywkeofcttgdgquawm`
3. Vá em **Settings** > **API**
4. Copie a chave **"service_role"** (não a "anon public")

#### 2.2 Configurar Variável de Ambiente
```powershell
# No PowerShell
$env:SUPABASE_SERVICE_KEY="sua_chave_service_role_aqui"
```

#### 2.3 Executar Setup do Banco
```powershell
npm run setup-db
```

### Passo 3: Iniciar Aplicação
```powershell
npm run dev
```

## 🌐 Acessar a Aplicação

Após executar `npm run dev`, a aplicação estará disponível em:
- **URL Local**: http://localhost:5173
- **URL de Rede**: http://192.168.x.x:5173 (se disponível)

## 📁 Estrutura do Projeto

```
smooth-cuts-booking/
├── src/
│   ├── pages/           # Páginas da aplicação
│   ├── components/      # Componentes reutilizáveis
│   ├── integrations/    # Configurações do Supabase
│   └── assets/          # Imagens e recursos
├── supabase/
│   └── migrations/      # Scripts do banco de dados
├── scripts/
│   └── setup-database.js # Script de configuração do BD
└── public/              # Arquivos públicos
```

## 🎯 Funcionalidades da Aplicação

- **Agendamento de Serviços**: Clientes podem agendar cortes e serviços
- **Gestão de Barbeiros**: Cadastro e gerenciamento de profissionais
- **Catálogo de Serviços**: Lista de serviços disponíveis com preços
- **Autenticação**: Sistema de login/registro via Supabase
- **Painel de Controle**: Visualização e gestão de agendamentos

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run setup-db` - Configura banco de dados
- `npm run preview` - Visualiza build de produção
- `npm run lint` - Executa verificação de código

## 🔍 Solução de Problemas

### Erro: "npm não é reconhecido"
- **Causa**: Node.js não instalado
- **Solução**: Instale o Node.js conforme instruções acima

### Erro: "SUPABASE_SERVICE_KEY não encontrada"
- **Causa**: Variável de ambiente não configurada
- **Solução**: Configure a chave conforme Passo 2.2

### Erro de Conexão com Banco
- **Causa**: Configuração incorreta do Supabase
- **Solução**: Verifique URL e chaves no arquivo `client.ts`

## 📞 Suporte

Se encontrar problemas:
1. Verifique se todos os pré-requisitos foram instalados
2. Confirme se as variáveis de ambiente estão corretas
3. Consulte os logs de erro no terminal
4. Verifique a documentação do Supabase: https://supabase.com/docs

---

**Próximos Passos**: Após a inicialização, você pode começar a personalizar a aplicação editando os arquivos em `src/pages/` e `src/components/`.