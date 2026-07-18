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

// Oculta a caixa amarela de avisos na tela
LogBox.ignoreLogs([
  'Animated: `useNativeDriver` is not supported',
  'props.pointerEvents is deprecated',
  'style.resizeMode is deprecated',
  'Video component from `expo-av` is deprecated',
]);

// Oculta os avisos diretamente no Console (F12) do navegador para manter limpo
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string') {
    if (
      args[0].includes('useNativeDriver') ||
      args[0].includes('pointerEvents') ||
      args[0].includes('resizeMode') ||
      args[0].includes('expo-av')
    ) {
      return; // Ignora e não imprime
    }
  }
  originalWarn(...args);
};

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    async function configureAudio() {
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
    }
    configureAudio();
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

