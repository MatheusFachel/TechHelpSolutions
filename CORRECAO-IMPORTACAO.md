# 🔧 CORREÇÃO: Como Importar o CSV Corretamente

## ⚠️ PROBLEMA IDENTIFICADO

O CSV tem colunas em **português com espaços**:
- "ID do Chamado"
- "Agente Responsável"
- "TMA (minutos)"

A tabela antiga tinha nomes em **snake_case inglês**:
- `id`
- `tecnico`
- `tma`

**Resultado**: Incompatibilidade! ❌

---

## ✅ SOLUÇÃO

Recriar a tabela com os nomes EXATOS do CSV.

---

## 📋 PASSOS PARA CORRIGIR

### 1️⃣ Apagar a Tabela Antiga

No Supabase Dashboard:
1. Vá em **SQL Editor**
2. Clique em **New Query**
3. Cole este comando:

```sql
DROP TABLE IF EXISTS chamados CASCADE;
```

4. Clique em **Run** (ou `Ctrl + Enter`)

### 2️⃣ Criar a Tabela Correta

No mesmo **SQL Editor**:
1. Clique em **New Query**
2. **COPIE TODO o conteúdo** do arquivo:
   ```
   supabase/create-table-CORRECTED.sql
   ```
3. Cole no SQL Editor
4. Clique em **Run**

**Você deve ver**: ✅ "Success. No rows returned"

### 3️⃣ Importar o CSV

Agora o CSV vai funcionar!

1. Vá em **Table Editor** → **chamados**
2. Clique em **Insert** → **Import from CSV**
3. Faça upload do arquivo: `cahamado suporte tecnico.csv`
4. **O mapeamento será AUTOMÁTICO!** (1:1)
   - "ID do Chamado" → "ID do Chamado" ✅
   - "Data de Abertura" → "Data de Abertura" ✅
   - "Agente Responsável" → "Agente Responsável" ✅
   - etc.
5. Clique em **Import**

### 4️⃣ Verificar

Execute no SQL Editor:

```sql
SELECT COUNT(*) as total FROM chamados;
```

**Deve retornar**: 550 registros ✅

---

## 🎯 PRÓXIMO PASSO

Após importação bem-sucedida:

```powershell
npm run dev
```

Acesse: http://localhost:8080

**O dashboard deve carregar com todos os dados!** 🎉

---

## 📝 O QUE FOI ATUALIZADO

Todos os arquivos foram corrigidos para usar os nomes do CSV:

✅ `src/lib/supabase.ts` - Interface atualizada
✅ `src/utils/dataParser.ts` - Função de conversão atualizada
✅ `src/pages/Index.tsx` - Query do Supabase atualizada
✅ `supabase/functions/sync-google-sheets/index.ts` - Edge Function atualizada
✅ `supabase/create-table-CORRECTED.sql` - Script SQL correto criado

---

## ⚠️ IMPORTANTE

Quando for fazer o Google Sheets:
- Use o MESMO CSV que você me enviou
- Os headers devem ser EXATAMENTE:
  ```
  ID do Chamado,Data de Abertura,Data de Fechamento,Status,Prioridade,Motivo,Solução,Solicitante,Agente Responsável,Departamento,TMA (minutos),FRT (minutos),Satisfação do Cliente
  ```

---

## 🐛 SE DER ERRO

### "Table already exists"
```sql
DROP TABLE IF EXISTS chamados CASCADE;
```

### "Permission denied"
- Você está usando o owner/admin do projeto? Verifique.

### CSV ainda não importa
- Verifique se executou TODO o script `create-table-CORRECTED.sql`
- Verifique se o CSV tem exatamente 13 colunas

---

## ✅ CHECKLIST

- [ ] Executei `DROP TABLE IF EXISTS chamados CASCADE;`
- [ ] Executei TODO o `create-table-CORRECTED.sql`
- [ ] Tabela `chamados` foi criada com sucesso
- [ ] Importei o CSV via Table Editor
- [ ] 550 registros foram importados
- [ ] `npm run dev` está rodando
- [ ] Dashboard mostra os dados

---

**Pronto! Agora deve funcionar perfeitamente! 🚀**
