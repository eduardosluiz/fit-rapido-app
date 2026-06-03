-- Executar no SQL Editor do Supabase
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS destaque_popular BOOLEAN DEFAULT false;
