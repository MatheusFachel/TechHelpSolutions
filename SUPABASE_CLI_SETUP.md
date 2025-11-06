# Guia: Configurar Supabase CLI e Aplicar Migration

## 1. Instalar Supabase CLI

### ⚠️ IMPORTANTE: NPM global NÃO é mais suportado!

### Opção 1: Via Scoop (RECOMENDADO para Windows)

```powershell
# 1. Instalar Scoop (se ainda não tiver)
# Execute no PowerShell (NÃO precisa ser Admin):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# 2. Adicionar bucket do Supabase
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git

# 3. Instalar Supabase CLI
scoop install supabase

# 4. Verificar instalação
supabase --version
```

### Opção 2: Via NPX (sem instalação, usa sempre a versão mais recente)

```powershell
# Não precisa instalar, use npx diretamente:
npx supabase --version
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF

# NOTA: Sempre use "npx supabase" antes de cada comando
```

## 2. Login no Supabase

```powershell
supabase login
```

Isso abrirá o navegador para autenticação. Faça login com sua conta Supabase.

## 3. Linkar Projeto Local com Projeto Remoto

```powershell
# Na pasta raiz do projeto
cd "C:\Users\ResTIC55\Documents\1 - Trabalhos (Projetos,Vibe Coding, Agentes)\Caldeira IA e Dados\TechHelpSolutions"

# Linkar com o projeto remoto
supabase link --project-ref SEU_PROJECT_REF
```

**Como encontrar o PROJECT_REF:**
1. Vá em https://app.supabase.com
2. Abra seu projeto
3. A URL será algo como: `https://app.supabase.com/project/abc123xyz`
4. O `abc123xyz` é o seu PROJECT_REF

**Ou pelo painel:**
- Settings → General → Reference ID

## 4. Aplicar a Migration

```powershell
# Aplicar migration remotamente
supabase db push

# Ou se preferir aplicar localmente primeiro (para testar)
supabase db reset
```

## 5. Verificar se a Tabela Foi Criada

```powershell
# Abrir SQL Editor no browser
supabase db studio

# Ou executar query direto do CLI
supabase db execute "SELECT * FROM notificacoes LIMIT 1;"
```

## 6. Comandos Úteis do Supabase CLI

```powershell
# Ver status da conexão
supabase status

# Criar nova migration
supabase migration new nome_da_migration

# Ver histórico de migrations
supabase migration list

# Rollback da última migration
supabase db reset

# Ver logs do banco
supabase db logs

# Abrir dashboard local
supabase start
```

## 7. Configurar Variáveis de Ambiente (se necessário)

Se você quiser usar Supabase local para desenvolvimento:

```powershell
# Iniciar Supabase local (Docker necessário)
supabase start

# Isso criará um banco PostgreSQL local e fornecerá URLs locais
```

Crie um arquivo `.env.local`:

```env
# Produção (Supabase Cloud)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key

# Ou Local (se usar supabase start)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=chave-local-fornecida
```

## 8. Testar a Migration

Após aplicar, teste com:

```sql
-- Inserir notificação de teste
INSERT INTO notificacoes (chamado_id, motivo, usuario_id)
VALUES ('INC-001', 'Teste de notificação', 'admin@techelp.com');

-- Ver notificações
SELECT * FROM notificacoes ORDER BY created_at DESC;

-- Testar RLS (Row Level Security)
SELECT * FROM notificacoes WHERE usuario_id = 'admin@techelp.com';
```

## 9. Troubleshooting

**Erro: "Migration already applied"**
```powershell
# Resetar banco (CUIDADO: apaga dados!)
supabase db reset
```

**Erro: "Cannot connect to project"**
```powershell
# Verificar se está logado
supabase projects list

# Re-linkar projeto
supabase link --project-ref SEU_PROJECT_REF
```

**Erro: "Permission denied"**
- Verifique se você tem permissões de admin no projeto
- Vá em Settings → Database → Connection Pooling

## 10. Migration Aplicada com Sucesso ✅

Agora as notificações estão sendo salvas no Supabase:
- ✅ Persistência no banco de dados PostgreSQL
- ✅ Sincronização em tempo real entre dispositivos
- ✅ Row Level Security (cada usuário vê apenas suas notificações)
- ✅ Limpeza automática (mantém últimas 50 por usuário)
- ✅ Backup automático pelo Supabase

## Diferenças: localStorage vs Supabase

| Recurso | localStorage | Supabase |
|---------|-------------|----------|
| Persistência | Apenas local | Cloud + Local |
| Sincronização | ❌ Não | ✅ Tempo real |
| Multi-dispositivo | ❌ Não | ✅ Sim |
| Backup | ❌ Não | ✅ Automático |
| Limite | ~5MB | ~500GB (plano gratuito) |
| Segurança | Cliente | RLS + Auth |
| Compartilhamento | ❌ Não | ✅ Entre usuários |

## Próximos Passos (Opcional)

1. **Adicionar autenticação real**: Substituir `CURRENT_USER` por auth do Supabase
2. **Dashboard de admin**: Ver notificações de todos os usuários
3. **Notificações push**: Enviar via email/SMS quando novo chamado
4. **Filtros avançados**: Por período, por técnico, etc.
