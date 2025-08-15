# Guia do Sistema de Administração - Mateus BarberShop

## Visão Geral

O sistema de administração permite que usuários autorizados gerenciem serviços, barbeiros e configurações da barbearia em tempo real. Todas as alterações são refletidas imediatamente para todos os usuários do sistema.

## Acesso ao Painel Administrativo

### Usuários Administradores

Por padrão, os seguintes e-mails têm acesso administrativo:
- `admin@mateusbarber.com`
- `mateus@mateusbarber.com`
- `gerente@mateusbarber.com`

**Senha Padrão:** `1233`

### ⚡ Criação Automática de Usuários (RECOMENDADO)

Para evitar erros de cadastro manual, use o script automático:

```bash
npm run create-admins
```

Este script criará automaticamente todos os usuários administradores no Supabase. **Consulte `ADMIN_USERS_SETUP.md` para instruções detalhadas.**

### Como Acessar

1. **Faça login** com um e-mail de administrador e a senha padrão `1233`
2. **Clique no menu do usuário** (canto superior direito)
3. **Selecione "Administração"** no dropdown
4. Você será redirecionado para `/admin`

**Nota:** Se for o primeiro acesso e você não usou o script automático, precisará criar uma conta manualmente usando um dos e-mails de administrador e a senha padrão.

### Adicionando Novos Administradores

Para adicionar novos administradores, edite o arquivo `src/config/admin.ts`:

```typescript
const ADMIN_EMAILS = [
  'admin@mateusbarber.com',
  'mateus@mateusbarber.com',
  'gerente@mateusbarber.com',
  'novo-admin@email.com' // Adicione aqui
];
```

## Funcionalidades do Painel

### 1. Gerenciamento de Serviços

**Adicionar Novo Serviço:**
- Clique em "Adicionar Serviço"
- Preencha: Nome, Descrição, Preço, Duração
- Clique em "Salvar"

**Editar Serviço:**
- Clique no ícone de edição (lápis) no card do serviço
- Modifique os campos desejados
- Clique em "Salvar"

**Remover Serviço:**
- Clique no ícone de lixeira no card do serviço
- Confirme a remoção

### 2. Gerenciamento de Barbeiros

**Adicionar Novo Barbeiro:**
- Clique em "Adicionar Barbeiro"
- Preencha: Nome, Especialidade, Email, Telefone
- Clique em "Salvar"

**Editar Barbeiro:**
- Clique no ícone de edição no card do barbeiro
- Modifique os campos desejados
- Clique em "Salvar"

**Remover Barbeiro:**
- Clique no ícone de lixeira no card do barbeiro
- Confirme a remoção

### 3. Configurações da Barbearia

**Informações Básicas:**
- Nome da barbearia
- Descrição
- Endereço
- Telefone e email de contato

**Horários de Funcionamento:**
- Configure horários para cada dia da semana
- Use formato "09:00 - 18:00" ou "Fechado"

**Redes Sociais:**
- Instagram: @usuario
- Facebook: Nome da página
- WhatsApp: Número com código do país (ex: 5511999999999)

## Sincronização em Tempo Real

### Como Funciona

O sistema utiliza múltiplas estratégias para garantir sincronização:

1. **localStorage**: Dados salvos localmente no navegador
2. **Storage Events**: Sincronização automática entre abas
3. **Polling**: Verificação periódica de mudanças (a cada 2 segundos)
4. **Hook useAdminData**: Gerencia atualizações automáticas

### Propagação de Alterações

Quando um administrador faz alterações:

1. **Dados são salvos** no localStorage
2. **Event listeners** detectam mudanças
3. **Componentes são atualizados** automaticamente
4. **Usuários veem mudanças** sem recarregar a página

## Estrutura Técnica

### Arquivos Principais

```
src/
├── config/
│   └── admin.ts              # Configurações e funções administrativas
├── hooks/
│   └── useAdminData.ts       # Hook para sincronização de dados
├── pages/
│   └── Admin.tsx             # Página principal do painel
└── components/
    └── Header.tsx            # Menu com acesso ao painel
```

### Funções Principais

**admin.ts:**
- `isAdmin(email)`: Verifica se usuário é admin
- `getServices()`: Carrega serviços
- `saveServices(services)`: Salva serviços
- `getBarbers()`: Carrega barbeiros
- `saveBarbers(barbers)`: Salva barbeiros
- `getBarbershopSettings()`: Carrega configurações
- `saveBarbershopSettings(settings)`: Salva configurações

**useAdminData.ts:**
- Hook que gerencia sincronização automática
- Detecta mudanças no localStorage
- Atualiza componentes em tempo real

## Segurança

### Controle de Acesso

- **Verificação de email**: Apenas emails autorizados podem acessar
- **Redirecionamento**: Usuários não autorizados são redirecionados
- **Validação no frontend**: Verificação antes de renderizar componentes

### Limitações

- **Segurança básica**: Sistema baseado em frontend apenas
- **Dados locais**: Informações armazenadas no navegador
- **Sem criptografia**: Dados não são criptografados

## Backup e Recuperação

### Dados Padrão

O sistema sempre mantém dados padrão como fallback:

**Serviços Padrão:**
- Corte de Cabelo (R$ 35, 45min)
- Barba Completa (R$ 25, 30min)
- Corte + Barba (R$ 55, 60min)
- Design de Sobrancelha (R$ 15, 20min)
- Tratamento Premium (R$ 85, 90min)

**Barbeiros Padrão:**
- Mateus Pereira (Cortes clássicos)
- João Santos (Barba e bigode)
- Pedro Costa (Cortes modernos)

### Restaurar Dados

Para restaurar dados padrão:

1. Abra o console do navegador (F12)
2. Execute:
```javascript
localStorage.removeItem('barbershop_services');
localStorage.removeItem('barbershop_barbers');
localStorage.removeItem('barbershop_settings');
location.reload();
```

## Solução de Problemas

### Problemas Comuns

**Não consigo acessar o painel:**
- Verifique se seu email está na lista de administradores
- Confirme que está logado corretamente
- Limpe o cache do navegador

**Alterações não aparecem:**
- Aguarde alguns segundos (sincronização automática)
- Recarregue a página
- Verifique se há erros no console

**Dados perdidos:**
- Verifique o localStorage do navegador
- Restaure dados padrão se necessário
- Entre em contato com o suporte técnico

### Logs e Debug

Para debug, abra o console do navegador e verifique:
- Mensagens de erro
- Logs de sincronização
- Estado do localStorage

## Contato e Suporte

Para suporte técnico ou dúvidas sobre o sistema:
- **Email**: suporte@mateusbarber.com
- **Telefone**: (71) 99316-3034
- **WhatsApp**: Mesmo número do telefone

---

*Este guia foi criado para facilitar o uso do sistema de administração. Mantenha-o atualizado conforme novas funcionalidades são adicionadas.*