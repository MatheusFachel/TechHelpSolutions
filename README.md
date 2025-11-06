# 📊 TechHelp Solutions - Dashboard de Análise de Suporte Técnico

<div align="center">

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Dashboard interativo em tempo real para análise e gestão de chamados de suporte técnico**

[🚀 Demo](#-demonstração) • [📖 Documentação](#-índice) • [🛠️ Instalação](#-guia-de-instalação-passo-a-passo) • [🤝 Contribuir](#-contribuindo)

</div>

---

## 📑 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades-principais)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Guia de Instalação](#-guia-de-instalação-passo-a-passo)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Funciona](#-como-funciona)
- [Personalização](#-personalização-e-configuração)
- [Deploy](#-deploy-em-produção)
- [Troubleshooting](#-troubleshooting)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Visão Geral

TechHelp Solutions é um **dashboard moderno e educacional** desenvolvido para demonstrar boas práticas de desenvolvimento web com React, TypeScript e Supabase. O projeto simula um sistema real de gestão de chamados de suporte técnico, oferecendo:

- ✅ **Análise em tempo real** com gráficos interativos
- ✅ **Notificações instantâneas** quando novos chamados são criados
- ✅ **Sincronização automática** com Google Sheets
- ✅ **Interface responsiva** para desktop e mobile
- ✅ **100% código aberto** com documentação completa para aprendizado

### 🎓 Por que este projeto é educacional?

Este dashboard foi construído com **foco didático**, documentando cada decisão técnica para que você possa:

1. **Aprender arquitetura moderna** de aplicações web
2. **Entender Real-Time subscriptions** com Supabase
3. **Dominar TypeScript** com tipos seguros end-to-end
4. **Implementar UI/UX profissional** com Shadcn/UI
5. **Configurar CI/CD** e deploy automatizado

> 💡 **Filosofia do Projeto**: "Conhecimento que não pode ser passado adiante é inútil. Por isso, cada linha de código está documentada para facilitar o aprendizado."

---

## ✨ Funcionalidades Principais

### � Dashboard Analítico

- **KPIs Dinâmicos**: 4 indicadores principais com animações suaves
  - Total de Chamados
  - Tempo Médio de Resolução (TMA)
  - Chamados Abertos
  - Nível de Satisfação
  
- **Gráficos Interativos** (Recharts):
  - Chamados por Técnico (Top 10)
  - Chamados por Categoria (Donut Chart)
  - Timeline de Evolução Temporal
  - Insights inteligentes em cada gráfico

- **Filtros Avançados**:
  - Período (7, 30, 90 dias ou todos)
  - Status, Técnico, Departamento
  - Busca por ID ou motivo
  - Filtros múltiplos simultâneos

### 🔔 Sistema de Notificações

- **Real-Time Notifications**: Alertas instantâneos de novos chamados
- **Centro de Notificações**: Histórico persistente no banco de dados
- **Badge de Não Lidas**: Contador visual de notificações pendentes
- **Proteção contra Spam**: Máximo 3 notificações simultâneas
- **Timestamps Relativos**: "5min atrás", "2h atrás", etc.

### 📱 Responsividade Total

- **Mobile-First Design**:
  - Cards otimizados para telas pequenas
  - Carrossel touch para gráficos
  - Tabela adaptativa (cards em mobile)
  - Header compacto com ícones responsivos

- **Desktop Enhancements**:
  - Layout em grid otimizado
  - Gráficos lado a lado
  - Tabela completa com scroll horizontal
  - Tooltips e hover states

### ⚡ Sincronização Automática

- **Google Sheets Integration**:
  - Edge Function para sincronização
  - Cron job configurável (a cada X minutos)
  - Upsert inteligente (atualiza ou cria)
  - Validação de dados na importação

- **Real-Time Updates**:
  - PostgreSQL Change Data Capture (CDC)
  - WebSocket connection via Supabase Realtime
  - Debounce de 500ms para evitar múltiplos reloads
  - Notificações apenas para novos dados

### 🎨 Temas e Personalização

- **Dark/Light Mode**: Toggle no header
- **Cores Customizáveis**: Sistema de design tokens
- **Metas Configuráveis**: TMA, Satisfação, SLA
- **Exportação de Dados**: CSV com dados filtrados

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn/UI + Tailwind CSS + Recharts
- **Backend**: Supabase (PostgreSQL + Real-time + Edge Functions)
- **Integração**: Google Sheets API
- **Gerenciamento de Estado**: React Query

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase (gratuita)
- Conta no Google Cloud (gratuita)
- Planilha no Google Sheets

### Instalação

```bash
# Clone o repositório
git clone https://github.com/MatheusFachel/TechHelpSolutions.git
cd TechHelpSolutions

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase
```

### Configuração Completa

**📖 Consulte o guia detalhado**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)

O guia contém instruções passo a passo para:
1. Configurar Supabase e criar banco de dados
2. Importar CSV inicial
3. Configurar Google Sheets API
4. Deploy da Edge Function
5. Configurar sincronização automática
6. Testar a aplicação

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

Acesse: http://localhost:8080

## 📁 Estrutura do Projeto

```
TechHelpSolutions/
├── src/
│   ├── components/
│   │   ├── dashboard/         # Componentes do dashboard
│   │   └── ui/                # Componentes UI (Shadcn)
│   ├── lib/
│   │   ├── supabase.ts        # Cliente e tipos do Supabase
│   │   └── utils.ts           # Utilitários
│   ├── pages/
│   │   ├── Index.tsx          # Página principal do dashboard
│   │   └── NotFound.tsx       # Página 404
│   ├── utils/
│   │   └── dataParser.ts      # Conversão de dados
│   └── App.tsx
├── supabase/
│   └── functions/
│       └── sync-google-sheets/  # Edge Function para sincronização
├── public/
│   └── data/
│       └── chamados.csv       # CSV de exemplo (fallback)
└── SETUP_GUIDE.md             # Guia de configuração detalhado
```

## 🔧 Configuração do Banco de Dados

### Schema da Tabela `chamados`

```sql
CREATE TABLE chamados (
  id TEXT PRIMARY KEY,
  data_abertura TEXT NOT NULL,
  data_fechamento TEXT,
  status TEXT NOT NULL,
  prioridade TEXT NOT NULL,
  motivo TEXT NOT NULL,
  solucao TEXT,
  solicitante TEXT NOT NULL,
  tecnico TEXT NOT NULL,
  departamento TEXT NOT NULL,
  tma INTEGER NOT NULL DEFAULT 0,
  frt INTEGER NOT NULL DEFAULT 0,
  satisfacao TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Sincronização com Google Sheets

A Edge Function `sync-google-sheets` sincroniza automaticamente dados da planilha para o Supabase:

- Lê dados da planilha via Google Sheets API
- Faz upsert no banco PostgreSQL
- Dispara eventos real-time para atualizar o dashboard

**Configuração**: Ver [SETUP_GUIDE.md](./SETUP_GUIDE.md) seção 4 e 5

## 📊 KPIs Disponíveis

1. **Total de Chamados**: Quantidade total de registros
2. **Tempo Médio de Resolução (TMA)**: Meta < 240 minutos
3. **Chamados Abertos**: Status "Aberto", "Pendente" ou "Em Andamento"
4. **Nível de Satisfação**: Meta ≥ 4.0/5

## 🎨 Temas

O dashboard suporta modo claro e escuro com toggle no header.

## 🧪 Testes

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## 📦 Deploy

### Frontend (Vercel/Netlify)

```bash
npm run build
# Upload da pasta dist/
```

### Edge Function

```bash
supabase functions deploy sync-google-sheets
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 📧 Contato

Matheus Fachel - [@MatheusFachel](https://github.com/MatheusFachel)

---

**Desenvolvido com ❤️ para otimizar a gestão de suporte técnico**
