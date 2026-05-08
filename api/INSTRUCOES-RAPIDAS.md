# 🚀 Instruções Rápidas - Corrigir API e Adicionar Chave USDA

## ✅ 1. Adicionar Chave da API USDA

Abra o arquivo `api/.env` e adicione esta linha:

```env
USDA_API_KEY=xGN5NigwU7LPROAsha5sMxaWSz6AhYiycl8CgXbX
```

**Localização**: `C:\Users\dude_\fit-rapido-app\api\.env`

---

## ✅ 2. Verificar se a API Inicia

Execute no terminal (na pasta `api`):

```powershell
npm run start:dev
```

Se ainda der erro de NULL, execute este script primeiro:

```powershell
node scripts/fix-ingredientes-null.js
```

---

## 🔍 3. Se Ainda Der Erro

### Opção A: Executar SQL Manual no Supabase

1. Acesse o Supabase SQL Editor
2. Execute este comando:

```sql
-- Verificar NULLs
SELECT COUNT(*) FROM ingredientes WHERE nome IS NULL;

-- Se houver NULLs, corrigir:
UPDATE ingredientes 
SET nome = 'Ingrediente_' || SUBSTRING(id::text, 1, 8)
WHERE nome IS NULL;

-- Garantir constraint
ALTER TABLE ingredientes ALTER COLUMN nome SET NOT NULL;
```

### Opção B: Desabilitar Sincronização Temporariamente

Se o problema persistir, você pode desabilitar a sincronização automática do TypeORM temporariamente:

1. Abra `api/src/app.module.ts`
2. Mude a linha 46 de:
   ```typescript
   synchronize: process.env.NODE_ENV !== 'production',
   ```
   Para:
   ```typescript
   synchronize: false, // Desabilitado temporariamente
   ```

**⚠️ ATENÇÃO**: Isso significa que mudanças nas entidades não serão aplicadas automaticamente. Use apenas para testar.

---

## 📞 Próximos Passos

Após adicionar a chave USDA e corrigir os NULLs:

1. ✅ Adicione `USDA_API_KEY` no `.env`
2. ✅ Execute `node scripts/fix-ingredientes-null.js` (se necessário)
3. ✅ Inicie a API: `npm run start:dev`
4. ✅ Teste o login no admin

