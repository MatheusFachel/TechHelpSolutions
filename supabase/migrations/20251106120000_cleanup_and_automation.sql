-- ========================================
-- LIMPEZA DO SISTEMA
-- ========================================
-- 
-- Este script:
-- 1. Remove tabela duplicada 'notificacoes' (antiga)
-- 2. Mantém apenas 'notifications' (padrão inglês)
-- 3. Cria tabela de logs de sincronização

-- ========================================
-- 1. REMOVER TABELA DUPLICADA
-- ========================================

-- Remover tabela antiga 'notificacoes' (com colunas em português)
DROP TABLE IF EXISTS public.notificacoes CASCADE;

COMMENT ON TABLE public.notifications IS 'Tabela de notificações do sistema - Armazena alertas de novos chamados';

-- ========================================
-- 2. TABELA DE LOGS DE SINCRONIZAÇÃO
-- ========================================

CREATE TABLE IF NOT EXISTS public.sync_logs (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_created_at ON public.sync_logs(created_at DESC);

COMMENT ON TABLE public.sync_logs IS 'Logs de execução de sincronizações automáticas';

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Migração concluída com sucesso!';
  RAISE NOTICE '✅ Tabela duplicada ''notificacoes'' removida';
  RAISE NOTICE '✅ Mantida apenas tabela ''notifications''';
  RAISE NOTICE '📋 Tabela de logs criada: public.sync_logs';
  RAISE NOTICE '⚠️ Nota: pg_cron não disponível no plano Free';
  RAISE NOTICE '💡 Solução: Polling automático no frontend';
END;
$$;
