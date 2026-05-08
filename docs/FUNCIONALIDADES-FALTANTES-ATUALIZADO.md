# 📋 Funcionalidades Faltantes para Publicação nas Lojas - Análise Atualizada

Baseado no estado atual do projeto e requisitos obrigatórios para publicação nas lojas Apple e Google.

## ✅ O QUE JÁ ESTÁ IMPLEMENTADO

### Backend (API NestJS)
- ✅ Autenticação JWT (login, registro, perfil)
- ✅ CRUD completo de Receitas
- ✅ CRUD completo de Treinos
- ✅ CRUD de Categorias (Receitas e Treinos)
- ✅ Sistema de Favoritos
- ✅ Upload de arquivos (imagens/vídeos)
- ✅ Filtros e busca de receitas/treinos
- ✅ Controle de acesso por roles (admin/user)

### Admin (Next.js)
- ✅ Painel administrativo completo
- ✅ CRUD de Receitas
- ✅ CRUD de Treinos
- ✅ CRUD de Categorias
- ✅ Gerenciamento de Usuários
- ✅ Interface visual moderna e responsiva

### Mobile (React Native + Expo)
- ✅ Estrutura base do app
- ✅ Telas de Login/Registro
- ✅ Tela de listagem de Receitas
- ✅ Tela de detalhe de Receita
- ✅ Tela de listagem de Treinos
- ✅ Tela de detalhe de Treino
- ✅ Tela de Favoritos
- ✅ Tela de Perfil
- ✅ Navegação entre telas
- ✅ Contexto de autenticação

---

## 🚨 CRÍTICO - Obrigatório para Publicação

### 1. **Sistema de Assinaturas (In-App Purchases)**

#### Mobile App
- [ ] **Instalar biblioteca de IAP**
  - `expo-in-app-purchases` ou `react-native-purchases` (RevenueCat)
  - Configurar produtos no `app.json`

- [ ] **Tela de Assinaturas**
  - Exibição de planos (Basic/Premium)
  - Botões de compra
  - Preços formatados
  - Benefícios de cada plano

- [ ] **Fluxo de Compra**
  - Iniciar compra (iOS/Android)
  - Processar receipt
  - Enviar receipt para API
  - Atualizar status de assinatura

- [ ] **Restauração de Compras**
  - Botão "Restaurar Compras"
  - Validar compras anteriores
  - Sincronizar com backend

#### Backend API
- [ ] **Endpoint de Validação iOS**
  - `POST /subscriptions/validate-ios`
  - Validar receipt com Apple
  - Atualizar `subscription_tier` do usuário
  - Registrar data de expiração

- [ ] **Endpoint de Validação Android**
  - `POST /subscriptions/validate-android`
  - Validar purchase token com Google
  - Atualizar `subscription_tier` do usuário
  - Registrar data de expiração

- [ ] **Webhook de Renovação/Cancelamento**
  - Receber notificações das lojas
  - Atualizar status automaticamente
  - Notificar usuário

- [ ] **Middleware de Verificação Premium**
  - Bloquear acesso a conteúdo premium
  - Retornar erro claro se não assinante

#### Configuração nas Lojas
- [ ] **Apple App Store Connect**
  - Criar produtos (Basic, Premium)
  - Configurar preços
  - Configurar renovação automática
  - Testar com sandbox

- [ ] **Google Play Console**
  - Criar produtos (Basic, Premium)
  - Configurar preços
  - Configurar renovação automática
  - Testar com licença de teste

### 2. **Notificações Push**

#### Mobile App
- [ ] **Instalar biblioteca**
  - `expo-notifications` ou `@react-native-firebase/messaging`

- [ ] **Solicitar Permissão**
  - Pedir permissão ao usuário
  - Tratar recusa

- [ ] **Registrar Token**
  - Obter FCM token
  - Enviar token para API
  - Atualizar token quando necessário

- [ ] **Handler de Notificações**
  - Receber notificações em foreground
  - Receber notificações em background
  - Navegar para tela específica ao tocar

#### Backend API
- [ ] **Módulo de Notificações**
  - Tabela `notification_tokens` (usuário_id, token, plataforma)
  - Endpoint para registrar token
  - Endpoint para remover token

- [ ] **Integração Firebase FCM**
  - Configurar Firebase Admin SDK
  - Função para enviar notificação
  - Suporte a notificações individuais e em massa

- [ ] **Endpoints de Notificação**
  - `POST /notifications/send` (admin)
  - `POST /notifications/send-to-user/:userId`
  - `GET /notifications/history` (usuário)

### 3. **Requisitos Legais e Documentação**

#### Documentos Obrigatórios
- [ ] **Política de Privacidade**
  - Documento completo em português
  - Explicar coleta de dados
  - Explicar uso de dados
  - Direitos do usuário (LGPD)
  - URL pública acessível

- [ ] **Termos de Uso**
  - Documento completo em português
  - Regras de uso do app
  - Responsabilidades
  - Política de cancelamento
  - URL pública acessível

- [ ] **LGPD Compliance**
  - Consentimento explícito no registro
  - Checkbox "Aceito termos e política"
  - Endpoint para exportar dados do usuário
  - Endpoint para deletar conta (direito ao esquecimento)

#### Implementação no App
- [ ] **Tela de Termos/Política**
  - Exibir documentos
  - Link no registro
  - Link no perfil

- [ ] **Aceite Obrigatório**
  - Checkbox no registro
  - Não permitir registro sem aceitar
  - Salvar data de aceite

### 4. **Segurança e Validação**

#### Backend
- [ ] **Rate Limiting**
  - Limitar requisições por IP
  - Limitar tentativas de login
  - Proteção contra DDoS

- [ ] **Validação de Inputs**
  - Sanitização de dados
  - Validação de tipos
  - Proteção contra SQL Injection (TypeORM já protege)

- [ ] **HTTPS Obrigatório**
  - Certificado SSL válido
  - Redirecionar HTTP para HTTPS
  - HSTS headers

- [ ] **Validação de Tokens**
  - Verificar expiração
  - Blacklist de tokens (logout)
  - Refresh tokens (opcional)

#### Mobile
- [ ] **Validação de Formulários**
  - Email válido
  - Senha forte
  - Campos obrigatórios

- [ ] **Armazenamento Seguro**
  - AsyncStorage para dados não sensíveis
  - SecureStore para tokens
  - Não armazenar senhas

### 5. **Player de Vídeo Funcional**

#### Mobile
- [ ] **Instalar biblioteca**
  - `expo-av` ou `react-native-video`

- [ ] **Player Customizado**
  - Controles de play/pause
  - Controle de volume
  - Controle de velocidade
  - Tela cheia
  - Indicador de carregamento

- [ ] **Tratamento de Erros**
  - Erro de carregamento
  - Erro de rede
  - Vídeo indisponível

- [ ] **Otimizações**
  - Cache de vídeos (opcional)
  - Qualidade adaptativa
  - Streaming progressivo

---

## ⚠️ IMPORTANTE - Melhora Significativamente a Experiência

### 6. **Sistema de Busca Avançada**

#### Mobile
- [ ] **Barra de Busca Melhorada**
  - Busca em tempo real
  - Histórico de buscas
  - Sugestões de busca
  - Busca por voz (opcional)

- [ ] **Filtros Avançados**
  - Por categoria
  - Por dificuldade
  - Por tempo de preparo
  - Por ingredientes
  - Conteúdo premium/gratuito

- [ ] **Ordenação**
  - Mais recente
  - Mais popular
  - Alfabética
  - Por avaliação

#### Backend
- [ ] **Endpoint de Busca**
  - `GET /receitas/search?q=termo`
  - `GET /treinos/search?q=termo`
  - Busca full-text (PostgreSQL)
  - Ranking de resultados

### 7. **Sistema de Avaliações e Comentários**

#### Backend
- [ ] **Tabela de Avaliações**
  - `avaliacoes` (id, usuario_id, receita_id/treino_id, nota, comentario, data)

- [ ] **Endpoints**
  - `POST /receitas/:id/avaliar`
  - `GET /receitas/:id/avaliacoes`
  - `PUT /avaliacoes/:id` (editar própria)
  - `DELETE /avaliacoes/:id` (deletar própria)

#### Mobile
- [ ] **Tela de Avaliações**
  - Lista de avaliações
  - Média de estrelas
  - Formulário de avaliação
  - Editar/deletar própria avaliação

### 8. **Calculadora de Macros**

#### Backend
- [ ] **Tabela de Macros**
  - Adicionar campos em `receitas`: calorias, proteinas, carboidratos, gorduras, fibras

- [ ] **Endpoints**
  - `GET /receitas/:id/macros`
  - `POST /macros/calcular` (calcular por porção)

#### Mobile
- [ ] **Tela de Calculadora**
  - Exibir macros da receita
  - Ajustar porções
  - Calcular macros diários
  - Metas personalizadas

### 9. **Perfil do Usuário Completo**

#### Mobile
- [ ] **Edição de Perfil**
  - Editar nome
  - Editar email
  - Upload de avatar
  - Alterar senha

- [ ] **Preferências**
  - Restrições alimentares
  - Objetivos de treino
  - Notificações
  - Idioma

- [ ] **Histórico**
  - Receitas visualizadas
  - Treinos realizados
  - Favoritos
  - Avaliações feitas

#### Backend
- [ ] **Endpoints de Perfil**
  - `PATCH /auth/profile` (atualizar dados)
  - `POST /auth/change-password`
  - `POST /auth/upload-avatar`
  - `GET /users/:id/history`

### 10. **Funcionalidades Offline**

#### Mobile
- [ ] **Cache de Conteúdo**
  - Salvar receitas visualizadas
  - Salvar treinos visualizados
  - Sincronizar quando online

- [ ] **Modo Offline**
  - Indicador de status
  - Acesso a conteúdo baixado
  - Sincronização automática

- [ ] **Download de Conteúdo**
  - Botão "Baixar para offline"
  - Gerenciar downloads
  - Limpar cache

---

## 📊 RECOMENDADO - Diferenciais Competitivos

### 11. **Integração com Health Apps**

#### Mobile
- [ ] **Apple HealthKit (iOS)**
  - `expo-health`
  - Sincronizar treinos
  - Registrar calorias
  - Metas de exercício

- [ ] **Google Fit (Android)**
  - `react-native-google-fit`
  - Sincronizar treinos
  - Registrar calorias
  - Metas de exercício

### 12. **Analytics e Métricas**

#### Backend
- [ ] **Tabela de Analytics**
  - Eventos de visualização
  - Eventos de conversão
  - Funil de assinatura

- [ ] **Endpoints**
  - `POST /analytics/track` (evento)
  - `GET /analytics/dashboard` (admin)

#### Mobile
- [ ] **Tracking de Eventos**
  - Visualização de receita
  - Visualização de treino
  - Compra de assinatura
  - Uso de funcionalidades

### 13. **Compartilhamento Social**

#### Mobile
- [ ] **Compartilhar Receitas/Treinos**
  - `expo-sharing`
  - Compartilhar link
  - Compartilhar imagem
  - Integração com redes sociais

### 14. **Planos de Treino Personalizados**

#### Backend
- [ ] **Tabela de Planos**
  - `planos_treino` (id, usuario_id, nome, exercicios, duracao)

- [ ] **Endpoints**
  - `POST /treinos/planos`
  - `GET /treinos/planos`
  - `PUT /treinos/planos/:id`

#### Mobile
- [ ] **Tela de Planos**
  - Criar plano personalizado
  - Visualizar planos
  - Acompanhar progresso

---

## 🧪 TESTES E QUALIDADE

### 15. **Testes Obrigatórios**

- [ ] **Testes de Integração**
  - Testes de API (Jest)
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

---

## 📱 METADADOS PARA AS LOJAS

### 16. **App Store (Apple)**

- [ ] **Assets**
  - Ícone do app (1024x1024)
  - Screenshots (vários tamanhos)
  - Vídeo promocional (opcional)

- [ ] **Informações**
  - Descrição do app (até 4000 caracteres)
  - Palavras-chave (até 100 caracteres)
  - Categoria (Health & Fitness)
  - Política de privacidade (URL)
  - Suporte (email/URL)

- [ ] **Configurações**
  - Idade mínima
  - Classificação de conteúdo
  - Preços e disponibilidade

### 17. **Google Play Store**

- [ ] **Assets**
  - Ícone do app (512x512)
  - Screenshots (vários tamanhos)
  - Vídeo promocional (opcional)
  - Feature graphic (1024x500)

- [ ] **Informações**
  - Título (até 50 caracteres)
  - Descrição curta (até 80 caracteres)
  - Descrição completa (até 4000 caracteres)
  - Categoria (Health & Fitness)
  - Política de privacidade (URL)

- [ ] **Configurações**
  - Classificação de conteúdo
  - Preços e disponibilidade
  - Países de distribuição

---

## 🎯 PRIORIZAÇÃO RECOMENDADA

### Fase 1 - MVP (Mínimo Viável para Publicação) - 4-6 semanas

1. **Sistema de Assinaturas (IAP)** ⭐ CRÍTICO
   - Configurar produtos nas lojas
   - Implementar compra no app
   - Validação no backend
   - Testes completos

2. **Notificações Push** ⭐ CRÍTICO
   - Configurar Firebase
   - Implementar no app
   - Endpoints no backend
   - Testes

3. **Documentação Legal** ⭐ CRÍTICO
   - Política de privacidade
   - Termos de uso
   - LGPD compliance
   - Integração no app

4. **Segurança** ⭐ CRÍTICO
   - Rate limiting
   - HTTPS
   - Validações
   - Testes de segurança

5. **Player de Vídeo** ⭐ CRÍTICO
   - Implementar player
   - Tratamento de erros
   - Testes

### Fase 2 - Melhorias Essenciais - 3-4 semanas

1. Busca avançada
2. Sistema de favoritos (já existe, melhorar)
3. Perfil completo
4. Avaliações e comentários
5. Calculadora de macros

### Fase 3 - Diferenciais - 2-3 semanas

1. Integração com Health Apps
2. Modo offline
3. Analytics
4. Compartilhamento social
5. Planos personalizados

---

## 📝 NOTAS IMPORTANTES

### Custos Estimados
- **Apple Developer**: $99/ano
- **Google Play Developer**: $25 (única vez)
- **Firebase**: Gratuito até certo limite
- **Hospedagem API**: Variável (Heroku, AWS, etc.)
- **CDN para mídia**: Variável (Cloudinary, AWS S3)

### Tempo Estimado
- **MVP**: 4-6 semanas (trabalho focado)
- **Completo**: 10-12 semanas (com todas as funcionalidades)

### Requisitos Legais
- Verificar legislação local sobre apps de saúde/fitness
- LGPD compliance obrigatório no Brasil
- Política de privacidade deve ser acessível

### Próximos Passos Imediatos
1. ✅ Revisar este documento
2. ⏭️ Criar conta Apple Developer (se ainda não tiver)
3. ⏭️ Criar conta Google Play Developer (se ainda não tiver)
4. ⏭️ Configurar Firebase para notificações
5. ⏭️ Começar implementação do IAP

---

**Última atualização**: Janeiro 2025
**Status do Projeto**: Backend e Admin completos, Mobile em desenvolvimento
**Prioridade**: Fase 1 (MVP) para publicação

