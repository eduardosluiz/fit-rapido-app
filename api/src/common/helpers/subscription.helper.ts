import { User, SubscriptionTier } from '../../auth/entities/user.entity';
import { Receita } from '../../receitas/entities/receita.entity';

export enum AccessLevel {
  FREE_TRIAL = 'free_trial', // Dentro dos 7 dias de trial
  FREE = 'free', // Após trial, apenas receitas FREE
  PREMIUM = 'premium', // Premium receitas
  PREMIUM_FIT = 'premium_fit', // Premium receitas + treinos
}

/**
 * Verifica se o usuário está dentro do período de trial (7 dias)
 */
export function hasActiveTrial(user: User | null): boolean {
  if (!user || !user.trial_expires_at) {
    return false;
  }
  return new Date() < new Date(user.trial_expires_at);
}

/**
 * Verifica se o usuário pode acessar uma receita específica
 */
export function canAccessRecipe(user: User | null, receita: Receita): boolean {
  if (!user) {
    return false;
  }

  const tier = user.subscription_tier || SubscriptionTier.NONE;

  // Se está dentro do trial, pode acessar todas as receitas
  if (hasActiveTrial(user)) {
    return true;
  }

  // Se é FREE (após trial), apenas receitas FREE
  if (tier === SubscriptionTier.FREE || tier === SubscriptionTier.NONE) {
    return receita.is_free === true;
  }

  // PREMIUM e PREMIUM_FIT podem acessar todas as receitas
  if (tier === SubscriptionTier.PREMIUM || tier === SubscriptionTier.PREMIUM_FIT) {
    return true;
  }

  // BASIC (deprecated) - apenas receitas não premium
  if (tier === SubscriptionTier.BASIC) {
    return receita.is_premium === false;
  }

  return false;
}

/**
 * Verifica se o usuário pode acessar treinos
 */
export function canAccessTreino(user: User | null): boolean {
  if (!user) {
    return false;
  }

  const tier = user.subscription_tier || SubscriptionTier.NONE;
  return tier === SubscriptionTier.PREMIUM_FIT;
}

/**
 * Retorna o nível de acesso do usuário
 */
export function getUserAccessLevel(user: User | null): AccessLevel {
  if (!user) {
    return AccessLevel.FREE;
  }

  const tier = user.subscription_tier || SubscriptionTier.NONE;

  if (hasActiveTrial(user)) {
    return AccessLevel.FREE_TRIAL;
  }

  if (tier === SubscriptionTier.FREE || tier === SubscriptionTier.NONE) {
    return AccessLevel.FREE;
  }

  if (tier === SubscriptionTier.PREMIUM) {
    return AccessLevel.PREMIUM;
  }

  if (tier === SubscriptionTier.PREMIUM_FIT) {
    return AccessLevel.PREMIUM_FIT;
  }

  // BASIC (deprecated) - tratar como FREE
  return AccessLevel.FREE;
}

/**
 * Verifica se o usuário tem assinatura ativa (não expirada)
 */
export function hasActiveSubscription(user: User | null): boolean {
  if (!user) {
    return false;
  }

  const tier = user.subscription_tier || SubscriptionTier.NONE;

  // FREE e NONE não são assinaturas ativas
  if (tier === SubscriptionTier.FREE || tier === SubscriptionTier.NONE) {
    return false;
  }

  // Verificar se a assinatura não expirou
  if (user.subscription_expires_at) {
    return new Date() < new Date(user.subscription_expires_at);
  }

  // Se não tem data de expiração, considerar ativa (para compatibilidade)
  return tier === SubscriptionTier.PREMIUM || tier === SubscriptionTier.PREMIUM_FIT;
}

