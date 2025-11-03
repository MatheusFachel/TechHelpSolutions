# 🧪 Guia de Testes - TechHelp Dashboard

Este guia contém testes passo a passo para verificar se tudo está funcionando corretamente.

---

## 🎯 TESTE 1: Conexão com Supabase

### Objetivo
Verificar se o frontend consegue se conectar ao Supabase e buscar dados.

### Passos
1. Certifique-se que `.env.local` está configurado
2. Execute:
   ```powershell
   npm run dev
   ```
3. Abra o navegador em: http://localhost:8080
4. Abra DevTools (F12) → Console

### ✅ Resultado Esperado
- Dashboard carrega sem erros
- KPIs mostram valores reais (não zeros)
- Gráficos aparecem com dados
- Console não mostra erros de autenticação

### ❌ Se Der Erro
**Erro**: `Missing environment variables`
- **Solução**: Verifique se `.env.local` existe e tem as credenciais corretas

**Erro**: `Failed to fetch` ou CORS error
- **Solução**: Verifique se a URL do Supabase está correta (sem barra no final)

**Erro**: `Invalid API key`
- **Solução**: Pegue novamente a anon key em: Project Settings → API

---

## 🎯 TESTE 2: Real-Time Subscriptions

### Objetivo
Verificar se o dashboard atualiza automaticamente quando dados mudam.

### Passos
1. Deixe o dashboard aberto no navegador
2. Abra o Supabase Dashboard em outra aba
3. Vá em **Table Editor** → **chamados**
4. Clique em qualquer linha para editar
5. Mude o campo `status` para outro valor (ex: "Aberto" → "Resolvido")
6. Clique em **Save**
7. **Volte para o dashboard** (não recarregue a página!)

### ✅ Resultado Esperado
- Dentro de 1-2 segundos, o dashboard deve atualizar automaticamente
- Toast de "Dados atualizados com sucesso!" deve aparecer
- KPIs e gráficos devem refletir a mudança
- No console (F12), você verá: `Mudança detectada: {...}`

### ❌ Se Não Atualizar
1. Verifique se executou no SQL Editor:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE chamados;
   ```
2. No Supabase Dashboard, vá em **Database** → **Replication**
3. Certifique-se que a tabela `chamados` está na lista de publicadas
4. Recarregue o dashboard e teste novamente

---

## 🎯 TESTE 3: Edge Function (Sem Google Sheets)

### Objetivo
Testar a Edge Function localmente antes de integrar com Google Sheets.

### Pré-requisito
Edge Function deve estar deployada (ver SETUP_GUIDE.md seção 5).

### Passos
1. Pegue a URL da sua Edge Function:
   - No Supabase Dashboard → **Edge Functions**
   - Copie a URL (ex: `https://xxxxx.supabase.co/functions/v1/sync-google-sheets`)

2. Teste manualmente via curl:
   ```powershell
   curl https://xxxxx.supabase.co/functions/v1/sync-google-sheets
   ```

3. Ou via navegador - acesse a URL diretamente

### ✅ Resultado Esperado
JSON de resposta como:
```json
{
  "success": false,
  "error": "Erro ao buscar Google Sheets: ...",
  "timestamp": "2024-XX-XX..."
}
```
**É NORMAL dar erro neste ponto** se você ainda não configurou o Google Sheets!

### ❌ Se Der Erro 500
1. Veja os logs no Supabase:
   - **Edge Functions** → **sync-google-sheets** → **Logs**
2. Verifique se os secrets foram configurados:
   ```powershell
   supabase secrets list
   ```
3. Deve mostrar: `GOOGLE_SHEETS_API_KEY`, `SPREADSHEET_ID`, `SHEET_NAME`

---

## 🎯 TESTE 4: Integração Google Sheets → Supabase

### Objetivo
Testar sincronização completa da planilha para o banco.

### Pré-requisitos
- Google Sheets API configurada
- Planilha criada e pública
- Secrets configurados
- Edge Function deployada

### Passos
1. Abra sua planilha no Google Sheets
2. Adicione uma nova linha com dados de teste:
   ```
   CHAMADO-TEST001, 2024-11-02 10:00:00, , Aberto, Alta, Teste API, , João Silva, Maria Santos, TI, 120, 30, Bom
   ```

3. Salve a planilha (Ctrl+S)

4. Chame a Edge Function:
   ```powershell
   curl https://xxxxx.supabase.co/functions/v1/sync-google-sheets
   ```

5. Verifique a resposta

6. Verifique no Supabase Table Editor se o registro `CHAMADO-TEST001` apareceu

### ✅ Resultado Esperado
```json
{
  "success": true,
  "message": "551 chamados sincronizados com sucesso",
  "timestamp": "2024-11-02T10:00:00.000Z"
}
```

E no Table Editor, você vê o novo registro.

### ❌ Se Der Erro

**Erro**: `The caller does not have permission`
- **Solução**: Planilha não está pública. Vá em Compartilhar → Acesso geral → Qualquer pessoa com o link

**Erro**: `API key not valid`
- **Solução**: Verifique se a API Key está correta e se a API está habilitada no Google Cloud

**Erro**: `Range 'Sheet1' not found`
- **Solução**: O nome da aba está errado. Verifique o `SHEET_NAME` nos secrets

---

## 🎯 TESTE 5: Sincronização Automática (Cron)

### Objetivo
Verificar se o cron job está funcionando.

### Pré-requisito
Cron configurado (cron-job.org ou pg_cron).

### Passos
1. Edite a planilha (mude algum status)
2. **Aguarde o intervalo do cron** (ex: 5 minutos)
3. Verifique os logs do cron job
4. Verifique se o dashboard atualizou automaticamente

### ✅ Resultado Esperado
- Após o intervalo, dashboard atualiza
- Toast de sucesso aparece
- Dados refletem mudanças da planilha

### 🔍 Como Verificar Logs

**Cron-job.org**:
1. Acesse sua conta
2. Vá no job criado
3. Clique em **History**
4. Veja status code (deve ser 200)

**Supabase pg_cron**:
```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

---

## 🎯 TESTE 6: Performance e Escalabilidade

### Objetivo
Verificar se o dashboard aguenta grande volume de dados.

### Passos
1. No Supabase SQL Editor, adicione muitos registros:
   ```sql
   INSERT INTO chamados 
   SELECT 
     'CHAMADO-' || LPAD(generate_series::text, 5, '0'),
     NOW() - (random() * interval '90 days'),
     CASE WHEN random() > 0.3 THEN NOW() - (random() * interval '60 days') ELSE NULL END,
     (ARRAY['Aberto', 'Pendente', 'Resolvido', 'Fechado'])[floor(random() * 4 + 1)],
     (ARRAY['Baixa', 'Média', 'Alta', 'Urgente'])[floor(random() * 4 + 1)],
     (ARRAY['Hardware', 'Software', 'Rede', 'Impressora'])[floor(random() * 4 + 1)],
     'Solução teste',
     'Solicitante ' || generate_series,
     'Técnico ' || (generate_series % 10 + 1),
     (ARRAY['TI', 'RH', 'Vendas', 'Marketing'])[floor(random() * 4 + 1)],
     floor(random() * 500)::int,
     floor(random() * 100)::int,
     (ARRAY['Ruim', 'Regular', 'Médio', 'Bom', 'Excelente'])[floor(random() * 5 + 1)]
   FROM generate_series(1000, 5000);
   ```

2. Recarregue o dashboard

### ✅ Resultado Esperado
- Dashboard carrega em < 3 segundos
- Gráficos renderizam corretamente
- Tabela usa paginação (10 itens por página)

### ⚠️ Se Ficar Lento
- Considere adicionar mais índices
- Use paginação server-side com React Query
- Limite dados nos gráficos (ex: últimos 30 dias)

---

## 🎯 TESTE 7: Filtros e Busca

### Objetivo
Verificar funcionalidades da tabela.

### Passos
1. No campo de busca, digite: "CHAMADO-00001"
2. Verifique se filtra corretamente
3. Limpe a busca
4. No dropdown de status, selecione "Aberto"
5. Verifique se mostra apenas abertos
6. Teste a paginação (próxima/anterior)

### ✅ Resultado Esperado
- Busca funciona em tempo real
- Filtro de status funciona
- Paginação atualiza corretamente
- Contador de páginas está correto

---

## 🎯 TESTE 8: Temas (Dark/Light Mode)

### Objetivo
Verificar alternância de temas.

### Passos
1. Clique no ícone de lua/sol no header
2. Verifique se tema muda
3. Recarregue a página
4. Verifique se tema persiste

### ✅ Resultado Esperado
- Tema alterna suavemente
- Cores mudam em todo o dashboard
- Preferência persiste após reload

---

## 📊 CHECKLIST DE TESTES COMPLETO

Execute todos os testes nesta ordem:

- [ ] **Teste 1**: Frontend conecta ao Supabase
- [ ] **Teste 2**: Real-Time funciona
- [ ] **Teste 3**: Edge Function responde
- [ ] **Teste 4**: Sincronização Google Sheets funciona
- [ ] **Teste 5**: Cron job executa automaticamente
- [ ] **Teste 6**: Performance com muitos dados
- [ ] **Teste 7**: Filtros e busca funcionam
- [ ] **Teste 8**: Temas funcionam

---

## 🐛 LOGS E DEBUG

### Ver Logs do Frontend
```
F12 → Console
```

### Ver Logs da Edge Function
```
Supabase Dashboard → Edge Functions → sync-google-sheets → Logs
```

### Ver Logs do Banco
```sql
-- Últimas queries executadas (requer habilitação de pg_stat_statements)
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%chamados%' 
ORDER BY calls DESC;
```

### Ver Execuções do Cron
```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC;
```

---

## ✅ TUDO FUNCIONANDO?

Se todos os testes passaram:

🎉 **PARABÉNS!** Seu dashboard está 100% funcional!

Próximos passos:
1. Deploy do frontend (Vercel/Netlify)
2. Adicionar autenticação (opcional)
3. Criar dashboard de administração
4. Adicionar mais visualizações

---

**Dúvidas?** Consulte:
- `SETUP_GUIDE.md` - Setup detalhado
- `IMPLEMENTATION_SUMMARY.md` - Resumo da implementação
- `CSV_IMPORT_GUIDE.md` - Como importar CSV
