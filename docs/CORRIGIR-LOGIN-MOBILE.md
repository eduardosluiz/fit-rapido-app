# 🔧 Correção do Problema de Login no Mobile

## 🐛 Problema Identificado

O arquivo `.env` na pasta `mobile/` estava com a URL da API **incorreta**:

**❌ ERRADO:**
```
EXPO_PUBLIC_API_URL=192.168.0.15:3001image.png
```

**✅ CORRETO:**
```
EXPO_PUBLIC_API_URL=http://192.168.0.15:3001
```

### Problemas na URL incorreta:
1. ❌ Falta o protocolo `http://` no início
2. ❌ Tem `image.png` no final (provavelmente copiado de algum lugar errado)
3. ❌ Isso fazia a requisição falhar e retornar HTML em vez de JSON

## ✅ Solução

### Opção 1: Executar o Script de Correção (Recomendado)

Execute o script PowerShell na pasta `mobile/`:

```powershell
cd mobile
.\corrigir-env.ps1
```

### Opção 2: Criar Manualmente

1. Abra a pasta `mobile/` no explorador de arquivos
2. Crie um arquivo chamado `.env` (sem extensão, começando com ponto)
3. Adicione o seguinte conteúdo:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.0.15:3001
   ```
4. Salve o arquivo

### Opção 3: Usar PowerShell

Execute no PowerShell na pasta `mobile/`:

```powershell
cd mobile
"EXPO_PUBLIC_API_URL=http://192.168.0.15:3001" | Out-File -FilePath .env -Encoding utf8 -NoNewline
```

## 🔄 Após Corrigir

**IMPORTANTE:** Você precisa **reiniciar o aplicativo mobile** para que as mudanças tenham efeito:

1. Pare o Metro bundler (Ctrl+C no terminal onde está rodando)
2. Execute novamente: `npm start` na pasta `mobile/`
3. Recarregue o aplicativo no dispositivo/emulador

## 🧪 Verificar se Funcionou

Após reiniciar, os logs devem mostrar:

```
🔗 API URL configurada: http://192.168.0.15:3001
🌐 Requisição: POST http://192.168.0.15:3001/auth/login
📥 Resposta: 200 OK
   Content-Type: application/json
```

Se ainda aparecer `text/html` ou URL incorreta, verifique:
- Se o arquivo `.env` foi criado corretamente
- Se reiniciou o aplicativo após criar o arquivo
- Se a API está rodando na porta 3001

## 📝 Notas

- O IP `192.168.0.15` é o IP da sua máquina na rede local
- Se mudar de rede Wi-Fi, pode precisar atualizar o IP
- Para emulador Android, pode usar `http://10.0.2.2:3001` (detectado automaticamente)
- Para iOS Simulator, pode usar `http://localhost:3001` (detectado automaticamente)




