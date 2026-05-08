# Fit & Rápido - API Backend

API REST desenvolvida com NestJS para gerenciar receitas, treinos, usuários e assinaturas.

## 🎯 Funcionalidades

- **Autenticação**: Login, cadastro, recuperação de senha (JWT)
- **Receitas**: CRUD completo de receitas
- **Treinos**: CRUD completo de treinos
- **Usuários**: Gerenciamento de perfis e preferências
- **Assinaturas**: Validação de in-app purchases (Google Play / Apple)
- **Notificações**: Envio de notificações push via FCM

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **PostgreSQL** - Banco de dados
- **TypeORM/Prisma** - ORM
- **JWT** - Autenticação
- **Firebase Admin SDK** - Notificações push

## 📦 Instalação

```bash
npm install
```

## 🛠️ Desenvolvimento

```bash
# Desenvolvimento com watch
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/fitrapido_db"

# JWT
JWT_SECRET="seu-secret-super-seguro"
JWT_EXPIRES_IN="7d"

# API
PORT=3001
API_URL="http://localhost:3001"

# Firebase (FCM)
FIREBASE_PROJECT_ID="seu-projeto-id"
FIREBASE_PRIVATE_KEY="sua-chave-privada"
FIREBASE_CLIENT_EMAIL="seu-email@projeto.iam.gserviceaccount.com"

# Google Play (In-App Purchases)
GOOGLE_PLAY_SERVICE_ACCOUNT="path/to/service-account.json"

# Apple App Store (In-App Purchases)
APPLE_SHARED_SECRET="seu-shared-secret"
```

## 📝 Estrutura

```
api/
├── src/
│   ├── auth/          # Módulo de autenticação
│   ├── receitas/      # Módulo de receitas
│   ├── treinos/       # Módulo de treinos
│   ├── usuarios/      # Módulo de usuários
│   ├── subscriptions/ # Módulo de assinaturas
│   └── common/        # Utilitários compartilhados
├── prisma/            # Schema do Prisma (se usar)
└── package.json
```

## 🔗 Repositórios Relacionados

- [Painel Admin](../admin) - Interface web administrativa
- [App Mobile](../mobile) - App React Native

