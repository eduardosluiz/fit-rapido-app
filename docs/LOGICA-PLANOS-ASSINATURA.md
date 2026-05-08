# Lógica de Planos de Assinatura - Fit & Rápido

## Visão Geral

O aplicativo Fit & Rápido oferece três níveis de acesso ao conteúdo:
- **Plano FREE (Trial)**: Acesso gratuito por 7 dias + receitas FREE rotativas
- **Plano Premium**: Acesso completo a todas as receitas
- **Plano Premium Fit**: Acesso completo a todas as receitas + todos os treinos

## Estrutura de Planos

### Plano FREE (Trial)
**Duração**: 7 dias após cadastro

**Funcionalidades Incluídas:**
- ✅ Acesso a todas as receitas durante o período de trial (7 dias)
- ✅ Após o trial: acesso a até 50 receitas marcadas como FREE (rotativas)
- ✅ Sistema de favoritos
- ✅ Perfil do usuário básico

**Limitações:**
- ❌ Após 7 dias: acesso apenas às receitas FREE
- ❌ Sem acesso a treinos
- ❌ Sem acesso a receitas premium após o trial

### Plano Premium
**Preço Base**: R$ 29,90/mês

**Funcionalidades Incluídas:**
- ✅ Acesso completo a todas as receitas (incluindo novas mensais)
- ✅ Receitas premium
- ✅ Sistema de favoritos ilimitado
- ✅ Perfil do usuário completo
- ✅ Notificações de novas receitas

**Limitações:**
- ❌ Sem acesso a treinos

### Plano Premium Fit
**Preço Base**: R$ 49,90/mês

**Funcionalidades Incluídas:**
- ✅ Acesso completo a todas as receitas (incluindo novas mensais)
- ✅ Acesso completo a todos os treinos
- ✅ Receitas premium
- ✅ Treinos premium
- ✅ Sistema de favoritos ilimitado
- ✅ Perfil do usuário completo
- ✅ Notificações de novas receitas e treinos
- ✅ Conteúdo exclusivo e atualizações antecipadas

## Períodos de Assinatura e Descontos

### Estrutura de Descontos

Os descontos são configuráveis no banco de dados através da tabela `subscription_discounts`:

- **Mensal**: Preço cheio (sem desconto)
- **Trimestral (3 meses)**: 10% de desconto
- **Semestral (6 meses)**: 15% de desconto
- **Anual (12 meses)**: 20% de desconto

### Exemplos de Preços

**Premium:**
- Mensal: R$ 29,90
- Trimestral: R$ 80,73 (R$ 26,91/mês) - 10% desconto
- Semestral: R$ 152,42 (R$ 25,40/mês) - 15% desconto
- Anual: R$ 287,04 (R$ 23,92/mês) - 20% desconto

**Premium Fit:**
- Mensal: R$ 49,90
- Trimestral: R$ 134,73 (R$ 44,91/mês) - 10% desconto
- Semestral: R$ 254,42 (R$ 42,40/mês) - 15% desconto
- Anual: R$ 479,04 (R$ 39,92/mês) - 20% desconto

**Nota**: Os descontos podem ser alterados diretamente no banco de dados sem necessidade de deploy.

## Implementação Técnica

### Controle de Acesso no Backend

#### Verificação de Trial
```typescript
// Helper: api/src/common/helpers/subscription.helper.ts
hasActiveTrial(user: User): boolean
```

#### Verificação de Acesso a Receitas
```typescript
canAccessRecipe(user: User, receita: Receita): boolean
```

#### Verificação de Acesso a Treinos
```typescript
canAccessTreino(user: User): boolean
```

### Filtragem de Conteúdo

#### Receitas
- **FREE (dentro trial)**: Todas as receitas
- **FREE (após trial)**: Apenas receitas com `is_free = true` (máximo 50)
- **PREMIUM**: Todas as receitas
- **PREMIUM_FIT**: Todas as receitas

#### Treinos
- **FREE, PREMIUM**: Sem acesso (retorna array vazio)
- **PREMIUM_FIT**: Todos os treinos

### Receitas FREE Rotativas

1. **Máximo de 50 receitas** podem ter `is_free = true` simultaneamente
2. Admin pode alterar quais receitas são FREE a qualquer momento via toggle
3. Validação no backend impede mais de 50 receitas FREE
4. Usuários FREE veem apenas receitas com `is_free = true`

### Estrutura de Dados

#### Entidade User
```typescript
enum SubscriptionTier {
  NONE = 'none',        // Deprecated
  BASIC = 'basic',      // Deprecated
  FREE = 'free',        // Plano gratuito (trial ou após trial)
  PREMIUM = 'premium',  // Premium receitas apenas
  PREMIUM_FIT = 'premium_fit', // Premium receitas + treinos
}

interface User {
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: Date;
  trial_expires_at?: Date; // 7 dias após cadastro
}
```

#### Entidade Receita
```typescript
interface Receita {
  is_premium: boolean;
  is_free: boolean; // Receita disponível no plano FREE (máximo 50)
}
```

#### Entidade Subscription
```typescript
enum SubscriptionPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMESTRAL = 'semestral',
  ANNUAL = 'annual',
}

interface Subscription {
  plano: SubscriptionTier;
  periodo: SubscriptionPeriod;
  data_inicio: Date;
  data_fim: Date;
  status: 'ativa' | 'expirada' | 'cancelada';
}
```

#### Entidade SubscriptionDiscount
```typescript
interface SubscriptionDiscount {
  periodo: SubscriptionPeriod; // quarterly, semestral, annual
  desconto_percentual: number; // 10.00, 15.00, 20.00
  ativo: boolean;
}
```

## Regras de Negócio

### Trial de 7 Dias

1. Ao registrar, definir `trial_expires_at = created_at + 7 dias`
2. Durante trial: acesso a todas as receitas
3. Após trial: acesso apenas a receitas FREE (máximo 50)
4. Trial não se renova automaticamente
5. `subscription_tier` inicia como `FREE`

### Receitas FREE Rotativas

1. Máximo de 50 receitas podem ter `is_free = true` simultaneamente
2. Admin pode alterar quais receitas são FREE a qualquer momento
3. Validação no backend (`ReceitasService.create()` e `update()`) impede mais de 50 receitas FREE
4. Usuários FREE veem apenas receitas com `is_free = true`

### Períodos de Assinatura

1. **Mensal**: Renovação mensal automática
2. **Trimestral**: Renovação a cada 3 meses
3. **Semestral**: Renovação a cada 6 meses
4. **Anual**: Renovação a cada 12 meses
5. Descontos aplicados no momento da compra
6. Descontos configuráveis no banco de dados (tabela `subscription_discounts`)

### Controle de Acesso

1. **FREE (dentro trial)**: Todas receitas
2. **FREE (após trial)**: Apenas receitas FREE
3. **PREMIUM**: Todas receitas, sem treinos
4. **PREMIUM_FIT**: Todas receitas + todos treinos

## Endpoints da API

### Verificar Status de Assinatura
```
GET /subscriptions/status
```
Retorna o status atual da assinatura do usuário autenticado.

### Listar Planos Disponíveis
```
GET /subscriptions/plans
```
Retorna lista de planos com preços calculados por período, incluindo descontos do banco de dados.

**Resposta:**
```json
{
  "plans": [
    {
      "tier": "premium",
      "nome": "Premium",
      "descricao": "Acesso completo a todas as receitas",
      "beneficios": ["Todas as receitas", "Novas receitas mensais", "Sem anúncios"],
      "periodos": [
        {
          "periodo": "monthly",
          "periodoDisplay": "Mensal",
          "precoTotal": 29.90,
          "precoMensal": 29.90,
          "descontoPercentual": 0,
          "meses": 1
        },
        {
          "periodo": "quarterly",
          "periodoDisplay": "Trimestral",
          "precoTotal": 80.73,
          "precoMensal": 26.91,
          "descontoPercentual": 10,
          "meses": 3
        }
        // ... outros períodos
      ]
    }
    // ... Premium Fit
  ]
}
```

### Validar Receipt (iOS/Android)
```
POST /subscriptions/validate-ios
POST /subscriptions/validate-android
```

### Restaurar Compras
```
POST /subscriptions/restore
```

## Gerenciamento de Descontos

### Alterar Descontos no Banco de Dados

Os descontos podem ser alterados diretamente no banco de dados:

```sql
-- Alterar desconto trimestral para 12%
UPDATE subscription_discounts 
SET desconto_percentual = 12.00 
WHERE periodo = 'quarterly';

-- Desativar desconto semestral temporariamente
UPDATE subscription_discounts 
SET ativo = FALSE 
WHERE periodo = 'semestral';
```

### Endpoints de Gerenciamento (Futuro)

Para facilitar o gerenciamento via admin, podem ser criados endpoints:
- `GET /subscriptions/discounts` - Listar todos os descontos
- `PUT /subscriptions/discounts/:periodo` - Atualizar desconto de um período

## Fluxo de Assinatura

### 1. Registro e Trial
- Usuário se registra no app
- `trial_expires_at` é definido para `created_at + 7 dias`
- `subscription_tier` é definido como `FREE`
- Durante 7 dias: acesso a todas as receitas

### 2. Após Trial
- Usuário mantém `subscription_tier = FREE`
- Acesso limitado a receitas com `is_free = true`
- App mostra opções de upgrade

### 3. Seleção de Plano
- Usuário navega para tela de assinaturas
- Visualiza planos disponíveis com preços por período
- Seleciona plano (Premium ou Premium Fit) e período

### 4. Processamento de Pagamento
- iOS: Integração com StoreKit
- Android: Integração com Google Play Billing
- Validação do receipt/token no backend

### 5. Ativação
- Backend valida o pagamento
- Atualiza `subscription_tier` do usuário
- Cria registro na tabela `subscriptions` com período
- Calcula `data_fim` baseado no período escolhido
- Envia confirmação ao usuário

### 6. Acesso ao Conteúdo
- Frontend verifica plano do usuário
- Filtra conteúdo baseado no plano
- Libera acesso a funcionalidades premium

## Validações Necessárias

### Backend
- Máximo 50 receitas FREE simultaneamente
- Trial expira após 7 dias exatos
- Períodos válidos apenas para planos pagos
- Validação de acesso antes de retornar conteúdo
- Descontos devem estar entre 0 e 100%

### Frontend
- Mostrar contador de dias restantes do trial
- Bloquear acesso a conteúdo não disponível
- Mostrar modal de upgrade quando necessário
- Exibir descontos de forma clara
- Destacar economia percentual e valor economizado

## Migrações

Execute o arquivo `api/migrations/001_subscription_system.sql` no banco de dados para:
1. Adicionar coluna `is_free` na tabela `receitas`
2. Adicionar coluna `trial_expires_at` na tabela `usuarios`
3. Adicionar coluna `periodo` na tabela `subscriptions`
4. Criar tabela `subscription_discounts`
5. Inserir dados iniciais de descontos (10%, 15%, 20%)
6. Criar índices para performance

## Notas Importantes

1. **Conteúdo Gratuito**: Sempre deve haver conteúdo disponível para usuários sem assinatura (receitas FREE)
2. **Transição Suave**: Usuários devem poder visualizar preview de conteúdo premium antes de assinar
3. **Validação Periódica**: Backend deve validar assinaturas periodicamente para detectar cancelamentos
4. **Fallback**: Se a validação falhar, manter acesso até próxima validação bem-sucedida
5. **Logs**: Registrar todas as tentativas de acesso a conteúdo premium para análise
6. **Descontos Flexíveis**: Descontos podem ser alterados no banco sem necessidade de deploy

## Próximos Passos

- [ ] Implementar validação de receipts iOS/Android reais
- [ ] Criar tela de upgrade no mobile
- [ ] Adicionar toggle `is_free` no admin com validação de limite
- [ ] Criar tela de gerenciamento de descontos no admin
- [ ] Adicionar analytics de conversão
- [ ] Criar dashboard de assinaturas no admin
- [ ] Implementar notificações de expiração de trial
