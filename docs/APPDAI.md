# Projeto: Plataforma de Área de Membros "Fit & Rápido"

## 🎯 Visão Geral do Projeto

Criar uma plataforma híbrida (web + mobile) de área de membros para a Daiane Pohlmann, baseada no design existente da landing page, oferecendo receitas, vídeos e treinos em parceria com personal trainer.

## 🎨 Design e Layout Base

### Paleta de Cores (Reutilizar do site atual)
```css
:root {
    --primary-color: #c8921a;
    --secondary-color: #1a1a1a;
    --text-color: #ffffff;
    --bg-color: #0f0f0f;
    --section-bg: #1a1a1a;
    --card-bg: #1a1a1a;
    --card-border: #2a2a2a;
    --shadow: rgba(0, 0, 0, 0.3);
    --shadow-gold: rgba(200, 146, 26, 0.3);
    --color-primary: #c8921a;
    --color-secondary: #1a1a1a;
    --color-accent: #f5e6cc;
    --color-background: #0f0f0f;
    --color-background-alt: #1a1a1a;
    --color-text: #ffffff;
    --color-text-light: #cccccc;
    --color-light: #ffffff;
    --font-primary: 'Montserrat', sans-serif;
    --font-heading: 'Playfair Display', serif;
    --header-height: 80px;
    --color-gray: #666666;
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 6px 12px rgba(0, 0, 0, 0.15);
    --transition-default: all 0.3s ease;
    --border-color: #2a2a2a;
    --header-bg: rgba(15, 15, 15, 0.95);
}
```

### Tipografias
- **Títulos**: 'Playfair Display', serif
- **Corpo**: 'Montserrat', sans-serif

### Componentes Visuais (Reutilizar do CSS atual)
- Cards com bordas douradas e sombras
- Animações suaves (fadeIn, slideIn)
- Botões com gradientes dourados
- Ícones Boxicons e Font Awesome
- Sistema de grid responsivo
- Efeitos hover com transformações
- Gradientes e sombras douradas

## 🏗️ Arquitetura Técnica

### Stack Recomendado
- **Frontend**: Next.js 14+ com App Router
- **Styling**: Tailwind CSS + CSS Modules (baseado no design atual)
- **PWA**: Next-PWA
- **Autenticação**: NextAuth.js
- **Pagamentos**: Stripe
- **Banco de Dados**: PostgreSQL + Prisma
- **CMS**: Strapi ou Sanity
- **Vídeos**: Vimeo API ou YouTube API
- **Deploy**: Vercel

### Estrutura de Pastas
fit-rapido-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── recipes/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   └── search/
│   │   ├── workouts/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   └── schedule/
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   └── settings/
│   │   └── shop/
│   │       ├── page.tsx
│   │       └── checkout/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── features/
│   │       ├── RecipeCard.tsx
│   │       ├── VideoPlayer.tsx
│   │       ├── WorkoutCard.tsx
│   │       └── SubscriptionCard.tsx
│   ├── lib/
│   │   ├── auth/
│   │   │   └── config.ts
│   │   ├── stripe/
│   │   │   └── config.ts
│   │   └── utils/
│   │       ├── cn.ts
│   │       └── validations.ts
│   └── styles/
│       ├── globals.css
│       └── components.css
├── public/
│   ├── images/
│   │   ├── recipes/
│   │   ├── workouts/
│   │   └── avatars/
│   └── videos/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## Funcionalidades Principais

### 1. Sistema de Autenticação
- Login com email/senha
- Login social (Google, Facebook)
- Recuperação de senha
- Verificação de email
- Perfis de usuário
- Logout seguro

### 2. Dashboard Principal
- Resumo de atividades
- Receitas em destaque
- Treinos recentes
- Progresso do usuário
- Notificações
- Estatísticas de uso

### 3. Seção de Receitas
- **Ebooks**: Visualização de PDFs
- **Vídeos**: Player customizado
- **Busca**: Por ingredientes, categoria, dificuldade
- **Filtros**: Sem glúten, vegano, proteico
- **Favoritos**: Sistema de favoritos
- **Compartilhamento**: Links para redes sociais

### 4. Seção de Treinos
- **Vídeos de exercícios**
- **Planos de treino** personalizados
- **Acompanhamento de progresso**
- **Agendamento** com personal trainer
- **Categorias**: Cardio, Musculação, Funcional, Yoga
- **Timer**: Cronômetro para exercícios
- **Histórico**: Registro de treinos realizados

### 5. Sistema de Assinaturas
- **Plano Básico**: R$ 29,90/mês
  - Receitas básicas
  - Ebooks
  - Suporte por email
- **Plano Premium**: R$ 49,90/mês
  - Todas as receitas
  - Vídeos exclusivos
  - Treinos personalizados
  - Suporte prioritário
  - Acesso a personal trainer

### 6. Perfil do Usuário
- Dados pessoais
- Preferências alimentares
- Objetivos de treino
- Histórico de atividades
- Configurações de notificação
- Gerenciamento de assinatura

## Componentes de UI (Baseados no Design Atual)

### RecipeCard Component
```jsx
const RecipeCard = ({ recipe, isPremium }) => {
    return (
        <div className="recipe-card animate-on-scroll">
            <div className="recipe-image" style={{backgroundImage: `url(${recipe.coverImage})`}}>
                {recipe.videoUrl && (
                    <div className="video-overlay">
                        <PlayButton />
                    </div>
                )}
                {isPremium && <PremiumBadge />}
            </div>
            <div className="recipe-content">
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>
                <div className="recipe-meta">
                    <span><i className="bx bx-time"></i> {recipe.prepTime}min</span>
                    <span><i className="bx bx-dumbbell"></i> {recipe.difficulty}</span>
                </div>
            </div>
        </div>
    );
};
```

### VideoPlayer Component
```jsx
const VideoPlayer = ({ videoUrl, title, isPremium }) => {
    return (
        <div className="video-player">
            <div className="video-container">
                <iframe src={videoUrl} />
            </div>
            <div className="video-info">
                <h3>{title}</h3>
                {isPremium && <PremiumBadge />}
            </div>
        </div>
    );
};
```

### WorkoutCard Component
```jsx
const WorkoutCard = ({ workout, isPremium }) => {
    return (
        <div className="workout-card animate-on-scroll">
            <div className="workout-image" style={{backgroundImage: `url(${workout.coverImage})`}}>
                <div className="workout-overlay">
                    <PlayButton />
                </div>
                {isPremium && <PremiumBadge />}
            </div>
            <div className="workout-content">
                <h3>{workout.title}</h3>
                <p>{workout.description}</p>
                <div className="workout-meta">
                    <span><i className="bx bx-time"></i> {workout.duration}min</span>
                    <span><i className="bx bx-dumbbell"></i> {workout.difficulty}</span>
                </div>
            </div>
        </div>
    );
};
```

## 📊 Estrutura de Dados

### Recipe Schema
```typescript
interface Recipe {
    id: string;
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    images: string[];
    videoUrl?: string;
    category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
    difficulty: 'easy' | 'medium' | 'hard';
    prepTime: number;
    cookTime: number;
    servings: number;
    isPremium: boolean;
    tags: string[];
    rating: number;
    reviews: Review[];
    createdAt: Date;
    updatedAt: Date;
}
```

### Workout Schema
```typescript
interface Workout {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: 'cardio' | 'strength' | 'functional' | 'yoga';
    equipment: string[];
    isPremium: boolean;
    trainer: string;
    exercises: Exercise[];
    createdAt: Date;
}
```

### User Schema
```typescript
interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    subscription: 'basic' | 'premium' | null;
    preferences: {
        dietary: string[];
        fitness: string[];
        notifications: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}
```

## 🗓️ Cronograma de Desenvolvimento

### Fase 1: Base (4-6 semanas)
- [ ] Setup do projeto Next.js + PWA
- [ ] Sistema de autenticação
- [ ] Design system baseado no site atual
- [ ] Dashboard principal
- [ ] Layout responsivo
- [ ] Configuração do banco de dados

### Fase 2: Conteúdo (4-6 semanas)
- [ ] Sistema de receitas (ebooks + vídeos)
- [ ] Player de vídeo customizado
- [ ] Sistema de busca e filtros
- [ ] Favoritos e histórico
- [ ] Sistema de categorias
- [ ] Upload e gerenciamento de mídia

### Fase 3: Treinos (3-4 semanas)
- [ ] Seção de treinos
- [ ] Integração com personal trainer
- [ ] Sistema de agendamento
- [ ] Acompanhamento de progresso
- [ ] Planos de treino
- [ ] Timer e cronômetro

### Fase 4: Monetização (2-3 semanas)
- [ ] Integração com Stripe
- [ ] Sistema de assinaturas
- [ ] Loja de produtos
- [ ] Analytics e relatórios
- [ ] Sistema de notificações
- [ ] Testes e otimizações

## ⚙️ Configurações Técnicas

### PWA Configuration
```javascript
// next.config.js
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
});

module.exports = withPWA({
    // configurações do Next.js
});
```

### Stripe Configuration
```javascript
// lib/stripe.js
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
```

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#c8921a',
                secondary: '#1a1a1a',
                accent: '#f5e6cc',
                background: '#0f0f0f',
                'background-alt': '#1a1a1a',
                text: '#ffffff',
                'text-light': '#cccccc',
            },
            fontFamily: {
                heading: ['Playfair Display', 'serif'],
                body: ['Montserrat', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
```

## Responsividade

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Componentes Responsivos
- Grid adaptativo para receitas
- Menu mobile com drawer
- Cards que se adaptam ao tamanho da tela
- Vídeos responsivos
- Navegação otimizada para touch

## 🎯 Objetivos de Performance

- **Lighthouse Score**: 90+
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s
- **PWA Score**: 90+

## 🔐 Segurança

- Autenticação JWT
- Criptografia de dados sensíveis
- Rate limiting
- Validação de entrada
- HTTPS obrigatório
- CORS configurado
- Sanitização de dados

## 📈 Analytics e Monitoramento

- Google Analytics 4
- Hotjar para heatmaps
- Sentry para error tracking
- Stripe Dashboard para pagamentos
- Custom analytics para engajamento
- PWA analytics

## Deploy e Infraestrutura

- **Frontend**: Vercel
- **Banco de Dados**: Supabase ou PlanetScale
- **CDN**: Vercel Edge Network
- **Backup**: Automático diário
- **Monitoramento**: Uptime monitoring
- **SSL**: Automático via Vercel

## 📝 Notas Importantes

1. **Reutilizar ao máximo** o design e componentes do site atual
2. **Manter consistência visual** entre web e mobile
3. **Focar na experiência do usuário** mobile-first
4. **Implementar PWA** para instalação como app nativo
5. **Otimizar para performance** em dispositivos móveis
6. **Implementar sistema de cache** para conteúdo offline
7. **Criar sistema de notificações** push
8. **Implementar busca avançada** com filtros
9. **Implementar sistema de progresso** e gamificação

## 🎨 Inspiração Visual

Basear-se no design existente da landing page:
- Cards com bordas douradas
- Animações suaves
- Gradientes e sombras
- Tipografia elegante
- Layout limpo e moderno
- Cores escuras com acentos dourados
- Efeitos hover sofisticados
- Sistema de grid responsivo

## 🔧 Comandos de Desenvolvimento

```bash
# Instalação
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Start produção
npm start

# Lint
npm run lint

# Testes
npm run test
```

## 🔐 Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/fitrapido_db"

# Autenticação
NEXTAUTH_SECRET="seu-secret-super-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# APIs Externas
VIMEO_ACCESS_TOKEN="seu-token-vimeo"
YOUTUBE_API_KEY="sua-chave-youtube"

# Upload de Arquivos
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-app"

# Analytics
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
HOTJAR_ID="seu-hotjar-id"
```

## 🧪 Estratégia de Testes

### Testes Unitários
- **Jest + Testing Library** para componentes React
- Testes de funções utilitárias
- Testes de hooks customizados
- Testes de validações de formulário

### Testes de Integração
- Testes de API routes
- Testes de autenticação
- Testes de integração com Stripe
- Testes de banco de dados

### Testes E2E
- **Playwright** para testes end-to-end
- Fluxos completos de usuário
- Testes de responsividade
- Testes de PWA

### Comandos de Teste
```bash
# Testes unitários
npm run test

# Testes com watch
npm run test:watch

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## ♿ Acessibilidade

### Padrões WCAG 2.1 AA
- **Contraste de cores**: Mínimo 4.5:1 para texto normal
- **Navegação por teclado**: Todos os elementos interativos acessíveis
- **Screen readers**: ARIA labels e roles apropriados
- **Alt text**: Todas as imagens com descrições
- **Foco visível**: Indicadores claros de foco
- **Estrutura semântica**: HTML semântico correto

### Implementação
```jsx
// Exemplo de componente acessível
<button 
  aria-label="Favoritar receita"
  aria-pressed={isFavorited}
  className="favorite-btn"
>
  <i className="bx bx-heart" aria-hidden="true" />
  <span className="sr-only">
    {isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
  </span>
</button>
```

## 🔍 SEO e Meta Tags

### Meta Tags Dinâmicas
```jsx
// Exemplo para páginas de receitas
export const metadata = {
  title: `${recipe.title} - Fit & Rápido`,
  description: recipe.description,
  keywords: recipe.tags.join(', '),
  openGraph: {
    title: recipe.title,
    description: recipe.description,
    images: [recipe.coverImage],
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: recipe.title,
    description: recipe.description,
    images: [recipe.coverImage],
  }
}
```

### Estrutura de URLs
- `/recipes/[slug]` - Receitas individuais
- `/workouts/[slug]` - Treinos individuais
- `/category/[category]` - Categorias
- `/search?q=termo` - Busca

### Sitemap e Robots
- Sitemap XML automático
- Robots.txt configurado
- Schema.org markup para receitas e treinos

## 💾 Backup e Recuperação

### Estratégia de Backup
- **Banco de Dados**: Backup automático diário
- **Arquivos de Mídia**: Sincronização com Cloudinary
- **Código**: Versionamento com Git
- **Configurações**: Backup de variáveis de ambiente

### Recuperação de Desastres
- **RTO (Recovery Time Objective)**: < 4 horas
- **RPO (Recovery Point Objective)**: < 1 hora
- **Testes de recuperação**: Mensais
- **Documentação**: Procedimentos detalhados

## 📱 PWA - Progressive Web App

### Manifest.json
```json
{
  "name": "Fit & Rápido - Receitas e Treinos",
  "short_name": "Fit & Rápido",
  "description": "Plataforma de receitas saudáveis e treinos personalizados",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f0f",
  "theme_color": "#c8921a",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker
- Cache de recursos estáticos
- Cache de API responses
- Estratégia de cache-first para imagens
- Estratégia de network-first para dados dinâmicos

## 🚀 Otimizações de Performance

### Lazy Loading
```jsx
// Componentes lazy
const VideoPlayer = lazy(() => import('./VideoPlayer'));
const RecipeModal = lazy(() => import('./RecipeModal'));

// Imagens lazy
<Image
  src={recipe.image}
  alt={recipe.title}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Bundle Optimization
- Code splitting por rota
- Tree shaking
- Minificação de CSS/JS
- Compressão gzip/brotli

### CDN e Cache
- Vercel Edge Network
- Cache de imagens otimizado
- Headers de cache apropriados
- Service Worker para cache offline

## 📊 Monitoramento e Logs

### Error Tracking
```javascript
// Sentry configuration
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Analytics Customizados
- Eventos de receitas visualizadas
- Tempo de permanência em vídeos
- Conversões de assinatura
- Engajamento por categoria

### Logs Estruturados
```javascript
// Exemplo de log estruturado
logger.info('Recipe viewed', {
  recipeId: recipe.id,
  userId: user.id,
  timestamp: new Date().toISOString(),
  userAgent: req.headers['user-agent']
});
```

## 📚 Recursos Adicionais

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Jest Testing](https://jestjs.io/docs/getting-started)
- [Playwright E2E](https://playwright.dev/)

---

**Nota**: Este arquivo serve como guia completo para o desenvolvimento da plataforma. Use-o como referência para manter consistência com o design atual e implementar todas as funcionalidades necessárias.


