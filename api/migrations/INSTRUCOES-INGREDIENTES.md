# 📋 Instruções: Sistema de Ingredientes

## Passo 1: Executar Migration

Execute a migration SQL no Supabase:

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo de `api/migrations/002_ingredientes_system.sql`
4. Execute o script

**OU** execute via terminal:

```bash
psql $DATABASE_URL -f api/migrations/002_ingredientes_system.sql
```

## Passo 2: Instalar Dependências do Script de Importação

```bash
cd api
npm install xlsx pg dotenv
```

## Passo 3: Importar Dados do TACO

1. **Baixe o arquivo TACO**:
   - Acesse: http://www.nepa.unicamp.br/taco/tabela.php
   - Baixe o arquivo Excel (.xls ou .xlsx)

2. **Execute o script de importação**:
   ```bash
   node scripts/importar-taco.js caminho/para/taco_4_edicao_2011.xls
   ```

   Exemplo:
   ```bash
   node scripts/importar-taco.js ../Downloads/taco_4_edicao_2011.xls
   ```

3. **Verifique a importação**:
   ```sql
   SELECT COUNT(*) FROM ingredientes;
   SELECT nome, calorias, proteinas FROM ingredientes LIMIT 10;
   ```

## Endpoints da API Criados

### Ingredientes
- `GET /ingredientes` - Listar todos (query: `?ativo=true`)
- `GET /ingredientes/search?q=termo` - Buscar ingredientes
- `GET /ingredientes/:id` - Buscar por ID
- `POST /ingredientes` - Criar (requer auth)
- `PATCH /ingredientes/:id` - Atualizar (requer auth)
- `DELETE /ingredientes/:id` - Deletar (requer auth)

### Receita Ingredientes
- `GET /receita-ingredientes/receita/:receitaId` - Listar ingredientes de uma receita
- `POST /receita-ingredientes` - Associar ingrediente a receita (requer auth)
- `PATCH /receita-ingredientes/:id` - Atualizar associação (requer auth)
- `DELETE /receita-ingredientes/:id` - Remover associação (requer auth)

### Substituições
- `POST /substituicoes` - Criar substituição (requer auth)
- `GET /substituicoes/receita/:receitaId` - Listar substituições de uma receita (requer auth)
- `GET /substituicoes/calcular/:receitaId` - Calcular macros com substituições (requer auth)
- `DELETE /substituicoes/:id` - Remover substituição (requer auth)

## Próximos Passos

1. ✅ Estrutura base criada
2. ⏳ Integrar API USDA (Fase 2)
3. ⏳ Criar interface admin (Fase 3)

