# 🚀 Guia Rápido - Iniciar Servidores

## 📍 Estado Atual do Projeto

✅ **API NestJS**: Configurada e pronta
- Porta: **3001**
- Módulos: Auth, Receitas, Treinos, Upload
- Banco: PostgreSQL (configurado via .env)

✅ **Admin Next.js**: Configurado e pronto
- Porta: **3000** (padrão Next.js)
- Conectado à API em `http://localhost:3001`

✅ **Mobile Expo**: Configurado
- Comando: `npm start` ou `npx expo start`
- **Importante**: Deve estar na pasta `mobile/` para funcionar

## 🎯 Como Iniciar

### ⚠️ **ORDEM DE INICIALIZAÇÃO É IMPORTANTE!**

A ordem importa porque:
- **API** deve estar rodando primeiro (Admin e Mobile dependem dela)
- **Admin** pode ser iniciado após a API estar pronta
- **Mobile** pode ser iniciado independentemente, mas precisa da API para funcionar

### 📋 Ordem Recomendada:

1. **Primeiro**: API Backend (porta 3001)
2. **Segundo**: Admin Frontend (porta 3000) - aguarde a API iniciar
3. **Terceiro**: Mobile Expo (opcional, apenas se for testar no app)

---

### Opção 1: Iniciar Manualmente (Recomendado)

#### 🟢 Passo 1: Terminal 1 - API Backend (OBRIGATÓRIO PRIMEIRO)
```bash
cd api
npm run start:dev
```

**Aguarde até ver:**
```
[Nest] Application successfully started
```

A API estará disponível em: **http://localhost:3001**

#### 🟡 Passo 2: Terminal 2 - Admin Frontend (APÓS API ESTAR RODANDO)
```bash
cd admin
npm run dev
```

**Aguarde até ver:**
```
✓ Ready in Xs
○ Local: http://localhost:3000
```

O Admin estará disponível em: **http://localhost:3000**

#### 🔵 Passo 3: Terminal 3 - Mobile Expo (OPCIONAL)
```bash
cd mobile
npm start
# ou
npx expo start
```

**Nota**: O mobile pode ser iniciado a qualquer momento, mas precisa da API rodando para funcionar corretamente.

---

### ⚡ Início Rápido (3 Terminais)

**Terminal 1:**
```powershell
cd api
npm run start:dev
```

**Terminal 2 (aguarde API iniciar):**
```powershell
cd admin
npm run dev
```

**Terminal 3 (opcional, para testar mobile):**
```powershell
cd mobile
npx expo start
```

## 📝 Verificações Importantes

### 1. Banco de Dados PostgreSQL
- ✅ Certifique-se de que o PostgreSQL está rodando
- ✅ Verifique se o banco `fitrapido_db` existe
- ✅ Confirme que o arquivo `.env` na pasta `api/` está configurado corretamente

### 2. Variáveis de Ambiente

**API (`api/.env`):**
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/fitrapido_db"
PORT=3001
JWT_SECRET="seu-secret-super-seguro"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
```

**Admin (`admin/.env.local` - opcional):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🔍 Testar a API

Após iniciar, teste os endpoints:

### Health Check
```bash
curl http://localhost:3001
```

### Cadastro de Usuário
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","nome":"Teste","senha":"senha123"}'
```

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","senha":"senha123"}'
```

## 🌐 Acessar Interfaces

- **Admin Panel**: http://localhost:3000
- **API Base**: http://localhost:3001
- **API Docs** (se configurado): http://localhost:3001/api

### ✅ Verificar se está tudo funcionando:

1. **API**: Acesse http://localhost:3001 - deve mostrar informações da API
2. **Admin**: Acesse http://localhost:3000/admin/login - deve abrir a tela de login
3. **Mobile**: Escaneie o QR code no terminal do Expo ou use o emulador

## 🛑 Parar os Servidores

Pressione `Ctrl+C` em cada terminal onde os servidores estão rodando.

Ou execute no PowerShell:
```powershell
taskkill /F /IM node.exe
```

## 🔍 Diagnóstico de Erros

Se estiver encontrando erros ao iniciar os servidores:

### 1. Executar Diagnóstico Automático
```powershell
.\scripts\diagnosticar-ambiente.ps1
```

Este script verifica:
- ✅ Versão do Node.js e npm
- ✅ Status do PostgreSQL
- ✅ Portas disponíveis (3000 e 3001)
- ✅ Arquivos de configuração (.env)
- ✅ Dependências instaladas

### 1.1. Verificar Conexão com Banco de Dados
```powershell
.\scripts\verificar-banco-dados.ps1
```

Este script verifica:
- ✅ Configuração do DATABASE_URL
- ✅ Tipo de conexão (Supabase ou PostgreSQL local)
- ✅ Resolução DNS e conectividade
- ✅ Status do PostgreSQL local (se aplicável)

### 2. Limpar e Reinstalar Tudo
Se houver problemas com dependências ou cache:
```powershell
.\scripts\limpar-e-reinstalar.ps1
```

Este script:
- 🛑 Para todos os processos Node.js
- 🧹 Remove node_modules, dist, .next e caches
- 📥 Reinstala todas as dependências

### 3. Consultar Guia Completo de Erros
Consulte o arquivo **[DIAGNOSTICO-ERROS.md](./DIAGNOSTICO-ERROS.md)** para:
- 📋 Lista completa de erros comuns
- 🔧 Soluções passo a passo
- 🐛 Troubleshooting detalhado

## ⚠️ Problemas Comuns

### Porta já em uso
```powershell
# Ver qual processo está usando a porta
netstat -ano | findstr :3001
# Matar o processo (substitua <PID> pelo número)
taskkill /PID <PID> /F
```

### PostgreSQL não está rodando
```powershell
# Verificar serviço
Get-Service -Name postgresql*

# Iniciar serviço (se necessário)
Start-Service -Name postgresql-x64-XX  # Substitua XX pela versão
```

### Arquivo .env não encontrado
Crie o arquivo `api/.env` com:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/fitrapido_db"
PORT=3001
JWT_SECRET="seu-secret-super-seguro"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
```

---

**Última atualização**: Agora
**Status**: ✅ Pronto para iniciar

