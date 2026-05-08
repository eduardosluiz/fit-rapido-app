# 💡 Proposta: Melhorias no Sistema de Substituição de Ingredientes

## 📊 Situação Atual

### ✅ **O que já está implementado:**

1. **Estrutura de Dados Completa:**
   - ✅ Tabela `ingredientes` com valores nutricionais
   - ✅ Tabela `receita_ingredientes` para associação
   - ✅ Tabela `substituicoes_usuario` para histórico
   - ✅ Tabela `ingrediente_cache` para cache de APIs
   - ✅ Tabela `consulta_ia` para histórico IA

2. **Serviços e Lógica:**
   - ✅ `SubstituicoesService.calcularMacrosReceita()` - Calcula macros originais
   - ✅ `SubstituicoesService.calcularMacrosComSubstituicao()` - Recalcula com substituições
   - ✅ `IngredientesService` - CRUD completo
   - ✅ `USDAService` - Integração com API USDA (estrutura pronta)

3. **Endpoints API:**
   - ✅ `GET /ingredientes` - Listar ingredientes
   - ✅ `GET /ingredientes/search?q=termo` - Buscar ingredientes
   - ✅ `POST /substituicoes` - Criar substituição
   - ✅ `GET /substituicoes/calcular/:receitaId` - Calcular macros

### ⚠️ **O que falta:**

1. **Dados:**
   - ⏳ Banco de ingredientes vazio (precisa popular)
   - ⏳ Receitas não têm ingredientes associados (só texto livre)

2. **Funcionalidades:**
   - ⏳ Script para associar ingredientes às receitas existentes
   - ⏳ Importação automática do TACO
   - ⏳ Interface admin para gerenciar ingredientes
   - ⏳ Interface mobile para substituições

## 🎯 Proposta de Implementação Incremental

### **Fase 1: Popular Banco com Ingredientes (1-2 dias)**

**Objetivo:** Ter ~200-300 ingredientes comuns cadastrados

**Ações:**
1. Criar script para importar TACO (Excel)
2. Cadastrar manualmente ingredientes mais comuns que não estão no TACO
3. Validar dados nutricionais

**Resultado:** Banco com ingredientes suficientes para começar

---

### **Fase 2: Associar Ingredientes às Receitas (2-3 dias)**

**Objetivo:** Todas as receitas têm ingredientes estruturados

**Problema Atual:**
- Receitas têm campo `ingredientes` como texto livre (array de strings)
- Exemplo: `["200g farinha de trigo", "2 ovos", "100ml leite"]`

**Solução Proposta:**

#### **Opção A: Script Automático (Recomendado)**

Criar script que:
1. Lê receitas existentes
2. Para cada receita, processa o array `ingredientes`
3. Tenta identificar ingredientes no banco usando busca inteligente
4. Cria registros em `receita_ingredientes`

**Exemplo de lógica:**
```typescript
// Para cada ingrediente no texto:
"200g farinha de trigo"
  ↓
// 1. Extrair quantidade e unidade
quantidade = 200
unidade = "g"
nome = "farinha de trigo"

// 2. Buscar no banco
ingrediente = await ingredientesService.findByNome("farinha de trigo")
  ↓
// 3. Criar associação
receitaIngrediente = {
  receita_id: receita.id,
  ingrediente_id: ingrediente.id,
  quantidade: 200,
  unidade: "g",
  ingrediente_texto: "200g farinha de trigo" // fallback
}
```

#### **Opção B: Interface Admin Manual**

Criar interface onde admin:
1. Vê receita com ingredientes em texto
2. Para cada ingrediente, busca e associa manualmente
3. Sistema salva em `receita_ingredientes`

**Recomendação:** Começar com Opção A (automático), Opção B como fallback

---

### **Fase 3: Melhorar Cálculo de Macros (1 dia)**

**Problemas Identificados:**

1. **Unidades diferentes:** 
   - Ingrediente pode ter `unidade_base = "100g"`
   - Receita pode usar `unidade = "ml"` ou `"unidade"`
   - Precisa conversão inteligente

2. **Ingredientes não cadastrados:**
   - Se ingrediente não está no banco, não calcula macros
   - Deveria usar valores da receita original como fallback

**Melhorias Propostas:**

#### **1. Sistema de Conversão de Unidades**

```typescript
// Criar serviço de conversão
class ConversaoUnidadesService {
  converter(
    quantidade: number,
    unidadeOrigem: string,
    unidadeDestino: string,
    ingrediente: Ingrediente
  ): number {
    // Exemplos:
    // 1 colher de sopa de farinha ≈ 10g
    // 1 unidade de ovo ≈ 50g
    // 1 xícara de leite ≈ 240ml
    
    // Usar tabela de conversão ou densidade do ingrediente
  }
}
```

#### **2. Fallback para Ingredientes Não Cadastrados**

```typescript
// Se ingrediente não está cadastrado:
if (!ingrediente_id) {
  // Usar macros da receita original dividido pelos ingredientes cadastrados
  // Ou buscar na API USDA automaticamente
  // Ou usar valores padrão por categoria
}
```

---

### **Fase 4: Interface Mobile (1 semana)**

**Funcionalidades:**

1. **Tela de Detalhes da Receita (Modificada):**
   ```
   ┌─────────────────────────────┐
   │ [Imagem] Título [❤️]        │
   ├─────────────────────────────┤
   │ 📊 Informações Nutricionais  │
   │ Original: 250 kcal          │
   │ Modificado: 220 kcal (-30)  │
   ├─────────────────────────────┤
   │ 🥘 Ingredientes             │
   │ • 200g Farinha [↻]         │
   │ • 2 ovos                    │
   │ • 100ml Leite [↻]          │
   │                             │
   │ [Personalizar Receita]      │
   └─────────────────────────────┘
   ```

2. **Modal de Substituição:**
   ```
   ┌─────────────────────────────┐
   │ Substituir: Farinha de trigo│
   │                             │
   │ Quantidade: [200] [g] ▼    │
   │                             │
   │ Substituir por:             │
   │ 🔍 [Buscar...]              │
   │                             │
   │ Sugestões:                   │
   │ • Farinha de amêndoa        │
   │ • Farinha de coco           │
   │ • Farinha de aveia          │
   │                             │
   │ [Cancelar] [Substituir]     │
   └─────────────────────────────┘
   ```

3. **Comparação Antes/Depois:**
   ```
   ┌─────────────────────────────┐
   │ 📊 Comparação Nutricional   │
   │                             │
   │         Antes │ Depois │ Δ  │
   │ Calorias: 250 │  220   │-30 │
   │ Proteínas: 15 │  18    │ +3 │
   │ Carboidratos:30│  25    │ -5 │
   │                             │
   │ [Aplicar] [Cancelar]         │
   └─────────────────────────────┘
   ```

---

### **Fase 5: Interface Admin (1 semana)**

**Funcionalidades:**

1. **Tela de Cadastro de Ingredientes:**
   - CRUD completo
   - Busca e filtros
   - Importação em lote (CSV/Excel)

2. **Tela de Associação Ingredientes ↔ Receitas:**
   - Lista receitas
   - Para cada receita, mostra ingredientes
   - Permite associar ingredientes cadastrados
   - Define substitutos pré-definidos

3. **Dashboard:**
   - Estatísticas de ingredientes mais usados
   - Substituições mais populares
   - Receitas com ingredientes não associados

---

## 🔧 Melhorias Técnicas Propostas

### **1. Cache Inteligente de Cálculos**

```typescript
// Cachear cálculos de macros por receita
// Se receita não mudou e substituições não mudaram, usar cache
class MacrosCacheService {
  async calcularComCache(
    receitaId: string,
    substituicoes: SubstituicaoUsuario[]
  ): Promise<Macros> {
    const cacheKey = `${receitaId}-${hash(substituicoes)}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const macros = await this.calcularMacros(...);
    await this.cache.set(cacheKey, macros, { ttl: 3600 });
    return macros;
  }
}
```

### **2. Validação de Substituições**

```typescript
// Validar se substituição faz sentido
class ValidacaoSubstituicaoService {
  async validar(
    original: Ingrediente,
    substituto: Ingrediente
  ): Promise<{
    valido: boolean;
    avisos: string[];
  }> {
    const avisos = [];
    
    // Verificar diferença muito grande de macros
    if (Math.abs(original.calorias - substituto.calorias) > 300) {
      avisos.push("Diferença significativa de calorias");
    }
    
    // Verificar compatibilidade (ex: líquido vs sólido)
    if (original.unidade_base.includes('ml') && 
        !substituto.unidade_base.includes('ml')) {
      avisos.push("Atenção: unidades diferentes podem afetar resultado");
    }
    
    return {
      valido: avisos.length === 0,
      avisos
    };
  }
}
```

### **3. Sugestões Inteligentes de Substitutos**

```typescript
// Sugerir substitutos baseado em:
// 1. Substitutos pré-definidos pelo admin
// 2. Substituições frequentes de outros usuários
// 3. Similaridade nutricional
class SugestaoSubstitutosService {
  async sugerir(
    ingredienteId: string,
    receitaId: string,
    usuarioId?: string
  ): Promise<Ingrediente[]> {
    // 1. Substitutos pré-definidos
    const predefinidos = await this.getSubstitutosPredefinidos(ingredienteId);
    
    // 2. Substituições frequentes
    const frequentes = await this.getSubstituicoesFrequentes(ingredienteId);
    
    // 3. Similaridade nutricional
    const similares = await this.getSimilaresNutricionais(ingredienteId);
    
    // Combinar e ordenar por relevância
    return this.combinarSugestoes(predefinidos, frequentes, similares);
  }
}
```

---

## 📋 Plano de Ação Imediato

### **Prioridade Alta (Esta Semana):**

1. ✅ **Popular banco com ingredientes**
   - [ ] Baixar TACO
   - [ ] Executar script de importação
   - [ ] Validar dados

2. ✅ **Criar script de associação automática**
   - [ ] Script que lê receitas existentes
   - [ ] Identifica ingredientes no texto
   - [ ] Cria associações em `receita_ingredientes`

3. ✅ **Testar cálculo de macros**
   - [ ] Testar com receita que tem ingredientes associados
   - [ ] Testar com substituição
   - [ ] Validar resultados

### **Prioridade Média (Próximas 2 Semanas):**

4. ⏳ **Interface mobile básica**
   - [ ] Tela de substituição
   - [ ] Mostrar comparação antes/depois
   - [ ] Salvar substituições

5. ⏳ **Interface admin básica**
   - [ ] CRUD de ingredientes
   - [ ] Associação manual ingredientes ↔ receitas

### **Prioridade Baixa (Futuro):**

6. ⏳ **Melhorias avançadas**
   - [ ] Cache de cálculos
   - [ ] Validação de substituições
   - [ ] Sugestões inteligentes
   - [ ] IA para PREMIUM_FIT

---

## 💰 Estimativa de Esforço

| Fase | Tempo Estimado | Prioridade |
|------|----------------|------------|
| Popular banco | 1-2 dias | 🔴 Alta |
| Associar ingredientes | 2-3 dias | 🔴 Alta |
| Melhorar cálculo | 1 dia | 🟡 Média |
| Interface mobile | 1 semana | 🟡 Média |
| Interface admin | 1 semana | 🟡 Média |
| Melhorias avançadas | 2 semanas | 🟢 Baixa |

**Total MVP:** ~2-3 semanas
**Total Completo:** ~4-5 semanas

---

## ✅ Próximo Passo Recomendado

**Começar pela Fase 1:** Popular banco com ingredientes

**Ações imediatas:**
1. Verificar se script de importação TACO existe
2. Se não existe, criar script
3. Baixar TACO e executar importação
4. Validar dados importados

Quer que eu comece criando o script de importação do TACO ou prefere começar pela associação automática de ingredientes às receitas?

