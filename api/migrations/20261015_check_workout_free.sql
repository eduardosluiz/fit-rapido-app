-- Somente leitura: executar no editor SQL do banco utilizado pela API.
-- Se não retornar linhas, a coluna ainda não existe nesse banco/schema.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'treinos'
  AND column_name = 'is_free';

-- Esperado: is_free | boolean | NO | false.
-- Este arquivo não cria nem altera a coluna.
