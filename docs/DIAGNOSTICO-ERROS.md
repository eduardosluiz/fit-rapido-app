# 🔍 Guia de Diagnóstico de Erros

Este guia ajuda a identificar e resolver os erros mais comuns ao iniciar os servidores.

## 📋 Checklist Inicial

Antes de iniciar, verifique:

- [ ] Node.js instalado (versão 18+)
- [ ] PostgreSQL rodando
- [ ] Arquivo `.env` configurado na pasta `api/`
- [ ] Dependências instaladas (`npm install` em cada pasta)
- [ ] Portas 3000 e 3001 livres

## 🐛 Erros Comuns e Soluções

### 1. Erro: "Cannot find module" ou "Module not found"

**Causa**: Dependências não instaladas ou node_modules corrompido.

**Solução**:
```powershell
# Na pasta do projeto que está com erro
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### 2. Erro: "Port 3001 already in use" ou "Port 3000 already in use"

**Causa**: Porta já está sendo usada por outro processo.

**Solução**:
```powershell
# Verificar qual processo está usando a porta
netstat -ano | findstr :3001
netstat -ano | findstr :3000

# Matar o processo (substitua <PID> pelo número encontrado)
taskkill /PID <PID> /F

# Ou matar todos os processos Node.js
taskkill /F /IM node.exe
```

### 3. Erro: "ECONNREFUSED" ou "Connection refused" (API)

**Causa**: PostgreSQL não está rodando ou configuração do `.env` está incorreta.

**Solução**:
1. Verificar se PostgreSQL está rodando:
```powershell
# Windows - verificar serviço
Get-Service -Name postgresql*

# Ou verificar processos
Get-Process | Where-Object {$_.ProcessName -like "*postgres*"}
```

2. Verificar arquivo `.env` em `api/.env`:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/fitrapido_db"
PORT=3001
JWT_SECRET="seu-secret-super-seguro"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
```

3. Testar conexão com PostgreSQL:
```powershell
# Se tiver psql instalado
psql -U usuario -d fitrapido_db -h localhost
```

### 3.1. Erro: "getaddrinfo ENOTFOUND db.xxxxx.supabase.co"

**Causa**: Projeto Supabase foi deletado, pausado ou URL está incorreta.

**Solução**:
1. **Verificar conexão com Supabase:**
```powershell
.\scripts\verificar-banco-dados.ps1
```

2. **Opções de solução:**
   - **Opção A**: Criar novo projeto no Supabase e atualizar URL
   - **Opção B**: Usar PostgreSQL local (recomendado para desenvolvimento)
   
3. **Para usar PostgreSQL local**, atualize `api/.env`:
```env
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/fitrapido_db"
```

4. **Consulte o guia completo:**
   - `SOLUCAO-ERRO-SUPABASE.md` - Soluções detalhadas
   - `GUIA-POSTGRESQL.md` - Configuração do PostgreSQL local

### 4. Erro: "TypeError: Cannot read property" ou erros de TypeScript

**Causa**: Problemas de compilação TypeScript ou cache corrompido.

**Solução**:
```powershell
# Para API
cd api
Remove-Item -Recurse -Force dist
npm run build

# Para Admin
cd admin
Remove-Item -Recurse -Force .next
npm run build
```

### 5. Erro: "EADDRINUSE" (Endereço já em uso)

**Causa**: Servidor já está rodando ou porta ocupada.

**Solução**: Ver solução do erro #2 acima.

### 6. Erro: "Validation failed" ou erros de validação

**Causa**: Dados inválidos sendo enviados ou configuração de validação incorreta.

**Solução**: Verificar os logs do servidor para ver qual campo está falhando na validação.

### 7. Erro: "JWT_SECRET is not defined"

**Causa**: Arquivo `.env` não existe ou variável não está definida.

**Solução**: Criar/verificar arquivo `api/.env` com todas as variáveis necessárias.

### 8. Erro: "Cannot find module '@nestjs/...'"

**Causa**: Dependências do NestJS não instaladas.

**Solução**:
```powershell
cd api
npm install
```

### 9. Erro: "Next.js compilation error" ou erros de build

**Causa**: Problemas de sintaxe, imports incorretos ou cache corrompido.

**Solução**:
```powershell
cd admin
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache
npm run dev
```

### 10. Erro: "Database connection failed"

**Causa**: Banco de dados não existe ou credenciais incorretas.

**Solução**:
1. Criar o banco de dados:
```sql
CREATE DATABASE fitrapido_db;
```

2. Verificar se o usuário tem permissões:
```sql
GRANT ALL PRIVILEGES ON DATABASE fitrapido_db TO seu_usuario;
```

## 🔧 Scripts de Diagnóstico

Execute os scripts abaixo para verificar o ambiente:

### Verificar Node.js e npm
```powershell
node --version
npm --version
```

### Verificar PostgreSQL
```powershell
# Verificar se está rodando
Get-Service -Name postgresql*

# Ou tentar conectar
psql --version
```

### Verificar portas
```powershell
netstat -ano | findstr ":3000"
netstat -ano | findstr ":3001"
```

### Verificar arquivos .env
```powershell
# Verificar se existe
Test-Path api\.env
Test-Path admin\.env.local
```

## 📝 Passo a Passo para Reiniciar Tudo

Se nada funcionar, siga estes passos:

1. **Parar todos os processos Node.js**:
```powershell
taskkill /F /IM node.exe
```

2. **Limpar caches e reinstalar dependências da API**:
```powershell
cd api
Remove-Item -Recurse -Force node_modules, dist, package-lock.json -ErrorAction SilentlyContinue
npm install
```

3. **Limpar caches e reinstalar dependências do Admin**:
```powershell
cd ..\admin
Remove-Item -Recurse -Force node_modules, .next, package-lock.json -ErrorAction SilentlyContinue
npm install
```

4. **Verificar arquivo .env da API**:
```powershell
cd ..\api
if (-not (Test-Path .env)) {
    Write-Host "⚠️ Arquivo .env não encontrado! Crie um arquivo .env com as configurações necessárias."
}
```

5. **Iniciar API primeiro**:
```powershell
npm run start:dev
```

6. **Em outro terminal, iniciar Admin**:
```powershell
cd admin
npm run dev
```

## 🆘 Ainda com Problemas?

Se os erros persistirem:

1. **Copie a mensagem de erro completa** do terminal
2. **Verifique os logs** do servidor
3. **Confirme a versão do Node.js** (deve ser 18+)
4. **Verifique se o PostgreSQL está realmente rodando**

## 📞 Informações Úteis para Debug

### Ver logs detalhados da API
```powershell
cd api
$env:NODE_ENV="development"
npm run start:dev
```

### Ver logs detalhados do Admin
```powershell
cd admin
npm run dev -- --debug
```

### Testar conexão com a API
```powershell
# Após iniciar a API, teste:
curl http://localhost:3001
# Ou no PowerShell:
Invoke-WebRequest -Uri http://localhost:3001
```

---

**Última atualização**: Agora
**Status**: ✅ Guia de diagnóstico completo


