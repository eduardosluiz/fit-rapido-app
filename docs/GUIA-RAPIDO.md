# 🚀 Guia Rápido - Como Continuar o Desenvolvimento

Este arquivo serve como referência rápida para continuar o trabalho no projeto.

## 📍 Onde Estamos

- ✅ **Fase 0**: COMPLETA - Estrutura criada
- ⏭️ **Próxima**: Fase 1 - Fundação (Backend e Autenticação)

## 🎯 Próxima Tarefa: Inicializar API NestJS

### Passo 1: Navegar para a pasta API
```bash
cd api
```

### Passo 2: Instalar NestJS CLI (se ainda não tiver)
```bash
npm install -g @nestjs/cli
```

### Passo 3: Criar projeto NestJS
```bash
nest new . --skip-git
```

### Passo 4: Instalar dependências adicionais
```bash
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install class-validator class-transformer
npm install bcrypt
npm install --save-dev @types/passport-jwt @types/bcrypt
```

### Passo 5: Configurar banco de dados
- Criar arquivo `.env` com variáveis de ambiente
- Configurar TypeORM no `app.module.ts`

## 📝 Padrão de Módulo NestJS

Quando criar novos módulos (Receitas, Treinos, etc.), siga este padrão:

```
modulo/
├── modulo.module.ts
├── modulo.controller.ts
├── modulo.service.ts
├── entities/
│   └── modulo.entity.ts
└── dto/
    ├── create-modulo.dto.ts
    └── update-modulo.dto.ts
```

## 🔄 Como Continuar Trabalhando

### No Cursor
1. Abra a pasta `fit-rapido-app`
2. Navegue até a pasta do projeto que está trabalhando (`api`, `admin`, ou `mobile`)
3. Use o Cursor para ajudar com código (ele lembra o contexto)

### Comandos Úteis
```bash
# Ver estrutura criada
cd fit-rapido-app
tree /F  # Windows
# ou
ls -R    # Linux/Mac

# Trabalhar em cada projeto
cd api && npm run start:dev
cd admin && npm run dev
cd mobile && npx expo start
```

## 📚 Documentação de Referência

- `CONTEXTO-PROJETO.md` - Todo o contexto e decisões
- `APPDAI.md` - Documentação completa do projeto
- `SETUP.md` - Configuração do ambiente
- `SETUP-GIT.md` - Instruções de Git

## 💬 Pedindo Ajuda ao Cursor

Você pode pedir ajuda assim:

```
"Preciso criar o módulo de autenticação no NestJS seguindo o padrão que definimos"
```

```
"Quero criar o componente ListaGenerica no React Native para listar receitas"
```

```
"Preciso configurar o PostgreSQL na API"
```

O Cursor tem acesso ao contexto através deste arquivo e outros documentos do projeto.

## ✅ Checklist de Início

Antes de começar a Fase 1:

- [ ] Abrir pasta `fit-rapido-app` no Cursor
- [ ] Verificar estrutura de pastas (`admin`, `api`, `mobile`)
- [ ] Ler `CONTEXTO-PROJETO.md` para entender decisões
- [ ] Ter PostgreSQL instalado e rodando
- [ ] Ter Node.js 18+ instalado
- [ ] Estar pronto para criar projeto NestJS

---

**Dica**: Mantenha este arquivo atualizado conforme o projeto avança!

