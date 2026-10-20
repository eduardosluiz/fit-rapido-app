import { hasActiveTrial } from './trialAccess';
export function canAccessRecipeContent(user: { created_at?: string; trial_expires_at?: string; role?: string; subscription_tier?: string; subscription_expires_at?: string } | null | undefined, recipe: { is_free?: boolean; locked?: boolean }): boolean {
  if (user && ['admin', 'personal_trainer'].includes(user.role || '')) return true;
  if (recipe.locked === true) return false;
  if (recipe.is_free === true && hasActiveTrial(user)) return true;
  return !!user && ['premium', 'premium_fit'].includes(user.subscription_tier || '') &&
    (!user.subscription_expires_at || new Date(user.subscription_expires_at).getTime() > Date.now());
}
