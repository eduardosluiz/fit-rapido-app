-- Script para corrigir registros com nome NULL na tabela ingredientes
-- Execute este script no Supabase SQL Editor ANTES de iniciar a API

-- 1. Verificar quantos registros têm nome NULL
SELECT COUNT(*) as total_null FROM ingredientes WHERE nome IS NULL;

-- 2. Opção A: Atualizar registros com nome NULL para um nome temporário baseado no ID
UPDATE ingredientes 
SET nome = 'Ingrediente_' || SUBSTRING(id::text, 1, 8)
WHERE nome IS NULL;

-- 2. Opção B: Se preferir excluir os registros problemáticos (descomente a linha abaixo)
-- DELETE FROM ingredientes WHERE nome IS NULL;

-- 3. Verificar se ainda há NULLs (deve retornar 0)
SELECT COUNT(*) as total_null_after FROM ingredientes WHERE nome IS NULL;

-- 4. Garantir que a coluna nome tenha constraint NOT NULL
-- (Se a migration não foi executada corretamente)
DO $$ 
BEGIN
    -- Remover constraint NOT NULL se existir (para poder atualizar)
    ALTER TABLE ingredientes ALTER COLUMN nome DROP NOT NULL;
    
    -- Atualizar NULLs novamente (caso ainda existam)
    UPDATE ingredientes 
    SET nome = 'Ingrediente_' || SUBSTRING(id::text, 1, 8)
    WHERE nome IS NULL;
    
    -- Adicionar constraint NOT NULL novamente
    ALTER TABLE ingredientes ALTER COLUMN nome SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN
        -- Se der erro, apenas logar
        RAISE NOTICE 'Erro ao alterar constraint: %', SQLERRM;
END $$;

-- 5. Verificar resultado final
SELECT COUNT(*) as total_registros FROM ingredientes;
SELECT COUNT(*) as total_com_nome FROM ingredientes WHERE nome IS NOT NULL;
