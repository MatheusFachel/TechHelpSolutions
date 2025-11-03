# 📊 Mapeamento de Colunas CSV → Supabase

Este documento mostra exatamente como mapear as colunas do seu CSV para a tabela do Supabase.

## 📋 Estrutura do CSV Atual

Seu CSV (`public/data/chamados.csv`) tem as seguintes colunas:

1. **ID do Chamado**
2. **Data de Abertura**
3. **Data de Fechamento**
4. **Status**
5. **Prioridade**
6. **Motivo**
7. **Solução**
8. **Solicitante**
9. **Agente Responsável**
10. **Departamento**
11. **TMA (minutos)**
12. **FRT (minutos)**
13. **Satisfação do Cliente**

## 🎯 Mapeamento para Tabela Supabase

Ao importar o CSV via interface do Supabase, use este mapeamento:

| CSV (Header)              | Supabase (Coluna)  | Tipo     | Observação |
|--------------------------|-------------------|----------|------------|
| ID do Chamado            | `id`              | TEXT     | Primary Key |
| Data de Abertura         | `data_abertura`   | TEXT     | Formato: YYYY-MM-DD HH:MM:SS |
| Data de Fechamento       | `data_fechamento` | TEXT     | Pode ser NULL/vazio |
| Status                   | `status`          | TEXT     | Ex: Aberto, Pendente, Resolvido |
| Prioridade               | `prioridade`      | TEXT     | Ex: Baixa, Média, Alta, Urgente |
| Motivo                   | `motivo`          | TEXT     | Categoria do problema |
| Solução                  | `solucao`         | TEXT     | Pode ser NULL/vazio |
| Solicitante              | `solicitante`     | TEXT     | Nome do solicitante |
| Agente Responsável       | `tecnico`         | TEXT     | Nome do técnico |
| Departamento             | `departamento`    | TEXT     | Ex: Vendas, RH, Marketing |
| TMA (minutos)            | `tma`             | INTEGER  | Tempo Médio de Atendimento |
| FRT (minutos)            | `frt`             | INTEGER  | First Response Time |
| Satisfação do Cliente    | `satisfacao`      | TEXT     | Ex: Bom, Regular, Excelente |

**IMPORTANTE**: 
- `created_at` e `updated_at` são gerados automaticamente - **NÃO** mapeie do CSV
- Se algum campo estiver vazio no CSV, será importado como NULL (exceto campos NOT NULL)

## 🔧 Passos para Importação via Interface Web

### 1. Acesse o Table Editor
- No Supabase Dashboard
- Menu lateral → **Table Editor**
- Selecione a tabela **chamados**

### 2. Inicie a Importação
- Clique em **Insert** (botão verde)
- Selecione **Import data from CSV**

### 3. Faça Upload do CSV
- Clique em **Choose file**
- Selecione: `public/data/chamados.csv`
- Clique em **Open**

### 4. Configure as Opções
- **First row is header**: ✅ Marque esta opção
- **Delimiter**: `,` (vírgula)
- **Encoding**: `UTF-8`

### 5. Mapeie as Colunas

A interface mostrará um dropdown para cada coluna do CSV. Configure assim:

```
CSV Column              →    Supabase Column
ID do Chamado           →    id
Data de Abertura        →    data_abertura
Data de Fechamento      →    data_fechamento
Status                  →    status
Prioridade              →    prioridade
Motivo                  →    motivo
Solução                 →    solucao
Solicitante             →    solicitante
Agente Responsável      →    tecnico
Departamento            →    departamento
TMA (minutos)           →    tma
FRT (minutos)           →    frt
Satisfação do Cliente   →    satisfacao
```

### 6. Importe
- Clique em **Import**
- Aguarde o processamento (pode demorar alguns segundos para 550 registros)
- Você verá uma mensagem de sucesso

### 7. Verifique
- Vá em **Table Editor** → **chamados**
- Você deve ver ~550 linhas
- Verifique se os dados estão corretos

## 🐛 Problemas Comuns

### "Duplicate key value violates unique constraint"
- Você já importou esses dados antes
- **Solução**: Limpe a tabela antes:
  ```sql
  DELETE FROM chamados;
  ```

### "Invalid input syntax for type integer"
- Algum campo numérico (tma ou frt) tem valor não-numérico no CSV
- **Solução**: Verifique o CSV e corrija valores inválidos

### "Column 'xxx' does not exist"
- Você mapeou para uma coluna errada
- **Solução**: Verifique o mapeamento na seção 5

### Acentos/caracteres especiais aparecem errados
- Problema de encoding
- **Solução**: Certifique-se que o CSV está em UTF-8

## 📝 Opção Alternativa: Conversão para SQL

Se preferir usar SQL em vez da interface:

1. Acesse: https://www.convertcsv.com/csv-to-sql.htm
2. Cole o conteúdo do CSV
3. Configure:
   - **Table name**: `chamados`
   - **Create Table**: Desmarque (já criamos a tabela)
   - **Include Column List**: Marque
4. Clique em **Convert CSV to SQL**
5. Copie os INSERTs gerados
6. Cole no SQL Editor do Supabase
7. Execute

## ✅ Verificação Pós-Importação

Execute no SQL Editor:

```sql
-- Total de registros
SELECT COUNT(*) as total FROM chamados;
-- Esperado: ~550

-- Distribuição por status
SELECT status, COUNT(*) as quantidade 
FROM chamados 
GROUP BY status 
ORDER BY quantidade DESC;

-- Distribuição por técnico
SELECT tecnico, COUNT(*) as quantidade 
FROM chamados 
GROUP BY tecnico 
ORDER BY quantidade DESC 
LIMIT 10;

-- Verificar se há dados nulos onde não deveria
SELECT 
  COUNT(*) FILTER (WHERE id IS NULL) as ids_nulos,
  COUNT(*) FILTER (WHERE status IS NULL) as status_nulos,
  COUNT(*) FILTER (WHERE tecnico IS NULL) as tecnico_nulos
FROM chamados;
-- Todos devem ser 0
```

## 🎯 Próximo Passo

Após importação bem-sucedida:
1. Configure o `.env.local` com suas credenciais
2. Execute `npm run dev`
3. Acesse http://localhost:8080
4. **Veja seus dados no dashboard!** 🎉

---

**Dica**: Depois que o Google Sheets estiver configurado, os dados virão automaticamente da planilha. Este CSV é apenas para inicializar o banco!
