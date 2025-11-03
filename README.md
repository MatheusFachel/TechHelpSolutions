# 📊 TechHelp Solutions - Dashboard de Suporte Técnico

Dashboard interativo em tempo real para análise de chamados de suporte técnico, integrado com Google Sheets e Supabase.

## ✨ Funcionalidades

- 📈 **KPIs em Tempo Real**: Total de chamados, tempo médio de resolução, chamados abertos e nível de satisfação
- 📊 **Visualizações Interativas**: Gráficos de técnicos, categorias e timeline
- 🔄 **Sincronização Automática**: Dados sincronizados automaticamente do Google Sheets
- ⚡ **Real-Time Updates**: Dashboard atualiza automaticamente quando dados mudam
- 🎨 **Interface Moderna**: Construído com React, TypeScript, Shadcn/UI e Tailwind CSS
- 🔍 **Filtros e Busca**: Tabela com busca por ID, técnico ou categoria

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
