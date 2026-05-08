-- Adicionar coluna ordem na tabela treinos
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

-- Criar índice para melhorar performance de ordenação
CREATE INDEX IF NOT EXISTS IDX_treinos_ordem ON treinos(ordem);

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'treinos'
AND column_name = 'ordem';
