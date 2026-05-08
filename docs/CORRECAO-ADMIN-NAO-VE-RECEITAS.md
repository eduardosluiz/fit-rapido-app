# 🔧 Correção: Admin não vê receitas e treinos

## Problema Identificado

O SUPER ADMIN conseguia fazer login, mas não via receitas e treinos porque:
1. Os endpoints `GET /receitas` e `GET /treinos` **não tinham guard de autenticação**
2. Sem o guard, o `req.user` não era populado pelo Passport
3. O código verificava `req.user?.sub`, mas sempre retornava `null`
4. Sem usuário, o backend aplicava filtros restritivos (apenas receitas FREE)

## Solução Aplicada

### 1. Criado Guard Opcional (`JwtOptionalGuard`)
- Valida o token JWT **se presente**
- **Não bloqueia** a requisição se não houver token
- Permite que endpoints funcionem tanto autenticados quanto não autenticados

### 2. Aplicado Guard nos Endpoints
- `GET /receitas` - Agora usa `@UseGuards(JwtOptionalGuard)`
- `GET /treinos` - Agora usa `@UseGuards(JwtOptionalGuard)`

### 3. Lógica de Filtragem
- **Com token válido**: Backend identifica o usuário e aplica filtros corretos
- **Admin**: Vê todas as receitas e treinos (já implementado anteriormente)
- **Sem token**: Vê apenas receitas FREE (comportamento público)

## Arquivos Modificados

1. ✅ `api/src/auth/guards/jwt-optional.guard.ts` - **NOVO** - Guard opcional
2. ✅ `api/src/receitas/receitas.controller.ts` - Adicionado guard opcional
3. ✅ `api/src/treinos/treinos.controller.ts` - Adicionado guard opcional
4. ✅ `api/src/auth/strategies/jwt.strategy.ts` - Pequeno ajuste

## Como Funciona Agora

### Fluxo de Autenticação:

1. **Admin faz login** → Recebe token JWT
2. **Admin acessa `/receitas`** → Envia token no header `Authorization: Bearer <token>`
3. **Guard opcional valida token** → Popula `req.user` com dados do admin
4. **Controller busca usuário completo** → `authService.findById(req.user.sub)`
5. **Service verifica role** → Se `user.role === UserRole.ADMIN`, retorna todas as receitas
6. **Admin vê tudo** ✅

## Teste

Após reiniciar o servidor API:

1. **Faça login no admin** com `dai@gmail.com` / `Dai123`
2. **Acesse a página de Receitas** → Deve mostrar todas as receitas
3. **Acesse a página de Treinos** → Deve mostrar todos os treinos

## Próximos Passos

1. **Reinicie o servidor API**:
   ```bash
   cd api
   npm run start:dev
   ```

2. **Teste no admin**:
   - Faça logout e login novamente
   - Verifique se receitas e treinos aparecem

3. **Se ainda não aparecer**:
   - Verifique o console do navegador (F12)
   - Verifique os logs do servidor API
   - Confirme que o token está sendo enviado nas requisições

---

**Status**: ✅ Correção aplicada - Reinicie o servidor API para testar

