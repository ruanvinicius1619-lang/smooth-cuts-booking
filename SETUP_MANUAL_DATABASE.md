# 🗄️ Setup Manual do Banco de Dados

## ⚠️ Problema Identificado

A aplicação está tentando acessar tabelas que não existem no banco de dados Supabase:
- `public.services`
- `public.barbers` 
- `public.bookings`

## 🔧 Solução: Configuração Manual

### Opção 1: Via Dashboard do Supabase (Recomendado)

1. **Acesse o Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Faça login na sua conta
   - Selecione o projeto: `nxmglqvrjkfizzorfljp`

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New Query"

3. **Execute a Migração**
   - Copie todo o conteúdo do arquivo: `supabase/migrations/001_create_bookings_tables.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

### Opção 2: Via Script (Requer Chave de Serviço)

1. **Obter a Chave de Serviço**
   - No dashboard do Supabase
   - Vá em Settings > API
   - Copie a "service_role" key

2. **Configurar Variável de Ambiente**
   ```powershell
   $env:SUPABASE_SERVICE_KEY="sua_chave_de_servico_aqui"
   ```

3. **Executar o Script**
   ```powershell
   npm run setup-db
   ```

## 📋 Estrutura das Tabelas

O arquivo de migração criará:

### Tabela `services`
- Serviços disponíveis (corte, barba, etc.)
- Preços e duração
- Dados iniciais incluídos

### Tabela `barbers`
- Barbeiros disponíveis
- Especialidades
- Dados iniciais incluídos

### Tabela `bookings`
- Agendamentos dos clientes
- Relacionamentos com usuários, serviços e barbeiros
- Políticas de segurança (RLS)

## ✅ Verificação

Após executar a migração:
1. Recarregue a aplicação em `http://localhost:8080`
2. Os erros de "table not found" devem desaparecer
3. A aplicação deve carregar normalmente

## 🆘 Suporte

Se ainda houver problemas:
1. Verifique se todas as tabelas foram criadas no dashboard
2. Confirme se os dados iniciais foram inseridos
3. Verifique as políticas RLS nas tabelas

---

**Nota**: Este setup é necessário apenas uma vez por projeto Supabase.