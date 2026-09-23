import { SubscriptionTier } from '../auth/entities/user.entity';

export const REVENUECAT_ENTITLEMENTS = {
  PREMIUM: 'premium',
  PREMIUM_FIT: 'premium_fit',
} as const;

export function getRevenueCatTier(event: any): SubscriptionTier | null {
  const entitlementIds = Array.isArray(event?.entitlement_ids)
    ? event.entitlement_ids
    : event?.entitlement_id ? [event.entitlement_id] : [];
  const productId = String(event?.product_id || '');

  if (
    entitlementIds.includes(REVENUECAT_ENTITLEMENTS.PREMIUM_FIT) ||
    productId.startsWith('premium_fit_')
  ) {
    return SubscriptionTier.PREMIUM_FIT;
  }

  if (
    entitlementIds.includes(REVENUECAT_ENTITLEMENTS.PREMIUM) ||
    productId.startsWith('premium_')
  ) {
    return SubscriptionTier.PREMIUM;
  }

  return null;
}
