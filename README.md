# Fit & Rápido - Plataforma Completa

Plataforma de área de membros para receitas saudáveis e treinos personalizados.

## 📁 Estrutura do Projeto

Este repositório contém 3 projetos separados, cada um com seu próprio repositório Git:

```
fit-rapido-app/
├── admin/          # Painel administrativo web (React/Vite)
├── api/            # API backend (NestJS + PostgreSQL)
└── mobile/         # App móvel (React Native + Expo)
```

## 🎯 Visão Geral

### 📱 App Mobile (`mobile/`)
Aplicativo para iOS e Android onde os usuários:
- Visualizam receitas e treinos
- Assinam planos (Basic/Premium)
- Calculam macros
- Gerenciam favoritos

**Repositório**: `fit-rapido-mobile`

### 🖥️ Painel Admin (`admin/`)
Interface web para gerenciamento de conteúdo:
- CRUD de receitas
- CRUD de treinos
- Envio de notificações
- Gerenciamento de categorias

**Repositório**: `fit-rapido-admin`

### ⚙️ API Backend (`api/`)
API REST que gerencia:
- Autenticação (JWT)
- Receitas e treinos
- Assinaturas (validação in-app purchases)
- Notificações push (FCM)

**Repositório**: `fit-rapido-api`

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Conta Expo (gratuita)

### Desenvolvimento Local

```bash
# 1. Clonar os 3 repositórios
git clone https://github.com/seu-usuario/fit-rapido-api.git api
git clone https://github.com/seu-usuario/fit-rapido-admin.git admin
git clone https://github.com/seu-usuario/fit-rapido-mobile.git mobile

# 2. Configurar API
cd api
npm install
cp .env.example .env
# Editar .env com suas configurações
npm run start:dev

# 3. Configurar Admin
cd ../admin
npm install
npm run dev

# 4. Configurar Mobile
cd ../mobile
npm install
npx expo start
```

## 📚 Documentação

Cada projeto possui sua própria documentação:
- [API Documentation](./api/README.md)
- [Admin Documentation](./admin/README.md)
- [Mobile Documentation](./mobile/README.md)

Documentação completa do projeto: [APPDAI.md](./docs/APPDAI.md)

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│   Mobile App (React Native + Expo)      │
│   → Usuários finais                     │
└─────────────────────────────────────────┘
              ↓ API REST
┌─────────────────────────────────────────┐
│   API Backend (NestJS + PostgreSQL)     │
│   → Lógica de negócio                   │
└─────────────────────────────────────────┘
              ↓ API REST
┌─────────────────────────────────────────┐
│   Admin Panel (React/Vite)              │
│   → Cliente e Personal Trainer          │
└─────────────────────────────────────────┘
```

## 🔗 Repositórios GitHub

- [fit-rapido-api](https://github.com/seu-usuario/fit-rapido-api)
- [fit-rapido-admin](https://github.com/seu-usuario/fit-rapido-admin)
- [fit-rapido-mobile](https://github.com/seu-usuario/fit-rapido-mobile)

## 📝 Roadmap

Veja o roadmap completo em [APPDAI.md](./docs/APPDAI.md)

## 🤝 Contribuindo

Cada projeto possui seu próprio repositório Git. Faça commits e pull requests diretamente nos repositórios individuais.

## 📄 Licença

[Definir licença]

