# 🍽️ Arquitetura: Substituição de Ingredientes e Cálculo de Macros

## 📋 Visão Geral

Sistema para permitir que usuários substituam ingredientes em receitas e recalculem automaticamente os valores nutricionais (macros).

---

## 🎯 Requisitos

1. ✅ Receitas já têm campos nutricionais (calorias, proteínas, carboidratos, gorduras, fibras, sódio)
2. ✅ Usuário pode substituir ingredientes
3. ✅ Sistema recalcula macros automaticamente
4. ✅ Mostrar diferença entre receita original e modificada

---

## 🤔 IA vs Banco de Dados Nutricional

### ❌ **NÃO recomendado: IA para cálculo de macros**

**Problemas:**
- **Custo**: Cada substituição = 1 requisição à API ($$$)
- **Latência**: 1-3 segundos por cálculo
- **Precisão**: LLMs podem "inventar" valores nutricionais
- **Dependência**: Requer internet sempre
- **Escalabilidade**: Custo cresce linearmente com uso

### ✅ **Recomendado: Banco de Dados Nutricional**

**Vantagens:**
- **Precisão**: Dados validados e confiáveis
- **Velocidade**: Cálculo instantâneo (local)
- **Custo**: Zero custo adicional após implementação
- **Offline**: Funciona sem internet
- **Escalável**: Suporta milhões de cálculos sem custo extra

**Quando usar IA (opcional):**
- **Sugestões de substituições**: "Que ingrediente posso usar no lugar de X?"
- **Reconhecimento de ingredientes**: Parsear texto livre em ingredientes estruturados
- **Receitas personalizadas**: Gerar receitas baseadas em preferências

---

## 🏗️ Arquitetura Proposta

### **Opção 1: Banco de Dados Próprio (Recomendado)**

```
┌─────────────────────────────────────────┐
│         Tabela: ingredientes             │
├─────────────────────────────────────────┤
│ id (UUID)                                │
│ nome (VARCHAR) - "Farinha de trigo"     │
│ nome_variacoes (TEXT[]) - ["trigo", ...]│
│ unidade_base (VARCHAR) - "100g"         │
│ calorias (DECIMAL) - 364.0               │
│ proteinas (DECIMAL) - 10.3               │
│ carboidratos (DECIMAL) - 76.3            │
│ gorduras (DECIMAL) - 1.0                 │
│ fibras (DECIMAL) - 2.7                   │
│ sodio (DECIMAL) - 2.0                    │
│ ativo (BOOLEAN)                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│    Tabela: receita_ingredientes         │
├─────────────────────────────────────────┤
│ receita_id (UUID)                        │
│ ingrediente_id (UUID)                    │
│ quantidade (DECIMAL) - 200.0             │
│ unidade (VARCHAR) - "g"                  │
│ ordem (INT)                              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   Tabela: substituicoes_usuario         │
├─────────────────────────────────────────┤
│ id (UUID)                                │
│ usuario_id (UUID)                        │
│ receita_id (UUID)                        │
│ ingrediente_original_id (UUID)           │
│ ingrediente_substituto_id (UUID)         │
│ quantidade (DECIMAL)                     │
│ unidade (VARCHAR)                        │
│ created_at (TIMESTAMP)                   │
└─────────────────────────────────────────┘
```

**Fluxo:**
1. Admin cadastra ingredientes com valores nutricionais
2. Admin associa ingredientes às receitas com quantidades
3. Usuário visualiza receita e clica em "Substituir ingrediente"
4. Sistema mostra lista de ingredientes disponíveis
5. Usuário escolhe substituto
6. Sistema recalcula macros:
   - Remove macros do ingrediente original
   - Adiciona macros do substituto (proporcional à quantidade)
   - Atualiza valores totais da receita

---

### **Opção 2: API Externa Nutricional (Alternativa)**

**APIs disponíveis:**
- **USDA FoodData Central** (gratuita, dados americanos)
- **Nutritionix API** (paga, dados internacionais)
- **Edamam Food Database** (paga, boa cobertura)

**Vantagens:**
- Dados já validados
- Grande base de ingredientes
- Atualizações automáticas

**Desvantagens:**
- Custo por requisição
- Dependência externa
- Latência de rede
- Limites de rate

**Recomendação:** Usar como complemento, não como base principal.

---

## 💡 Implementação Recomendada (Híbrida Melhorada)

### **Estratégia Híbrida: Banco Próprio + Fallback Inteligente**

**Princípio:** Banco de dados como base (80-90% dos casos), IA/API como fallback para ingredientes não cadastrados.

### **Fase 1: Banco Próprio (MVP)**
1. Criar tabela `ingredientes` com ~200-600 ingredientes mais comuns
2. Criar tabela `receita_ingredientes` para associar ingredientes às receitas
3. Implementar cálculo de macros baseado em ingredientes
4. Interface de substituição simples com opções pré-definidas

### **Fase 2: Fallback Inteligente**
1. **Ingredientes não cadastrados:**
   - Tentar buscar via API nutricional (USDA - gratuita)
   - Cachear resultado no banco próprio
   - Marcar como "fonte: api" para rastreabilidade

2. **Substituições sem opções pré-definidas:**
   - Buscar ingredientes similares no banco
   - (Opcional) Usar IA para sugerir substitutos

### **Fase 3: IA para PREMIUM_FIT (Diferencial)**
1. Campo de texto livre para perguntas do usuário
2. IA analisa pergunta e sugere substituições
3. Sistema busca valores nutricionais (banco ou API)
4. Calcula macros automaticamente
5. Mostra comparação antes/depois

---

## 🔧 Estrutura de Dados Detalhada

### **1. Entidade Ingrediente**

```typescript
@Entity('ingredientes')
export class Ingrediente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nome: string; // "Farinha de trigo"

  @Column('text', { array: true, default: [] })
  nome_variacoes: string[]; // ["trigo", "farinha branca", ...]

  @Column({ default: '100g' })
  unidade_base: string; // "100g", "1 unidade", "1 colher de sopa"

  // Valores nutricionais por unidade_base
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  calorias: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  proteinas: number; // gramas

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  carboidratos: number; // gramas

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  gorduras: number; // gramas

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  fibras: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  sodio: number; // miligramas

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'enum', enum: ['manual', 'api', 'ia'], default: 'manual' })
  fonte: 'manual' | 'api' | 'ia'; // De onde veio o dado nutricional

  @Column({ type: 'timestamp', nullable: true })
  data_importacao: Date; // Quando foi importado/cadastrado

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

### **2. Entidade ReceitaIngrediente**

```typescript
@Entity('receita_ingredientes')
export class ReceitaIngrediente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Receita)
  @JoinColumn({ name: 'receita_id' })
  receita: Receita;

  @Column()
  receita_id: string;

  @ManyToOne(() => Ingrediente)
  @JoinColumn({ name: 'ingrediente_id' })
  ingrediente: Ingrediente;

  @Column({ nullable: true })
  ingrediente_id: string | null; // NULL se ingrediente não está cadastrado

  @Column({ nullable: true })
  ingrediente_texto: string; // Fallback: texto original se ingrediente_id é NULL

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantidade: number; // 200.0

  @Column({ default: 'g' })
  unidade: string; // "g", "ml", "unidade", "colher de sopa"

  @Column({ type: 'int', default: 0 })
  ordem: number; // Ordem na lista de ingredientes

  @Column({ nullable: true })
  observacao: string; // "opcional", "a gosto", etc.

  // NOVO: Substitutos pré-definidos pelo admin
  @Column('text', { array: true, default: [] })
  substitutos_sugeridos: string[]; // IDs de ingredientes substitutos
}
```

### **3. Entidade SubstituicaoUsuario**

```typescript
@Entity('substituicoes_usuario')
export class SubstituicaoUsuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column()
  usuario_id: string;

  @ManyToOne(() => Receita)
  @JoinColumn({ name: 'receita_id' })
  receita: Receita;

  @Column()
  receita_id: string;

  @ManyToOne(() => Ingrediente)
  @JoinColumn({ name: 'ingrediente_original_id' })
  ingrediente_original: Ingrediente;

  @Column()
  ingrediente_original_id: string;

  @ManyToOne(() => Ingrediente)
  @JoinColumn({ name: 'ingrediente_substituto_id' })
  ingrediente_substituto: Ingrediente;

  @Column()
  ingrediente_substituto_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantidade: number;

  @Column({ default: 'g' })
  unidade: string;

  @CreateDateColumn()
  created_at: Date;
}

### **4. Entidade IngredienteCache (Cache de ingredientes da IA/API)**

```typescript
@Entity('ingredientes_cache')
export class IngredienteCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nome_normalizado: string; // "farinha de trigo" (lowercase, sem acentos)

  @ManyToOne(() => Ingrediente, { nullable: true })
  @JoinColumn({ name: 'ingrediente_id' })
  ingrediente: Ingrediente | null;

  @Column({ nullable: true })
  ingrediente_id: string | null; // Se foi cadastrado depois

  // Valores nutricionais (por 100g)
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  calorias: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  proteinas: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  carboidratos: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  gorduras: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  fibras: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  sodio: number;

  @Column({ type: 'enum', enum: ['ia', 'api_usda', 'api_nutritionix'] })
  fonte: 'ia' | 'api_usda' | 'api_nutritionix';

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  confianca: number; // 0-1 (confiança nos dados)

  @CreateDateColumn()
  created_at: Date;
}

### **5. Entidade ConsultaIA (Histórico de consultas IA - PREMIUM_FIT)**

```typescript
@Entity('consultas_ia')
export class ConsultaIA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column()
  usuario_id: string;

  @ManyToOne(() => Receita, { nullable: true })
  @JoinColumn({ name: 'receita_id' })
  receita: Receita | null;

  @Column({ nullable: true })
  receita_id: string | null;

  @Column('text')
  pergunta: string; // "Na receita de bolo de chocolate posso trocar chocolate por morango?"

  @Column('text', { nullable: true })
  resposta_ia: string; // Resposta da IA

  @Column('jsonb', { nullable: true })
  substituicao_sugerida: {
    ingrediente_original: string;
    ingrediente_substituto: string;
    quantidade_original: number;
    quantidade_substituto: number;
    unidade: string;
    razao: string; // Por que essa substituição foi sugerida
  } | null;

  @Column({ default: false })
  aplicada: boolean; // Se o usuário aplicou a substituição

  @CreateDateColumn()
  created_at: Date;
}
```

---

## 🧮 Lógica de Cálculo

### **Cálculo de Macros da Receita Original**

```typescript
function calcularMacrosReceita(
  receita: Receita, 
  receitaIngredientes: ReceitaIngrediente[]
): Macros {
  let totalCalorias = 0;
  let totalProteinas = 0;
  let totalCarboidratos = 0;
  let totalGorduras = 0;
  let totalFibras = 0;
  let totalSodio = 0;

  for (const ri of receitaIngredientes) {
    // Se ingrediente está cadastrado, usar dados do banco
    if (ri.ingrediente_id && ri.ingrediente) {
      const ingrediente = ri.ingrediente;
      const unidadeBase = parseFloat(ingrediente.unidade_base.replace('g', ''));
      const fator = ri.quantidade / unidadeBase;
      
      totalCalorias += ingrediente.calorias * fator;
      totalProteinas += ingrediente.proteinas * fator;
      totalCarboidratos += ingrediente.carboidratos * fator;
      totalGorduras += ingrediente.gorduras * fator;
      totalFibras += (ingrediente.fibras || 0) * fator;
      totalSodio += (ingrediente.sodio || 0) * fator;
    } else {
      // Se não está cadastrado, tentar buscar no cache ou usar valores da receita
      // (fallback para ingredientes não estruturados)
      console.warn(`Ingrediente não cadastrado: ${ri.ingrediente_texto}`);
    }
  }

  // Dividir pelo número de porções
  const porcoes = receita.porcoes || 1;
  
  return {
    calorias: totalCalorias / porcoes,
    proteinas: totalProteinas / porcoes,
    carboidratos: totalCarboidratos / porcoes,
    gorduras: totalGorduras / porcoes,
    fibras: totalFibras / porcoes,
    sodio: totalSodio / porcoes,
  };
}
```

### **Cálculo com Substituição**

```typescript
function calcularMacrosComSubstituicao(
  receita: Receita,
  receitaIngredientes: ReceitaIngrediente[],
  substituicoes: SubstituicaoUsuario[]
): Macros {
  // Calcular macros originais
  const macrosOriginais = calcularMacrosReceita(receita, receitaIngredientes);
  
  // Aplicar substituições
  for (const sub of substituicoes) {
    const ingredienteOriginal = sub.ingrediente_original;
    const ingredienteSubstituto = sub.ingrediente_substituto;
    
    // Remover macros do ingrediente original
    const unidadeBaseOriginal = parseFloat(ingredienteOriginal.unidade_base.replace('g', ''));
    const fatorOriginal = sub.quantidade / unidadeBaseOriginal;
    
    macrosOriginais.calorias -= ingredienteOriginal.calorias * fatorOriginal;
    macrosOriginais.proteinas -= ingredienteOriginal.proteinas * fatorOriginal;
    macrosOriginais.carboidratos -= ingredienteOriginal.carboidratos * fatorOriginal;
    macrosOriginais.gorduras -= ingredienteOriginal.gorduras * fatorOriginal;
    macrosOriginais.fibras -= (ingredienteOriginal.fibras || 0) * fatorOriginal;
    macrosOriginais.sodio -= (ingredienteOriginal.sodio || 0) * fatorOriginal;
    
    // Adicionar macros do substituto
    const unidadeBaseSubstituto = parseFloat(ingredienteSubstituto.unidade_base.replace('g', ''));
    const fatorSubstituto = sub.quantidade / unidadeBaseSubstituto;
    
    macrosOriginais.calorias += ingredienteSubstituto.calorias * fatorSubstituto;
    macrosOriginais.proteinas += ingredienteSubstituto.proteinas * fatorSubstituto;
    macrosOriginais.carboidratos += ingredienteSubstituto.carboidratos * fatorSubstituto;
    macrosOriginais.gorduras += ingredienteSubstituto.gorduras * fatorSubstituto;
    macrosOriginais.fibras += (ingredienteSubstituto.fibras || 0) * fatorSubstituto;
    macrosOriginais.sodio += (ingredienteSubstituto.sodio || 0) * fatorSubstituto;
  }
  
  return macrosOriginais;
}
```

### **Cálculo com IA (Fluxo Completo)**

```typescript
async function processarPerguntaIA(
  pergunta: string,
  receitaId: string,
  usuarioId: string
): Promise<{
  resposta: string;
  substituicao?: SubstituicaoUsuario;
  macrosAntes: Macros;
  macrosDepois: Macros;
}> {
  // 1. Enviar pergunta para IA (OpenAI/Claude)
  const respostaIA = await iaService.processarPergunta(pergunta, receitaId);
  
  // 2. IA retorna:
  // - Se a substituição é viável
  // - Qual ingrediente substituir
  // - Qual ingrediente usar como substituto
  // - Quantidade sugerida
  
  // 3. Buscar valores nutricionais dos ingredientes
  const ingredienteOriginal = await buscarOuCriarIngrediente(
    respostaIA.ingrediente_original
  );
  
  const ingredienteSubstituto = await buscarOuCriarIngrediente(
    respostaIA.ingrediente_substituto
  );
  
  // 4. Calcular macros antes da substituição
  const receita = await receitasService.findOne(receitaId);
  const receitaIngredientes = await receitaIngredientesService.findByReceita(receitaId);
  const macrosAntes = calcularMacrosReceita(receita, receitaIngredientes);
  
  // 5. Criar substituição temporária para cálculo
  const substituicaoTemp: SubstituicaoUsuario = {
    ingrediente_original: ingredienteOriginal,
    ingrediente_substituto: ingredienteSubstituto,
    quantidade: respostaIA.quantidade_sugerida,
    unidade: respostaIA.unidade,
  };
  
  // 6. Calcular macros depois da substituição
  const macrosDepois = calcularMacrosComSubstituicao(
    receita,
    receitaIngredientes,
    [substituicaoTemp]
  );
  
  // 7. Salvar consulta no histórico
  await consultasIAService.create({
    usuario_id: usuarioId,
    receita_id: receitaId,
    pergunta,
    resposta_ia: respostaIA.texto_completo,
    substituicao_sugerida: {
      ingrediente_original: ingredienteOriginal.nome,
      ingrediente_substituto: ingredienteSubstituto.nome,
      quantidade_original: respostaIA.quantidade_original,
      quantidade_substituto: respostaIA.quantidade_sugerida,
      unidade: respostaIA.unidade,
      razao: respostaIA.razao_substituicao,
    },
  });
  
  return {
    resposta: respostaIA.texto_completo,
    substituicao: substituicaoTemp,
    macrosAntes,
    macrosDepois,
  };
}

async function buscarOuCriarIngrediente(nome: string): Promise<Ingrediente> {
  // 1. Tentar buscar no banco próprio
  let ingrediente = await ingredientesService.findByNome(nome);
  
  if (ingrediente) {
    return ingrediente;
  }
  
  // 2. Tentar buscar no cache
  const cache = await ingredientesCacheService.findByNome(nome);
  if (cache && cache.ingrediente_id) {
    return await ingredientesService.findOne(cache.ingrediente_id);
  }
  
  // 3. Buscar via API (USDA)
  const dadosAPI = await usdaService.buscarIngrediente(nome);
  
  // 4. Criar ingrediente no banco com dados da API
  ingrediente = await ingredientesService.create({
    nome: dadosAPI.nome,
    calorias: dadosAPI.calorias,
    proteinas: dadosAPI.proteinas,
    carboidratos: dadosAPI.carboidratos,
    gorduras: dadosAPI.gorduras,
    fibras: dadosAPI.fibras,
    sodio: dadosAPI.sodio,
    fonte: 'api',
  });
  
  // 5. Cachear para próximas buscas
  await ingredientesCacheService.create({
    nome_normalizado: nome.toLowerCase(),
    ingrediente_id: ingrediente.id,
    ...dadosAPI,
    fonte: 'api_usda',
    confianca: 0.9,
  });
  
  return ingrediente;
}
```

### **Exemplo Prático: Chocolate → Morango**

```typescript
// Receita original: Bolo de Chocolate
// Ingrediente: 100g chocolate amargo

// 1. Buscar valores nutricionais
const chocolate = {
  nome: "Chocolate amargo",
  calorias: 500, // por 100g
  proteinas: 7,
  carboidratos: 30,
  gorduras: 40,
};

const morango = {
  nome: "Morango",
  calorias: 32, // por 100g
  proteinas: 0.7,
  carboidratos: 7.7,
  gorduras: 0.3,
};

// 2. Calcular diferença
const quantidadeOriginal = 100; // g
const quantidadeSubstituto = 100; // g (mesma quantidade)

const macrosRemovidos = {
  calorias: (chocolate.calorias / 100) * quantidadeOriginal, // 500 kcal
  proteinas: (chocolate.proteinas / 100) * quantidadeOriginal, // 7g
  carboidratos: (chocolate.carboidratos / 100) * quantidadeOriginal, // 30g
  gorduras: (chocolate.gorduras / 100) * quantidadeOriginal, // 40g
};

const macrosAdicionados = {
  calorias: (morango.calorias / 100) * quantidadeSubstituto, // 32 kcal
  proteinas: (morango.proteinas / 100) * quantidadeSubstituto, // 0.7g
  carboidratos: (morango.carboidratos / 100) * quantidadeSubstituto, // 7.7g
  gorduras: (morango.gorduras / 100) * quantidadeSubstituto, // 0.3g
};

// 3. Diferença final
const diferenca = {
  calorias: macrosAdicionados.calorias - macrosRemovidos.calorias, // -468 kcal
  proteinas: macrosAdicionados.proteinas - macrosRemovidos.proteinas, // -6.3g
  carboidratos: macrosAdicionados.carboidratos - macrosRemovidos.carboidratos, // -22.3g
  gorduras: macrosAdicionados.gorduras - macrosRemovidos.gorduras, // -39.7g
};

// 4. Aplicar na receita total
const macrosReceitaOriginal = {
  calorias: 250, // por porção
  proteinas: 15,
  carboidratos: 30,
  gorduras: 10,
};

const macrosReceitaModificada = {
  calorias: macrosReceitaOriginal.calorias + (diferenca.calorias / receita.porcoes),
  proteinas: macrosReceitaOriginal.proteinas + (diferenca.proteinas / receita.porcoes),
  // ... outros macros
};
```

---

## 🎨 Interface do Usuário

### **Tela de Detalhes da Receita (Modificada)**

```
┌─────────────────────────────────────┐
│  [Imagem] [Título] [❤️]            │
│  ⏱️ 10 min │ 🍽️ 2 │ 📊 Médio      │
├─────────────────────────────────────┤
│  📊 Informações Nutricionais        │
│  ┌─────────────────────────────┐   │
│  │ Original │ Modificado │ Diff │   │
│  │ 250 kcal │ 220 kcal   │ -30  │   │
│  │ 15g prot │ 18g prot   │ +3   │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  🥘 Ingredientes                    │
│  • 200g Farinha de trigo [↻]      │
│  • 2 ovos                          │
│  • 100ml Leite [↻]                 │
│                                     │
│  [Botão: Personalizar Receita]      │
│                                     │
│  🤖 [Perguntar à IA] (PREMIUM_FIT) │
└─────────────────────────────────────┘
```

### **Modal de Substituição (Opções Pré-definidas)**

```
┌─────────────────────────────────────┐
│  Substituir: Farinha de trigo       │
│                                     │
│  Quantidade: [200] [g] ▼           │
│                                     │
│  Substituir por:                    │
│  🔍 [Buscar ingrediente...]        │
│                                     │
│  Sugestões Pré-definidas:           │
│  • Farinha de amêndoa               │
│  • Farinha de coco                 │
│  • Farinha de aveia                │
│                                     │
│  [Cancelar]  [Substituir]          │
└─────────────────────────────────────┘
```

### **Modal IA para PREMIUM_FIT (NOVO)**

```
┌─────────────────────────────────────┐
│  🤖 Assistente de Substituições     │
│                                     │
│  Receita: Bolo de Chocolate        │
│                                     │
│  Digite sua pergunta:               │
│  ┌─────────────────────────────┐   │
│  │ Na receita de bolo de        │   │
│  │ chocolate posso trocar       │   │
│  │ chocolate por morango?       │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Enviar]                           │
│                                     │
│  💡 Exemplos:                       │
│  • "Posso trocar açúcar por stevia?"│
│  • "Substituir leite por leite de   │
│    coco funciona?"                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🤖 Resposta da IA                  │
│                                     │
│  Sim! Você pode substituir          │
│  chocolate por morango.              │
│                                     │
│  📊 Impacto Nutricional:            │
│  ┌─────────────────────────────┐   │
│  │ Original:                    │   │
│  │ • 100g chocolate: 500 kcal  │   │
│  │                              │   │
│  │ Modificado:                  │   │
│  │ • 200g morango: 64 kcal     │   │
│  │                              │   │
│  │ Diferença: -436 kcal ✅      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ⚠️ Atenção:                        │
│  A textura pode mudar. Considere    │
│  ajustar outros ingredientes.       │
│                                     │
│  [Aplicar Substituição]             │
│  [Cancelar]                         │
└─────────────────────────────────────┘
```

---

## 📊 Fontes de Dados Nutricionais

### **✅ Opção 1: TACO (Tabela Brasileira de Composição de Alimentos)** ⭐ RECOMENDADO

**Informações:**
- **Gratuita** ✅
- **Dados brasileiros** (mais relevante para o mercado)
- **~600 alimentos** cadastrados
- **Formato**: PDF/Excel disponível para download
- **Site oficial**: http://www.nepa.unicamp.br/taco/tabela.php

**Como obter:**
1. Download direto do site da UNICAMP
2. Arquivo Excel com todas as informações nutricionais
3. Script de importação pode ser criado para popular o banco

**Vantagens:**
- Dados validados cientificamente
- Específicos para alimentos brasileiros
- Gratuito e sem limitações

**Desvantagens:**
- Quantidade limitada (~600 alimentos)
- Precisa importar manualmente
- Não tem API (apenas Excel/PDF)

---

### **✅ Opção 2: USDA FoodData Central** ⭐ FALLBACK RECOMENDADO

**Informações:**
- **Gratuita** ✅
- **API REST disponível** ✅
- **~300.000 alimentos** cadastrados
- **Dados americanos** (pode ter diferenças com produtos brasileiros)
- **Site**: https://fdc.nal.usda.gov/

**Como usar:**
```typescript
// Exemplo de busca na API USDA
GET https://api.nal.usda.gov/fdc/v1/foods/search?query=morango&api_key=YOUR_KEY

// Retorna JSON com valores nutricionais
{
  "foods": [{
    "description": "Strawberries, raw",
    "foodNutrients": [
      { "nutrientName": "Energy", "value": 32 }, // kcal
      { "nutrientName": "Protein", "value": 0.67 }, // g
      // ...
    ]
  }]
}
```

**Vantagens:**
- Grande base de dados
- API REST fácil de integrar
- Gratuita (com limite de requisições)

**Desvantagens:**
- Dados americanos (pode ter diferenças)
- Requer chave de API (gratuita, mas precisa cadastrar)
- Limite de rate (não documentado claramente)

---

### **Opção 3: Nutritionix API** (Paga)

**Informações:**
- **Paga**: ~$0.01 por requisição
- **API REST disponível**
- **Dados internacionais**
- **Site**: https://www.nutritionix.com/

**Quando usar:**
- Como último recurso se USDA não tiver o ingrediente
- Para ingredientes muito específicos

---

### **Opção 4: Manual (MVP Inicial)**

**Estratégia:**
1. Começar com ~100-200 ingredientes mais comuns
2. Importar do TACO (Excel)
3. Admin pode cadastrar novos via painel
4. Sistema busca automaticamente via API quando não encontra

**Lista inicial sugerida:**
- Farinhas (trigo, amêndoa, coco, aveia)
- Açúcares (branco, mascavo, demerara, stevia)
- Óleos e gorduras (azeite, óleo de coco, manteiga)
- Laticínios (leite, iogurte, queijos)
- Proteínas (ovos, carnes, peixes, leguminosas)
- Frutas e vegetais mais comuns
- Temperos e especiarias básicas

---

## 🚀 Plano de Implementação

### **Fase 1: Estrutura Base (1-2 semanas)**
- [ ] Criar entidades: `Ingrediente`, `ReceitaIngrediente`, `SubstituicaoUsuario`, `IngredienteCache`, `ConsultaIA`
- [ ] Criar migrations
- [ ] Criar serviços: `IngredientesService`, `SubstituicoesService`, `IngredientesCacheService`
- [ ] Criar endpoints da API
- [ ] Importar ~200-600 ingredientes do TACO (Excel)
- [ ] Script de importação do TACO

### **Fase 2: Fallback API Nutricional (1 semana)**
- [ ] Integrar API USDA FoodData Central
- [ ] Serviço de busca e cache de ingredientes
- [ ] Tratamento de erros e fallbacks
- [ ] Testes com ingredientes não cadastrados

### **Fase 3: Interface Admin (1 semana)**
- [ ] Tela de cadastro de ingredientes
- [ ] Tela de associação ingredientes ↔ receitas
- [ ] Campo para definir substitutos pré-definidos
- [ ] Validação e testes

### **Fase 4: Interface Mobile - Substituição Básica (1 semana)**
- [ ] Tela de substituição de ingredientes
- [ ] Lista de substitutos pré-definidos
- [ ] Busca de ingredientes
- [ ] Cálculo e exibição de macros modificados
- [ ] Comparação original vs modificado
- [ ] Salvar substituições do usuário

### **Fase 5: IA para PREMIUM_FIT (2 semanas)**
- [ ] Campo de texto para perguntas do usuário
- [ ] Integração com IA (OpenAI/Claude)
- [ ] Processamento de perguntas e extração de intenção
- [ ] Busca automática de valores nutricionais
- [ ] Cálculo de macros com substituição sugerida
- [ ] Interface de resposta da IA com comparação
- [ ] Histórico de consultas IA
- [ ] Limite de consultas por usuário (ex: 50/mês)

### **Fase 6: Melhorias (Opcional)**
- [ ] Sugestões inteligentes baseadas em histórico
- [ ] Compartilhar receitas modificadas
- [ ] Notificações sobre novas substituições disponíveis
- [ ] Analytics de substituições mais populares

---

## 💰 Estimativa de Custos

### **Banco Próprio:**
- **Desenvolvimento**: Tempo de implementação
- **Manutenção**: Tempo para adicionar novos ingredientes
- **Custo mensal**: R$ 0 (já usa PostgreSQL)

### **API Externa (se necessário):**
- **Nutritionix**: ~$0.01 por requisição
- **Edamam**: ~$0.005 por requisição
- **USDA**: Gratuita (mas limitada)

**Recomendação**: Começar com banco próprio, usar API apenas como fallback.

---

## ✅ Recomendação Final

**Implementar com Banco de Dados Próprio** porque:
1. ✅ Precisão garantida
2. ✅ Custo zero após implementação
3. ✅ Funciona offline
4. ✅ Escalável
5. ✅ Controle total dos dados

**Usar IA apenas para:**
- Sugestões de substituições ("Use X no lugar de Y")
- Reconhecimento de ingredientes em texto livre (opcional)

---

---

## 🔄 Fluxo Completo: IA + Cálculo de Macros

### **Cenário: Usuário PREMIUM_FIT pergunta "Na receita de bolo de chocolate posso trocar chocolate por morango?"**

```
1. Usuário digita pergunta no campo de texto
   ↓
2. Sistema envia para IA (OpenAI/Claude):
   Prompt: "Na receita de bolo de chocolate [ID: xxx], 
            o usuário quer substituir chocolate por morango. 
            Analise se é viável e sugira quantidade."
   ↓
3. IA retorna:
   {
     "viavel": true,
     "ingrediente_original": "chocolate amargo",
     "ingrediente_substituto": "morango",
     "quantidade_original": "100g",
     "quantidade_substituto": "200g", // IA pode sugerir ajuste
     "razao": "Morango tem menos calorias, mas pode alterar textura",
     "texto_resposta": "Sim, você pode substituir..."
   }
   ↓
4. Sistema busca valores nutricionais:
   - Chocolate: Busca no banco → Encontrado ✅
   - Morango: Busca no banco → Não encontrado
     → Busca API USDA → Encontrado ✅
     → Cacheia no banco
   ↓
5. Sistema calcula macros:
   - Macros antes: Receita original completa
   - Macros depois: Receita com substituição aplicada
   - Diferença: Mostra o que mudou
   ↓
6. Sistema mostra para usuário:
   - Resposta da IA (texto explicativo)
   - Comparação nutricional (antes/depois)
   - Opção de aplicar substituição
   ↓
7. Se usuário aplicar:
   - Salva substituição no banco
   - Atualiza macros da receita modificada
   - Salva no histórico de consultas IA
```

### **Como os Macros são Calculados:**

```typescript
// Exemplo prático: Bolo de Chocolate → Bolo de Morango

// Receita Original:
// - 100g chocolate amargo: 500 kcal, 7g prot, 30g carb, 40g gordura
// - Outros ingredientes: 200 kcal, 8g prot, 20g carb, 5g gordura
// Total Original: 700 kcal, 15g prot, 50g carb, 45g gordura

// Substituição: 100g chocolate → 200g morango
// - Remover: 500 kcal, 7g prot, 30g carb, 40g gordura
// - Adicionar: 64 kcal (200g × 32kcal/100g), 1.4g prot, 15.4g carb, 0.6g gordura

// Total Modificado: 264 kcal, 9.4g prot, 35.4g carb, 5.6g gordura
// Diferença: -436 kcal, -5.6g prot, -14.6g carb, -39.4g gordura ✅
```

---

## 📝 Respostas às Dúvidas

### **1. Onde encontrar/cadastrar lista de ingredientes?**

**✅ Resposta: TACO (Tabela Brasileira de Composição de Alimentos)**

- **Site oficial**: http://www.nepa.unicamp.br/taco/tabela.php
- **Formato**: Excel/PDF para download gratuito
- **Quantidade**: ~600 alimentos brasileiros
- **Como usar**: 
  1. Download do Excel
  2. Criar script de importação
  3. Popular banco de dados automaticamente

**Alternativa: USDA FoodData Central**
- API REST gratuita
- ~300.000 alimentos
- Dados americanos (pode ter diferenças)

**Recomendação**: Começar com TACO (dados brasileiros), usar USDA como fallback.

---

### **2. IA para PREMIUM_FIT - Campo de texto para perguntas?**

**✅ Resposta: Sim, exatamente isso!**

**Implementação:**
- Campo de texto livre na tela de detalhes da receita
- Disponível apenas para usuários `PREMIUM_FIT`
- Usuário digita pergunta natural: "Na receita de bolo de chocolate posso trocar chocolate por morango?"
- IA processa pergunta e retorna:
  - Se a substituição é viável
  - Sugestão de quantidade
  - Comparação nutricional
  - Avisos sobre textura/sabor

**Exemplo de Interface:**
```
┌─────────────────────────────────────┐
│  🤖 Perguntar à IA                  │
│                                     │
│  [Campo de texto livre...]          │
│                                     │
│  💡 Exemplos:                       │
│  • "Posso trocar açúcar por stevia?"│
│  • "Substituir leite por leite de   │
│    coco funciona?"                  │
│                                     │
│  [Enviar]                           │
└─────────────────────────────────────┘
```

---

### **3. Como calcular macros quando IA sugere substituição?**

**✅ Resposta: Processo Automatizado**

**Fluxo:**
1. **IA identifica ingredientes**: Extrai "chocolate" e "morango" da pergunta
2. **Sistema busca valores nutricionais**:
   - Se está no banco → usa dados do banco
   - Se não está → busca API USDA → cacheia
3. **Sistema calcula automaticamente**:
   - Remove macros do ingrediente original
   - Adiciona macros do substituto (proporcional à quantidade)
   - Mostra diferença antes/depois
4. **Usuário vê resultado**:
   - Resposta da IA (texto)
   - Comparação nutricional (tabela)
   - Opção de aplicar substituição

**Exemplo de Cálculo:**
```
Receita: Bolo de Chocolate
Ingrediente: 100g chocolate amargo

Substituição sugerida pela IA:
- Remover: 100g chocolate (500 kcal)
- Adicionar: 200g morango (64 kcal)
- Diferença: -436 kcal ✅

Macros da receita completa:
- Antes: 700 kcal total
- Depois: 264 kcal total
- Diferença: -436 kcal
```

**Tudo é calculado automaticamente!** O usuário só precisa perguntar e ver o resultado.

---

---

## 🔄 Fluxo de Trabalho do Admin

### **Cenário: Admin cria/edita receita**

```
1. Admin digita ingredientes (texto livre):
   "200g farinha de trigo"
   "2 ovos"
   "100ml leite"
   ↓
2. Sistema tenta identificar automaticamente:
   - Busca "farinha de trigo" no banco → Encontrado ✅
   - Busca "ovos" no banco → Encontrado ✅
   - Busca "leite" no banco → Encontrado ✅
   ↓
3. Admin vê preview:
   ✅ 200g Farinha de trigo (cadastrado)
   ✅ 2 unidades Ovos (cadastrado)
   ✅ 100ml Leite (cadastrado)
   ⚠️ 1 colher de canela (não cadastrado - opcional)
   ↓
4. Admin pode:
   - Cadastrar ingrediente novo manualmente
   - Ou deixar como texto (sem cálculo de macros)
   - Definir substitutos pré-definidos para cada ingrediente
   ↓
5. Sistema calcula macros automaticamente:
   - Soma macros de todos ingredientes cadastrados
   - Divide pelo número de porções
   - Salva na receita
```

### **Definindo Substitutos Pré-definidos**

```
Admin edita receita → Seção "Ingredientes"
┌─────────────────────────────────────┐
│  Ingrediente: Farinha de trigo     │
│  Quantidade: 200g                   │
│                                     │
│  Substitutos Sugeridos:             │
│  ☑ Farinha de amêndoa               │
│  ☑ Farinha de coco                 │
│  ☐ Farinha de aveia                │
│                                     │
│  [Adicionar Substituto]             │
└─────────────────────────────────────┘
```

**Vantagens:**
- Usuário vê apenas opções válidas
- Admin controla quais substituições são permitidas
- Cálculo sempre preciso (todos ingredientes cadastrados)

---

## 📊 Comparação: Opções Pré-definidas vs IA

| Aspecto | Opções Pré-definidas | IA (PREMIUM_FIT) |
|---------|---------------------|------------------|
| **Disponibilidade** | Todos os planos | Apenas PREMIUM_FIT |
| **Custo** | R$ 0 | ~R$ 0,01-0,02 por consulta |
| **Velocidade** | Instantâneo | 1-3 segundos |
| **Flexibilidade** | Limitada (admin define) | Alta (usuário pergunta) |
| **Precisão** | Alta (todos cadastrados) | Alta (busca automática) |
| **Uso** | Substituições comuns | Perguntas específicas |

**Recomendação:**
- **Opções pré-definidas**: Para substituições comuns (farinhas, açúcares, leites)
- **IA**: Para perguntas específicas e ingredientes não previstos

---

**Próximo passo**: Posso começar a implementar a estrutura base? 🚀

