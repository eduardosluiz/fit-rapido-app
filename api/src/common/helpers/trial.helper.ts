export const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

export function trialDeadline(user: { created_at?: string | Date; trial_expires_at?: string | Date } | null | undefined): number {
  if (!user?.created_at || !user.trial_expires_at) return NaN;
  return Math.min(new Date(user.created_at).getTime() + TRIAL_DURATION_MS, new Date(user.trial_expires_at).getTime());
}

export function hasActiveTrial(user: { created_at?: string | Date; trial_expires_at?: string | Date } | null | undefined): boolean {
  return !!user?.created_at && Date.now() >= new Date(user.created_at).getTime() && Date.now() < trialDeadline(user);
}
