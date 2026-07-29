import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './navigation';
import OfflineNotice from './components/OfflineNotice';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet, LogBox, Platform } from 'react-native';
import { Audio } from 'expo-av';
import colors from './constants/colors';

import { configurePurchases } from './services/purchases';

// Oculta a caixa amarela de avisos na tela
LogBox.ignoreLogs([
  'Animated: `useNativeDriver` is not supported',
  'props.pointerEvents is deprecated',
  'style.resizeMode is deprecated',
  'Video component from `expo-av` is deprecated',
  'NotFoundError',
  'removeChild',
]);

// Oculta os avisos diretamente no Console (F12) do navegador web para manter o ambiente de testes limpo
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (
      msg.includes('useNativeDriver') ||
      msg.includes('pointerEvents') ||
      msg.includes('resizeMode') ||
      msg.includes('expo-av') ||
      msg.includes('error occurred in the') ||
      msg.includes('error boundary') ||
      msg.includes('NativeSafeAreaProvider') ||
      msg.includes('Notificações') ||
      msg.includes('notificação')
    ) {
      return;
    }
    originalWarn(...args);
  };

  const originalError = console.error;
  console.error = (...args) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (
      msg.includes('removeChild') ||
      msg.includes('NotFoundError') ||
      msg.includes('notificação')
    ) {
      return;
    }
    originalError(...args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('removeChild') || event.reason?.message?.includes('NotFoundError')) {
      event.preventDefault();
    }
  });
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    async function setupApp() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.warn('Erro ao configurar áudio:', e);
      }
      
      try {
        await configurePurchases();
      } catch (e) {
        console.warn('Erro ao configurar purchases:', e);
      }
    }
    setupApp();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Navigation />
        <OfflineNotice />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

