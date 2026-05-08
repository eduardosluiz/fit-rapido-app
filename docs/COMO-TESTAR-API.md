# 🧪 Como Testar a API - Fit & Rápido

## ❌ Problema Comum: Erro 404 ao Acessar `/auth/login`

### Por que acontece?

Quando você acessa `http://localhost:3001/auth/login` diretamente no navegador, ele faz uma requisição **GET**. Porém, o endpoint `/auth/login` é um **POST**, não GET. Por isso você recebe o erro 404.

### ✅ Soluções

## 1. Página de Teste HTML (Mais Fácil)

Acesse no navegador:
```
http://localhost:3001/public/test-api.html
```

Esta página permite testar todos os endpoints de autenticação diretamente no navegador com uma interface amigável.

## 2. Documentação da API

Acesse no navegador:
```
http://localhost:3001/auth
```

Você verá informações sobre os endpoints disponíveis e exemplos de uso.

## 3. Usando cURL (Terminal)

### Cadastrar Usuário
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"teste@example.com\",\"nome\":\"Usuário Teste\",\"senha\":\"senha123\"}"
```

### Fazer Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"teste@example.com\",\"senha\":\"senha123\"}"
```

### Obter Perfil (com token)
```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 4. Usando Postman ou Insomnia

### Configuração:
- **URL Base**: `http://localhost:3001`
- **Método**: POST (para login e register)
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):

Para Login:
```json
{
  "email": "teste@example.com",
  "senha": "senha123"
}
```

Para Cadastro:
```json
{
  "email": "teste@example.com",
  "nome": "Usuário Teste",
  "senha": "senha123"
}
```

## 5. Usando JavaScript/Fetch

```javascript
// Login
const response = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'teste@example.com',
    senha: 'senha123'
  })
});

const data = await response.json();
console.log(data);
```

## 📋 Endpoints Disponíveis

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/auth` | Documentação dos endpoints | ❌ |
| POST | `/auth/register` | Cadastrar novo usuário | ❌ |
| POST | `/auth/login` | Fazer login | ❌ |
| GET | `/auth/profile` | Obter perfil do usuário | ✅ |

## 🔑 Resposta do Login

Quando você faz login com sucesso, recebe:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "teste@example.com",
    "nome": "Usuário Teste",
    "role": "user",
    "subscription_tier": "basic"
  }
}
```

Use o `access_token` no header `Authorization: Bearer TOKEN` para acessar endpoints protegidos.

## 🚨 Erros Comuns

### 404 Not Found
- **Causa**: Tentando acessar endpoint POST via GET (navegador)
- **Solução**: Use a página de teste HTML ou ferramentas como Postman

### 401 Unauthorized
- **Causa**: Token inválido ou ausente
- **Solução**: Faça login novamente e use o token correto

### 400 Bad Request
- **Causa**: Dados inválidos no body
- **Solução**: Verifique o formato JSON e os campos obrigatórios

---

**Dica**: Use a página de teste em `http://localhost:3001/public/test-api.html` para começar rapidamente! 🚀

