# Fit & Rápido - App Mobile

Aplicativo móvel desenvolvido com React Native e Expo para iOS e Android.

## 🎯 Funcionalidades

- **Autenticação**: Login, cadastro, recuperação de senha
- **Receitas**: Visualizar receitas, favoritar, buscar e filtrar
- **Treinos**: Visualizar treinos, acompanhar exercícios
- **Calculadora de Macros**: Calcular macros diários
- **Favoritos**: Gerenciar receitas e treinos favoritos
- **Notificações**: Receber notificações push
- **Assinaturas**: Assinar planos Basic ou Premium

## 🚀 Tecnologias

- **React Native** - Framework mobile
- **Expo** - Toolchain e SDK
- **TypeScript** - Linguagem
- **React Navigation** - Navegação
- **Expo In-App Purchases** - Compras dentro do app
- **Firebase** - Notificações push

## 📦 Instalação

```bash
npm install
```

## 🛠️ Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npx expo start

# Escanear QR code com Expo Go
# Ou pressionar:
# - 'a' para Android Emulator
# - 'i' para iOS Simulator
```

## 📱 Testes

### Com Expo Go (Dispositivo Real)
1. Instale o Expo Go no seu celular
2. Execute `npx expo start`
3. Escaneie o QR code com o app

### Build de Desenvolvimento
```bash
# Android
eas build --profile development --platform android

# iOS (requer conta Apple Developer)
eas build --profile development --platform ios
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# API Backend
API_URL="http://localhost:3001"

# Firebase (FCM)
FIREBASE_API_KEY="sua-api-key"
FIREBASE_PROJECT_ID="seu-projeto-id"
```

## 📝 Estrutura

```
mobile/
├── src/
│   ├── screens/       # Telas do app
│   ├── components/    # Componentes reutilizáveis
│   ├── navigation/    # Configuração de navegação
│   ├── services/      # Chamadas de API
│   ├── hooks/         # Custom hooks
│   └── utils/         # Funções utilitárias
├── app.json           # Configuração do Expo
└── package.json
```

## 📦 Build para Produção

```bash
# Configurar EAS (primeira vez)
eas build:configure

# Build Android
eas build --profile production --platform android

# Build iOS
eas build --profile production --platform ios
```

## 🔗 Repositórios Relacionados

- [API Backend](../api) - API NestJS
- [Painel Admin](../admin) - Interface web administrativa

