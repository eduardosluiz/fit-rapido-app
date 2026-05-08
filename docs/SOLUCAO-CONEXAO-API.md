# 🔧 Solução para Problema de Conexão com a API

## 🐛 Problemas Identificados

1. **API não está rodando** - Nenhum processo Node encontrado na porta 3001
2. **URL incorreta** - Está usando `192.168.0.15:3001` em vez de `localhost:3001` no navegador
3. **Endpoint truncado** - Aparece `/auth/1` em vez de `/auth/login` (pode ser cache do navegador)

## ✅ Soluções

### 1. Iniciar a API

**IMPORTANTE:** A API precisa estar rodando para o app funcionar!

```powershell
cd api
npm run start:dev
```

Você deve ver:
```
🚀 API rodando em http://localhost:3001
```

### 2. Configurar URL Correta para Navegador

O código já detecta automaticamente quando está no navegador e usa `localhost:3001`. Mas se o arquivo `.env` tiver uma URL específica, ela será usada.

**Para usar no navegador, você tem duas opções:**

#### Opção A: Remover ou comentar o .env (Recomendado para navegador)
```powershell
cd mobile
# Renomear o arquivo temporariamente
Rename-Item .env .env.backup
```

#### Opção B: Atualizar o .env para localhost
```powershell
cd mobile
"EXPO_PUBLIC_API_URL=http://localhost:3001" | Out-File -FilePath .env -Encoding utf8 -NoNewline
```

### 3. Limpar Cache do Navegador

O endpoint aparecendo como `/auth/1` pode ser cache:

1. Pressione `Ctrl+Shift+R` para recarregar sem cache
2. Ou abra DevTools (F12) → Network → Marque "Disable cache"
3. Ou feche completamente o navegador e abra novamente

### 4. Verificar Banco de Dados Supabase

O banco está configurado corretamente no `api/.env`:
```
DATABASE_URL="postgresql://postgres:Fitrapido248622!@db.occddouiyqvcdhtxpbej.supabase.co:5432/postgres"
```

A autenticação do Supabase está funcionando - o problema é apenas a conexão da API.

## 🚀 Passos para Resolver

### Passo 1: Iniciar a API
```powershell
cd api
npm run start:dev
```

Aguarde até ver: `🚀 API rodando em http://localhost:3001`

### Passo 2: Limpar Cache do Mobile
```powershell
cd mobile
.\limpar-cache-rapido.ps1
```

### Passo 3: Atualizar .env para localhost (se necessário)
```powershell
cd mobile
"EXPO_PUBLIC_API_URL=http://localhost:3001" | Out-File -FilePath .env -Encoding utf8 -NoNewline
```

### Passo 4: Reiniciar o App Mobile
```powershell
cd mobile
npm start
```

Depois pressione `w` para abrir no navegador.

### Passo 5: Limpar Cache do Navegador
- Pressione `Ctrl+Shift+R` no navegador
- Ou feche e abra novamente

## ✅ Verificar se Funcionou

Os logs devem mostrar:
```
🔗 Web/Navegador detectado - usando: http://localhost:3001
🌐 Requisição: POST http://localhost:3001/auth/login
   API_URL: http://localhost:3001
   Endpoint: /auth/login
📥 Resposta: 200 OK
```

## 📝 Notas Importantes

1. **A API PRECISA estar rodando** - Sem ela, o app não funciona
2. **Porta 3001** - A API roda na porta 3001, não 8081
3. **Navegador usa localhost** - O código detecta automaticamente e usa `localhost:3001`
4. **Supabase está OK** - O banco de dados está configurado corretamente

## 🔍 Se Ainda Não Funcionar

1. Verifique se a API está realmente rodando:
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:3001/auth/login" -Method POST -Body '{"email":"test@test.com","senha":"test"}' -ContentType "application/json"
   ```
   Deve retornar `401 Unauthorized` (isso é normal, significa que a API está funcionando)

2. Verifique o firewall:
   - Certifique-se de que a porta 3001 não está bloqueada

3. Verifique os logs da API:
   - Olhe o terminal onde a API está rodando
   - Deve mostrar as requisições chegando




