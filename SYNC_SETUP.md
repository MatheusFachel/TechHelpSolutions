# 🔄 Guia de Configuração de Sincronização Automática

Este guia explica como configurar a sincronização automática dos dados do CSV para o Supabase.

## 📋 Pré-requisitos

- Edge Function `sync-csv-to-supabase` já criada no Supabase
- Arquivo CSV acessível via URL pública (GitHub Raw, Google Drive, etc.)

---

## 🎯 Opção 1: Cron-job.org (Recomendado - Gratuito)

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

## 🔧 Opção 2: GitHub Actions (Gratuito - 2000 min/mês)

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

## ⚙️ Opção 3: Supabase pg_cron (Plano Pro - $25/mês)

### Vantagens:
✅ 100% nativo Supabase  
✅ Máxima confiabilidade  
✅ Sem dependências externas  

### Passo a Passo:

1. **Acesse o Supabase SQL Editor**

2. **Execute:**
```sql
-- Habilitar extensão
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Criar cron job (a cada 15 minutos)
SELECT cron.schedule(
  'sync-csv-every-15min', 
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://SEU_PROJETO.supabase.co/functions/v1/sync-csv-to-supabase',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer SUA_ANON_KEY"}'::jsonb
  );
  $$
);
```

3. **Verificar jobs ativos:**
```sql
SELECT * FROM cron.job;
```

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

Para este projeto (portfólio/demonstração):

**Use: cron-job.org com frequência de 15 minutos**

✅ Zero custo  
✅ Configuração em 5 minutos  
✅ Confiável  
✅ Fácil de monitorar  

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique os logs da Edge Function
2. Teste manualmente primeiro (cURL)
3. Confirme que a URL do CSV está acessível
4. Valide as permissões no Supabase

**Boa sorte! 🚀**
