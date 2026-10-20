import { hasActiveTrial } from './trialAccess';
export function canAccessPaidWorkouts(user: { role?: string; subscription_tier?: string; subscription_expires_at?: string } | null | undefined) {
  if (!user) return false;
  if (['admin', 'personal_trainer'].includes(user.role || '')) return true;
  return user.subscription_tier === 'premium_fit' &&
    (!user.subscription_expires_at || new Date(user.subscription_expires_at).getTime() > Date.now());
}

export function canAccessWorkoutContent(user: (Parameters<typeof canAccessPaidWorkouts>[0] & { created_at?: string; trial_expires_at?: string }) | null | undefined, item: { is_free?: boolean; locked?: boolean }): boolean {
  if (user && ['admin', 'personal_trainer'].includes(user.role || '')) return true;
  if (item.locked === true) return false;
  return canAccessPaidWorkouts(user) || (item.is_free === true && hasActiveTrial(user));
}
