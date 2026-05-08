-- Script de correção para subscription_discounts
-- Execute este script no Supabase SQL Editor ANTES de iniciar o servidor API
-- Este script corrige o problema de valores NULL na coluna periodo

-- 1. Verificar e corrigir registros com periodo NULL ou vazio
-- Primeiro, vamos garantir que não há NULLs
UPDATE subscription_discounts 
SET periodo = 'quarterly' 
WHERE periodo IS NULL OR periodo = '';

-- 2. Remover registros duplicados ou inválidos (manter apenas os válidos)
DELETE FROM subscription_discounts 
WHERE periodo NOT IN ('quarterly', 'semestral', 'annual');

-- 3. Garantir que os registros iniciais existem com os valores corretos
INSERT INTO subscription_discounts (periodo, desconto_percentual, ativo) 
VALUES 
    ('quarterly', 10.00, TRUE),
    ('semestral', 15.00, TRUE),
    ('annual', 20.00, TRUE)
ON CONFLICT (periodo) DO UPDATE 
SET desconto_percentual = EXCLUDED.desconto_percentual,
    ativo = EXCLUDED.ativo;

-- 4. Garantir que a coluna periodo é NOT NULL
-- Primeiro, atualizar qualquer NULL restante
UPDATE subscription_discounts 
SET periodo = 'quarterly' 
WHERE periodo IS NULL;

-- Depois, adicionar constraint NOT NULL
ALTER TABLE subscription_discounts 
ALTER COLUMN periodo SET NOT NULL;

-- 5. Verificar se a constraint CHECK existe, se não, criar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_periodo' 
        AND conrelid = 'subscription_discounts'::regclass
    ) THEN
        ALTER TABLE subscription_discounts 
        ADD CONSTRAINT check_periodo 
        CHECK (periodo IN ('quarterly', 'semestral', 'annual'));
    END IF;
END $$;

-- 6. Verificar resultado (deve retornar 3 registros)
SELECT periodo, desconto_percentual, ativo FROM subscription_discounts;

