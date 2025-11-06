-- Tabela para armazenar notificações dos usuários
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chamado_id TEXT NOT NULL REFERENCES chamados("ID do Chamado") ON DELETE CASCADE,
  motivo TEXT NOT NULL,
  usuario_id TEXT NOT NULL, -- Email ou ID do usuário
  lida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX idx_notificacoes_usuario_id ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX idx_notificacoes_created_at ON notificacoes(created_at DESC);

-- RLS (Row Level Security) - cada usuário vê apenas suas notificações
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias notificações
CREATE POLICY "Usuarios veem apenas suas notificacoes"
  ON notificacoes
  FOR SELECT
  USING (usuario_id = current_setting('request.jwt.claims', true)::json->>'email');

-- Política: Usuários podem inserir notificações para si mesmos
CREATE POLICY "Usuarios podem criar suas notificacoes"
  ON notificacoes
  FOR INSERT
  WITH CHECK (usuario_id = current_setting('request.jwt.claims', true)::json->>'email');

-- Política: Usuários podem atualizar apenas suas notificações
CREATE POLICY "Usuarios podem atualizar suas notificacoes"
  ON notificacoes
  FOR UPDATE
  USING (usuario_id = current_setting('request.jwt.claims', true)::json->>'email');

-- Política: Usuários podem deletar apenas suas notificações
CREATE POLICY "Usuarios podem deletar suas notificacoes"
  ON notificacoes
  FOR DELETE
  USING (usuario_id = current_setting('request.jwt.claims', true)::json->>'email');

-- Função para limpar notificações antigas (manter apenas últimas 50 por usuário)
CREATE OR REPLACE FUNCTION limpar_notificacoes_antigas()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM notificacoes
  WHERE id IN (
    SELECT id
    FROM notificacoes
    WHERE usuario_id = NEW.usuario_id
    ORDER BY created_at DESC
    OFFSET 50
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para executar limpeza automática após cada insert
CREATE TRIGGER trigger_limpar_notificacoes
  AFTER INSERT ON notificacoes
  FOR EACH ROW
  EXECUTE FUNCTION limpar_notificacoes_antigas();

-- Comentários para documentação
COMMENT ON TABLE notificacoes IS 'Armazena notificações de novos chamados para cada usuário';
COMMENT ON COLUMN notificacoes.chamado_id IS 'ID do chamado relacionado';
COMMENT ON COLUMN notificacoes.usuario_id IS 'Email ou ID do usuário que receberá a notificação';
COMMENT ON COLUMN notificacoes.lida IS 'Indica se a notificação foi lida pelo usuário';
