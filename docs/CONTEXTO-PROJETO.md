# 📋 Contexto e Planejamento do Projeto Fit & Rápido

Este documento contém todo o contexto, decisões arquiteturais e planejamento discutido para o desenvolvimento da plataforma.

## 🎯 Visão Geral do Projeto

Plataforma de área de membros "Fit & Rápido" para a Daiane Pohlmann, oferecendo:
- Receitas saudáveis (ebooks, vídeos)
- Treinos personalizados
- Sistema de assinaturas (Basic/Premium)
- App móvel (iOS/Android)

## 🏗️ Arquitetura Decidida

### Stack Tecnológica Final

```
┌─────────────────────────────────────────┐
│  1. APP MÓVEL (React Native + Expo)     │
│     → Para usuários finais              │
│     → Publicado nas lojas               │
└─────────────────────────────────────────┘
                  ↓ API REST
┌─────────────────────────────────────────┐
│  2. API BACKEND (NestJS + PostgreSQL)   │
│     → Endpoints padronizados            │
│     → Autenticação JWT                  │
│     → Lógica de negócio                 │
└─────────────────────────────────────────┘
                  ↓ API REST
┌─────────────────────────────────────────┐
│  3. PAINEL ADMIN WEB (React/Vite)        │
│     → Para cliente e personal trainer   │
│     → Hospedado como site estático      │
└─────────────────────────────────────────┘
```

### Tecnologias Escolhidas

- **App Mobile**: React Native + Expo (porque você já conhece React)
- **Backend**: NestJS (arquitetura padronizada, escalável)
- **Admin**: React/Vite (baseado no projeto Next.js existente)
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (não NextAuth)
- **Pagamentos**: In-App Purchases (Google Play / Apple) - NÃO Stripe
- **Notificações**: Firebase Cloud Messaging (FCM)

## 📝 Decisões Importantes

### Por que React Native e não Flutter?
- Você já conhece React/TypeScript
- Reaproveita 90% do conhecimento existente
- Curva de aprendizado quase zero
- Ecossistema JavaScript imenso

### Por que Admin separado (web) e não dentro do app?
- Cadastrar receitas no celular é muito difícil
- Separação de responsabilidades (consumir vs. criar)
- Mais seguro (endpoints admin separados)
- Melhor UX para tarefas administrativas

### Por que In-App Purchases e não Stripe?
- Obrigatório para apps nas lojas (Google/Apple)
- Renovação automática pelas lojas
- Não precisa processar pagamentos diretamente
- Taxa de 15-30% já incluída no preço

### Quando criar contas de developer?
- **Google Play**: Criar na Fase 7 (in-app purchases)
- **Apple Developer**: Criar na Fase 7 (in-app purchases)
- **Expo**: Conta gratuita, pode criar agora

## 🗺️ Roadmap de Desenvolvimento

### Fase 0: Decisões Arquiteturais ✅ (COMPLETA)
- [x] Definir stack tecnológica
- [x] Criar estrutura de pastas
- [x] Configurar repositórios Git separados

### Fase 1: Fundação - Backend e Autenticação (PRÓXIMA)
**Duração**: 2-3 semanas

**Objetivo**: API funcional com autenticação

**Tarefas Backend**:
- [ ] Setup do projeto NestJS
- [ ] Configurar PostgreSQL + TypeORM/Prisma
- [ ] Módulo de autenticação (JWT)
  - [ ] Login (email/senha)
  - [ ] Cadastro
  - [ ] Recuperação de senha
  - [ ] Login social (Google, Apple)
- [ ] Módulo de usuários
- [ ] Sistema de permissões/roles
- [ ] Documentação Swagger

**Padrão de Módulo NestJS**:
```typescript
receitas/
├── receitas.module.ts
├── receitas.controller.ts  // Endpoints REST
├── receitas.service.ts      // Lógica de negócio
├── entities/receita.entity.ts
└── dto/
    ├── create-receita.dto.ts
    └── update-receita.dto.ts
```

### Fase 2: Conteúdo - Receitas (API + Admin)
**Duração**: 2 semanas

**Objetivo**: Cliente consegue cadastrar receitas pelo admin

**Backend**:
- [ ] Módulo Receitas seguindo padrão
- [ ] CRUD completo
- [ ] Upload de imagens/vídeos
- [ ] Sistema de categorias
- [ ] Filtros e busca

**Admin**:
- [ ] Componente `FormularioGenerico` (padrão de cadastro)
- [ ] CRUD de receitas
- [ ] CRUD de categorias

### Fase 3: App Móvel - MVP de Receitas
**Duração**: 2-3 semanas

**Objetivo**: Usuário visualiza receitas no app

**Tarefas**:
- [ ] Setup React Native + Expo
- [ ] Autenticação (telas de login/cadastro)
- [ ] Componentes base reutilizáveis
- [ ] Componente `ListaGenerica` (padrão de listagem)
- [ ] Telas de receitas (lista, detalhe)

### Fase 4: Treinos - Replicando Padrão
**Duração**: 2 semanas

**Objetivo**: Adicionar treinos usando mesmo padrão

**Tarefas**:
- [ ] Módulo Treinos no backend
- [ ] CRUD no admin (usando FormularioGenerico)
- [ ] Telas no app (usando ListaGenerica)

### Fase 5: Funcionalidades do Usuário
**Duração**: 2 semanas

**Tarefas**:
- [ ] Sistema de favoritos
- [ ] Calculadora de macros
- [ ] Perfil e configurações

### Fase 6: Notificações Push
**Duração**: 1 semana

**Tarefas**:
- [ ] Setup Firebase FCM
- [ ] Endpoint de notificações no backend
- [ ] Handler no app

### Fase 7: Assinaturas e Pagamentos
**Duração**: 2 semanas

**Tarefas**:
- [ ] Configurar produtos no Google Play Console
- [ ] Configurar produtos no Apple App Store Connect
- [ ] Integração expo-in-app-purchases
- [ ] Validação de receipts no backend
- [ ] Controle de acesso premium

### Fase 8: Polimento e Publicação
**Duração**: 2-3 semanas

**Tarefas**:
- [ ] Correções de bugs
- [ ] Otimizações
- [ ] Builds de produção
- [ ] Submissão nas lojas

## 📊 Schemas do Banco de Dados

### Tabelas Principais

```sql
-- Usuários
usuarios (id, email, senha_hash, nome, role, subscription_tier, ...)

-- Receitas
receitas (id, titulo, descricao, ingredientes, modo_preparo, ...)
categorias_receitas (id, nome, slug)

-- Treinos
treinos (id, titulo, descricao, duracao, ...)
exercicios (id, treino_id, nome, series, repeticoes, video_url)
categorias_treinos (id, nome, slug)

-- Favoritos
favoritos (id, usuario_id, receita_id, treino_id)

-- Notificações
notification_tokens (id, usuario_id, token, plataforma)

-- Preferências
preferencias_usuarios (id, usuario_id, macros_calorias, ...)
```

## 🎨 Design System

### Paleta de Cores
- **Primary**: #c8921a (dourado)
- **Secondary**: #1a1a1a (preto)
- **Background**: #0f0f0f
- **Text**: #ffffff
- **Accent**: #f5e6cc

### Tipografias
- **Títulos**: 'Playfair Display', serif
- **Corpo**: 'Montserrat', sans-serif

## 🔧 Padrões de Desenvolvimento

### Backend (NestJS)
- Módulos padronizados para escalabilidade
- Cada módulo segue: Module → Controller → Service → Entity
- DTOs para validação de entrada

### Frontend (React Native)
- Componentes reutilizáveis em `/components`
- `ListaGenerica` para listagens padronizadas
- `FormularioGenerico` no admin para cadastros padronizados

### Git
- 3 repositórios separados no GitHub
- Branches: `main`, `develop`, `feature/*`, `fix/*`

## ❓ Perguntas Frequentes Respondidas

### Posso ver o app no navegador?
Não. React Native roda em dispositivo/emulador. Expo DevTools abre no navegador para controle, mas o app roda no celular.

### Preciso de contas de developer agora?
Não. Apenas quando for implementar in-app purchases (Fase 7).

### Posso testar antes de publicar?
Sim! Com Expo Go ou builds de desenvolvimento.

### Como funciona in-app purchases?
1. Usuário compra no app
2. Google/Apple processam pagamento
3. App recebe receipt
4. Backend valida receipt
5. Backend libera acesso premium

## 📚 Documentação Relacionada

- `README.md` - Visão geral
- `APPDAI.md` - Documentação completa
- `SETUP.md` - Guia de configuração
- `SETUP-GIT.md` - Instruções de Git

## 🚀 Próximos Passos Imediatos

1. ✅ Estrutura criada
2. ⏭️ **Próximo**: Inicializar projeto NestJS na pasta `api/`
3. ⏭️ Configurar PostgreSQL
4. ⏭️ Criar módulo de autenticação

## 💡 Dicas Importantes

- **Sempre** desenvolva seguindo os padrões estabelecidos
- **Reutilize** componentes e módulos existentes
- **Teste** em dispositivo real quando possível
- **Documente** código complexo
- **Mantenha** consistência visual com design system

---

**Última atualização**: 05/11/2025
**Status**: Estrutura criada, pronto para Fase 1

