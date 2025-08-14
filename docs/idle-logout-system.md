# Sistema de Logout Automático por Inatividade

Este documento descreve o sistema implementado para realizar logout automático quando o usuário fica inativo na aplicação.

## Visão Geral

O sistema monitora a atividade do usuário e automaticamente faz logout após um período de inatividade, garantindo a segurança da sessão.

## Componentes

### 1. Hook `useIdleLogout`
**Arquivo:** `src/hooks/use-idle-logout.ts`

**Funcionalidades:**
- Monitora eventos de atividade do usuário (mouse, teclado, toque)
- Gerencia timers de inatividade
- Integração com Supabase para autenticação
- Callbacks configuráveis para eventos

**Configurações:**
```typescript
interface UseIdleLogoutOptions {
  idleTime: number;        // Tempo de inatividade (ms)
  warningTime: number;     // Tempo de aviso antes do logout (ms)
  showWarning: boolean;    // Exibir aviso automático
  onIdle?: () => void;     // Callback quando inativo
  onActive?: () => void;   // Callback quando ativo
  onWarning?: () => void;  // Callback de aviso
  onLogout?: () => void;   // Callback de logout
}
```

### 2. Componente `IdleLogoutProvider`
**Arquivo:** `src/components/IdleLogoutProvider.tsx`

**Funcionalidades:**
- Wrapper da aplicação para gerenciar logout automático
- Dialog de aviso com contagem regressiva
- Opções para manter sessão ou fazer logout
- Integração visual com a UI da aplicação

## Configurações Padrão

- **Tempo de Inatividade:** 5 minutos
- **Tempo de Aviso:** 1 minuto antes do logout
- **Contagem Regressiva:** 60 segundos para decisão
- **Eventos Monitorados:** mousemove, mousedown, keypress, scroll, touchstart

## Como Funciona

1. **Monitoramento:** O sistema monitora eventos de atividade do usuário
2. **Detecção de Inatividade:** Após 5 minutos sem atividade, inicia o processo
3. **Aviso:** Exibe dialog com contagem regressiva de 60 segundos
4. **Opções do Usuário:**
   - **Continuar Logado:** Reseta o timer e mantém a sessão
   - **Sair Agora:** Faz logout imediatamente
   - **Não fazer nada:** Logout automático após 60 segundos

## Eventos de Atividade

O sistema considera os seguintes eventos como atividade do usuário:
- Movimento do mouse (`mousemove`)
- Cliques do mouse (`mousedown`)
- Teclas pressionadas (`keypress`)
- Rolagem da página (`scroll`)
- Toque na tela (`touchstart`)

## Integração

O sistema está integrado no `App.tsx` como um provider:

```tsx
<IdleLogoutProvider>
  {/* Resto da aplicação */}
</IdleLogoutProvider>
```

## Segurança

- **Apenas usuários logados:** O sistema só funciona para usuários autenticados
- **Limpeza de sessão:** Remove tokens e dados de sessão do Supabase
- **Redirecionamento:** Redireciona para página de login após logout
- **Notificações:** Informa o usuário sobre o logout por inatividade

## Personalização

Para alterar as configurações, modifique as constantes no `IdleLogoutProvider`:

```typescript
const IDLE_TIME = 5 * 60 * 1000; // 5 minutos
const WARNING_TIME = 1 * 60 * 1000; // 1 minuto
const DIALOG_COUNTDOWN = 60; // 60 segundos
```

## Estados do Sistema

1. **Ativo:** Usuário interagindo normalmente
2. **Inativo:** Sem atividade por 30 minutos
3. **Aviso:** Dialog exibido com contagem regressiva
4. **Logout:** Sessão encerrada automaticamente

## Tratamento de Erros

- Fallback para logout em caso de erro
- Limpeza de timers ao desmontar componentes
- Tratamento de mudanças de estado de autenticação

## Acessibilidade

- Dialog com foco automático
- Textos descritivos e claros
- Ícones visuais para melhor compreensão
- Botões com labels apropriados

## Compatibilidade

- Funciona em desktop e mobile
- Compatível com todos os navegadores modernos
- Responsivo e adaptável

## Manutenção

Para manutenção do sistema:

1. **Logs:** Verifique console para erros
2. **Timers:** Certifique-se de que timers são limpos
3. **Eventos:** Monitore se eventos estão sendo capturados
4. **Autenticação:** Verifique integração com Supabase

## Testes

Para testar o sistema:

1. Faça login na aplicação
2. Aguarde 5 minutos sem interagir
3. Verifique se o dialog de aviso aparece
4. Teste as opções "Continuar Logado" e "Sair Agora"
5. Verifique se o logout automático funciona após 60 segundos