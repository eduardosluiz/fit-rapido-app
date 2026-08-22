-- Configuração visual dos cards de dias da semana nas modalidades.
-- Seguro para execução repetida: não remove nem altera dados existentes.

ALTER TABLE public.treinos_modalidades
  ADD COLUMN IF NOT EXISTS configuracao_dias jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.treinos_modalidades.configuracao_dias IS
  'Título e imagem dos cards por nível e dia da semana no aplicativo mobile.';
