# 🔐 Criar Usuário SUPER ADMIN

## Opção 1: Usando Script Node.js (Recomendado)

### Passo 1: Instalar dependências (se necessário)
```bash
cd api
npm install bcrypt pg
```

### Passo 2: Executar o script
```bash
node scripts/create-super-admin.js
```

O script irá:
- Conectar ao banco de dados usando `DATABASE_URL` do `.env`
- Gerar hash bcrypt da senha "Dai123"
- Criar ou atualizar o usuário com:
  - Email: `dai@gmail.com`
  - Nome: `Dai`
  - Senha: `Dai123`
  - Role: `admin`
  - Subscription: `premium_fit`

## Opção 2: Via SQL (Manual)

Se preferir criar manualmente via SQL no Supabase:

### Passo 1: Gerar hash bcrypt
Use um gerador online como: https://bcrypt-generator.com/
- Senha: `Dai123`
- Rounds: `10`
- Copie o hash gerado

### Passo 2: Executar SQL no Supabase

```sql
-- Substitua $2b$10$SEU_HASH_AQUI pelo hash gerado acima
INSERT INTO usuarios (
    id,
    email,
    nome,
    senha_hash,
    role,
    subscription_tier,
    ativo,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'dai@gmail.com',
    'Dai',
    '$2b$10$SEU_HASH_AQUI', -- Cole o hash gerado aqui
    'admin'::usuarios_role_enum,
    'premium_fit'::usuarios_subscription_tier_enum,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE
SET 
    nome = 'Dai',
    senha_hash = '$2b$10$SEU_HASH_AQUI', -- Cole o hash gerado aqui
    role = 'admin'::usuarios_role_enum,
    subscription_tier = 'premium_fit'::usuarios_subscription_tier_enum,
    ativo = TRUE,
    updated_at = CURRENT_TIMESTAMP;
```

## Opção 3: Via API (Temporário)

Se o script Node.js não funcionar, você pode criar um endpoint temporário no AuthController:

```typescript
@Post('create-admin')
async createAdmin() {
  return this.authService.createAdmin({
    email: 'dai@gmail.com',
    nome: 'Dai',
    senha: 'Dai123',
  });
}
```

Mas isso requer modificar o código, então prefira as opções 1 ou 2.

## Verificação

Após criar o usuário, teste o login:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dai@gmail.com","senha":"Dai123"}'
```

Ou faça login no painel admin com essas credenciais.

