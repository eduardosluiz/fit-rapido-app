-- Adicionar coluna imagens_url na tabela receitas
-- Execute este script no Supabase SQL Editor

ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS imagens_url text[] DEFAULT '{}'::text[];

-- Comentário: Esta coluna armazena um array de URLs de imagens para criar um carrossel na página da receita
-- A primeira imagem do array será usada como imagem principal (imagem_url)

