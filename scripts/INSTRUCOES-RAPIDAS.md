# ⚡ Instruções Rápidas - Cadastrar Receitas

## 🎯 Passo a Passo Completo

### 1️⃣ Criar Usuário Admin (se ainda não criou)

```bash
node scripts/criar-admin.js
```

**Credenciais criadas:**
- Email: `admin@fitrapido.com`
- Senha: `Admin123!`

### 2️⃣ Promover para Admin

**Opção A - Via SQL (Recomendado):**
Execute no Supabase SQL Editor:
```sql
UPDATE usuarios SET role = 'admin' WHERE email = 'admin@fitrapido.com';
```

**Opção B - Via Admin Panel:**
1. Acesse `http://localhost:3000`
2. Faça login com as credenciais acima
3. Vá em "Usuários" → Edite → Role: "admin"

### 3️⃣ Configurar Credenciais no .env

Edite `api/.env` e adicione/atualize:
```env
ADMIN_EMAIL=admin@fitrapido.com
ADMIN_PASSWORD=Admin123!
API_URL=http://localhost:3001
```

### 4️⃣ Cadastrar Receitas

```bash
node scripts/cadastrar-receitas.js
```

---

## ✅ Checklist

- [ ] API rodando (`npm run start:dev` na pasta `api`)
- [ ] Usuário admin criado
- [ ] Usuário promovido para admin (via SQL ou admin panel)
- [ ] Credenciais configuradas em `api/.env`
- [ ] Receitas adicionadas em `scripts/receitas.json`
- [ ] Script executado com sucesso

---

## 🆘 Problemas Comuns

### Erro: "Credenciais inválidas"
- Verifique se a senha no `.env` está correta: `Admin123!`
- Certifique-se de que o usuário foi criado

### Erro: "ECONNREFUSED"
- Certifique-se de que a API está rodando
- Verifique se a porta está correta (3001)

### Erro: "Acesso negado"
- Certifique-se de que o usuário foi promovido para admin
- Execute o SQL para atualizar o role

---

**Pronto para cadastrar!** 🎉




