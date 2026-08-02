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
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';
import SocialLoginButtons from '../../components/SocialLoginButtons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [lembrarDados, setLembrarDados] = useState(false);

  React.useEffect(() => {
    const fetchCover = async () => {
      try {
        const { API_URL } = require('../../services/api');
        let response = await fetch(`${API_URL}/configuracoes/public/login_cover_mobile_url`);
        let data = await response.json();
        if (data && data.valor) {
          setCoverUrl(data.valor);
        } else {
          response = await fetch(`${API_URL}/configuracoes/public/login_cover_url`);
          data = await response.json();
          if (data && data.valor) {
            setCoverUrl(data.valor);
          }
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Background Image absolute container with border-infinity gradient */}
        <View style={styles.absoluteImageContainer}>
          <Image
            source={coverUrl ? { uri: coverUrl } : require('../../../assets/banners/bannerinicial.jpg')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          {/* Horizontal Gradient: Fades left to black */}
          <LinearGradient
            colors={[colors.background, 'rgba(28, 27, 30, 0.4)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Vertical Gradient: Fades bottom to black */}
          <LinearGradient
            colors={['transparent', 'rgba(28, 27, 30, 0.3)', colors.background]}
            start={{ x: 0, y: 0.15 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.content}>
          {/* Superior: Título + Slogan da Dai */}
          <View style={styles.headerRow}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.titleText}>Fit & Rápido</Text>
              
              <View style={styles.pulseContainer}>
                <View style={styles.pulseLine} />
                <Ionicons name="pulse" size={14} color={colors.primary} style={{ marginHorizontal: 4 }} />
                <View style={styles.pulseLine} />
              </View>

              <Text style={styles.taglineText}>Receitas & Treinos{"\n"}para sua melhor versão</Text>
            </View>
          </View>

          {/* Bem-vindo de volta */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>
              <Text style={styles.welcomeTitleGold}>Bem-vindo</Text> de volta!
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Acesse suas receitas favoritas, seus treinos e continue evoluindo todos os dias.
            </Text>
          </View>

          {/* Highlights / Features Grid (Glassmorphism card) */}
          <View style={styles.highlightsContainer}>
            <View style={styles.highlightItem}>
              <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
              <Text style={styles.highlightText}>+200{"\n"}receitas{"\n"}saudáveis</Text>
            </View>
            <View style={styles.verticalDivider} />

            <View style={styles.highlightItem}>
              <MaterialCommunityIcons name="dumbbell" size={20} color={colors.primary} />
              <Text style={styles.highlightText}>treinos para{"\n"}todos os{"\n"}níveis</Text>
            </View>
            <View style={styles.verticalDivider} />

            <View style={styles.highlightItem}>
              <Ionicons name="heart-outline" size={20} color={colors.primary} />
              <Text style={styles.highlightText}>foco na sua{"\n"}melhor{"\n"}versão</Text>
            </View>
            <View style={styles.verticalDivider} />

            <View style={styles.highlightItem}>
              <Ionicons name="flame-outline" size={20} color={colors.primary} />
              <Text style={styles.highlightText}>resultados{"\n"}reais e{"\n"}consistentes</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Input Email */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#8A8892" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#8A8892"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Input Senha */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8A8892" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#8A8892"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#8A8892" 
                />
              </TouchableOpacity>
            </View>

            {/* Lembrar dados & Esqueci minha senha */}
            <View style={styles.rememberForgotRow}>
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => setLembrarDados(!lembrarDados)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={lembrarDados ? "checkbox" : "square-outline"} 
                  size={18} 
                  color={lembrarDados ? colors.primary : "#8A8892"} 
                />
                <Text style={styles.checkboxLabel}>Lembrar meus dados</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => Alert.alert('Recuperação de Senha', 'Funcionalidade em desenvolvimento. Entre em contato com o suporte.')}>
                <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
              </TouchableOpacity>
            </View>

            {/* Botão Entrar */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Text>
              {!loading && <Ionicons name="arrow-forward" size={18} color="#000000" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>

            {/* Cadastro */}
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Register' as never)}
            >
              <Text style={styles.linkText}>
                Não tem conta? <Text style={styles.linkTextBold}>Cadastre-se</Text>
              </Text>
            </TouchableOpacity>

            <SocialLoginButtons onLoading={setLoading} />

            {/* Rodapé de privacidade */}
            <View style={styles.footerContainer}>
              <Ionicons name="lock-closed-outline" size={12} color="#8A8892" style={{ marginRight: 6 }} />
              <Text style={styles.footerText}>
                Seus dados estão <Text style={styles.footerTextGold}>protegidos e seguros</Text> conosco.
              </Text>
            </View>
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
    paddingBottom: 24,
  },
  absoluteImageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: SCREEN_WIDTH * 0.65,
    height: 380,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  content: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  headerTextContainer: {
    width: SCREEN_WIDTH * 0.48,
    paddingTop: 8,
  },
  titleText: {
    fontSize: 26,
    fontFamily: fonts.title,
    color: '#ffffff',
    marginBottom: 4,
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  pulseLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 210, 111, 0.25)',
  },
  taglineText: {
    fontSize: 10,
    fontFamily: fonts.body,
    color: '#B8B8C0',
    lineHeight: 14,
  },
  welcomeContainer: {
    marginBottom: 20,
    marginTop: 20,
  },
  welcomeTitle: {
    fontSize: 22,
    fontFamily: fonts.title,
    color: '#ffffff',
    marginBottom: 6,
  },
  welcomeTitleGold: {
    color: colors.primary,
  },
  welcomeSubtitle: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: '#8A8892',
    lineHeight: 18,
    maxWidth: '65%',
  },
  highlightsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(35, 33, 41, 0.45)',
    borderWidth: 1.2,
    borderColor: 'rgba(231, 196, 138, 0.15)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  highlightItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: {
    color: '#B8B8C0',
    fontSize: 8.5,
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 11,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(231, 196, 138, 0.15)',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(35, 33, 41, 0.75)',
    borderWidth: 1.2,
    borderColor: 'rgba(231, 196, 138, 0.2)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    fontFamily: fonts.body,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    color: '#B8B8C0',
    fontSize: 13,
    fontFamily: fonts.body,
    marginLeft: 8,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 11.5,
    fontFamily: fonts.bodySemiBold,
  },
  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
  },
  linkButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  linkText: {
    color: '#8A8892',
    fontSize: 14,
    fontFamily: fonts.body,
  },
  linkTextBold: {
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  footerText: {
    color: '#8A8892',
    fontSize: 11,
    fontFamily: fonts.body,
  },
  footerTextGold: {
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
  },
});

