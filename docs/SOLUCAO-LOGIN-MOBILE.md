# Solução para Erro de Login no Mobile

## Problema
O erro "Resposta vazia do servidor" ocorre quando o aplicativo mobile não consegue se conectar à API.

## Soluções

### 1. Verificar se a API está rodando

Certifique-se de que a API está rodando na porta 3001:

```bash
cd api
npm run start:dev
```

Você deve ver uma mensagem como:
```
[Nest] Application successfully started on http://localhost:3001
```

### 2. Configurar a URL da API corretamente

O aplicativo mobile precisa saber onde encontrar a API. A URL depende do ambiente:

#### Para Android Emulator:
- **URL padrão**: `http://10.0.2.2:3001` (já configurado automaticamente)
- O aplicativo detecta automaticamente se está rodando no Android

#### Para iOS Simulator:
- **URL padrão**: `http://localhost:3001` (já configurado automaticamente)
- O aplicativo detecta automaticamente se está rodando no iOS

#### Para Dispositivo Físico (Android ou iOS):
Você precisa usar o IP da sua máquina na rede local.

1. **Descobrir seu IP local:**
   - Windows: Execute `ipconfig` no PowerShell e procure por "IPv4"
   - Exemplo: `192.168.0.14`

2. **Criar arquivo `.env` na pasta `mobile/`:**
   ```
   EXPO_PUBLIC_API_URL=http://192.168.0.14:3001
   ```
   (Substitua `192.168.0.14` pelo seu IP real)

3. **Reiniciar o aplicativo mobile** após criar o `.env`

### 3. Verificar Firewall

Certifique-se de que o Windows Firewall não está bloqueando a porta 3001:

1. Abra "Firewall do Windows Defender"
2. Clique em "Configurações avançadas"
3. Verifique se há regras bloqueando a porta 3001
4. Se necessário, crie uma regra de entrada para a porta 3001

### 4. Verificar se API e Mobile estão na mesma rede

- **Emulador**: Não precisa estar na mesma rede (usa 10.0.2.2 ou localhost)
- **Dispositivo físico**: Precisa estar na mesma rede Wi-Fi que o computador

### 5. Testar a conexão

Após configurar, tente fazer login novamente. Os logs no console mostrarão:

```
🔗 API URL configurada: http://10.0.2.2:3001
🌐 Requisição: POST http://10.0.2.2:3001/auth/login
📥 Resposta: 200 OK
```

Se aparecer um erro de conexão, verifique:
- Se a API está rodando
- Se a URL está correta
- Se o firewall não está bloqueando

## Logs de Debug

O aplicativo agora mostra logs detalhados no console:

- 🔗 URL da API sendo usada
- 🌐 Requisições sendo feitas
- 📥 Respostas recebidas
- ❌ Erros de conexão com mensagens claras

## Próximos Passos

1. Verifique se a API está rodando
2. Se estiver usando dispositivo físico, crie o arquivo `.env` com seu IP
3. Reinicie o aplicativo mobile
4. Tente fazer login novamente
5. Verifique os logs no console para identificar o problema




