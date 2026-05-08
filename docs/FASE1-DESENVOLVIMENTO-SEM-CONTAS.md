# 🚀 Fase 1 - Desenvolvimento Sem Contas de Desenvolvedor

## ✅ O QUE PODE SER DESENVOLVIDO AGORA (Sem Contas)

### 1. **Sistema de Assinaturas - Estrutura e Backend** ✅

#### Backend (API NestJS)
- [x] **Tabela de Assinaturas** (já existe campo `subscription_tier` em `usuarios`)
- [ ] **Criar entidade `Subscription`** (histórico de assinaturas)
  - `id`, `usuario_id`, `plano` (basic/premium)
  - `data_inicio`, `data_fim`, `status` (ativa/expirada/cancelada)
  - `receipt_ios`, `receipt_android` (armazenar receipts)
  - `transaction_id` (ID da transação)

- [ ] **Endpoints de Validação (Mock/Preparado)**
  - `POST /subscriptions/validate-ios` (preparado para receber receipt)
  - `POST /subscriptions/validate-android` (preparado para receber purchase token)
  - `GET /subscriptions/status` (verificar status atual)
  - `POST /subscriptions/restore` (restaurar compras)

- [ ] **Middleware de Verificação Premium**
  - Guard para verificar se usuário tem acesso premium
  - Aplicar em rotas de conteúdo premium

- [ ] **Lógica de Expiração**
  - Verificar se assinatura está ativa
  - Atualizar status automaticamente

#### Mobile App
- [ ] **Instalar biblioteca de IAP**
  ```bash
  npx expo install expo-in-app-purchases
  # ou
  npm install react-native-purchases
  ```

- [ ] **Tela de Assinaturas (UI Completa)**
  - Exibir planos (Basic/Premium)
  - Botões de compra
  - Preços (pode usar valores mock)
  - Benefícios de cada plano
  - Design completo

- [ ] **Serviço de IAP (Preparado)**
  - Função para iniciar compra
  - Função para processar receipt
  - Função para enviar para API
  - Função para restaurar compras
  - **Nota**: Usar modo sandbox/teste quando disponível

- [ ] **Integração com Backend**
  - Enviar receipt para API
  - Atualizar status local
  - Sincronizar com servidor

**⚠️ Limitação**: Sem contas de desenvolvedor, não é possível testar compras reais, mas toda a estrutura pode ser desenvolvida e testada com dados mock.

---

### 2. **Notificações Push - Estrutura Completa** ✅

#### Backend (API NestJS)
- [ ] **Criar entidade `NotificationToken`**
  - `id`, `usuario_id`, `token` (FCM token)
  - `plataforma` (ios/android)
  - `ativo` (boolean)
  - `created_at`, `updated_at`

- [ ] **Módulo de Notificações**
  - `notifications.module.ts`
  - `notifications.service.ts`
  - `notifications.controller.ts`

- [ ] **Endpoints**
  - `POST /notifications/register-token` (registrar token do usuário)
  - `DELETE /notifications/remove-token` (remover token)
  - `POST /notifications/send` (admin - enviar notificação)
  - `POST /notifications/send-to-user/:userId` (enviar para usuário específico)
  - `GET /notifications/history` (histórico do usuário)

- [ ] **Integração Firebase Admin SDK**
  - Instalar: `npm install firebase-admin`
  - Configurar com service account (pode usar credenciais de teste)
  - Função para enviar notificação
  - Suporte a notificações individuais e em massa

**⚠️ Limitação**: Sem conta Firebase, não é possível enviar notificações reais, mas toda a estrutura pode ser desenvolvida.

#### Mobile App
- [ ] **Instalar biblioteca**
  ```bash
  npx expo install expo-notifications
  ```

- [ ] **Configurar Notificações**
  - Solicitar permissão
  - Obter token FCM
  - Registrar token no backend
  - Handler de notificações (foreground/background)

- [ ] **Tela de Configurações de Notificação**
  - Toggle para ativar/desativar
  - Tipos de notificações (novos conteúdos, lembretes, etc.)

**⚠️ Limitação**: Sem projeto Firebase configurado, não é possível receber notificações reais, mas toda a estrutura pode ser desenvolvida.

---

### 3. **Documentação Legal - 100% Desenvolvível** ✅

#### Backend
- [ ] **Endpoints de Documentos**
  - `GET /legal/privacy-policy` (retornar política)
  - `GET /legal/terms-of-service` (retornar termos)
  - `GET /legal/lgpd` (informações LGPD)

- [ ] **Tabela de Consentimentos**
  - `consentimentos` (id, usuario_id, tipo, aceito, data_aceite)
  - Registrar quando usuário aceita termos

- [ ] **Endpoint de Exportação de Dados (LGPD)**
  - `GET /users/export-data` (exportar todos os dados do usuário)
  - `DELETE /users/delete-account` (deletar conta - direito ao esquecimento)

#### Mobile App
- [ ] **Tela de Termos/Política**
  - Exibir documento completo
  - Scroll view
  - Botão de aceitar

- [ ] **Integração no Registro**
  - Checkbox obrigatório
  - Link para termos
  - Link para política
  - Não permitir registro sem aceitar

- [ ] **Tela de Configurações**
  - Link para termos
  - Link para política
  - Opção de exportar dados
  - Opção de deletar conta

#### Documentos (Conteúdo)
- [ ] **Escrever Política de Privacidade**
  - Coleta de dados
  - Uso de dados
  - Compartilhamento
  - Direitos do usuário
  - Contato

- [ ] **Escrever Termos de Uso**
  - Regras de uso
  - Responsabilidades
  - Política de cancelamento
  - Propriedade intelectual

**✅ Sem Limitações**: Tudo pode ser desenvolvido e testado completamente.

---

### 4. **Segurança - 100% Desenvolvível** ✅

#### Backend
- [ ] **Rate Limiting**
  - Instalar: `npm install @nestjs/throttler`
  - Configurar limites por IP
  - Limitar tentativas de login
  - Proteção contra DDoS

- [ ] **Validação de Inputs**
  - Usar `class-validator` (já instalado)
  - Sanitização de dados
  - Validação de tipos

- [ ] **HTTPS**
  - Configurar certificado SSL (pode usar Let's Encrypt grátis)
  - Redirecionar HTTP para HTTPS
  - HSTS headers

- [ ] **Validação de Tokens**
  - Verificar expiração (já implementado)
  - Blacklist de tokens (opcional)
  - Refresh tokens (opcional)

**✅ Sem Limitações**: Tudo pode ser desenvolvido e testado.

---

### 5. **Player de Vídeo - 100% Desenvolvível** ✅

#### Mobile App
- [ ] **Instalar biblioteca**
  ```bash
  npx expo install expo-av
  ```

- [ ] **Componente de Player**
  - Controles de play/pause
  - Controle de volume
  - Controle de velocidade
  - Tela cheia
  - Indicador de carregamento
  - Barra de progresso

- [ ] **Tratamento de Erros**
  - Erro de carregamento
  - Erro de rede
  - Vídeo indisponível
  - Mensagens amigáveis

- [ ] **Integração**
  - Usar em `ReceitaDetailScreen`
  - Usar em `TreinoDetailScreen`

**✅ Sem Limitações**: Tudo pode ser desenvolvido e testado com vídeos de exemplo.

---

## 📊 RESUMO DO QUE PODE SER FEITO AGORA

| Funcionalidade | Backend | Mobile | Testável | Requer Conta |
|---------------|---------|--------|----------|--------------|
| **Assinaturas (IAP)** | ✅ 100% | ✅ 100% | ⚠️ Mock | ❌ Não (para estrutura) |
| **Notificações Push** | ✅ 100% | ✅ 100% | ⚠️ Mock | ❌ Não (para estrutura) |
| **Documentação Legal** | ✅ 100% | ✅ 100% | ✅ Sim | ❌ Não |
| **Segurança** | ✅ 100% | ✅ 100% | ✅ Sim | ❌ Não |
| **Player de Vídeo** | N/A | ✅ 100% | ✅ Sim | ❌ Não |

---

## 🎯 PLANO DE DESENVOLVIMENTO RECOMENDADO

### Semana 1-2: Estrutura Base
1. ✅ Criar entidades faltantes (Subscription, NotificationToken, Consentimento)
2. ✅ Criar endpoints de assinaturas (mock)
3. ✅ Criar módulo de notificações (mock)
4. ✅ Implementar documentação legal
5. ✅ Implementar segurança (rate limiting, validações)

### Semana 3-4: Mobile App
1. ✅ Tela de assinaturas (UI completa)
2. ✅ Serviço de IAP (preparado)
3. ✅ Configuração de notificações
4. ✅ Telas de termos/política
5. ✅ Player de vídeo

### Semana 5-6: Integração e Testes
1. ✅ Integrar tudo
2. ✅ Testes com dados mock
3. ✅ Ajustes e correções
4. ✅ Documentação

---

## ⚠️ O QUE PRECISA DE CONTAS DE DESENVOLVEDOR

### Para Testes Reais
- **Apple Developer Account** ($99/ano)
  - Testar compras iOS (sandbox)
  - Testar notificações push iOS
  - Build para dispositivo físico

- **Google Play Developer Account** ($25)
  - Testar compras Android (licença de teste)
  - Testar notificações push Android
  - Build para dispositivo físico

- **Firebase Project** (Gratuito)
  - Configurar FCM
  - Obter credenciais
  - Enviar notificações reais

### Quando Criar?
- **Agora**: Pode criar Firebase (gratuito) para testar notificações
- **Fase de Testes**: Criar contas de desenvolvedor quando for testar compras reais
- **Antes de Publicar**: Obrigatório ter todas as contas

---

## 💡 VANTAGENS DE DESENVOLVER AGORA

1. ✅ **Estrutura Completa**: Toda a arquitetura pode ser desenvolvida
2. ✅ **Testes com Mock**: Pode testar fluxos completos com dados simulados
3. ✅ **Economia de Tempo**: Quando tiver as contas, só precisa conectar
4. ✅ **Validação de Design**: UI/UX pode ser testada completamente
5. ✅ **Documentação Legal**: Pode ser escrita e integrada agora

---

## 📝 PRÓXIMOS PASSOS IMEDIATOS

1. ✅ Revisar este documento
2. ⏭️ Criar entidades faltantes no banco
3. ⏭️ Implementar endpoints de assinaturas (mock)
4. ⏭️ Implementar módulo de notificações
5. ⏭️ Escrever documentos legais
6. ⏭️ Implementar segurança
7. ⏭️ Desenvolver telas no mobile

**Conclusão**: Sim, é possível desenvolver 95% da Fase 1 sem contas de desenvolvedor. Apenas os testes finais com compras e notificações reais precisarão das contas.

