# ✅ Receita Convertida e Pronta!

A receita **🍔 Hambúrguer Caseiro da Dai** foi convertida e adicionada ao arquivo `scripts/receitas.json`.

## 📋 Resumo da Conversão

- ✅ **Título**: Mantido com emoji
- ✅ **Descrição**: Extraída corretamente
- ✅ **Ingredientes**: 8 itens (incluindo ingredientes do molho)
- ✅ **Modo de Preparo**: 9 passos detalhados
- ✅ **Tempo**: 10 minutos
- ✅ **Porções**: 6 hambúrgueres médios
- ✅ **Dificuldade**: Fácil
- ✅ **Tipo de Refeição**: Almoço (lunch)
- ✅ **Tags**: hambúrguer, caseiro, congelar, rápido, proteico

## 🚀 Próximos Passos

### 1. Verificar Credenciais de Admin

Certifique-se de que o arquivo `api/.env` contém:

```env
ADMIN_EMAIL=seu-email@admin.com
ADMIN_PASSWORD=sua-senha-admin
API_URL=http://localhost:3001
```

### 2. Iniciar a API (se não estiver rodando)

```bash
cd api
npm run start:dev
```

### 3. Executar o Script de Cadastro

```bash
# Na raiz do projeto
node scripts/cadastrar-receitas.js
```

## 📝 Adicionar Mais Receitas

Para adicionar mais receitas, você pode:

1. **Enviar mais receitas aqui no chat** (mesmo formato)
2. **Editar manualmente** o arquivo `scripts/receitas.json` e adicionar mais objetos ao array

### Formato para Adicionar Mais Receitas:

```json
[
  {
    "titulo": "🍔 Hambúrguer Caseiro da Dai",
    ...
  },
  {
    "titulo": "Nova Receita",
    "descricao": "...",
    "ingredientes": [...],
    "modo_preparo": [...],
    ...
  }
]
```

## ✨ Dica

Você pode enviar múltiplas receitas de uma vez! Basta seguir o mesmo formato e eu converto todas de uma vez.

---

**Pronto para cadastrar!** 🎉




