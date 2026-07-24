import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

// TODO: Substituir pelas chaves reais geradas no painel do RevenueCat da cliente
export const REVENUECAT_API_KEYS = {
  apple: 'appl_api_key_placeholder',
  google: 'goog_api_key_placeholder',
};

export const configurePurchases = async () => {
  if (Platform.OS === 'web') return; // RevenueCat não suporta Web nativamente

  Purchases.setLogLevel(LOG_LEVEL.DEBUG);

  if (Platform.OS === 'ios') {
    Purchases.configure({ apiKey: REVENUECAT_API_KEYS.apple });
  } else if (Platform.OS === 'android') {
    Purchases.configure({ apiKey: REVENUECAT_API_KEYS.google });
  }
};
