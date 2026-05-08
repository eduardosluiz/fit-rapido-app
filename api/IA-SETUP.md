# 🤖 Configuração do Assistente de IA

Este documento explica como configurar o Assistente de IA para substituições de ingredientes.

## 📋 Pré-requisitos

1. Conta na OpenAI (https://platform.openai.com/)
2. Chave de API da OpenAI

## 🔑 Configuração

### 1. Obter Chave de API da OpenAI

1. Acesse https://platform.openai.com/api-keys
2. Faça login na sua conta OpenAI
3. Clique em "Create new secret key"
4. Copie a chave gerada (ela só será mostrada uma vez!)

### 2. Configurar Variável de Ambiente

Adicione a seguinte variável ao seu arquivo `.env` na pasta `api/`:

```env
OPENAI_API_KEY=sk-sua-chave-aqui
```

**⚠️ IMPORTANTE**: Nunca commite a chave de API no Git! Ela deve estar no `.env` que está no `.gitignore`.

### 3. Reiniciar o Servidor

Após adicionar a variável de ambiente, reinicie o servidor da API:

```bash
cd api
npm run start:dev
```

Você deve ver no console:
```
✅ OpenAI configurado com sucesso
```

Se não configurar a chave, você verá:
```
⚠️ OPENAI_API_KEY não configurada. Funcionalidade de IA desabilitada.
```

## 🎯 Como Funciona

O Assistente de IA usa o modelo `gpt-4o-mini` da OpenAI, que é:
- ✅ Mais econômico que o GPT-4 completo
- ✅ Mais rápido para respostas
- ✅ Adequado para tarefas de culinária e nutrição

### Fluxo de Funcionamento

1. Usuário faz uma pergunta sobre substituição de ingredientes
2. Sistema busca informações da receita (ingredientes, macros, etc.)
3. Envia contexto completo para a OpenAI
4. OpenAI gera resposta personalizada
5. Resposta é salva no banco de dados
6. Resposta é retornada ao usuário

## 💰 Custos

O modelo `gpt-4o-mini` tem os seguintes custos (atualizado em 2024):
- **Input**: ~$0.15 por 1M tokens
- **Output**: ~$0.60 por 1M tokens

Uma consulta típica usa aproximadamente:
- **Input**: ~500-1000 tokens
- **Output**: ~200-500 tokens

**Custo estimado por consulta**: ~$0.0005 - $0.001 (menos de 1 centavo)

## 🔒 Segurança

- ✅ A chave de API nunca é exposta ao frontend
- ✅ Todas as requisições passam pela autenticação JWT
- ✅ Rate limiting aplicado (via ThrottlerModule)
- ✅ Logs de consultas são salvos no banco de dados

## 🐛 Troubleshooting

### Erro: "OPENAI_API_KEY não configurada"

**Solução**: Verifique se a variável está no arquivo `.env` e reinicie o servidor.

### Erro: "Invalid API Key"

**Solução**: Verifique se a chave está correta e se não expirou. Gere uma nova chave se necessário.

### Erro: "Rate limit exceeded"

**Solução**: Você atingiu o limite de requisições da OpenAI. Aguarde alguns minutos ou verifique seu plano na OpenAI.

### Respostas genéricas ou sem contexto

**Solução**: Verifique se a receita tem ingredientes cadastrados corretamente no banco de dados.

## 📚 Endpoints Disponíveis

### POST `/ingredientes/ia/consulta`
Cria uma nova consulta de IA.

**Body**:
```json
{
  "receita_id": "uuid-da-receita",
  "pergunta": "Posso substituir açúcar por mel?"
}
```

### GET `/ingredientes/ia/consultas`
Lista todas as consultas do usuário autenticado.

### GET `/ingredientes/ia/consultas/receita/:receitaId`
Lista consultas de uma receita específica.

### PATCH `/ingredientes/ia/consultas/:id/aplicar`
Marca uma consulta como aplicada (quando o usuário aplica a substituição sugerida).

## 🚀 Próximos Passos

- [ ] Implementar cache de respostas similares
- [ ] Adicionar suporte a outros modelos de IA (Claude, Gemini)
- [ ] Extrair automaticamente informações de substituição da resposta
- [ ] Adicionar métricas de uso e custos



