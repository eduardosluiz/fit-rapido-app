import { User, SubscriptionTier } from '../../auth/entities/user.entity';
import { canAccessTreino, canAccessRecipe, getEffectiveSubscriptionTier } from './subscription.helper';

describe('acesso durante cancelamento e expiração', () => {
  beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(new Date('2026-09-25T18:00:00Z')); });
  afterEach(() => jest.useRealTimers());
  const account = (expiry: string) => ({ subscription_tier: SubscriptionTier.PREMIUM_FIT, subscription_expires_at: new Date(expiry) } as User);
  it('mantém o acesso até o horário final após cancelamento', () => {
    expect(canAccessTreino(account('2026-09-25T18:00:01Z'))).toBe(true);
  });
  it('bloqueia treino e receita paga exatamente na expiração mesmo com tier antigo', () => {
    const user = account('2026-09-25T18:00:00Z');
    expect(canAccessTreino(user)).toBe(false);
    expect(canAccessRecipe(user, { is_free: false } as any)).toBe(false);
    expect(getEffectiveSubscriptionTier(user)).toBe(SubscriptionTier.NONE);
    expect(user.subscription_tier).toBe(SubscriptionTier.PREMIUM_FIT);
  });
  it('continua permitindo receitas gratuitas e respeita o trial de receitas', () => {
    const user = account('2026-09-24T18:00:00Z');
    expect(canAccessRecipe(user, { is_free: true } as any)).toBe(true);
    user.trial_expires_at = new Date('2026-09-26T18:00:00Z');
    expect(canAccessRecipe(user, { is_free: false } as any)).toBe(true);
    expect(canAccessTreino(user)).toBe(false);
  });
});
