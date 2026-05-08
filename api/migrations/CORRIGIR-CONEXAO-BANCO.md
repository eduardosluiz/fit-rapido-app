# 🔧 Correção: Erro de Conexão com Banco de Dados

## Problema
O servidor API não está conseguindo conectar ao banco de dados devido a um erro na tabela `subscription_discounts`:
```
column "periodo" of relation "subscription_discounts" contains null values
```

## Solução

### Passo 1: Executar Script de Correção no Supabase

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Execute o script `fix_subscription_discounts.sql` completo:

```sql
-- Copie e cole todo o conteúdo do arquivo api/migrations/fix_subscription_discounts.sql
```

Ou execute diretamente:

```sql
-- 1. Corrigir registros com periodo NULL
UPDATE subscription_discounts 
SET periodo = 'quarterly' 
WHERE periodo IS NULL OR periodo = '';

-- 2. Remover registros inválidos
DELETE FROM subscription_discounts 
WHERE periodo NOT IN ('quarterly', 'semestral', 'annual');

-- 3. Garantir registros iniciais
INSERT INTO subscription_discounts (periodo, desconto_percentual, ativo) 
VALUES 
    ('quarterly', 10.00, TRUE),
    ('semestral', 15.00, TRUE),
    ('annual', 20.00, TRUE)
ON CONFLICT (periodo) DO UPDATE 
SET desconto_percentual = EXCLUDED.desconto_percentual,
    ativo = EXCLUDED.ativo;

-- 4. Garantir NOT NULL
UPDATE subscription_discounts 
SET periodo = 'quarterly' 
WHERE periodo IS NULL;

ALTER TABLE subscription_discounts 
ALTER COLUMN periodo SET NOT NULL;

-- 5. Verificar resultado
SELECT periodo, desconto_percentual, ativo FROM subscription_discounts;
```

### Passo 2: Reiniciar o Servidor API

Após executar o script SQL:

```bash
cd api
npm run start:dev
```

## O que foi corrigido?

1. **Entidade SubscriptionDiscount**: Alterada de `enum` para `varchar` para compatibilidade com a tabela existente
2. **Script SQL**: Criado para garantir que não há valores NULL na coluna `periodo`
3. **Constraints**: Verificadas e corrigidas no banco de dados

## Verificação

Após executar o script, você deve ver 3 registros:
- `quarterly` - 10.00%
- `semestral` - 15.00%
- `annual` - 20.00%

Se tudo estiver correto, o servidor API deve conectar normalmente! ✅

