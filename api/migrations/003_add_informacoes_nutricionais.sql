-- Migration: Adicionar campo informacoes_nutricionais na tabela receitas
-- Data: 2024

-- Adicionar coluna informacoes_nutricionais (texto livre para informações nutricionais aproximadas)
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS informacoes_nutricionais TEXT NULL;

-- Comentário na coluna para documentação
COMMENT ON COLUMN receitas.informacoes_nutricionais IS 'Informações nutricionais aproximadas ou adicionais em texto livre (ex: "Por unidade: 45 kcal, 2g proteínas")';

