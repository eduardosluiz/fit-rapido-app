# 📊 Análise da Estrutura do Banco de Dados

## ✅ ESTRUTURA ATUAL (Verificada)

### 1. **Tabela `usuarios`** ✅
```typescript
- id (uuid, PK)
- email (unique)
- senha_hash
- nome
- role (enum: user/admin/personal_trainer)
- subscription_tier (enum: none/basic/premium) ✅
- avatar_url
- email_verificado
- google_id
- apple_id
- ativo
- created_at
- updated_at
```

**Status**: ✅ **CORRETO**
- Campo `subscription_tier` existe e está bem definido
- Suporta roles diferentes
- Suporta login social (Google/Apple)

**Observações**:
- ✅ Campo de assinatura já existe
- ⚠️ Falta campo `subscription_expires_at` (data de expiração)
- ⚠️ Falta campo `subscription_receipt` (armazenar receipt)

---

### 2. **Tabela `receitas`** ✅
```typescript
- id (uuid, PK)
- titulo
- descricao
- ingredientes (array)
- modo_preparo (array)
- imagem_url
- video_url
- ebook_url
- categoria_id (FK)
- categoria (ManyToOne)
- dificuldade (enum: facil/medio/dificil)
- tempo_preparo (int, minutos)
- porcoes (int)
- is_premium (boolean) ✅
- tags (array)
- avaliacao (decimal)
- total_avaliacoes (int)
- ativa (boolean)
- created_at
- updated_at
```

**Status**: ✅ **CORRETO**
- Relacionamento com categoria está correto
- Campo `is_premium` existe
- Campos de avaliação existem

**Observações**:
- ✅ Estrutura completa para receitas
- ⚠️ Falta campos de macros (calorias, proteínas, carboidratos, gorduras) para calculadora

---

### 3. **Tabela `categorias_receitas`** ✅
```typescript
- id (uuid, PK)
- nome (unique)
- slug (unique)
- descricao
- imagem_url
- ativa
- receitas (OneToMany)
- created_at
- updated_at
```

**Status**: ✅ **CORRETO**
- Relacionamento OneToMany com receitas está correto

---

### 4. **Tabela `treinos`** ✅
```typescript
- id (uuid, PK)
- titulo
- descricao
- exercicios (simple-array)
- series_repeticoes (json)
- observacoes
- imagem_url
- video_url
- categoria_id (FK)
- categoria (ManyToOne)
- nivel (enum: iniciante/intermediario/avancado)
- duracao_minutos (int)
- dias_por_semana (int)
- grupos_musculares (simple-array)
- is_premium (boolean) ✅
- equipamentos (simple-array)
- tags (simple-array)
- avaliacao (float)
- total_avaliacoes (int)
- ativa (boolean)
- created_at
- updated_at
```

**Status**: ✅ **CORRETO**
- Relacionamento com categoria está correto
- Campo `is_premium` existe
- Campos de avaliação existem

---

### 5. **Tabela `categorias_treinos`** ✅
```typescript
- id (uuid, PK)
- nome
- slug (unique)
- descricao
- imagem_url
- ativa
- created_at
- updated_at
```

**Status**: ✅ **CORRETO**
- Estrutura básica correta

**Observações**:
- ⚠️ Falta relacionamento OneToMany com treinos (mas não é crítico, pode usar categoria_id)

---

### 6. **Tabela `favoritos`** ✅
```typescript
- id (uuid, PK)
- usuario_id (FK)
- usuario (ManyToOne, CASCADE delete)
- item_id
- tipo (enum: receita/treino)
- created_at
- Unique(usuario_id, item_id, tipo)
```

**Status**: ✅ **CORRETO**
- Relacionamento com usuário está correto
- Constraint única previne duplicatas
- CASCADE delete está configurado

---

## ❌ TABELAS FALTANTES (Para Fase 1)

### 1. **Tabela `subscriptions` (Histórico de Assinaturas)** ❌

**Necessária para**:
- Armazenar histórico de assinaturas
- Validar receipts
- Controlar expiração
- Webhooks de renovação

**Estrutura Recomendada**:
```typescript
@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({
    type: 'enum',
    enum: SubscriptionTier,
  })
  plano: SubscriptionTier; // basic/premium

  @Column({ type: 'timestamp' })
  data_inicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  data_fim: Date; // null = assinatura ativa

  @Column({
    type: 'enum',
    enum: ['ativa', 'expirada', 'cancelada'],
    default: 'ativa',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  receipt_ios: string; // Receipt da Apple

  @Column({ type: 'text', nullable: true })
  receipt_android: string; // Purchase token do Google

  @Column({ nullable: true })
  transaction_id: string; // ID da transação

  @Column({ nullable: true })
  original_transaction_id: string; // Para renovações

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

**Campos Adicionais em `usuarios`**:
```typescript
// Adicionar ao User entity:
@Column({ type: 'timestamp', nullable: true })
subscription_expires_at: Date; // Data de expiração da assinatura atual

@Column({ type: 'text', nullable: true })
subscription_receipt: string; // Último receipt válido
```

---

### 2. **Tabela `notification_tokens`** ❌

**Necessária para**:
- Armazenar tokens FCM
- Enviar notificações push
- Gerenciar múltiplos dispositivos

**Estrutura Recomendada**:
```typescript
@Entity('notification_tokens')
export class NotificationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ type: 'text' })
  token: string; // FCM token

  @Column({
    type: 'enum',
    enum: ['ios', 'android'],
  })
  plataforma: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Index(['usuario_id', 'token'])
  // Índice para busca rápida
}
```

---

### 3. **Tabela `consentimentos`** ❌

**Necessária para**:
- LGPD compliance
- Registrar aceite de termos
- Histórico de consentimentos

**Estrutura Recomendada**:
```typescript
@Entity('consentimentos')
export class Consentimento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({
    type: 'enum',
    enum: ['terms', 'privacy', 'marketing', 'analytics'],
  })
  tipo: string;

  @Column({ default: true })
  aceito: boolean;

  @Column({ type: 'text', nullable: true })
  versao: string; // Versão dos termos aceitos

  @Column({ type: 'timestamp' })
  data_aceite: Date;

  @CreateDateColumn()
  created_at: Date;
}
```

---

### 4. **Tabela `avaliacoes`** ⚠️ (Opcional para Fase 1)

**Necessária para**:
- Sistema de avaliações e comentários
- Histórico de avaliações

**Estrutura Recomendada**:
```typescript
@Entity('avaliacoes')
export class Avaliacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'item_id' })
  item_id: string; // ID da receita ou treino

  @Column({
    type: 'enum',
    enum: ['receita', 'treino'],
  })
  tipo: string;

  @Column({ type: 'int' })
  nota: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Unique(['usuario_id', 'item_id', 'tipo'])
  // Um usuário pode avaliar cada item apenas uma vez
}
```

**Nota**: Os campos `avaliacao` e `total_avaliacoes` nas tabelas `receitas` e `treinos` podem ser calculados a partir desta tabela, mas manter campos denormalizados é mais eficiente.

---

## 📋 RESUMO DA ANÁLISE

### ✅ O QUE ESTÁ CORRETO

1. **Estrutura Base**: Todas as tabelas principais estão bem estruturadas
2. **Relacionamentos**: Foreign keys e relacionamentos TypeORM estão corretos
3. **Campos Essenciais**: Campos básicos para funcionalidades existentes estão presentes
4. **Constraints**: Unique constraints e enums estão bem definidos

### ⚠️ MELHORIAS RECOMENDADAS

1. **Tabela `usuarios`**:
   - ✅ `subscription_tier` existe
   - ❌ Adicionar `subscription_expires_at`
   - ❌ Adicionar `subscription_receipt`

2. **Tabela `receitas`**:
   - ✅ Estrutura completa
   - ❌ Adicionar campos de macros (opcional para Fase 1)

3. **Tabela `categorias_treinos`**:
   - ⚠️ Adicionar relacionamento OneToMany (opcional)

### ❌ TABELAS FALTANTES (Críticas para Fase 1)

1. **`subscriptions`** - Histórico de assinaturas
2. **`notification_tokens`** - Tokens FCM
3. **`consentimentos`** - LGPD compliance

### 📝 TABELAS OPCIONAIS (Fase 2+)

1. **`avaliacoes`** - Sistema de avaliações
2. **`historico_visualizacoes`** - Analytics
3. **`macros`** - Calculadora de macros (pode ser campo em receitas)

---

## 🔧 AÇÕES RECOMENDADAS

### Prioridade Alta (Fase 1)
1. ✅ Criar entidade `Subscription`
2. ✅ Criar entidade `NotificationToken`
3. ✅ Criar entidade `Consentimento`
4. ✅ Adicionar campos em `User` (`subscription_expires_at`, `subscription_receipt`)

### Prioridade Média (Fase 2)
1. ⚠️ Adicionar campos de macros em `Receita`
2. ⚠️ Criar entidade `Avaliacao`
3. ⚠️ Adicionar relacionamento OneToMany em `CategoriaTreino`

### Prioridade Baixa (Fase 3)
1. ⚠️ Criar tabela de histórico de visualizações
2. ⚠️ Criar tabela de analytics
3. ⚠️ Otimizações de índices

---

## ✅ CONCLUSÃO

**Status Geral**: ✅ **ESTRUTURA CORRETA E BEM PROJETADA**

A estrutura atual do banco de dados está **correta e bem organizada**. As tabelas principais estão completas e os relacionamentos estão corretos.

**Para a Fase 1**, precisamos adicionar apenas **3 tabelas novas**:
1. `subscriptions` (histórico de assinaturas)
2. `notification_tokens` (tokens FCM)
3. `consentimentos` (LGPD)

E **2 campos adicionais** na tabela `usuarios`:
1. `subscription_expires_at`
2. `subscription_receipt`

**Tempo estimado para criar as entidades faltantes**: 2-3 horas

---

**Próximos Passos**:
1. ✅ Revisar esta análise
2. ⏭️ Criar as entidades faltantes
3. ⏭️ Criar migrations (se necessário)
4. ⏭️ Atualizar módulos do NestJS

