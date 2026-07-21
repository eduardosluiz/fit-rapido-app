import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchCover = async () => {
      try {
        const { API_URL } = require('../../services/api');
        const response = await fetch(`${API_URL}/configuracoes/public/login_cover_url`);
        const data = await response.json();
        if (data && data.valor) {
          setCoverUrl(data.valor);
        }
      } catch (e) {
        console.error('Error fetching login cover:', e);
      }
    };
    fetchCover();
  }, []);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await login(email, senha);
      // Se chegou aqui, o login foi bem-sucedido
      // A navegação será feita automaticamente pelo AuthContext
    } catch (error: any) {
      // Mensagem de erro mais amigável
      const errorMessage = error.message || 'Erro ao fazer login';
      
      // Verificar se é erro de credenciais
      if (errorMessage.includes('incorretos') || errorMessage.includes('Credenciais')) {
        Alert.alert(
          'Login Falhou',
          'Email ou senha incorretos.\n\nVerifique suas credenciais e tente novamente.',
          [{ text: 'OK' }]
        );
      } else if (errorMessage.includes('servidor') || errorMessage.includes('servidor')) {
        Alert.alert(
          'Erro de Conexão',
          'Não foi possível conectar ao servidor.\n\nVerifique sua conexão com a internet e tente novamente.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erro', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Banner acima do título */}
          <View style={styles.bannerContainer}>
            <Image
              source={coverUrl ? { uri: coverUrl } : require('../../../assets/banners/bannerinicial.jpg')}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>
          
          <Text style={styles.title}>Fit & Rápido</Text>
          <Text style={styles.subtitle}>Bem-vindo de volta!</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#666"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Register' as never)}
            >
              <Text style={styles.linkText}>
                Não tem conta? <Text style={styles.linkTextBold}>Cadastre-se</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  bannerContainer: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    alignSelf: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.title,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#999',
    fontSize: 14,
  },
  linkTextBold: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

