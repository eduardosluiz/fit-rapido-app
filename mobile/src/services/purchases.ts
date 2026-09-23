import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

export const REVENUECAT_API_KEYS = {
  // Chave pública do SDK iOS; pode ser incluída no aplicativo distribuído.
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim() || 'appl_UzqLynGzJFsrevqDWCzknDtLxtB',
  google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim(),
};

let configuredPlatform: 'ios' | 'android' | null = null;

export const configurePurchases = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  if (configuredPlatform === platform) return true;

  const apiKey = platform === 'ios'
    ? REVENUECAT_API_KEYS.apple
    : REVENUECAT_API_KEYS.google;

  if (!apiKey) {
    console.warn(`RevenueCat não configurado para ${platform}: chave pública ausente.`);
    return false;
  }

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
  Purchases.configure({ apiKey });
  configuredPlatform = platform;

  return true;
};
