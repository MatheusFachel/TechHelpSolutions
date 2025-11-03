# 🚀 Como Importar TODOS os 550 Registros

## ❌ Problema
A interface do Supabase importou apenas 100 registros dos 550.

## ✅ Solução: Importação via SQL

### **Opção 1: Usar Script Python (Recomendado)**

1. **Execute o script Python:**
   ```powershell
   cd scripts
   python csv-to-sql.py
   ```

2. **O script vai gerar:** `import-all-chamados.sql`

3. **Abra o arquivo gerado** e copie TODO o conteúdo

4. **No Supabase SQL Editor:**
   - Cole o conteúdo
   - Execute (`Ctrl + Enter`)

5. **Verifique:**
   ```sql
   SELECT COUNT(*) FROM chamados;
   ```
   Deve retornar: **550 registros** ✅

---

### **Opção 2: Importação Manual em Lotes**

Se não quiser usar Python:

1. **Limpe a tabela primeiro:**
   ```sql
   DELETE FROM chamados;
   ```

2. **Divida o CSV em arquivos menores:**
   - Linhas 1-100 → `chamados_parte1.csv`
   - Linhas 101-200 → `chamados_parte2.csv`
   - Linhas 201-300 → `chamados_parte3.csv`
   - Linhas 301-400 → `chamados_parte4.csv`
   - Linhas 401-500 → `chamados_parte5.csv`
   - Linhas 501-551 → `chamados_parte6.csv`

3. **Importe cada arquivo** pela interface do Supabase

---

### **Opção 3: Usar Conversor Online**

1. Acesse: https://www.convertcsv.com/csv-to-sql.htm

2. **Configure:**
   - Cole seu CSV completo
   - Table name: `chamados`
   - Include Column List: ✅ Marque
   - Create Table: ❌ Desmarque (já criamos)

3. **Ajuste os nomes das colunas** para:
   ```
   "ID do Chamado","Data de Abertura","Data de Fechamento","Status","Prioridade","Motivo","Solução","Solicitante","Agente Responsável","Departamento","TMA (minutos)","FRT (minutos)","Satisfação do Cliente"
   ```

4. **Clique em "Convert CSV to SQL"**

5. **Copie os INSERTs gerados**

6. **Cole no Supabase SQL Editor e execute**

---

## 🔍 Verificar Importação

Após qualquer método:

```sql
-- Total de registros
SELECT COUNT(*) as total FROM chamados;

-- Distribuição por status
SELECT "Status", COUNT(*) as quantidade 
FROM chamados 
GROUP BY "Status" 
ORDER BY quantidade DESC;

-- Verificar se todos os IDs estão lá
SELECT MIN("ID do Chamado") as primeiro, MAX("ID do Chamado") as ultimo 
FROM chamados;
```

**Esperado:**
- Total: 550
- Primeiro: CHAMADO-00001
- Último: CHAMADO-00550

---

## ⚠️ Se Tiver Problemas

### "Transaction too large"
Divida em lotes menores (100 registros por vez):

```sql
-- Lote 1 (primeiros 100 INSERTs)
BEGIN;
INSERT INTO chamados ...
COMMIT;

-- Lote 2 (próximos 100 INSERTs)
BEGIN;
INSERT INTO chamados ...
COMMIT;
```

### "Duplicate key error"
Limpe a tabela primeiro:
```sql
DELETE FROM chamados;
```

---

## 🎯 Recomendação

**Use a Opção 1 (Script Python)** - é a mais rápida e confiável!

```powershell
cd scripts
python csv-to-sql.py
```

Depois execute o SQL gerado no Supabase.

---

**Qualquer dúvida, me avise!** 🚀
