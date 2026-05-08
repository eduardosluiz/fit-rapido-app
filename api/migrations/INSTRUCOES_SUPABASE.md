# Como Executar a Migration no Supabase

## Passo a Passo

1. **Acesse o Supabase Dashboard**
   - Vá para https://app.supabase.com
   - Faça login na sua conta
   - Selecione o projeto do Fit & Rápido

2. **Abra o SQL Editor**
   - No menu lateral esquerdo, clique em "SQL Editor"
   - Clique em "New query"

3. **Cole o conteúdo da migration**
   - Abra o arquivo `api/migrations/001_subscription_system.sql`
   - Copie TODO o conteúdo do arquivo
   - Cole no SQL Editor do Supabase

4. **Execute a query**
   - Clique no botão "Run" (ou pressione Ctrl+Enter / Cmd+Enter)
   - Aguarde a execução completar

5. **Verifique se foi executado com sucesso**
   - Você deve ver uma mensagem de sucesso
   - Se houver erros, verifique se as tabelas já existem (alguns comandos usam `IF NOT EXISTS`)

## Verificação

Para verificar se tudo foi criado corretamente, execute estas queries:

```sql
-- Verificar se a coluna is_free foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'receitas' AND column_name = 'is_free';

-- Verificar se a coluna trial_expires_at foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND column_name = 'trial_expires_at';

-- Verificar se a tabela subscription_discounts foi criada
SELECT * FROM subscription_discounts;

-- Verificar se os descontos foram inseridos
SELECT periodo, desconto_percentual, ativo FROM subscription_discounts;
```

Você deve ver:
- `is_free` na tabela `receitas`
- `trial_expires_at` na tabela `usuarios`
- 3 registros na tabela `subscription_discounts` (quarterly: 10%, semestral: 15%, annual: 20%)

## Alterar Descontos no Futuro

Para alterar os descontos, você pode executar diretamente no SQL Editor:

```sql
-- Alterar desconto trimestral para 12%
UPDATE subscription_discounts 
SET desconto_percentual = 12.00 
WHERE periodo = 'quarterly';

-- Desativar desconto semestral temporariamente
UPDATE subscription_discounts 
SET ativo = FALSE 
WHERE periodo = 'semestral';

-- Reativar desconto semestral
UPDATE subscription_discounts 
SET ativo = TRUE 
WHERE periodo = 'semestral';
```

