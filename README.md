# 🪒 Mateus Barbershop - Sistema de Agendamento para Barbearia

Sistema completo de agendamento online para barbearias, desenvolvido com React, TypeScript e Supabase.

## 🚀 Inicialização Rápida (Windows)

### Método 1: Script Automático (Recomendado)
```powershell
# Execute o script de inicialização automática
.\inicializar.ps1
```

### Método 2: Manual
1. **Instale o Node.js**: https://nodejs.org/ (versão LTS)
2. **Instale dependências**: `npm install`
3. **Configure Supabase**: Veja `GUIA_INICIALIZACAO.md`
4. **Inicie aplicação**: `npm run dev`

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** (incluído com Node.js)
- **Conta Supabase** (gratuita)

## 🔧 Configuração Detalhada

Para instruções completas de configuração, consulte:
- 📖 **[GUIA_INICIALIZACAO.md](./GUIA_INICIALIZACAO.md)** - Guia completo passo a passo
- 🤖 **[SETUP_AUTOMATED.md](./SETUP_AUTOMATED.md)** - Setup automatizado do banco

## 🛠️ Scripts Disponíveis

```powershell
npm run dev              # Iniciar servidor de desenvolvimento
npm run build            # Gerar build de produção
npm run setup-db         # Configurar banco de dados Supabase
npm run preview          # Visualizar build de produção
npm run lint             # Verificar código
node scripts/check-prerequisites.js  # Verificar pré-requisitos
```

## 🌐 Acesso à Aplicação

Após executar `npm run dev`:
- **Local**: http://localhost:5173
- **Rede**: http://192.168.x.x:5173

## 🎯 Funcionalidades

- ✅ **Agendamento Online** - Clientes podem agendar serviços
- 👨‍💼 **Gestão de Barbeiros** - Cadastro e gerenciamento de profissionais
- 💰 **Catálogo de Serviços** - Lista de serviços com preços
- 🔐 **Autenticação** - Sistema de login/registro
- 📊 **Dashboard** - Painel de controle para agendamentos
- 📱 **Responsivo** - Interface adaptada para mobile

## 🏗️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Formulários**: React Hook Form + Zod
- **Estado**: TanStack Query

## 📁 Estrutura do Projeto

```
src/
├── pages/           # Páginas da aplicação
├── components/      # Componentes reutilizáveis
├── integrations/    # Configurações do Supabase
├── hooks/           # Hooks customizados
├── lib/             # Utilitários
└── assets/          # Imagens e recursos
```

**Edite um arquivo diretamente no GitHub**

- Navegue até o(s) arquivo(s) desejado(s).
- Clique no botão "Editar" (ícone de lápis) no canto superior direito da visualização do arquivo.
- Faça suas alterações e confirme-as.

**Use os Codespaces do GitHub**

- Navegue até a página principal do seu repositório.
- Clique no botão "Código" (botão verde) próximo ao canto superior direito.
- Selecione a aba "Codespaces".
- Clique em "Novo codespace" para iniciar um novo ambiente do Codespace.
- Edite os arquivos diretamente no Codespace, confirme e envie suas alterações assim que terminar.

## Quais tecnologias são usadas neste projeto?

Este projeto foi criado com:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Como posso implementar este projeto?

Basta abrir o [Lovable](https://lovable.dev/projects/3dceb11f-473b-4ba4-985f-064fb293409d) e clicar em Compartilhar -> Publicar.

## Posso conectar um domínio personalizado ao meu projeto Lovable?

Sim, você pode!

Para conectar um domínio, navegue até Projeto > Configurações > Domínios e clique em Conectar Domínio.

Leia mais aqui: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
