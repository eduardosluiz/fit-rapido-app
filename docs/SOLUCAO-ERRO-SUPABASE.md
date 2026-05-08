# 🔧 Solução para Erro de Conexão com Supabase

## 🐛 Erro Identificado

```
Error: getaddrinfo ENOTFOUND db.occddouiyqvcdhtxpbej.supabase.co
```

Este erro indica que a API não consegue conectar ao banco de dados Supabase.

## 🔍 Causas Possíveis

1. **Projeto Supabase foi deletado ou pausado**
2. **URL do banco está incorreta no arquivo `.env`**
3. **Problemas de conexão de internet/DNS**
4. **Credenciais do Supabase expiraram ou mudaram**

## ✅ Soluções

### Opção 1: Usar PostgreSQL Local (Recomendado para Desenvolvimento)

Se você tem PostgreSQL instalado localmente, use esta configuração:

#### 1. Atualizar `api/.env`:

```env
# PostgreSQL Local
DATABASE_URL="postgresql://usuario:senha@localhost:5432/fitrapido_db"
PORT=3001
JWT_SECRET="seu-secret-super-seguro-altere-em-producao"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
```

**Substitua:**
- `usuario`: seu usuário PostgreSQL (geralmente `postgres`)
- `senha`: sua senha PostgreSQL
- `fitrapido_db`: nome do banco (crie se não existir)

#### 2. Criar o banco de dados (se não existir):

```sql
CREATE DATABASE fitrapido_db;
```

#### 3. Verificar se PostgreSQL está rodando:

```powershell
# Verificar serviço
Get-Service -Name postgresql*

# Se não estiver rodando, iniciar:
Start-Service -Name postgresql-x64-XX  # Substitua XX pela versão
```

### Opção 2: Criar Novo Projeto no Supabase

Se preferir continuar usando Supabase:

#### 1. Acesse https://supabase.com
#### 2. Crie um novo projeto
#### 3. Obtenha a nova Connection String:
   - Vá em **Settings** → **Database** → **Connection string** → **URI**
   - Copie a URL completa

#### 4. Atualize `api/.env`:

```env
DATABASE_URL="postgresql://postgres.[NOVO_PROJECT_REF]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
PORT=3001
JWT_SECRET="seu-secret-super-seguro-altere-em-producao"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
```

**⚠️ IMPORTANTE:**
- Substitua `[NOVO_PROJECT_REF]` pelo ID do novo projeto
- Substitua `[SENHA]` pela senha que você criou
- Use a porta `6543` (pooler) ou `5432` (direto)

### Opção 3: Verificar e Corrigir URL Existente

Se você tem certeza que o projeto Supabase ainda existe:

#### 1. Verificar no Supabase Dashboard:
   - Acesse https://supabase.com/dashboard
   - Verifique se o projeto `occddouiyqvcdhtxpbej` ainda existe
   - Se existir, vá em **Settings** → **Database** e copie a URL atualizada

#### 2. Verificar formato da URL:

A URL deve estar neste formato:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

**Ou para conexão direta:**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

#### 3. Verificar se a senha está codificada corretamente:
   - Se a senha contém caracteres especiais, eles devem estar codificados na URL
   - Exemplo: `@` vira `%40`, `#` vira `%23`, etc.

## 🧪 Testar Conexão

Após atualizar o `.env`, teste a conexão:

### Teste 1: Verificar se a API inicia sem erros

```powershell
cd api
npm run start:dev
```

Você deve ver:
```
🚀 API rodando em http://localhost:3001
```

**NÃO deve aparecer:**
```
ERROR [TypeOrmModule] Unable to connect to the database
```

### Teste 2: Testar conexão direta (se tiver psql)

```powershell
# Para PostgreSQL local
psql -U usuario -d fitrapido_db -h localhost

# Para Supabase (substitua pelos seus valores)
psql "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
```

## 📋 Checklist de Verificação

Antes de tentar iniciar a API novamente, verifique:

- [ ] Arquivo `api/.env` existe
- [ ] `DATABASE_URL` está configurado corretamente
- [ ] Senha está correta (sem espaços extras)
- [ ] URL está completa (não está cortada)
- [ ] PostgreSQL local está rodando (se usar local)
- [ ] Projeto Supabase existe e está ativo (se usar Supabase)
- [ ] Conexão de internet está funcionando

## 🚀 Solução Rápida (PostgreSQL Local)

Se você tem PostgreSQL instalado, use esta configuração imediatamente:

```env
# api/.env
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/fitrapido_db"
PORT=3001
JWT_SECRET="seu-secret-super-seguro-altere-em-producao"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
```

Depois crie o banco:
```sql
CREATE DATABASE fitrapido_db;
```

E inicie a API:
```powershell
cd api
npm run start:dev
```

## 🆘 Ainda com Problemas?

1. **Verifique os logs completos** do erro
2. **Teste a conexão manualmente** com `psql` ou cliente PostgreSQL
3. **Verifique firewall/antivírus** que possam estar bloqueando conexões
4. **Tente usar a porta direta (5432)** em vez do pooler (6543) no Supabase

---

**Última atualização**: Agora
**Status**: ✅ Solução completa para erro de conexão

