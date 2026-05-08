# Fit & Rápido - Painel Administrativo

Painel web administrativo para gerenciamento de conteúdo da plataforma Fit & Rápido.

## 🎯 Funcionalidades

- **CRUD de Receitas**: Criar, editar e gerenciar receitas
- **CRUD de Treinos**: Criar, editar e gerenciar treinos
- **Categorias**: Gerenciar categorias de receitas e treinos
- **Notificações**: Enviar notificações push para usuários
- **Upload de Mídia**: Fazer upload de fotos e vídeos

## 🚀 Tecnologias

- **React** 19.1.0
- **Next.js** 15.5.3 (App Router)
- **TypeScript**
- **Tailwind CSS** 4
- **Vite** (via Turbopack)

## 📦 Instalação

```bash
npm install
```

## 🛠️ Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🏗️ Build

```bash
npm run build
npm start
```

## 📝 Estrutura

```
admin/
├── src/
│   ├── app/          # Páginas Next.js
│   └── components/   # Componentes React
├── public/           # Assets estáticos
└── package.json
```

## 🔗 Repositórios Relacionados

- [API Backend](../api) - API NestJS
- [App Mobile](../mobile) - App React Native
