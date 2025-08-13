# 🚀 Setup Automatizado do Banco de Dados

Este guia mostra como configurar o banco de dados Supabase automaticamente usando scripts.

## 📋 Pré-requisitos

1. **Projeto Supabase criado** e configurado
2. **Chave de serviço** do Supabase

## 🔑 Obtendo a Chave de Serviço

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto: `nxmglqvrjkfizzorfljp`
3. Vá em **Settings** > **API**
4. Copie a chave **"service_role"** (não a "anon public")

## ⚡ Método 1: Script Automatizado (Recomendado)

### Passo 1: Configurar variável de ambiente
```bash
# Windows (PowerShell)
$env:SUPABASE_SERVICE_KEY="sua_chave_service_role_aqui"

# Windows (CMD)
set SUPABASE_SERVICE_KEY=sua_chave_service_role_aqui

# Linux/Mac
export SUPABASE_SERVICE_KEY="sua_chave_service_role_aqui"
```

### Passo 2: Executar o setup
```bash
npm run setup-db
```

### ✅ O que o script faz:
- 📄 Lê o arquivo de migração SQL
- 🔧 Executa todos os comandos automaticamente
- ✅ Cria tabelas `services`, `barbers`, `bookings`
- 🔒 Configura políticas de segurança (RLS)
- 📊 Insere dados iniciais
- 🔍 Verifica se tudo foi criado corretamente

## 🛠️ Método 2: Supabase CLI (Alternativo)

### Instalação do CLI:
```bash
# Via Scoop (Windows)
scoop install supabase

# Via Homebrew (Mac)
brew install supabase/tap/supabase

# Via apt (Linux)
sudo apt install supabase
```

### Uso do CLI:
```bash
# Login no Supabase
supabase login

# Conectar ao projeto
supabase link --project-ref nxmglqvrjkfizzorfljp

# Aplicar migrações
supabase db push
```

## 🔧 Troubleshooting

### ❌ Erro: "SUPABASE_SERVICE_KEY não encontrada"
**Solução**: Configure a variável de ambiente com a chave de serviço

### ❌ Erro: "exec_sql function not found"
**Solução**: Use o método manual no painel do Supabase

### ❌ Erro: "Permission denied"
**Solução**: Verifique se a chave de serviço está correta

### ❌ Erro: "Table already exists"
**Solução**: Normal! As tabelas já foram criadas anteriormente

## 📖 Método Manual (Fallback)

Se os métodos automatizados falharem:

1. Acesse https://supabase.com/dashboard
2. Vá para **SQL Editor**
3. Copie o conteúdo de `supabase/migrations/001_create_bookings_tables.sql`
4. Cole e execute no editor SQL

## ✅ Verificação

Após executar qualquer método, verifique:

1. **Table Editor** no Supabase deve mostrar:
   - ✅ Tabela `services` (5 registros)
   - ✅ Tabela `barbers` (3 registros)
   - ✅ Tabela `bookings` (vazia inicialmente)

2. **Teste na aplicação**:
   - Faça login
   - Crie um agendamento
   - Verifique se aparece no perfil
   - Cancele um agendamento

## 🎯 Vantagens do Setup Automatizado

- ⚡ **Rápido**: Execução em segundos
- 🔄 **Repetível**: Pode ser executado múltiplas vezes
- 🛡️ **Seguro**: Usa chaves de serviço oficiais
- 📝 **Versionado**: Migrações controladas por arquivos
- 🔍 **Verificação**: Confirma se tudo foi criado

---

**💡 Dica**: Após o primeiro setup, você pode usar apenas `npm run dev` normalmente. O setup só precisa ser executado uma vez por projeto!