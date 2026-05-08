import { User, SubscriptionTier, UserRole } from '../../auth/entities/user.entity';

/**
 * Verifica se é permitido alterar manualmente o plano de assinatura
 * Em produção, apenas para contas de teste ou admin
 */
export function canManuallyChangeSubscription(
  user: User,
  newTier: SubscriptionTier,
  requestingUserRole?: UserRole
): boolean {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Em desenvolvimento, sempre permitir
  if (!isProduction) {
    return true;
  }
  
  // Em produção:
  
  // 1. Admin sempre pode alterar
  if (requestingUserRole === UserRole.ADMIN) {
    return true;
  }
  
  // 2. Alterar para FREE sempre permitido (não é plano pago)
  if (newTier === SubscriptionTier.FREE || newTier === SubscriptionTier.NONE) {
    return true;
  }
  
  // 3. Alterar planos pagos (premium/premium_fit) requer validação de receipt
  // Por padrão, não permitir alteração manual de planos pagos em produção
  // A alteração deve ser feita através dos endpoints de validação de receipt
  if (newTier === SubscriptionTier.PREMIUM || newTier === SubscriptionTier.PREMIUM_FIT) {
    return false;
  }
  
  return false;
}

/**
 * Verifica se deve validar receipt em produção
 */
export function shouldValidateReceipt(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Retorna mensagem de erro apropriada para alteração de plano
 */
export function getSubscriptionChangeErrorMessage(newTier: SubscriptionTier): string {
  if (newTier === SubscriptionTier.PREMIUM || newTier === SubscriptionTier.PREMIUM_FIT) {
    return (
      'Em produção, planos pagos só podem ser alterados após validação de receipt. ' +
      'Use o endpoint /subscriptions/validate-ios ou /subscriptions/validate-android.'
    );
  }
  return 'Alteração de plano não permitida.';
}


