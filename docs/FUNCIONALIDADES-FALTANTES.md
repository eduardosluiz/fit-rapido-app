# 📋 Funcionalidades Faltantes para Publicação nas Lojas

Baseado no plano inicial do projeto (APPDAI.md) e requisitos para publicação nas lojas Apple e Google.

## 🚨 CRÍTICO - Obrigatório para Publicação

### 1. **App Mobile (React Native + Expo)**
- [ ] **Tela de Login/Registro**
  - Autenticação completa
  - Recuperação de senha
  - Validação de email
  - Integração com API

- [ ] **Dashboard Principal**
  - Visualização de receitas e treinos
  - Cards com imagens
  - Navegação intuitiva
  - Indicadores de conteúdo premium

- [ ] **Visualização de Receitas**
  - Detalhes completos (ingredientes, modo de preparo)
  - Player de vídeo funcional
  - Download de ebooks (se aplicável)
  - Sistema de favoritos
  - Compartilhamento

- [ ] **Visualização de Treinos**
  - Detalhes do treino
  - Vídeos demonstrativos
  - Timer/cronômetro integrado
  - Acompanhamento de progresso
  - Histórico de treinos realizados

- [ ] **Sistema de Assinaturas (In-App Purchases)**
  - Integração com Apple App Store (iOS)
  - Integração com Google Play Billing (Android)
  - Validação de assinaturas na API
  - Gerenciamento de planos (Basic/Premium)
  - Restauração de compras

- [ ] **Perfil do Usuário**
  - Edição de dados pessoais
  - Upload de avatar
  - Preferências (dietas, restrições)
  - Histórico de atividades

### 2. **API Backend (NestJS)**

- [ ] **Validação de In-App Purchases**
  - Endpoint para validar compras iOS
  - Endpoint para validar compras Android
  - Verificação de assinaturas ativas
  - Webhooks para renovações/cancelamentos

- [ ] **Sistema de Notificações Push**
  - Integração com Firebase Cloud Messaging (FCM)
  - Envio de notificações para usuários
  - Notificações de novos conteúdos
  - Notificações de lembretes de treino

- [ ] **Endpoints de Conteúdo**
  - Listagem de receitas com filtros
  - Listagem de treinos com filtros
  - Busca avançada
  - Sistema de favoritos
  - Histórico de visualizações

- [ ] **Sistema de Upload de Mídia**
  - Upload de imagens (Cloudinary ou similar)
  - Upload de vídeos
  - Gerenciamento de arquivos
  - CDN para entrega de conteúdo

### 3. **Requisitos Legais e de Segurança**

- [ ] **Política de Privacidade**
  - Documento completo
  - Acessível dentro do app
  - Link na página de registro

- [ ] **Termos de Uso**
  - Documento completo
  - Aceite obrigatório no registro

- [ ] **LGPD Compliance**
  - Consentimento de dados
  - Direito ao esquecimento
  - Exportação de dados do usuário

- [ ] **Segurança**
  - HTTPS obrigatório
  - Validação de tokens JWT
  - Rate limiting na API
  - Sanitização de inputs
  - Proteção contra SQL injection

## ⚠️ IMPORTANTE - Melhora Significativamente a Experiência

### 4. **Funcionalidades de Conteúdo**

- [ ] **Sistema de Busca Avançada**
  - Busca por nome, ingredientes, tags
  - Filtros por categoria, dificuldade, tempo
  - Ordenação (mais recente, mais popular)
  - Histórico de buscas

- [ ] **Sistema de Favoritos**
  - Salvar receitas/treinos favoritos
  - Lista de favoritos
  - Sincronização entre dispositivos

- [ ] **Sistema de Avaliações**
  - Usuários podem avaliar receitas/treinos
  - Exibição de média de avaliações
  - Comentários (opcional)

- [ ] **Calculadora de Macros**
  - Cálculo de macros por receita
  - Acompanhamento diário
  - Metas personalizadas

### 5. **Integração com Health Apps**

- [ ] **Apple HealthKit (iOS)**
  - Sincronização de atividades
  - Registro de treinos
  - Metas de exercício

- [ ] **Google Fit (Android)**
  - Sincronização de atividades
  - Registro de treinos
  - Metas de exercício

### 6. **Funcionalidades Offline**

- [ ] **Cache de Conteúdo**
  - Download de receitas para offline
  - Download de vídeos (opcional)
  - Sincronização quando online

- [ ] **Modo Offline**
  - Acesso a conteúdo baixado
  - Indicador de status offline
  - Sincronização automática

## 📊 RECOMENDADO - Diferenciais Competitivos

### 7. **Analytics e Métricas**

- [ ] **Dashboard de Analytics (Admin)**
  - Usuários ativos
  - Receitas/treinos mais visualizados
  - Taxa de conversão de assinaturas
  - Engajamento dos usuários

- [ ] **Tracking de Eventos**
  - Eventos de visualização
  - Eventos de conversão
  - Funil de assinatura

### 8. **Funcionalidades Sociais (Opcional)**

- [ ] **Compartilhamento**
  - Compartilhar receitas/treinos
  - Links de compartilhamento
  - Integração com redes sociais

- [ ] **Comunidade**
  - Fórum ou comentários
  - Receitas enviadas por usuários
  - Moderação de conteúdo

### 9. **Personalização**

- [ ] **Planos de Treino Personalizados**
  - Criação de planos customizados
  - Acompanhamento de progresso
  - Ajustes baseados em feedback

- [ ] **Planos de Refeição**
  - Sugestão de refeições semanais
  - Lista de compras gerada
  - Ajuste de porções

## 🧪 TESTES E QUALIDADE

### 10. **Testes Obrigatórios**

- [ ] **Testes de Integração**
  - Testes de API
  - Testes de fluxos de usuário
  - Testes de assinaturas

- [ ] **Testes em Dispositivos**
  - iOS (iPhone e iPad)
  - Android (vários modelos)
  - Diferentes versões de OS

- [ ] **Testes de Performance**
  - Tempo de carregamento
  - Uso de memória
  - Consumo de bateria

- [ ] **Testes de Acessibilidade**
  - Suporte a leitores de tela
  - Contraste de cores
  - Tamanhos de fonte

## 📱 METADADOS PARA AS LOJAS

### 11. **App Store (Apple)**

- [ ] Ícone do app (1024x1024)
- [ ] Screenshots (vários tamanhos)
- [ ] Descrição do app
- [ ] Palavras-chave
- [ ] Categoria
- [ ] Vídeo promocional (opcional)
- [ ] Política de privacidade (URL)

### 12. **Google Play Store**

- [ ] Ícone do app (512x512)
- [ ] Screenshots (vários tamanhos)
- [ ] Descrição do app
- [ ] Descrição curta
- [ ] Categoria
- [ ] Vídeo promocional (opcional)
- [ ] Política de privacidade (URL)

## 🎯 PRIORIZAÇÃO RECOMENDADA

### Fase 1 - MVP (Mínimo Viável para Publicação)
1. App Mobile básico funcionando
2. Autenticação completa
3. Visualização de receitas e treinos
4. Sistema de assinaturas (IAP)
5. Política de privacidade e termos
6. Testes básicos

### Fase 2 - Melhorias Essenciais
1. Sistema de favoritos
2. Busca e filtros
3. Notificações push
4. Perfil do usuário
5. Analytics básico

### Fase 3 - Diferenciais
1. Integração com Health Apps
2. Modo offline
3. Calculadora de macros
4. Avaliações e comentários

## 📝 NOTAS IMPORTANTES

- **Tempo Estimado**: 3-6 meses para MVP completo
- **Custos**: 
  - Conta de desenvolvedor Apple ($99/ano)
  - Conta de desenvolvedor Google ($25 única vez)
  - Serviços de hospedagem (API, banco de dados)
  - Serviços de mídia (Cloudinary, etc.)

- **Requisitos Legais**: Verificar legislação local sobre apps de saúde/fitness

