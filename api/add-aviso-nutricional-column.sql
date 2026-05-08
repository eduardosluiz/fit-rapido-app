-- Adicionar coluna aviso_nutricional à tabela receitas
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS aviso_nutricional TEXT;
