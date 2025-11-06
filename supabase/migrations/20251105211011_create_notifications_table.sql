-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chamado_id TEXT NOT NULL,
    motivo TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT DEFAULT 'default_user' -- Para futura autenticação multi-usuário
);

-- Criar índice para buscar notificações de um usuário específico
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Criar índice para buscar notificações não lidas
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Criar índice para ordenar por data
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Política: Permitir leitura de todas as notificações (por enquanto, sem autenticação)
CREATE POLICY "Allow read access to all users" ON public.notifications
    FOR SELECT
    USING (true);

-- Política: Permitir inserção de notificações
CREATE POLICY "Allow insert for all users" ON public.notifications
    FOR INSERT
    WITH CHECK (true);

-- Política: Permitir atualização (marcar como lida)
CREATE POLICY "Allow update for all users" ON public.notifications
    FOR UPDATE
    USING (true);

-- Política: Permitir exclusão
CREATE POLICY "Allow delete for all users" ON public.notifications
    FOR DELETE
    USING (true);
