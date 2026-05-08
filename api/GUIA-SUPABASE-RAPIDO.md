# 🚀 Guia Rápido: Criar Banco de Dados PostgreSQL

## ✅ Opção Mais Rápida: Supabase (PostgreSQL Online)

**Vantagens:**
- ✅ Não precisa instalar nada
- ✅ Funciona imediatamente
- ✅ Grátis para começar
- ✅ Interface visual para gerenciar dados

---

## 📝 Passo a Passo Completo

### Passo 1: Criar Conta no Supabase

1. **Acesse:** https://supabase.com
2. Clique em **"Start your project"** (canto superior direito)
3. **Escolha uma opção:**
   - **"Continue with GitHub"** (recomendado - mais rápido)
   - Ou crie conta com email

### Passo 2: Criar Novo Projeto

1. Depois de fazer login, clique em **"New Project"**
2. Preencha os dados:
   - **Name**: `fit-rapido-app`
   - **Database Password**: Crie uma senha forte (ex: `MinhaSenh@123!`)
     - **⚠️ IMPORTANTE: ANOTE ESSA SENHA!** Você vai precisar
   - **Region**: Escolha **"South America (São Paulo)"** (mais rápido no Brasil)
   - **Pricing Plan**: Deixe **"Free"** (suficiente para começar)
3. Clique em **"Create new project"**
4. Aguarde 2-3 minutos enquanto o projeto é criado

### Passo 3: Obter URL de Conexão

1. Quando o projeto estiver pronto, vá em:
   - **Settings** (ícone de engrenagem no menu lateral esquerdo)
   - **Database**
2. Role até a seção **"Connection string"**
3. Clique na aba **"URI"**
4. Você verá uma URL assim:
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```
5. **Copie essa URL completa**

### Passo 4: Atualizar Arquivo .env

Abra o arquivo `api/.env` e cole a URL que você copiou:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
PORT=3001
JWT_SECRET="seu-secret-super-seguro-altere-em-producao"
JWT_EXPIRES_IN="7d"
API_URL="http://localhost:3001"
NODE_ENV="development"
```

**⚠️ IMPORTANTE:**
- Substitua `[PASSWORD]` pela senha que você criou no Passo 2
- A URL já está completa, só precisa trocar a senha

**Exemplo de como ficaria:**
```env
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:MinhaSenh@123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
```

### Passo 5: Criar o Banco de Dados "fitrapido_db"

O Supabase já cria um banco padrão chamado `postgres`. Você tem 2 opções:

#### Opção A: Usar o banco padrão (Mais Simples)

Nesse caso, NÃO precisa criar nada. O banco `postgres` já existe e funciona.

**Mas atualize o `.env` para usar o banco correto:**
```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
```

#### Opção B: Criar banco específico "fitrapido_db"

1. No Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **"New query"**
3. Cole este SQL:
   ```sql
   CREATE DATABASE fitrapido_db;
   ```
4. Clique em **"Run"** (ou pressione Ctrl+Enter)

**Mas na verdade**, no Supabase você não precisa criar outro banco. O banco `postgres` já serve perfeitamente!

### Passo 6: Testar a Conexão

1. **Abra o terminal** na pasta `api/`
2. Execute:
   ```powershell
   npm run start:dev
   ```

Se tudo estiver correto, você verá:
```
🚀 API rodando em http://localhost:3001
```

Se aparecer erro de conexão, verifique:
- ✅ URL no `.env` está completa?
- ✅ Senha foi substituída corretamente?
- ✅ Não há espaços antes/depois da URL?

---

## 🔍 Como Verificar se Está Funcionando

### Teste 1: Ver Tabelas no Supabase

1. No Supabase, vá em **Table Editor** (menu lateral)
2. Você verá tabelas padrão do Supabase
3. Quando rodar a API pela primeira vez, a tabela `usuarios` será criada automaticamente!

### Teste 2: Testar Endpoint de Cadastro

Com a API rodando (`npm run start:dev`), teste em outro terminal:

```powershell
curl -X POST http://localhost:3001/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\": \"teste@example.com\", \"nome\": \"Teste\", \"senha\": \"senha123\"}'
```

Se funcionar, você verá uma resposta JSON com o usuário criado!

---

## 📸 Screenshots de Referência

### Onde encontrar a Connection String:

1. **Settings** → **Database** → **Connection string** → **URI**
2. Copie a URL completa

### Exemplo de URL:
```
postgresql://postgres.abcdefghijklmnop:SUA_SENHA_AQUI@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

---

## ⚠️ Troubleshooting

### Erro: "password authentication failed"
- Verifique se substituiu `[PASSWORD]` pela senha correta
- A senha é a que você criou ao criar o projeto

### Erro: "could not connect to server"
- Verifique se a URL está completa
- Não esqueça de substituir a senha na URL

### Erro: "database does not exist"
- Use o banco `postgres` que já existe (não precisa criar novo)
- Ou certifique-se de que criou o banco no SQL Editor

---

## 🎯 Resumo Rápido

1. ✅ Acesse https://supabase.com
2. ✅ Crie conta e projeto
3. ✅ Copie Connection String (URI)
4. ✅ Cole no `.env` substituindo a senha
5. ✅ Execute `npm run start:dev`

**Pronto!** O banco está configurado e funcionando! 🎉

---

**Dica**: Depois de criar o projeto no Supabase, você pode acessar o dashboard para ver as tabelas, dados e até usar o SQL Editor para fazer queries diretamente!

