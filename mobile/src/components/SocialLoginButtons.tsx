import React from 'react';
import { View, StyleSheet, Platform, Alert, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// Configuração do Google Sign In (TODO: Substituir webClientId real do Google Cloud)
GoogleSignin.configure({
  webClientId: 'SUA_CHAVE_WEB_AQUI.apps.googleusercontent.com',
  iosClientId: 'SUA_CHAVE_IOS_AQUI.apps.googleusercontent.com',
});

interface Props {
  onLoading: (isLoading: boolean) => void;
}

export default function SocialLoginButtons({ onLoading }: Props) {
  const { socialLogin } = useAuth();

  const handleAppleLogin = async () => {
    try {
      onLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      const email = credential.email || undefined;
      const name = credential.fullName ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() : undefined;
      
      await socialLogin('apple', credential.identityToken!, email, name);
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Erro', 'Não foi possível fazer login com a Apple.');
      }
    } finally {
      onLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      onLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const token = userInfo.idToken;
      if (!token) throw new Error('No token');
      
      await socialLogin('google', token, userInfo.user.email, userInfo.user.name || undefined);
    } catch (error: any) {
      if (error.code !== 'SIGN_IN_CANCELLED') {
        Alert.alert('Erro', 'Não foi possível fazer login com o Google.');
      }
    } finally {
      onLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>ou entre com</Text>
        <View style={styles.line} />
      </View>
      
      <View style={styles.buttonRow}>
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={8}
            style={styles.appleButton}
            onPress={handleAppleLogin}
          />
        )}
        
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Ionicons name="logo-google" size={24} color="#000" style={{ marginRight: 8 }} />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#999',
    marginHorizontal: 10,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'column',
    gap: 12,
  },
  appleButton: {
    width: '100%',
    height: 48,
  },
  googleButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  }
});
