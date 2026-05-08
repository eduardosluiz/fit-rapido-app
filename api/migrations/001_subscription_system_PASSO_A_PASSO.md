# Migration - Passo a Passo para Supabase

## ⚠️ IMPORTANTE: Execute em 2 etapas

O PostgreSQL não permite adicionar valores a um ENUM dentro de uma transação. Por isso, você precisa executar em **2 etapas separadas**.

### ETAPA 1: Adicionar valores ao ENUM

Execute estas 2 linhas **SEPARADAMENTE** no SQL Editor do Supabase:

```sql
ALTER TYPE usuarios_subscription_tier_enum ADD VALUE IF NOT EXISTS 'free';
```

```sql
ALTER TYPE usuarios_subscription_tier_enum ADD VALUE IF NOT EXISTS 'premium_fit';
```

**Aguarde alguns segundos** após executar cada linha para garantir que foi processado.

### ETAPA 2: Executar o resto da migration

Depois de executar as 2 linhas acima, execute o resto do script `001_subscription_system.sql` (a partir da linha 8).

Ou execute este script completo (que já assume que os valores foram adicionados):

```sql
-- 1. Adicionar coluna is_free na tabela receitas
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT FALSE;

-- 2. Adicionar coluna trial_expires_at na tabela usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP NULL;

-- 3. Adicionar coluna periodo na tabela subscriptions
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

-- 8. Atualizar usuários existentes sem trial_expires_at para definir trial baseado em created_at
UPDATE usuarios 
SET trial_expires_at = created_at + INTERVAL '7 days'
WHERE trial_expires_at IS NULL AND created_at IS NOT NULL;

-- 9. Atualizar usuários existentes com subscription_tier = 'none' para 'free' se ainda estão no trial
UPDATE usuarios 
SET subscription_tier = 'free'::usuarios_subscription_tier_enum
WHERE subscription_tier = 'none'::usuarios_subscription_tier_enum
  AND trial_expires_at IS NOT NULL 
  AND trial_expires_at > CURRENT_TIMESTAMP;
```

## Verificação

Após executar tudo, verifique se funcionou:

```sql
-- Verificar se os valores foram adicionados ao enum
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'usuarios_subscription_tier_enum'::regtype
ORDER BY enumsortorder;

-- Deve mostrar: none, basic, free, premium, premium_fit

-- Verificar se a coluna is_free foi criada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'receitas' AND column_name = 'is_free';

-- Verificar se a tabela subscription_discounts foi criada
SELECT * FROM subscription_discounts;
```


