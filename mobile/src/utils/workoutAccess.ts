export function canAccessPaidWorkouts(user: { role?: string; subscription_tier?: string; subscription_expires_at?: string } | null | undefined) {
  if (!user) return false;
  if (['admin', 'personal_trainer'].includes(user.role || '')) return true;
  return user.subscription_tier === 'premium_fit' &&
    (!user.subscription_expires_at || new Date(user.subscription_expires_at).getTime() > Date.now());
}
