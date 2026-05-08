# 🔐 Criar Usuário Admin

## Problema

Você está recebendo erro "Credenciais inválidas" ao tentar fazer login com:
- **Email**: `dai@gmail.com`
- **Senha**: `Senha123`

Isso acontece porque o usuário não existe no banco de dados ou a senha está incorreta.

## ✅ Solução

Execute o script de seed para criar/atualizar o usuário admin:

### Passo 1: Certifique-se de que a API está rodando

```powershell
cd api
npm run start:dev
```

Aguarde até ver: `[Nest] Application successfully started`

### Passo 2: Execute o script de criação do admin

Em um **novo terminal**, execute:

```powershell
cd api
npm run seed:admin
```

### O que o script faz?

1. ✅ Conecta ao banco de dados PostgreSQL
2. ✅ Verifica se o usuário `dai@gmail.com` existe
3. ✅ Se não existir, cria o usuário como admin
4. ✅ Se existir, verifica/atualiza a senha e garante que é admin
5. ✅ Define a senha como `Senha123` (com hash bcrypt)

### Resultado Esperado

Você verá uma das seguintes mensagens:

**Se o usuário não existia:**
```
✅ Conectado ao banco de dados
📝 Criando usuário admin: dai@gmail.com
✅ Usuário admin criado com sucesso!
📧 Email: dai@gmail.com
🔑 Senha: Senha123
👤 Nome: Daiane Admin
🔐 Role: admin
```

**Se o usuário já existia:**
```
✅ Conectado ao banco de dados
⚠️  Usuário com email dai@gmail.com já existe!
✅ Senha está correta!
✅ Usuário já é admin!
```

**Se a senha estava incorreta:**
```
✅ Conectado ao banco de dados
⚠️  Usuário com email dai@gmail.com já existe!
❌ Senha está incorreta!
💡 Atualizando senha...
✅ Senha atualizada e usuário promovido a admin!
```

### Passo 3: Testar o Login

Após executar o script:

1. Acesse: http://localhost:3000/admin/login
2. Use as credenciais:
   - **Email**: `dai@gmail.com`
   - **Senha**: `Senha123`
3. Clique em "Entrar"

## 🔧 Troubleshooting

### Erro: "Cannot find module 'ts-node'"

Instale o ts-node:
```powershell
cd api
npm install --save-dev ts-node
```

### Erro: "DATABASE_URL is not defined"

Certifique-se de que o arquivo `api/.env` existe e contém:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/fitrapido_db"
```

### Erro de conexão com o banco

1. Verifique se o PostgreSQL está rodando
2. Verifique se o banco `fitrapido_db` existe
3. Verifique se as credenciais no `.env` estão corretas

## 📝 Notas

- O script é **idempotente**: pode ser executado múltiplas vezes sem problemas
- A senha é sempre atualizada para `Senha123` se o usuário existir
- O usuário sempre será promovido a `admin` se não for
- O script não remove usuários existentes, apenas atualiza

## 🎯 Próximos Passos

Após criar o admin, você pode:
1. Fazer login no painel admin
2. Criar outros usuários através da interface
3. Gerenciar receitas, treinos e categorias
