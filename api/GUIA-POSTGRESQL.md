# 📊 Guia de Configuração do PostgreSQL

## 🎯 Opções para Banco de Dados

Você tem 3 opções principais:

### Opção 1: PostgreSQL Local (Recomendado para Desenvolvimento)
- Instalar PostgreSQL no seu computador
- Banco de dados local
- Mais rápido para desenvolvimento

### Opção 2: PostgreSQL Online (Supabase, Neon, etc)
- Banco de dados na nuvem
- Não precisa instalar nada
- Boa para começar rapidamente

### Opção 3: Docker
- Usar Docker para rodar PostgreSQL
- Mais fácil de gerenciar
- Bom se já usa Docker

---

## 🚀 Opção 1: PostgreSQL Local (Passo a Passo)

### Passo 1: Verificar se já tem PostgreSQL instalado

Execute no PowerShell:
```powershell
psql --version
```

Se aparecer uma versão (ex: `psql (PostgreSQL) 15.x`), você já tem instalado! Pule para o Passo 3.

### Passo 2: Instalar PostgreSQL

**Windows:**

1. **Baixar PostgreSQL:**
   - Acesse: https://www.postgresql.org/download/windows/
   - Ou use o instalador direto: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Baixe a versão mais recente (ex: PostgreSQL 15 ou 16)

2. **Instalar:**
   - Execute o instalador
   - Durante a instalação:
     - **Porta**: Deixe padrão (5432)
     - **Senha do usuário postgres**: **ANOTE ESSA SENHA!** Você vai precisar
     - Marque para adicionar ao PATH se perguntar

3. **Verificar instalação:**
   ```powershell
   psql --version
   ```

### Passo 3: Criar o Banco de Dados

#### Método A: Via linha de comando (PowerShell)

```powershell
# Conectar ao PostgreSQL
psql -U postgres

# Se pedir senha, digite a senha que você configurou na instalação
# Depois execute:
CREATE DATABASE fitrapido_db;

# Verificar se foi criado
\l

# Sair
\q
```

#### Método B: Via pgAdmin (Interface Gráfica)

1. **Abrir pgAdmin:**
   - Procure por "pgAdmin" no menu iniciar
   - Ou acesse: http://localhost/pgAdmin

2. **Conectar ao servidor:**
   - Clique com botão direito em "Servers" → "Register" → "Server"
   - Na aba "General", dê um nome (ex: "Local PostgreSQL")
   - Na aba "Connection":
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: [sua senha]
   - Clique em "Save"

3. **Criar banco de dados:**
   - Clique com botão direito em "Databases" → "Create" → "Database"
   - Nome: `fitrapido_db`
   - Clique em "Save"

#### Método C: Via PowerShell (mais simples)

```powershell
# Criar banco diretamente sem entrar no psql
psql -U postgres -c "CREATE DATABASE fitrapido_db;"
```

### Passo 4: Atualizar o arquivo .env

Atualize seu arquivo `.env` na pasta `api/`:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA_AQUI@localhost:5432/fitrapido_db"
PORT=3001
JWT_SECRET="seu-secret-super-seguro-altere-em-producao"
JWT_EXPIRES_IN="7d"
API_URL="http://localhost:3001"
NODE_ENV="development"
```

**Substitua `SUA_SENHA_AQUI` pela senha que você configurou durante a instalação.**

---

## ☁️ Opção 2: PostgreSQL Online (Supabase - Mais Rápido)

### Passo 1: Criar conta no Supabase

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub (ou crie conta)

### Passo 2: Criar novo projeto

1. Clique em "New Project"
2. Preencha:
   - **Name**: `fit-rapido-app`
   - **Database Password**: Crie uma senha forte e **ANOTE**
   - **Region**: Escolha a mais próxima (ex: South America)
3. Clique em "Create new project"

### Passo 3: Obter URL de conexão

1. No projeto, vá em **Settings** → **Database**
2. Procure por **Connection string** → **URI**
3. Copie a URL que começa com `postgresql://postgres:...`

### Passo 4: Atualizar o arquivo .env

Cole a URL completa no seu `.env`:

```env
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.xxxxx.supabase.co:5432/postgres"
PORT=3001
JWT_SECRET="seu-secret-super-seguro-altere-em-producao"
JWT_EXPIRES_IN="7d"
API_URL="http://localhost:3001"
NODE_ENV="development"
```

**Substitua `[SUA-SENHA]` pela senha que você criou no Supabase.**

---

## 🐳 Opção 3: Docker (Se já usa Docker)

```bash
# Rodar PostgreSQL em Docker
docker run --name fitrapido-postgres \
  -e POSTGRES_PASSWORD=senha123 \
  -e POSTGRES_DB=fitrapido_db \
  -p 5432:5432 \
  -d postgres:15

# Criar banco (já está criado pelo comando acima)
```

Atualize o `.env`:
```env
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/fitrapido_db"
```

---

## ✅ Verificar se está funcionando

### Teste 1: Verificar conexão

No PowerShell, na pasta `api/`:

```powershell
# Testar conexão (se usar PostgreSQL local)
psql -U postgres -d fitrapido_db -c "SELECT version();"
```

### Teste 2: Iniciar a API

```powershell
cd api
npm run start:dev
```

Se tudo estiver correto, você verá:
```
🚀 API rodando em http://localhost:3001
```

Se aparecer erro de conexão, verifique:
- ✅ PostgreSQL está rodando?
- ✅ Senha no `.env` está correta?
- ✅ Nome do banco está correto?
- ✅ Porta está correta (5432)?

---

## 🔧 Troubleshooting

### Erro: "psql não é reconhecido como comando"
- PostgreSQL não está instalado ou não está no PATH
- Reinstale o PostgreSQL marcando a opção "Add to PATH"

### Erro: "password authentication failed"
- Senha incorreta no `.env`
- Verifique a senha que você configurou

### Erro: "database does not exist"
- O banco não foi criado ainda
- Execute: `CREATE DATABASE fitrapido_db;`

### Erro: "could not connect to server"
- PostgreSQL não está rodando
- Windows: Abra "Services" e inicie o serviço "postgresql-x64-15"
- Ou reinicie o computador

---

## 📝 Resumo Rápido (PostgreSQL Local)

```powershell
# 1. Instalar PostgreSQL (se não tiver)
# Baixe de: https://www.postgresql.org/download/windows/

# 2. Criar banco
psql -U postgres -c "CREATE DATABASE fitrapido_db;"

# 3. Atualizar .env com:
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/fitrapido_db"

# 4. Testar API
cd api
npm run start:dev
```

---

**Recomendação**: Para começar rápido, use **Supabase (Opção 2)**. Para desenvolvimento profissional, use **PostgreSQL Local (Opção 1)**.

