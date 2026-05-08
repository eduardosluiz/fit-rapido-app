# 🚀 Próximos Passos - Sistema de Substituição de Ingredientes

## ✅ Fase 1: Estrutura Base - **COMPLETA**

- ✅ Entidades criadas (`Ingrediente`, `ReceitaIngrediente`, `SubstituicaoUsuario`, etc.)
- ✅ Migrations executadas
- ✅ Serviços criados (`IngredientesService`, `SubstituicoesService`, etc.)
- ✅ Endpoints da API criados
- ✅ **582 ingredientes importados do TACO** 🎉

---

## 🔄 Fase 2: Fallback API Nutricional (USDA) - **EM ANDAMENTO**

### ✅ O que foi feito:
- ✅ Criado `USDAService` para buscar dados nutricionais na API USDA FoodData Central
- ✅ Integrado com `IngredientesService.buscarOuCriarIngrediente()`
- ✅ Sistema de cache implementado

### ⚠️ Configuração necessária (opcional):

A API USDA funciona **sem API key** para buscas básicas, mas recomenda-se cadastrar uma (gratuita):

1. Acesse: https://fdc.nal.usda.gov/api-guide.html
2. Cadastre-se e obtenha sua API key
3. Adicione no `api/.env`:
   ```env
   USDA_API_KEY=sua_api_key_aqui
   ```

**Nota**: O sistema funciona sem API key, mas pode ter limitações de rate limit.

---

## 📋 Fase 3: Interface Admin - **PRÓXIMA**

### O que precisa ser feito:

#### 1. **Tela de Cadastro de Ingredientes** (`admin/src/app/ingredientes/page.tsx`)
- Listar ingredientes cadastrados
- Formulário para cadastrar novo ingrediente
- Campos: nome, calorias, proteínas, carboidratos, gorduras, fibras, sódio
- Busca/filtro de ingredientes
- Opção de editar/excluir

#### 2. **Tela de Associação Ingredientes ↔ Receitas** (`admin/src/app/receitas/[id]/ingredientes/page.tsx`)
- Listar ingredientes da receita atual
- Adicionar ingrediente à receita (buscar do banco ou criar novo)
- Definir quantidade e unidade
- Definir substitutos pré-definidos (múltipla seleção)
- Reordenar ingredientes (campo `ordem`)
- Remover ingrediente da receita

#### 3. **Melhorias na Tela de Cadastro de Receitas**
- Adicionar seção "Ingredientes" no formulário
- Permitir associar ingredientes durante o cadastro
- Mostrar macros calculados automaticamente

---

## 🎯 Ordem Recomendada de Implementação:

1. **Tela de Cadastro de Ingredientes** (mais simples, base para o resto)
2. **Tela de Associação Ingredientes ↔ Receitas** (usa a tela anterior)
3. **Integração no Cadastro de Receitas** (melhoria)

---

## 📝 Endpoints da API Disponíveis:

### Ingredientes:
- `GET /ingredientes` - Listar ingredientes (com busca)
- `GET /ingredientes/:id` - Detalhes de um ingrediente
- `POST /ingredientes` - Criar ingrediente
- `PATCH /ingredientes/:id` - Atualizar ingrediente
- `DELETE /ingredientes/:id` - Excluir ingrediente

### Receita-Ingredientes:
- `GET /receitas/:receitaId/ingredientes` - Listar ingredientes de uma receita
- `POST /receitas/:receitaId/ingredientes` - Adicionar ingrediente à receita
- `PATCH /receitas/:receitaId/ingredientes/:id` - Atualizar ingrediente da receita
- `DELETE /receitas/:receitaId/ingredientes/:id` - Remover ingrediente da receita

### Substituições:
- `POST /substituicoes/calcular` - Calcular macros após substituição
- `GET /substituicoes/usuario/:usuarioId` - Listar substituições do usuário

---

## 🔍 Testes Recomendados:

1. **Testar busca de ingrediente não cadastrado**:
   - Tentar buscar "quinoa" (se não estiver no TACO)
   - Verificar se busca na API USDA
   - Verificar se cria automaticamente no banco

2. **Testar cálculo de macros**:
   - Criar uma receita com ingredientes associados
   - Fazer uma substituição via API
   - Verificar se os macros são recalculados corretamente

---

## 📚 Documentação:

- Arquitetura completa: `ARQUITETURA-SUBSTITUICAO-INGREDIENTES.md`
- Resumo da Fase 1: `IMPLEMENTACAO-INGREDIENTES-RESUMO.md`
- Instruções de importação TACO: `api/scripts/README-IMPORTACAO-TACO.md`

---

**Status Atual**: Pronto para iniciar Fase 3 (Interface Admin) 🎯

