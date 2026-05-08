# 🔧 Troubleshooting: Importação TACO

## Erro: ECONNREFUSED (Conexão Recusada)

Este erro significa que o script não conseguiu encontrar a variável `DATABASE_URL`.

### ✅ Solução 1: Verificar arquivo .env

1. **Verifique se o arquivo `.env` existe na raiz do projeto**:
   ```
   fit-rapido-app/
   ├── api/
   ├── admin/
   ├── mobile/
   └── .env  ← Deve estar aqui!
   ```

2. **Verifique se o arquivo `.env` contém `DATABASE_URL`**:
   ```env
   DATABASE_URL=postgresql://usuario:senha@host:porta/database
   ```

### ✅ Solução 2: Executar da raiz do projeto

Se o `.env` está na raiz, execute o script da raiz:

```bash
# Na raiz do projeto
cd C:\Users\dude_\fit-rapido-app
node api/scripts/importar-taco.js C:\Users\dude_\Downloads\Taco-4a-Edicao.xlsx
```

### ✅ Solução 3: Definir variável de ambiente temporariamente

**Windows PowerShell:**
```powershell
$env:DATABASE_URL="postgresql://usuario:senha@host:porta/database"
node api/scripts/importar-taco.js C:\Users\dude_\Downloads\Taco-4a-Edicao.xlsx
```

**Windows CMD:**
```cmd
set DATABASE_URL=postgresql://usuario:senha@host:porta/database
node api\scripts\importar-taco.js C:\Users\dude_\Downloads\Taco-4a-Edicao.xlsx
```

### ✅ Solução 4: Verificar formato da DATABASE_URL

A URL do Supabase geralmente tem este formato:
```
postgresql://postgres:[SENHA]@[HOST]:5432/postgres?sslmode=require
```

**Exemplo:**
```
postgresql://postgres.abcdefghijklmnop:minhasenha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

### 🔍 Como encontrar sua DATABASE_URL no Supabase

1. Acesse https://supabase.com
2. Vá em seu projeto
3. **Settings** → **Database**
4. Role até **Connection string** → **URI**
5. Copie a URL (ela já inclui a senha)

### ✅ Teste rápido

Para testar se a conexão funciona:

```bash
# No PowerShell, da raiz do projeto
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL ? 'OK' : 'ERRO')"
```

Se mostrar "OK", o `.env` está sendo carregado corretamente.

