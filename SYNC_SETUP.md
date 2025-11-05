# 🔄 Guia de Configuração de Sincronização Automática

Este guia explica como configurar a sincronização automática dos dados do CSV para o Supabase.

## 📋 Pré-requisitos

- Edge Function `sync-csv-to-supabase` já criada no Supabase
- Arquivo CSV acessível via URL pública (GitHub Raw, Google Drive, etc.)

---

## 🎯 Opção 1: Supabase pg_cron (RECOMENDADO - 100% Gratuito e Integrado)

### Vantagens:
✅ **Totalmente gratuito** (incluído no plano Free do Supabase)  
✅ **Sem serviços externos** (tudo no Supabase)  
✅ **Configuração única** (não precisa de contas externas)  
✅ **Qualquer frequência** (minutos, horas, dias)  
✅ **Integrado nativamente** com PostgreSQL  

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

---

## 🔧 Opção 2: Cron-job.org (Alternativa com Interface Visual)

### Vantagens:
✅ Gratuito  
✅ Interface simples  
✅ Notificações de falha por email  
✅ Histórico de execuções  

### Passo a Passo:

1. **Acesse:** https://cron-job.org/en/

2. **Crie uma conta gratuita**

3. **Crie um novo Cron Job:**
   - Nome: `TechHelp CSV Sync`
   - URL: `https://SEU_PROJETO.supabase.co/functions/v1/sync-csv-to-supabase`
   - Schedule: `*/15 * * * *` (a cada 15 minutos)
   - Método: `POST`

4. **Configure Headers:**
   ```
   Authorization: Bearer SUA_ANON_KEY_AQUI
   Content-Type: application/json
   ```

5. **Salve e Ative**

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

Para este projeto:

**Use: Supabase pg_cron (Opção 1) - TOTALMENTE GRATUITO! ✨**

✅ **Zero custo** (incluído no plano Free)  
✅ **Configuração em 5 minutos** (apenas SQL)  
✅ **Sem dependências externas** (tudo no Supabase)  
✅ **100% confiável** (nativo PostgreSQL)  
✅ **Qualquer frequência** (sem limites de 15 min)  

**Alternativas:**
- **cron-job.org**: Se preferir interface visual
- **GitHub Actions**: Se quiser versionamento

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique os logs da Edge Function no Supabase
2. Teste manualmente primeiro (SQL: `SELECT sync_chamados()`)
3. Confirme que a URL do CSV está acessível
4. Valide as permissões no Supabase
5. Verifique o histórico: `SELECT * FROM cron.job_run_details`

**Boa sorte! 🚀**
