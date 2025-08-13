# Configuração do Banco de Dados Supabase

Para que a persistência de dados funcione corretamente, você precisa executar o script SQL no painel do Supabase.

## Passos para configurar:

1. **Acesse o painel do Supabase**: https://supabase.com/dashboard
2. **Selecione seu projeto**: `nxmglqvrjkfizzorfljp`
3. **Vá para SQL Editor** (ícone de banco de dados na barra lateral)
4. **Execute o script SQL** localizado em `supabase/migrations/001_create_bookings_tables.sql`

## O que o script faz:

- ✅ Cria a tabela `services` com os serviços da barbearia
- ✅ Cria a tabela `barbers` com os barbeiros
- ✅ Cria a tabela `bookings` para armazenar agendamentos
- ✅ Configura políticas de segurança (RLS)
- ✅ Insere dados iniciais (serviços e barbeiros padrão)
- ✅ Cria índices para melhor performance

## Funcionalidades implementadas:

### ✅ Persistência de Agendamentos
- Novos agendamentos são salvos no banco de dados
- Cancelamentos são persistidos
- Dados não são perdidos ao sair da sessão

### ✅ Carregamento Dinâmico
- Serviços e barbeiros são carregados do banco
- Agendamentos futuros e histórico são carregados do banco
- Interface atualizada em tempo real

### ✅ Segurança
- Usuários só podem ver seus próprios agendamentos
- Políticas RLS impedem acesso não autorizado
- Validações de dados no frontend e backend

## Testando a funcionalidade:

1. **Faça login** na aplicação
2. **Crie um agendamento** na página de booking
3. **Verifique no perfil** se o agendamento aparece
4. **Cancele um agendamento** e veja ele ir para o histórico
5. **Saia e entre novamente** - os dados devem persistir

## Troubleshooting:

Se os dados não estiverem persistindo:
1. Verifique se o script SQL foi executado corretamente
2. Confirme se as tabelas foram criadas no Supabase
3. Verifique o console do navegador para erros
4. Confirme se o usuário está autenticado