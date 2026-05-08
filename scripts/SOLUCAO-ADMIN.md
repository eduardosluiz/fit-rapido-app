# 🔧 Solução: Criar Usuário Admin

O sistema criou o usuário, mas não conseguiu promover para admin automaticamente porque não há admins no sistema ainda.

## ✅ Opção 1: Atualizar via SQL (Mais Rápido)

Execute este SQL no **Supabase SQL Editor**:

```sql
UPDATE usuarios 
SET role = 'admin' 
WHERE email = 'admin@fitrapido.com';
```

Depois verifique:
```sql
SELECT id, email, nome, role FROM usuarios WHERE email = 'admin@fitrapido.com';
```

## ✅ Opção 2: Atualizar via Admin Panel

1. Acesse o admin panel: `http://localhost:3000`
2. Faça login com:
   - Email: `admin@fitrapido.com`
   - Senha: `Admin123!`
3. Vá em "Usuários" e edite o usuário
4. Altere o role para "admin"

## ✅ Opção 3: Usar Credenciais Existentes

Se você já tem um usuário admin no sistema, atualize o arquivo `api/.env`:

```env
ADMIN_EMAIL=seu-email-admin@exemplo.com
ADMIN_PASSWORD=sua-senha-admin
```

## 📝 Credenciais Criadas

- **Email**: `admin@fitrapido.com`
- **Senha**: `Admin123!`
- **Status**: Usuário criado, mas precisa ser promovido para admin

## 🚀 Depois de Promover para Admin

Execute o script de cadastro de receitas:

```bash
node scripts/cadastrar-receitas.js
```

---

**Recomendação**: Use a Opção 1 (SQL) para ser mais rápido! 🚀




