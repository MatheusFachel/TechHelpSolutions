# 🚀 START HERE - Guia Rápido de Início

**Bem-vindo!** Este é o ponto de partida para configurar seu dashboard.

---

## 📚 DOCUMENTAÇÃO DISPONÍVEL

Todos os arquivos que você precisa:

1. **`IMPLEMENTATION_SUMMARY.md`** ⭐ COMECE AQUI
   - Resumo completo do que foi implementado
   - Checklist de próximos passos
   - Troubleshooting comum

2. **`SETUP_GUIDE.md`** 📖 GUIA PRINCIPAL
   - Passo a passo detalhado de TUDO
   - Configuração do Supabase
   - Configuração do Google Sheets API
   - Deploy da Edge Function
   - Configuração do Cron Job

3. **`CSV_IMPORT_GUIDE.md`** 📊 IMPORTAR DADOS
   - Como importar o CSV inicial para o Supabase
   - Mapeamento exato das colunas
   - Troubleshooting de importação

4. **`TESTING_GUIDE.md`** 🧪 TESTAR TUDO
   - 8 testes essenciais
   - Como verificar se tudo funciona
   - Debug e logs

5. **`README.md`** 📄 SOBRE O PROJETO
   - Visão geral do projeto
   - Tecnologias usadas
   - Como contribuir

---

## ⚡ INÍCIO RÁPIDO (5 PASSOS)

### 1️⃣ Configurar Supabase (15 min)
```
✅ Criar conta em https://supabase.com
✅ Criar novo projeto
✅ Executar SQL para criar tabela (ver SETUP_GUIDE.md seção 1.2)
✅ Copiar URL e anon key
✅ Colar no arquivo .env.local
```

### 2️⃣ Importar Dados (5 min)
```
✅ No Supabase Table Editor → Import CSV
✅ Usar arquivo: public/data/chamados.csv
✅ Seguir mapeamento em CSV_IMPORT_GUIDE.md
✅ Verificar se ~550 registros foram importados
```

### 3️⃣ Testar Frontend (2 min)
```powershell
npm run dev
```
Abra http://localhost:8080 - deve mostrar dados! 🎉

### 4️⃣ Configurar Google Sheets (20 min)
```
✅ Criar projeto no Google Cloud Console
✅ Ativar Google Sheets API
✅ Criar API Key
✅ Copiar planilha para Google Sheets
✅ Tornar planilha pública (leitura)
✅ Anotar SPREADSHEET_ID
```
(Ver SETUP_GUIDE.md seção 4 para detalhes)

### 5️⃣ Deploy Edge Function (10 min)
```powershell
npm install -g supabase
supabase login
supabase link --project-ref SEU_PROJECT_ID
supabase secrets set GOOGLE_SHEETS_API_KEY="..."
supabase secrets set SPREADSHEET_ID="..."
supabase secrets set SHEET_NAME="Sheet1"
supabase functions deploy sync-google-sheets
```
(Ver SETUP_GUIDE.md seção 5 para detalhes)

---

## 🎯 VOCÊ ESTÁ EM QUAL FASE?

### ❓ Ainda não comecei
👉 Leia `IMPLEMENTATION_SUMMARY.md` primeiro
👉 Depois siga `SETUP_GUIDE.md` passo a passo

### ❓ Tenho o Supabase configurado
👉 Importe o CSV usando `CSV_IMPORT_GUIDE.md`
👉 Configure `.env.local` com suas credenciais
👉 Execute `npm run dev` para testar

### ❓ Frontend está funcionando
👉 Configure Google Sheets API (`SETUP_GUIDE.md` seção 4)
👉 Deploy Edge Function (`SETUP_GUIDE.md` seção 5)
👉 Configure Cron Job (`SETUP_GUIDE.md` seção 6)

### ❓ Tudo está configurado
👉 Execute os testes em `TESTING_GUIDE.md`
👉 Verifique se sincronização automática funciona
👉 Deploy do frontend (Vercel/Netlify)

---

## 🆘 PRECISO DE AJUDA!

### Erro ao rodar `npm run dev`
```powershell
# Reinstalar dependências
npm install

# Verificar se .env.local existe e está configurado
cat .env.local
```

### Dashboard não mostra dados
1. Verifique `.env.local` tem credenciais corretas
2. Verifique se tabela `chamados` tem dados no Supabase
3. Abra DevTools (F12) → Console e veja erros

### Real-Time não funciona
Execute no Supabase SQL Editor:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE chamados;
```

### Edge Function dá erro
1. Veja logs: Supabase Dashboard → Edge Functions → Logs
2. Verifique secrets: `supabase secrets list`
3. Teste Google Sheets API separadamente

---

## 📞 SUPORTE E REFERÊNCIAS

- **Supabase Docs**: https://supabase.com/docs
- **Google Sheets API**: https://developers.google.com/sheets/api
- **Edge Functions**: https://supabase.com/docs/guides/functions
- **React Query**: https://tanstack.com/query/latest

---

## 🎓 ENTENDENDO A ARQUITETURA

```
┌─────────────────┐
│  Google Sheets  │ ← Você edita aqui
└────────┬────────┘
         │
         │ (Cron Job chama a cada X min)
         ▼
┌─────────────────────┐
│  Edge Function      │ ← Lê planilha e sincroniza
│  sync-google-sheets │
└────────┬────────────┘
         │
         │ (Upsert de dados)
         ▼
┌─────────────────┐
│  Supabase       │
│  PostgreSQL     │ ← Banco de dados
└────────┬────────┘
         │
         │ (Real-Time Subscriptions)
         ▼
┌─────────────────┐
│  React          │
│  Dashboard      │ ← Atualiza automaticamente!
└─────────────────┘
```

---

## ✅ CHECKLIST COMPLETO

- [ ] Supabase configurado
- [ ] Tabela `chamados` criada
- [ ] CSV importado (550+ registros)
- [ ] `.env.local` configurado
- [ ] `npm run dev` funcionando
- [ ] Real-Time testado
- [ ] Google Cloud projeto criado
- [ ] Google Sheets API habilitada
- [ ] API Key criada
- [ ] Planilha copiada para Google Sheets
- [ ] Planilha pública (leitura)
- [ ] Supabase CLI instalado
- [ ] Projeto linkado
- [ ] Secrets configurados
- [ ] Edge Function deployada
- [ ] Cron Job configurado
- [ ] Sincronização testada
- [ ] Testes do TESTING_GUIDE.md executados

---

## 🎉 PRONTO PARA COMEÇAR?

1. **Primeiro**: Leia `IMPLEMENTATION_SUMMARY.md`
2. **Depois**: Siga `SETUP_GUIDE.md` passo a passo
3. **Ao final**: Execute testes do `TESTING_GUIDE.md`

**Boa sorte! 🚀**

---

> 💡 **Dica**: Marque os checkboxes acima conforme completa cada etapa!
