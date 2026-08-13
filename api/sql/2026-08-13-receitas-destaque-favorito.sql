-- Executar manualmente no SQL Editor do Supabase antes de publicar a API.
-- Operação aditiva: não remove nem modifica receitas existentes.
BEGIN;

ALTER TABLE public.receitas
  ADD COLUMN IF NOT EXISTS destaque_favorito boolean NOT NULL DEFAULT false;

COMMIT;
