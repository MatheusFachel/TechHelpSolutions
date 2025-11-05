# 🔄 Guia de Configuração de Sincronização Automática

Este guia explica como configurar a sincronização automática dos dados do CSV para o Supabase.

## 📋 Pré-requisitos

- Edge Function `sync-csv-to-supabase` já criada no Supabase
- Arquivo CSV acessível via URL pública (GitHub Raw, Google Drive, etc.)

---

## 🎯 Opção 1: Supabase pg_cron (RECOMENDADO - 100% Gratuito e Integrado)

### ⚠️ Importante: pg_cron requer plano PRO

Infelizmente, a extensão `pg_cron` **não está disponível no plano Free** do Supabase. Ela requer o plano Pro ($25/mês).

**Para sincronização gratuita, use a Opção 2 (cron-job.org) abaixo. ⬇️**

<details>
<summary>📖 Instruções para pg_cron (apenas plano Pro)</summary>

### Vantagens:
✅ **Integrado ao Supabase**  
✅ **Sem serviços externos**  
✅ **Qualquer frequência**  
✅ **100% confiável**  
❌ **Requer plano Pro** ($25/mês)

### Passo a Passo:

#### 1. Acesse o SQL Editor do Supabase
- Vá para seu projeto no Supabase
- Clique em **SQL Editor** no menu lateral
- Clique em **New Query**

#### 2. Execute os comandos SQL na ordem abaixo:

##### **COMANDO 1:** Habilitar extensão pg_net (para requisições HTTP)

```sql
-- Habilitar extensão para fazer requisições HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;
```

##### **COMANDO 2:** Habilitar extensão pg_cron (para agendamento)

```sql
-- Habilitar extensão para agendar tarefas
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

##### **COMANDO 3:** Criar a função de sincronização

```sql
-- Criar função que sincroniza os dados
CREATE OR REPLACE FUNCTION sync_chamados()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  response json;
BEGIN
  -- Fazer requisição POST para a Edge Function
  SELECT net.http_post(
    url := 'https://bttgotjfushzmcrfkpxl.supabase.co/functions/v1/sync-csv-to-supabase',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dGdvdGpmdXNoem1jcmZrcHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDU2MzgsImV4cCI6MjA3NzY4MTYzOH0.I8aiwrY_oZpsq-kuGvAThpxgixx7fcoj-MqrTc_ywmI'
    ),
    body := '{}'::jsonb
  ) INTO request_id;
  
  -- Log do resultado
  RAISE NOTICE 'Sync iniciado - Request ID: %', request_id;
END;
$$;
```

##### **COMANDO 4:** Agendar execução automática (cron job)

```sql
-- Agendar execução a cada 1 hora (recomendado)
SELECT cron.schedule(
  'sync-chamados-hourly',  -- Nome do job
  '0 * * * *',             -- A cada hora no minuto 0
  $$SELECT sync_chamados()$$
);
```

##### **COMANDO 5 (OPCIONAL):** Testar a sincronização imediatamente

```sql
-- Executar a sincronização agora para testar
SELECT sync_chamados();
```

#### 3. Verificar se funcionou:

```sql
-- Ver o cron job criado
SELECT * FROM cron.job;

-- Ver histórico de execuções (após alguns minutos)
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 5;
```

---

#### 📝 Observações Importantes:

- **NÃO precisa substituir variáveis** - o comando já está pronto com suas credenciais!
- Execute **um comando por vez** na ordem indicada
- Aguarde cada comando completar antes de executar o próximo
- O COMANDO 5 (teste manual) é opcional mas recomendado

---

## ⚙️ Gerenciamento do Cron Job

### Mudar a Frequência (se quiser):

```sql
-- Primeiro, remover o cron job atual
SELECT cron.unschedule('sync-chamados-hourly');

-- Depois, criar com nova frequência:

-- A cada 15 minutos
SELECT cron.schedule('sync-chamados-15min', '*/15 * * * *', $$SELECT sync_chamados()$$);

-- A cada 30 minutos
SELECT cron.schedule('sync-chamados-30min', '*/30 * * * *', $$SELECT sync_chamados()$$);

-- A cada 6 horas
SELECT cron.schedule('sync-chamados-6h', '0 */6 * * *', $$SELECT sync_chamados()$$);

-- Todos os dias às 2:00 AM
SELECT cron.schedule('sync-chamados-daily', '0 2 * * *', $$SELECT sync_chamados()$$);

-- Todos os dias às 8:00 AM e 8:00 PM
SELECT cron.schedule('sync-chamados-twice', '0 8,20 * * *', $$SELECT sync_chamados()$$);
```

### Comandos Úteis:

```sql
-- Listar todos os cron jobs ativos
SELECT * FROM cron.job;

-- Ver histórico de execuções
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;

-- Pausar o cron job
SELECT cron.unschedule('sync-chamados-hourly');

-- Executar manualmente a qualquer momento
SELECT sync_chamados();
```

</details>

---

## 🎯 Opção 2: Cron-job.org (RECOMENDADO PARA PLANO FREE - 100% Gratuito)

### Vantagens:
✅ **100% Gratuito** (sem limite de tempo)  
✅ **Interface visual simples**  
✅ **Notificações de falha por email**  
✅ **Histórico de execuções**  
✅ **Funciona com plano Free do Supabase**  
✅ **Configuração em 5 minutos**

### Passo a Passo:

#### 1. Acesse e crie uma conta:
- Vá para: **https://cron-job.org/en/**
- Clique em **Sign up for free**
- Confirme seu email

#### 2. Crie um novo Cron Job:
- No dashboard, clique em **Create cronjob**
- Preencha os campos:

**Configurações Básicas:**
- **Title:** `TechHelp CSV Sync`
- **Address (URL):** `https://bttgotjfushzmcrfkpxl.supabase.co/functions/v1/sync-csv-to-supabase`
- **Schedule:**
  - Escolha: **Every 15 minutes** (ou personalize)
  - Ou use cron: `*/15 * * * *`

**Configurações Avançadas (aba "Advanced"):**
- **Request method:** `POST`
- **Request headers:** Clique em "+ ADD" para adicionar 2 headers:

  **Header 1:**
  - **Key:** `Authorization`
  - **Value:** `    `
  
  **Header 2:**
  - **Key:** `Content-Type`
  - **Value:** `application/json`

> 💡 **Dica:** Copie o valor completo do "Bearer" até o final do token. O "Bearer" + espaço + token vão juntos no campo Value!

#### 3. Salve e Ative:
- Clique em **Create cronjob**
- O job começará a executar automaticamente!

#### 4. Verificar execuções:
- No dashboard, você verá o histórico de execuções
- Status 200 = sucesso ✅
- Qualquer outro código = erro ❌

---

## 🔧 Opção 3: GitHub Actions (Gratuito - 2000 min/mês)

### Vantagens:
✅ Integrado ao repositório  
✅ Versionado com o código  
✅ 2000 minutos grátis/mês  

### Passo a Passo:

1. **Crie o arquivo:** `.github/workflows/sync-csv.yml`

```yaml
name: Sync CSV to Supabase

on:
  schedule:
    # Executar a cada 15 minutos
    - cron: '*/15 * * * *'
  workflow_dispatch: # Permite execução manual

jobs:
  sync:
    runs-on: ubuntu-latest
    
    steps:
      - name: Trigger Supabase Edge Function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            https://SEU_PROJETO.supabase.co/functions/v1/sync-csv-to-supabase
```

2. **Adicione o Secret no GitHub:**
   - Vá em: Settings → Secrets and variables → Actions
   - Adicione: `SUPABASE_ANON_KEY` com sua chave anônima

3. **Commit e Push**

4. **Habilite Actions** (se necessário):
   - Settings → Actions → General → Allow all actions

---

## 🧪 Testar Sincronização

### Teste Manual via cURL:

```bash
curl -X POST \
  -H "Authorization: Bearer SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  https://SEU_PROJETO.supabase.co/functions/v1/sync-csv-to-supabase
```

### Verificar Logs:

**Supabase:**
- Edge Functions → Logs → Filtrar por `sync-csv-to-supabase`

**GitHub Actions:**
- Actions → Workflows → Sync CSV to Supabase → View runs

**Cron-job.org:**
- Dashboard → History → Ver execuções

---

## 📊 Frequências Recomendadas

| Cenário | Frequência | Cron |
|---------|-----------|------|
| **Produção Ativa** | 5 minutos | `*/5 * * * *` |
| **Uso Moderado** | 15 minutos | `*/15 * * * *` |
| **Demonstração** | 1 hora | `0 * * * *` |
| **Apenas Diário** | 1x/dia 6h | `0 6 * * *` |

---

## ⚠️ Importante

1. **Nunca commite sua ANON_KEY no código!**
   - Use variáveis de ambiente
   - Use GitHub Secrets
   - Use configurações da plataforma

2. **Monitore o uso:**
   - Supabase Free: Limite de requisições
   - GitHub Actions: 2000 min/mês
   - Cron-job.org: Monitoramento grátis

3. **Logs são seus amigos:**
   - Sempre verifique logs após configurar
   - Configure alertas de falha

---

## 🎯 Recomendação Final

Para este projeto no **plano Free do Supabase**:

**Use: cron-job.org (Opção 2) - TOTALMENTE GRATUITO! ✨**

✅ **Zero custo** (gratuito para sempre)  
✅ **Configuração em 5 minutos** (interface visual)  
✅ **Funciona com Supabase Free** (sem necessidade de upgrade)  
✅ **Confiável** (serviço estabelecido há anos)  
✅ **Frequência flexível** (até a cada 1 minuto no plano gratuito!)  
✅ **Notificações** (receba email se algo der errado)

**Se você tiver plano Pro do Supabase:**
- **pg_cron (Opção 1)**: Melhor integração nativa

**Alternativas:**
- **GitHub Actions (Opção 3)**: Se quiser versionamento no código

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique os logs da Edge Function no Supabase
2. Teste manualmente primeiro (SQL: `SELECT sync_chamados()`)
3. Confirme que a URL do CSV está acessível
4. Valide as permissões no Supabase
5. Verifique o histórico: `SELECT * FROM cron.job_run_details`

**Boa sorte! 🚀**
