# 📜 Scripts de Automação - Fit & Rápido

Scripts úteis para gerenciar o sistema.

## 🚀 Scripts Disponíveis

### 1. `criar-admin.js` - Criar Usuário Admin

Cria um usuário administrador no sistema.

**Uso:**
```bash
node scripts/criar-admin.js
```

**Configuração:**
Edite `api/.env` ou defina variáveis de ambiente:
```env
ADMIN_EMAIL=seu-email@admin.com
ADMIN_PASSWORD=sua-senha-segura
ADMIN_NAME=Seu Nome
```

---

### 2. `cadastrar-receitas.js` - Cadastrar Receitas em Lote

Cadastra receitas automaticamente via API.

**Uso:**
```bash
node scripts/cadastrar-receitas.js
```

**Pré-requisitos:**
1. ✅ API rodando (`npm run start:dev` na pasta `api`)
2. ✅ Usuário admin criado (use `criar-admin.js`)
3. ✅ Credenciais configuradas em `api/.env`

**Formato das receitas:**
Edite `scripts/receitas.json` com suas receitas.

---

## 📋 Ordem Recomendada

1. **Primeiro:** Criar usuário admin
   ```bash
   node scripts/criar-admin.js
   ```

2. **Depois:** Cadastrar receitas
   ```bash
   node scripts/cadastrar-receitas.js
   ```

---

## ⚙️ Configuração

### Arquivo `api/.env`

```env
# Configurações da API
DATABASE_URL="postgresql://..."
PORT=3001
JWT_SECRET="..."

# Credenciais do Admin (para scripts)
ADMIN_EMAIL=admin@fitrapido.com
ADMIN_PASSWORD=senha-segura-aqui
ADMIN_NAME=Administrador
API_URL=http://localhost:3001
```

---

## 🆘 Solução de Problemas

### Erro: "Cannot find module 'axios'"
```bash
npm install axios dotenv
```

### Erro: "ECONNREFUSED"
- Certifique-se de que a API está rodando
- Verifique se a URL está correta (`http://localhost:3001`)

### Erro: "Credenciais inválidas"
- Execute primeiro `criar-admin.js` para criar o usuário
- Verifique se as credenciais em `api/.env` estão corretas

---

**Última atualização:** Agora




