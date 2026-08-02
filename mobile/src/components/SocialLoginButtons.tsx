import React from 'react';
import { View, StyleSheet, Platform, Alert, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import fonts from '../constants/fonts';

// Configuração do Google Sign In (TODO: Substituir webClientId real do Google Cloud)
GoogleSignin.configure({
  webClientId: 'SUA_CHAVE_WEB_AQUI.apps.googleusercontent.com',
  iosClientId: 'SUA_CHAVE_IOS_AQUI.apps.googleusercontent.com',
});

interface Props {
  onLoading: (isLoading: boolean) => void;
  isSignUp?: boolean;
}

export default function SocialLoginButtons({ onLoading, isSignUp = false }: Props) {
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
        <Text style={styles.dividerText}>{isSignUp ? 'ou cadastre-se com' : 'ou entre com'}</Text>
        <View style={styles.line} />
      </View>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.socialButton} onPress={handleAppleLogin} activeOpacity={0.8}>
          <Ionicons name="logo-apple" size={20} color="#ffffff" style={{ marginRight: 10 }} />
          <Text style={styles.socialButtonText}>
            {isSignUp ? 'Cadastrar com Apple' : 'Continuar com Apple'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin} activeOpacity={0.8}>
          <Ionicons name="logo-google" size={18} color="#ffffff" style={{ marginRight: 10 }} />
          <Text style={styles.socialButtonText}>
            {isSignUp ? 'Cadastrar com Google' : 'Continuar com Google'}
          </Text>
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
    marginTop: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 210, 111, 0.15)',
  },
  dividerText: {
    color: '#8A8892',
    marginHorizontal: 12,
    fontSize: 13,
    fontFamily: fonts.body,
  },
  buttonRow: {
    flexDirection: 'column',
    gap: 12,
  },
  socialButton: {
    width: '100%',
    height: 52,
    backgroundColor: 'rgba(35, 33, 41, 0.6)',
    borderWidth: 1.2,
    borderColor: 'rgba(231, 196, 138, 0.2)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
  }
});
