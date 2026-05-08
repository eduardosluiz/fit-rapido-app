# 🍽️ Guia: Sistema de Substituição de Ingredientes e Recálculo de Macros

## 📋 Visão Geral

O sistema já está **parcialmente implementado** e permite:
- ✅ Cadastrar ingredientes com valores nutricionais
- ✅ Associar ingredientes às receitas
- ✅ Criar substituições de ingredientes
- ✅ Calcular macros automaticamente com substituições

## 🏗️ Arquitetura Atual

### **Estrutura de Dados**

```
┌─────────────────────────────────┐
│     Tabela: ingredientes         │
├─────────────────────────────────┤
│ • id (UUID)                      │
│ • nome (ex: "Farinha de trigo") │
│ • unidade_base (ex: "100g")      │
│ • calorias, proteinas, etc.      │
│ • fonte (manual/api/ia)          │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  Tabela: receita_ingredientes   │
├─────────────────────────────────┤
│ • receita_id                     │
│ • ingrediente_id (nullable)      │
│ • ingrediente_texto (fallback)   │
│ • quantidade (ex: 200)          │
│ • unidade (ex: "g")              │
│ • substitutos_sugeridos (array)  │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  Tabela: substituicoes_usuario  │
├─────────────────────────────────┤
│ • usuario_id                     │
│ • receita_id                     │
│ • ingrediente_original_id         │
│ • ingrediente_substituto_id      │
│ • quantidade                     │
│ • unidade                        │
└─────────────────────────────────┘
```

## 🔄 Como Funciona o Recálculo

### **1. Cálculo da Receita Original**

O sistema calcula macros baseado nos ingredientes cadastrados:

```typescript
// Para cada ingrediente na receita:
const fator = quantidade_ingrediente / unidade_base_ingrediente;
calorias += ingrediente.calorias * fator;
proteinas += ingrediente.proteinas * fator;
// ... outros macros

// Divide pelo número de porções
macros_por_porcao = macros_totais / receita.porcoes;
```

### **2. Cálculo com Substituição**

Quando o usuário substitui um ingrediente:

```typescript
// 1. Remove macros do ingrediente original
macros_modificado -= macros_ingrediente_original;

// 2. Adiciona macros do substituto
macros_modificado += macros_ingrediente_substituto;

// 3. Calcula diferença
diferenca = macros_modificado - macros_original;
```

## 🚀 Como Usar o Sistema

### **Endpoint: Calcular Macros com Substituições**

```http
GET /substituicoes/calcular/:receitaId
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "macrosOriginal": {
    "calorias": 250,
    "proteinas": 15,
    "carboidratos": 30,
    "gorduras": 10,
    "fibras": 2,
    "sodio": 200
  },
  "macrosModificado": {
    "calorias": 220,
    "proteinas": 18,
    "carboidratos": 25,
    "gorduras": 8,
    "fibras": 3,
    "sodio": 180
  },
  "diferenca": {
    "calorias": -30,
    "proteinas": 3,
    "carboidratos": -5,
    "gorduras": -2,
    "fibras": 1,
    "sodio": -20
  }
}
```

### **Endpoint: Criar Substituição**

```http
POST /substituicoes
Authorization: Bearer {token}
Content-Type: application/json

{
  "receita_id": "uuid-da-receita",
  "ingrediente_original_id": "uuid-ingrediente-original",
  "ingrediente_substituto_id": "uuid-ingrediente-substituto",
  "quantidade": 200,
  "unidade": "g"
}
```

## 💡 Estratégias de Implementação

### **Opção 1: Banco Próprio (Recomendado - Já Implementado)**

**Vantagens:**
- ✅ Precisão garantida
- ✅ Custo zero após implementação
- ✅ Funciona offline
- ✅ Escalável

**Como funciona:**
1. Admin cadastra ingredientes com valores nutricionais
2. Admin associa ingredientes às receitas
3. Usuário substitui ingrediente
4. Sistema recalcula automaticamente

**Status:** ✅ Estrutura base implementada

### **Opção 2: Fallback com API Externa**

Para ingredientes não cadastrados, usar API USDA (gratuita):

```typescript
// Se ingrediente não está no banco:
1. Buscar na API USDA
2. Cachear resultado no banco
3. Usar para cálculo
```

**Status:** ⏳ Serviço USDA já existe, precisa integrar

### **Opção 3: IA para PREMIUM_FIT**

Para usuários premium, permitir perguntas em texto livre:

```
Usuário: "Posso trocar chocolate por morango?"
IA: Analisa e sugere substituição
Sistema: Busca valores nutricionais e calcula
```

**Status:** ⏳ Estrutura existe, precisa implementar integração IA

## 📊 Fluxo Completo de Uso

### **Cenário: Usuário quer substituir farinha de trigo por farinha de amêndoa**

```
1. Usuário abre receita no mobile
   ↓
2. Clica em "Substituir ingrediente" na farinha de trigo
   ↓
3. Sistema mostra opções pré-definidas:
   • Farinha de amêndoa ✅
   • Farinha de coco ✅
   • Farinha de aveia ✅
   ↓
4. Usuário escolhe "Farinha de amêndoa"
   ↓
5. Sistema calcula automaticamente:
   • Remove macros da farinha de trigo (200g)
   • Adiciona macros da farinha de amêndoa (200g)
   • Mostra diferença antes/depois
   ↓
6. Usuário confirma substituição
   ↓
7. Sistema salva substituição e recalcula receita
```

## 🔧 Melhorias Necessárias

### **1. Associar Ingredientes às Receitas Existentes**

Atualmente, as receitas têm ingredientes como texto livre. Precisamos:

- [ ] Criar script para associar ingredientes existentes às receitas
- [ ] Permitir que admin associe ingredientes manualmente
- [ ] Sistema de busca inteligente para identificar ingredientes no texto

### **2. Popular Banco com Ingredientes Comuns**

- [ ] Importar dados do TACO (Tabela Brasileira de Composição de Alimentos)
- [ ] Cadastrar ~200-600 ingredientes mais comuns
- [ ] Criar script de importação automática

### **3. Interface Mobile**

- [ ] Tela de substituição de ingredientes
- [ ] Mostrar comparação antes/depois
- [ ] Lista de substitutos sugeridos
- [ ] Histórico de substituições do usuário

### **4. Interface Admin**

- [ ] Tela de cadastro de ingredientes
- [ ] Tela de associação ingredientes ↔ receitas
- [ ] Campo para definir substitutos pré-definidos

## 📝 Próximos Passos Práticos

### **Passo 1: Popular Banco com Ingredientes**

```bash
# 1. Baixar TACO: http://www.nepa.unicamp.br/taco/tabela.php
# 2. Executar script de importação
cd api/scripts
node importar-taco.js caminho/para/taco.xls
```

### **Passo 2: Associar Ingredientes às Receitas**

Criar script que:
1. Lê ingredientes das receitas existentes (campo `ingredientes`)
2. Tenta identificar ingredientes no banco
3. Cria registros em `receita_ingredientes`

### **Passo 3: Testar Cálculo**

```bash
# Testar endpoint de cálculo
curl -X GET http://localhost:3001/substituicoes/calcular/{receitaId} \
  -H "Authorization: Bearer {token}"
```

## 🎯 Recomendações

### **Para MVP (Versão Inicial)**

1. **Começar simples:**
   - Cadastrar ~100 ingredientes mais comuns manualmente
   - Associar ingredientes às receitas principais
   - Permitir substituição apenas com ingredientes cadastrados

2. **Interface básica:**
   - Lista de substitutos pré-definidos
   - Cálculo automático de macros
   - Mostrar diferença antes/depois

### **Para Versão Completa**

1. **Importar TACO completo** (~600 ingredientes)
2. **Integrar API USDA** como fallback
3. **IA para PREMIUM_FIT** (diferencial premium)
4. **Sistema de busca inteligente** de ingredientes

## 📚 Documentação Técnica

- **Arquitetura completa:** `ARQUITETURA-SUBSTITUICAO-INGREDIENTES.md`
- **Resumo implementação:** `IMPLEMENTACAO-INGREDIENTES-RESUMO.md`
- **Código:** `api/src/ingredientes/`

---

**Status Atual:** ✅ Estrutura base implementada | ⏳ Precisa popular dados e criar interfaces

