# 🔧 Correção: Erro de NULL na coluna `nome` da tabela `ingredientes`

## ❌ Problema

A API está falhando ao iniciar com o erro:
```
column "nome" of relation "ingredientes" contains null values
```

Isso acontece porque alguns registros na tabela `ingredientes` têm `nome` NULL, mas o TypeORM está tentando adicionar uma constraint `NOT NULL`.

## ✅ Solução

Execute o script SQL no Supabase antes de iniciar a API:

### Passo 1: Acesse o Supabase SQL Editor

1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor**
3. Clique em **New Query**

### Passo 2: Execute o Script

Copie e cole o conteúdo do arquivo `api/migrations/fix_ingredientes_nome_null.sql` e execute.

### Passo 3: Verifique

O script vai:
- ✅ Atualizar todos os registros com `nome` NULL
- ✅ Garantir que a constraint NOT NULL está aplicada
- ✅ Mostrar estatísticas finais

### Passo 4: Reinicie a API

Após executar o script, reinicie a API:

```bash
cd api
npm run start:dev
```

## 🔍 Verificação Manual

Se quiser verificar manualmente no Supabase:

```sql
-- Ver quantos têm NULL
SELECT COUNT(*) FROM ingredientes WHERE nome IS NULL;

-- Ver alguns exemplos
SELECT id, nome FROM ingredientes WHERE nome IS NULL LIMIT 10;
```

## ⚠️ Nota

Se você preferir **excluir** os registros problemáticos ao invés de atualizá-los, descomente a linha no script:

```sql
DELETE FROM ingredientes WHERE nome IS NULL;
```

Mas **cuidado**: isso vai excluir permanentemente os registros!

