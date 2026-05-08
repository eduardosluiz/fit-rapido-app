-- Script para adicionar os novos campos na tabela treinos
-- Execute este script quando o banco de dados estiver rodando

-- Adicionar tipo_treino
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS tipo_treino VARCHAR;

-- Adicionar tipo_dica
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS tipo_dica VARCHAR;

-- Adicionar tipo_equipamento_casa
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS tipo_equipamento_casa VARCHAR;

-- Adicionar substituicoes_exercicios
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS substituicoes_exercicios JSONB;

-- Adicionar mostrar_ponto_partida
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS mostrar_ponto_partida BOOLEAN DEFAULT false;

-- Adicionar is_inedito
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS is_inedito BOOLEAN DEFAULT false;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS IDX_treinos_tipo_treino ON treinos(tipo_treino);
CREATE INDEX IF NOT EXISTS IDX_treinos_tipo_dica ON treinos(tipo_dica);
CREATE INDEX IF NOT EXISTS IDX_treinos_mostrar_ponto_partida ON treinos(mostrar_ponto_partida);
CREATE INDEX IF NOT EXISTS IDX_treinos_is_inedito ON treinos(is_inedito);

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'treinos'
AND column_name IN ('tipo_treino', 'tipo_dica', 'tipo_equipamento_casa', 'substituicoes_exercicios', 'mostrar_ponto_partida', 'is_inedito')
ORDER BY column_name;
