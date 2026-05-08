# 🔧 Correção: Conteúdo não aparece no Feed, Receitas e Treinos

## Problema Identificado

O conteúdo não aparecia porque o **frontend estava passando parâmetros de filtro incorretos** que conflitavam com a lógica de filtragem do backend baseada no plano de assinatura do usuário.

## Correções Aplicadas

### 1. FeedScreen ✅
- **Antes**: Passava `premium: false` para usuários não-premium
- **Depois**: Remove o parâmetro `premium`, deixando o backend filtrar automaticamente

### 2. ReceitasScreen ✅
- **Antes**: Passava `premium: false` para usuários não-premium
- **Depois**: Remove o parâmetro `premium`, deixando o backend filtrar automaticamente

### 3. TreinosScreen ✅
- **Antes**: Passava `premium: false` para usuários não-premium
- **Depois**: Remove o parâmetro `premium`, deixando o backend filtrar automaticamente

## Como Funciona Agora

O backend já tem toda a lógica de filtragem baseada no `subscription_tier` do usuário:

### Para Receitas:
- **Trial (7 dias)**: Vê todas as receitas
- **FREE (após trial)**: Vê apenas receitas marcadas como `is_free: true` (máximo 50)
- **PREMIUM**: Vê todas as receitas
- **PREMIUM_FIT**: Vê todas as receitas

### Para Treinos:
- **PREMIUM_FIT**: Vê todos os treinos
- **Outros planos**: Não vê treinos (backend retorna array vazio)

## ⚠️ IMPORTANTE: Verificar Receitas FREE no Banco

Para que usuários FREE vejam conteúdo, é necessário:

1. **Marcar receitas como FREE no Admin**:
   - Acesse o painel admin
   - Edite receitas e marque o toggle "FREE"
   - Máximo de 50 receitas podem ser marcadas como FREE simultaneamente

2. **Verificar se há receitas FREE cadastradas**:
   ```sql
   SELECT COUNT(*) FROM receitas WHERE is_free = TRUE AND ativa = TRUE;
   ```
   Deve retornar pelo menos 1 receita para usuários FREE verem conteúdo.

3. **Se não houver receitas FREE**:
   - Usuários FREE não verão nenhuma receita
   - Isso é esperado e correto conforme a lógica de negócio

## Teste

Após as correções:

1. **Usuário FREE**:
   - Deve ver apenas receitas marcadas como `is_free: true`
   - Não deve ver treinos

2. **Usuário PREMIUM**:
   - Deve ver todas as receitas
   - Não deve ver treinos

3. **Usuário PREMIUM_FIT**:
   - Deve ver todas as receitas
   - Deve ver todos os treinos

4. **Usuário em Trial (7 dias)**:
   - Deve ver todas as receitas
   - Deve ver todos os treinos

## Arquivos Modificados

- `mobile/src/screens/feed/FeedScreen.tsx`
- `mobile/src/screens/receitas/ReceitasScreen.tsx`
- `mobile/src/screens/treinos/TreinosScreen.tsx`

