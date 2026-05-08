# Configuração do Ambiente de Desenvolvimento

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** ou **yarn**
- **PostgreSQL** 14+ (para API)
- **Git**
- **Expo CLI** (para mobile): `npm install -g expo-cli`

## 🚀 Setup Rápido

### 1. Clone os repositórios (se ainda não fez)

```bash
# Criar estrutura de pastas
mkdir fit-rapido-app
cd fit-rapido-app

# Clonar repositórios (substitua SEU-USUARIO)
git clone https://github.com/SEU-USUARIO/fit-rapido-api.git api
git clone https://github.com/SEU-USUARIO/fit-rapido-admin.git admin
git clone https://github.com/SEU-USUARIO/fit-rapido-mobile.git mobile
```

### 2. Configurar API

```bash
cd api

# Instalar NestJS CLI globalmente (se ainda não tiver)
npm install -g @nestjs/cli

# Criar projeto NestJS
nest new . --skip-git

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar em desenvolvimento
npm run start:dev
```

### 3. Configurar Admin

```bash
cd ../admin

# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev
```

### 4. Configurar Mobile

```bash
cd ../mobile

# Instalar dependências
npm install

# Instalar Expo CLI globalmente (se ainda não tiver)
npm install -g expo-cli

# Iniciar servidor Expo
npx expo start

# Escanear QR code com Expo Go no celular
# Ou pressionar 'a' para Android / 'i' para iOS
```

## 🔐 Variáveis de Ambiente

### API (`api/.env`)

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/fitrapido_db"
PORT=3001
JWT_SECRET="seu-secret-super-seguro"
JWT_EXPIRES_IN="7d"
```

### Admin (`admin/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### Mobile (`mobile/.env`)

```env
API_URL="http://localhost:3001"
```

## 📦 Comandos Úteis

### API
```bash
npm run start:dev    # Desenvolvimento com watch
npm run build        # Build para produção
npm run start:prod   # Executar produção
npm run test         # Executar testes
```

### Admin
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Executar produção
npm run lint         # Verificar código
```

### Mobile
```bash
npx expo start       # Iniciar servidor
npx expo start --android  # Abrir Android
npx expo start --ios      # Abrir iOS
eas build --profile development --platform android  # Build desenvolvimento
```

## 🐛 Troubleshooting

### Erro de porta já em uso
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Erro de módulos não encontrados
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problemas com Expo
```bash
# Limpar cache do Expo
npx expo start --clear
```

