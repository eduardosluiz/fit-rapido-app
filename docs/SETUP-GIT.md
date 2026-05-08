# Configuração Git - Projetos Separados

Este projeto contém **3 repositórios Git separados**, cada um em sua própria pasta.

## 📁 Estrutura

```
fit-rapido-app/
├── admin/     ← Repositório Git separado
├── api/       ← Repositório Git separado
└── mobile/    ← Repositório Git separado
```

## 🚀 Setup Inicial do Git

### 1. Criar repositórios no GitHub

Primeiro, crie os 3 repositórios vazios no GitHub:
- `fit-rapido-admin`
- `fit-rapido-api`
- `fit-rapido-mobile`

### 2. Inicializar Git em cada projeto

#### Admin
```bash
cd admin
git init
git branch -M main
git add .
git commit -m "Initial commit: Painel administrativo Fit & Rápido"
git remote add origin https://github.com/SEU-USUARIO/fit-rapido-admin.git
git push -u origin main
```

#### API
```bash
cd api
git init
git branch -M main
git add .
git commit -m "Initial commit: API Backend NestJS Fit & Rápido"
git remote add origin https://github.com/SEU-USUARIO/fit-rapido-api.git
git push -u origin main
```

#### Mobile
```bash
cd mobile
git init
git branch -M main
git add .
git commit -m "Initial commit: App React Native Fit & Rápido"
git remote add origin https://github.com/SEU-USUARIO/fit-rapido-mobile.git
git push -u origin main
```

## 🔄 Workflow de Desenvolvimento

### Trabalhando em um projeto específico

```bash
# Exemplo: trabalhar no admin
cd admin
git checkout -b feature/nova-funcionalidade
# ... fazer alterações ...
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade
```

### Atualizar todos os projetos

```bash
# Admin
cd admin
git pull origin main

# API
cd ../api
git pull origin main

# Mobile
cd ../mobile
git pull origin main
```

## 📝 Estrutura de Branches Recomendada

- `main` - Código de produção
- `develop` - Código de desenvolvimento
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `hotfix/*` - Correções urgentes

## ⚠️ Importante

- **NÃO** inicialize Git na pasta pai (`fit-rapido-app/`)
- Cada projeto tem seu próprio `.gitignore`
- Commits são feitos individualmente em cada projeto
- Pull requests são criados nos repositórios individuais do GitHub

