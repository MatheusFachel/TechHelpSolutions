-- Script SQL para importar dados do CSV para o Supabase
-- ATENÇÃO: Este é um exemplo de como seria o script.
-- Você precisa adaptar com os dados reais do seu CSV.

-- Opção 1: Via Interface Web do Supabase
-- 1. Vá em Table Editor → chamados → Insert → Import from CSV
-- 2. Faça upload do arquivo public/data/chamados.csv
-- 3. Mapeie as colunas conforme indicado no SETUP_GUIDE.md

-- Opção 2: Via SQL (para poucos registros de teste)
-- Execute este script no SQL Editor do Supabase para criar alguns registros de exemplo:

INSERT INTO chamados (id, data_abertura, data_fechamento, status, prioridade, motivo, solucao, solicitante, tecnico, departamento, tma, frt, satisfacao)
VALUES
('CHAMADO-00001', '2024-07-12 21:51:58', NULL, 'Aberto', 'Média', 'Acesso Negado', NULL, 'Kaique Cavalcante', 'Luara da Conceição', 'Vendas', 355, 66, 'Regular'),
('CHAMADO-00002', '2024-05-25 00:14:55', NULL, 'Aberto', 'Baixa', 'Falha de Software', NULL, 'Luigi Moraes', 'Yago Ferreira', 'Recursos Humanos', 144, 102, 'Bom'),
('CHAMADO-00003', '2025-08-04 14:36:44', NULL, 'Aberto', 'Baixa', 'Impressora Não Funciona', NULL, 'Dra. Ágatha Souza', 'Maria Flor Ferreira', 'Recursos Humanos', 375, 119, 'Médio'),
('CHAMADO-00004', '2024-11-07 11:37:29', NULL, 'Pendente', 'Alta', 'Acesso Negado', NULL, 'Elisa Camargo', 'Vinícius Câmara', 'Marketing', 96, 24, 'Regular'),
('CHAMADO-00005', '2025-05-12 08:02:50', NULL, 'Pendente', 'Urgente', 'Acesso Negado', NULL, 'Luna Peixoto', 'Luara Moura', 'Recursos Humanos', 276, 96, 'Médio');

-- NOTA: Para importar todos os 550+ registros do CSV, use a Opção 1 (Interface Web)
-- ou use uma ferramenta como https://www.convertcsv.com/csv-to-sql.htm

-- Verificar se os dados foram importados corretamente:
SELECT COUNT(*) as total_chamados FROM chamados;
SELECT status, COUNT(*) as quantidade FROM chamados GROUP BY status;
SELECT tecnico, COUNT(*) as total FROM chamados GROUP BY tecnico ORDER BY total DESC LIMIT 5;

-- Habilitar Real-Time (IMPORTANTE!)
ALTER PUBLICATION supabase_realtime ADD TABLE chamados;

-- Testar query que será usada no frontend:
SELECT * FROM chamados ORDER BY data_abertura DESC LIMIT 10;
