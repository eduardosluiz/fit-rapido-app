-- Migration: Sistema de Planos de Assinatura Completo
-- Data: 2025-01-XX
-- Descrição: Adiciona campos e tabelas necessárias para o sistema de planos de assinatura

-- 1. Adicionar coluna is_free na tabela receitas
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT FALSE;

-- 2. Adicionar coluna trial_expires_at na tabela usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP NULL;

-- 3. Adicionar enum SubscriptionPeriod (usando tipo text com constraint)
-- Primeiro, adicionar coluna periodo na tabela subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS periodo VARCHAR(20) NULL;

-- 4. Criar tabela subscription_discounts
CREATE TABLE IF NOT EXISTS subscription_discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    periodo VARCHAR(20) NOT NULL UNIQUE,
    desconto_percentual DECIMAL(5,2) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_periodo CHECK (periodo IN ('quarterly', 'semestral', 'annual'))
);

-- 5. Criar índice único em periodo
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_discounts_periodo ON subscription_discounts(periodo);

-- 6. Inserir dados iniciais de descontos
INSERT INTO subscription_discounts (periodo, desconto_percentual, ativo) 
VALUES 
    ('quarterly', 10.00, TRUE),
    ('semestral', 15.00, TRUE),
    ('annual', 20.00, TRUE)
ON CONFLICT (periodo) DO NOTHING;

-- 7. Criar índice em receitas.is_free para performance
CREATE INDEX IF NOT EXISTS idx_receitas_is_free ON receitas(is_free) WHERE is_free = TRUE;

-- 8. Atualizar enum subscription_tier no banco (PostgreSQL)
-- IMPORTANTE: No PostgreSQL, ALTER TYPE deve ser executado FORA de uma transação
-- Execute estas linhas SEPARADAMENTE antes de continuar:
-- ALTER TYPE usuarios_subscription_tier_enum ADD VALUE IF NOT EXISTS 'free';
-- ALTER TYPE usuarios_subscription_tier_enum ADD VALUE IF NOT EXISTS 'premium_fit';
-- 
-- Se você já executou as linhas acima, pode continuar com o resto do script.
-- Se não executou, pare aqui, execute as duas linhas acima, e depois continue.

-- 9. Atualizar usuários existentes sem trial_expires_at para definir trial baseado em created_at
UPDATE usuarios 
SET trial_expires_at = created_at + INTERVAL '7 days'
WHERE trial_expires_at IS NULL AND created_at IS NOT NULL;

-- 10. Atualizar usuários existentes com subscription_tier = 'none' para 'free' se ainda estão no trial
-- NOTA: Esta atualização só funcionará se 'free' for um valor válido no enum
-- Se der erro aqui, execute primeiro as linhas do passo 8 acima
UPDATE usuarios 
SET subscription_tier = 'free'::usuarios_subscription_tier_enum
WHERE subscription_tier = 'none'::usuarios_subscription_tier_enum
  AND trial_expires_at IS NOT NULL 
  AND trial_expires_at > CURRENT_TIMESTAMP;

-- Comentários:
-- - A coluna periodo na tabela subscriptions aceita: 'monthly', 'quarterly', 'semestral', 'annual'
-- - Os descontos podem ser alterados diretamente na tabela subscription_discounts sem necessidade de deploy
-- - O máximo de 50 receitas FREE é validado no código da aplicação

