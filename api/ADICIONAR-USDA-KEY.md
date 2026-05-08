# 🔑 Adicionar Chave da API USDA

## Passo 1: Adicionar no arquivo `.env`

Abra o arquivo `api/.env` e adicione a linha:

```env
USDA_API_KEY=xGN5NigwU7LPROAsha5sMxaWSz6AhYiycl8CgXbX
```

**Localização do arquivo**: `api/.env`

---

## Passo 2: Verificar se foi adicionado

O arquivo `.env` deve conter algo assim:

```env
DATABASE_URL=postgresql://...
PORT=3001
JWT_SECRET=...
# ... outras variáveis ...

# API USDA
USDA_API_KEY=xGN5NigwU7LPROAsha5sMxaWSz6AhYiycl8CgXbX
```

---

## ✅ Pronto!

Após adicionar, reinicie a API para que a chave seja carregada.

