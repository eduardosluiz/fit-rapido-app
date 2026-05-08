# 🔧 Correções: Admin não mostra receitas/treinos + Criar SUPER ADMIN

## Problema 1: Admin não mostra receitas/treinos ✅ CORRIGIDO

### Causa
O backend estava aplicando filtros de plano de assinatura **mesmo para admins**, fazendo com que admins só vissem conteúdo baseado no seu `subscription_tier`.

### Correção Aplicada

**ReceitasService** (`api/src/receitas/receitas.service.ts`):
- Adicionada verificação: se `user.role === UserRole.ADMIN`, retorna todas as receitas sem filtro

**TreinosService** (`api/src/treinos/treinos.service.ts`):
- Adicionada verificação: se `user.role === UserRole.ADMIN`, retorna todos os treinos sem filtro

### Resultado
Agora admins veem **TODAS** as receitas e treinos, independente do plano de assinatura.

---

## Problema 2: Criar Usuário SUPER ADMIN

### Credenciais Solicitadas
- **Nome**: Dai
- **Email**: dai@gmail.com
- **Senha**: Dai123
- **Role**: admin
- **Subscription**: premium_fit

### Solução: Script Node.js (Recomendado)

#### Passo 1: Instalar dependências
```bash
cd api
npm install bcrypt pg
```

#### Passo 2: Executar script
```bash
node scripts/create-super-admin.js
```

O script irá:
- ✅ Conectar ao banco usando `DATABASE_URL` do `.env`
- ✅ Gerar hash bcrypt da senha automaticamente
- ✅ Criar ou atualizar o usuário com todas as permissões

### Alternativa: Via SQL Manual

Se o script não funcionar, siga as instruções em:
`api/migrations/create_super_admin_INSTRUCOES.md`

---

## Arquivos Modificados

1. ✅ `api/src/receitas/receitas.service.ts` - Adicionada verificação de admin
2. ✅ `api/src/treinos/treinos.service.ts` - Adicionada verificação de admin
3. ✅ `api/scripts/create-super-admin.js` - Script para criar admin
4. ✅ `api/migrations/create_super_admin_INSTRUCOES.md` - Instruções alternativas

---

## Teste

Após executar o script:

1. **Login no Admin**:
   - Email: `dai@gmail.com`
   - Senha: `Dai123`

2. **Verificar**:
   - ✅ Deve ver todas as receitas (ativas e inativas)
   - ✅ Deve ver todos os treinos (ativos e inativos)
   - ✅ Deve poder editar qualquer usuário
   - ✅ Deve ter acesso completo ao sistema

---

## Próximos Passos

1. Execute o script para criar o SUPER ADMIN
2. Faça login no painel admin
3. Verifique se receitas e treinos aparecem
4. Marque algumas receitas como `is_free: true` para usuários FREE verem conteúdo

