# 🚀 Guia de Setup Completo - TechHelp Dashboard

Este guia vai te orientar passo a passo para configurar o Supabase, importar o CSV, configurar o Google Sheets API e fazer tudo funcionar.

---

## 📋 **ÍNDICE**

1. [Configurar Supabase](#1-configurar-supabase)
2. [Importar CSV Inicial para o Banco](#2-importar-csv-para-supabase)
3. [Configurar Variáveis de Ambiente](#3-configurar-variáveis-de-ambiente)
4. [Configurar Google Sheets API](#4-configurar-google-sheets-api)
5. [Deploy da Edge Function](#5-deploy-da-edge-function)
6. [Configurar Cron Job (Execução Automática)](#6-configurar-cron-job)
7. [Testar a Aplicação](#7-testar-aplicação)

---

## **1. CONFIGURAR SUPABASE**

### 1.1 Criar Conta e Projeto

1. Acesse: https://supabase.com
2. Clique em **"Start your project"**
3. Faça login com GitHub
4. Clique em **"New Project"**
5. Preencha:
   - **Name**: `TechHelpSolutions`
   - **Database Password**: (anote essa senha!)
   - **Region**: `South America (São Paulo)` (mais próximo)
6. Clique em **"Create new project"**
7. Aguarde ~2 minutos para o projeto ser criado

### 1.2 Criar a Tabela `chamados`

1. No menu lateral, clique em **SQL Editor**
2. Clique em **"New Query"**
3. Cole o código SQL abaixo:

```sql
-- Criar tabela chamados
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

-- Criar índices para melhor performance
CREATE INDEX idx_chamados_status ON chamados(status);
CREATE INDEX idx_chamados_tecnico ON chamados(tecnico);
CREATE INDEX idx_chamados_data_abertura ON chamados(data_abertura);
CREATE INDEX idx_chamados_departamento ON chamados(departamento);

-- Habilitar Real-Time para esta tabela
ALTER PUBLICATION supabase_realtime ADD TABLE chamados;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chamados_updated_at 
  BEFORE UPDATE ON chamados 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

4. Clique em **"Run"** (ou pressione `Ctrl + Enter`)
5. Você deve ver: ✅ **"Success. No rows returned"**

### 1.3 Pegar Credenciais do Projeto

1. No menu lateral, clique em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Anote os seguintes valores:

   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (chave longa)
   - **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (chave longa - NUNCA exponha publicamente!)

---

## **2. IMPORTAR CSV PARA SUPABASE**

Você tem **2 opções** para importar o CSV inicial:

### Opção A: Interface Web (Mais Fácil)

1. No Supabase, vá em **Table Editor** (menu lateral)
2. Clique na tabela **chamados**
3. Clique em **"Insert"** > **"Import data from CSV"**
4. Faça upload do arquivo `public/data/chamados.csv`
5. Mapeie as colunas corretamente:
   - `ID do Chamado` → `id`
   - `Data de Abertura` → `data_abertura`
   - `Data de Fechamento` → `data_fechamento`
   - `Status` → `status`
   - `Prioridade` → `prioridade`
   - `Motivo` → `motivo`
   - `Solução` → `solucao`
   - `Solicitante` → `solicitante`
   - `Agente Responsável` → `tecnico`
   - `Departamento` → `departamento`
   - `TMA (minutos)` → `tma`
   - `FRT (minutos)` → `frt`
   - `Satisfação do Cliente` → `satisfacao`
6. Clique em **"Import"**

### Opção B: SQL Script (Mais Rápido para Grandes Volumes)

1. Converta o CSV para SQL usando um conversor online: https://www.convertcsv.com/csv-to-sql.htm
2. No **SQL Editor** do Supabase, cole os INSERTs gerados
3. Execute o script

---

## **3. CONFIGURAR VARIÁVEIS DE AMBIENTE**

1. Abra o arquivo `.env.local` na raiz do projeto
2. Substitua os valores pelas credenciais que você anotou:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **NÃO** commite este arquivo no Git! (já está no `.gitignore`)

---

## **4. CONFIGURAR GOOGLE SHEETS API**

### 4.1 Criar Projeto no Google Cloud

1. Acesse: https://console.cloud.google.com/
2. Clique em **"Select a project"** > **"New Project"**
3. Nome: `TechHelp Sheets Integration`
4. Clique em **"Create"**

### 4.2 Ativar Google Sheets API

1. No menu lateral, vá em **APIs & Services** > **Library**
2. Busque por **"Google Sheets API"**
3. Clique em **"Enable"**

### 4.3 Criar Credenciais (API Key)

1. Vá em **APIs & Services** > **Credentials**
2. Clique em **"Create Credentials"** > **"API Key"**
3. Copie a API Key gerada: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
4. (Opcional) Clique em **"Restrict Key"**:
   - Em **API restrictions**, selecione **"Restrict key"**
   - Marque apenas **"Google Sheets API"**
   - Salve

### 4.4 Tornar a Planilha Pública

**IMPORTANTE**: Para usar API Key, a planilha precisa estar acessível:

1. Abra sua planilha no Google Sheets
2. Clique em **"Compartilhar"**
3. Em **"Acesso geral"**, selecione **"Qualquer pessoa com o link"**
4. Permissão: **"Leitor"**
5. Clique em **"Concluído"**

### 4.5 Pegar o ID da Planilha

Na URL da planilha:
```
https://docs.google.com/spreadsheets/d/1ABC-XYZ123example/edit#gid=0
                                       ^^^^^^^^^^^^^^^^^^
                                       Este é o SPREADSHEET_ID
```

Anote o **SPREADSHEET_ID**: `1ABC-XYZ123example`

### 4.6 Anotar Nome da Aba

- Se sua aba se chama "Sheet1", use: `Sheet1`
- Se tiver outro nome (ex: "Chamados"), use o nome exato

---

## **5. DEPLOY DA EDGE FUNCTION**

### 5.1 Instalar Supabase CLI

No PowerShell:

```powershell
# Instalar via npm
npm install -g supabase

# Verificar instalação
supabase --version
```

### 5.2 Login no Supabase

```powershell
supabase login
```

Isso vai abrir o navegador para você fazer login.

### 5.3 Linkar com seu Projeto

```powershell
cd "c:\Users\ResTIC55\Documents\1 - Trabalhos (Projetos,Vibe Coding, Agentes)\Caldeira IA e Dados\TechHelpSolutions"

supabase link --project-ref your-project-id
```

**Como pegar o `project-ref`:**
- No Supabase Dashboard, vá em **Settings** > **General**
- Copie o **Reference ID** (ex: `abcdefghijklm`)

### 5.4 Configurar Secrets (Variáveis de Ambiente da Edge Function)

```powershell
supabase secrets set GOOGLE_SHEETS_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXX"
supabase secrets set SPREADSHEET_ID="1ABC-XYZ123example"
supabase secrets set SHEET_NAME="Sheet1"
```

### 5.5 Deploy da Função

```powershell
supabase functions deploy sync-google-sheets
```

Você verá:
```
Deploying sync-google-sheets (version xxxxx)
Function URL: https://xxxxxxxxxxxxx.supabase.co/functions/v1/sync-google-sheets
```

Anote a **Function URL**!

---

## **6. CONFIGURAR CRON JOB**

Para executar a sincronização automaticamente a cada X minutos:

### Opção 1: Usar Cron-Job.org (Grátis e Simples)

1. Acesse: https://cron-job.org/
2. Crie uma conta
3. Clique em **"Create cronjob"**
4. Preencha:
   - **Title**: `Sync TechHelp Sheets`
   - **URL**: `https://xxxxxxxxxxxxx.supabase.co/functions/v1/sync-google-sheets`
   - **Schedule**: Escolha a frequência (ex: a cada 5 minutos)
5. Salve

### Opção 2: Usar Supabase Platform (Requer upgrade para Pro)

No Supabase Dashboard:
1. Vá em **Database** > **Extensions**
2. Habilite `pg_cron`
3. No SQL Editor:

```sql
SELECT cron.schedule(
  'sync-google-sheets-job',
  '*/5 * * * *',  -- A cada 5 minutos
  $$
  SELECT net.http_post(
    url := 'https://xxxxxxxxxxxxx.supabase.co/functions/v1/sync-google-sheets',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
```

### Opção 3: Sincronização Manual (Para Testes)

Você pode chamar a função manualmente via navegador ou curl:

```powershell
curl https://xxxxxxxxxxxxx.supabase.co/functions/v1/sync-google-sheets
```

---

## **7. TESTAR APLICAÇÃO**

### 7.1 Verificar Conexão

```powershell
npm run dev
```

Acesse: http://localhost:8080

**Você deve ver:**
- ✅ Dashboard carregando
- ✅ Dados da tabela `chamados` do Supabase
- ✅ Se adicionar/editar no Supabase Table Editor, o dashboard atualiza automaticamente!

### 7.2 Testar Sincronização com Google Sheets

1. Edite sua planilha no Google Sheets (adicione uma linha)
2. Chame a Edge Function manualmente:
   ```powershell
   curl https://xxxxxxxxxxxxx.supabase.co/functions/v1/sync-google-sheets
   ```
3. Veja no Supabase Table Editor se o dado foi importado
4. O dashboard deve atualizar automaticamente!

### 7.3 Verificar Logs

No Supabase Dashboard:
1. Vá em **Edge Functions**
2. Clique em **sync-google-sheets**
3. Clique na aba **"Logs"**
4. Veja se há erros ou sucesso

---

## **📝 TROUBLESHOOTING**

### Erro: "Cannot find module @supabase/supabase-js"
```powershell
npm install @supabase/supabase-js
```

### Erro: "Invalid API key"
- Verifique se a API Key do Google está correta
- Certifique-se que a planilha está pública (qualquer pessoa com o link)

### Dashboard não atualiza em tempo real
- Verifique se executou: `ALTER PUBLICATION supabase_realtime ADD TABLE chamados;`
- No navegador, abra o console (F12) e veja se há erros

### Edge Function retorna erro 500
- Veja os logs no Supabase Dashboard
- Verifique se os `secrets` foram configurados corretamente

---

## **🎯 PRÓXIMOS PASSOS**

Após tudo configurado:

1. ✅ Configure o cron job para sincronização automática
2. ✅ Teste adicionar/editar dados na planilha e veja atualizar no dashboard
3. 🚀 (Opcional) Adicionar autenticação para dashboard privado
4. 🚀 (Opcional) Criar página de admin para gerenciar chamados
5. 🚀 (Opcional) Deploy do frontend (Vercel, Netlify, etc.)

---

## **📞 SUPORTE**

Se tiver dúvidas, consulte:
- **Supabase Docs**: https://supabase.com/docs
- **Google Sheets API**: https://developers.google.com/sheets/api
- **Edge Functions**: https://supabase.com/docs/guides/functions

---

**Boa sorte! 🚀**
