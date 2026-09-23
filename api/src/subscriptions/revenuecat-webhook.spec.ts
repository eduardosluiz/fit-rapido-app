import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionTier } from '../auth/entities/user.entity';

describe('RevenueCat webhook lifecycle', () => {
  const users = { findOne: jest.fn(), update: jest.fn() };
  const service = new SubscriptionsService({} as any, users as any, {} as any);
  beforeEach(() => { jest.clearAllMocks(); users.findOne.mockResolvedValue({ id: 'user' }); users.update.mockResolvedValue({}); });
  it('ignores test events without querying customers', async () => {
    await service.processRevenueCatWebhook({ type: 'TEST', app_user_id: 'sample' });
    expect(users.findOne).not.toHaveBeenCalled();
  });
  it('grants the complete tier and preserves access on cancellation', async () => {
    await service.processRevenueCatWebhook({ type: 'INITIAL_PURCHASE', app_user_id: 'user', product_id: 'premium_fit_monthly', expiration_at_ms: 2000000000000 });
    expect(users.update).toHaveBeenCalledWith('user', { subscription_tier: SubscriptionTier.PREMIUM_FIT, subscription_expires_at: new Date(2000000000000) });
    users.update.mockClear();
    await service.processRevenueCatWebhook({ type: 'CANCELLATION', app_user_id: 'user', product_id: 'premium_fit_monthly' });
    expect(users.update).not.toHaveBeenCalled();
  });
  it('removes paid access on expiration', async () => {
    await service.processRevenueCatWebhook({ type: 'EXPIRATION', app_user_id: 'user', product_id: 'premium_monthly' });
    expect(users.update).toHaveBeenCalledWith('user', { subscription_tier: SubscriptionTier.NONE, subscription_expires_at: null });
  });
  it('returns an error for retry when persistence fails', async () => {
    users.update.mockRejectedValueOnce(new Error('database unavailable'));
    await expect(service.processRevenueCatWebhook({ type: 'RENEWAL', app_user_id: 'user', product_id: 'premium_monthly' })).rejects.toThrow('Não foi possível processar a assinatura');
  });
  it('does not treat the free trial as a paid subscription', async () => {
    users.findOne.mockResolvedValueOnce({ subscription_tier: SubscriptionTier.FREE });
    expect((await service.getStatus('user')).active).toBe(false);
  });
});
