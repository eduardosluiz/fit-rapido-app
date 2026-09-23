import { SubscriptionTier } from '../auth/entities/user.entity';
import { getRevenueCatTier } from './revenuecat.helper';

describe('getRevenueCatTier', () => {
  it('identifica o plano completo antes do prefixo premium', () => {
    expect(getRevenueCatTier({ product_id: 'premium_fit_annual' }))
      .toBe(SubscriptionTier.PREMIUM_FIT);
  });

  it('identifica os dois entitlements configurados', () => {
    expect(getRevenueCatTier({ entitlement_ids: ['premium'] }))
      .toBe(SubscriptionTier.PREMIUM);
    expect(getRevenueCatTier({ entitlement_ids: ['premium_fit'] }))
      .toBe(SubscriptionTier.PREMIUM_FIT);
  });

  it('ignora produtos que não pertencem ao aplicativo', () => {
    expect(getRevenueCatTier({ product_id: 'unknown_monthly' })).toBeNull();
  });
});
