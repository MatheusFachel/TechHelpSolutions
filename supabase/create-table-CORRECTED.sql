-- ============================================
-- SCRIPT CORRIGIDO PARA IMPORTAR CSV
-- ============================================
-- Este script cria a tabela com os nomes EXATOS do CSV
-- para permitir importação direta via interface do Supabase

-- 1. Apagar a tabela antiga (se existir)
DROP TABLE IF EXISTS chamados CASCADE;

-- 2. Criar tabela com nomes das colunas EXATAMENTE como no CSV
CREATE TABLE chamados (
  "ID do Chamado" TEXT PRIMARY KEY,
  "Data de Abertura" TEXT NOT NULL,
  "Data de Fechamento" TEXT,
  "Status" TEXT NOT NULL,
  "Prioridade" TEXT NOT NULL,
  "Motivo" TEXT NOT NULL,
  "Solução" TEXT,
  "Solicitante" TEXT NOT NULL,
  "Agente Responsável" TEXT NOT NULL,
  "Departamento" TEXT NOT NULL,
  "TMA (minutos)" INTEGER NOT NULL DEFAULT 0,
  "FRT (minutos)" INTEGER NOT NULL DEFAULT 0,
  "Satisfação do Cliente" TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Criar índices para melhor performance
CREATE INDEX idx_chamados_status ON chamados("Status");
CREATE INDEX idx_chamados_tecnico ON chamados("Agente Responsável");
CREATE INDEX idx_chamados_data_abertura ON chamados("Data de Abertura");
CREATE INDEX idx_chamados_departamento ON chamados("Departamento");
CREATE INDEX idx_chamados_prioridade ON chamados("Prioridade");

-- 4. Habilitar Real-Time para esta tabela
ALTER PUBLICATION supabase_realtime ADD TABLE chamados;

-- 5. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chamados_updated_at 
  BEFORE UPDATE ON chamados 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PRONTO! Agora você pode importar o CSV
-- ============================================
-- Passos:
-- 1. Vá em Table Editor → chamados
-- 2. Clique em Insert → Import from CSV
-- 3. Faça upload do arquivo "cahamado suporte tecnico.csv"
-- 4. O mapeamento será AUTOMÁTICO (1:1)
-- 5. Clique em Import
-- ============================================
