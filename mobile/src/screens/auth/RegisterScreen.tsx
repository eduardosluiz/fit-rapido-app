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
import { api } from '../../services/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';
import SocialLoginButtons from '../../components/SocialLoginButtons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [aceitaTermos, setAceitaTermos] = useState(false);
  const [aceitaPrivacidade, setAceitaPrivacidade] = useState(false);
  
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

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

  const handleRegister = async () => {
    if (!nome || !email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(senha)) {
      Alert.alert('Erro', 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número');
      return;
    }

    if (!aceitaTermos || !aceitaPrivacidade) {
      Alert.alert('Erro', 'Você deve aceitar os Termos de Uso e a Política de Privacidade');
      return;
    }

    setLoading(true);
    try {
      await register(email, nome, senha);
      // Registrar consentimentos
      await api.createConsentimento('terms', true);
      await api.createConsentimento('privacy', true);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao criar conta');
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
          {/* Horizontal Gradient */}
          <LinearGradient
            colors={[colors.background, 'rgba(28, 27, 30, 0.4)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Vertical Gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(28, 27, 30, 0.3)', colors.background]}
            start={{ x: 0, y: 0.15 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Botão Voltar */}
        <TouchableOpacity 
          onPress={() => step === 2 ? setStep(1) : navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.content}>
          {step === 1 ? (
            /* Passo 1: Aceite de Termos */
            <View style={styles.wizardStep}>
              {/* Escudo no topo */}
              <View style={styles.shieldIconContainer}>
                <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
              </View>

              <Text style={styles.wizardTitle}>
                Falta só <Text style={styles.wizardTitleGold}>um passo</Text>
              </Text>
              <Text style={styles.wizardSubtitle}>
                Seu acesso é pessoal e exclusivo. Para continuar, confirme que você concorda com as condições abaixo.
              </Text>

              {/* Box de Condições (Glassmorphism card) */}
              <View style={styles.conditionsBox}>
                {/* Condição 1 */}
                <View style={styles.conditionRow}>
                  <View style={styles.conditionIconCircle}>
                    <Ionicons name="person-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.conditionTextContainer}>
                    <Text style={styles.conditionTitle}>Uso individual</Text>
                    <Text style={styles.conditionDesc}>Sua conta é pessoal e de uso individual.</Text>
                  </View>
                </View>

                {/* Condição 2 */}
                <View style={styles.conditionRow}>
                  <View style={styles.conditionIconCircle}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.conditionTextContainer}>
                    <Text style={styles.conditionTitle}>Conteúdo exclusivo</Text>
                    <Text style={styles.conditionDesc}>Os treinos, receitas e materiais são exclusivos para assinantes do aplicativo.</Text>
                  </View>
                </View>

                {/* Condição 3 */}
                <View style={styles.conditionRow}>
                  <View style={styles.conditionIconCircle}>
                    <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.conditionTextContainer}>
                    <Text style={styles.conditionTitle}>Termos e privacidade</Text>
                    <Text style={styles.conditionDesc}>Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.</Text>
                  </View>
                </View>
              </View>

              {/* Checkbox Único */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => {
                  setAceitaTermos(!aceitaTermos);
                  setAceitaPrivacidade(!aceitaTermos);
                }}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={aceitaTermos ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={aceitaTermos ? colors.primary : "#8A8892"} 
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.checkboxLabel}>
                  Li e aceito os <Text style={styles.checkboxLabelGold} onPress={() => navigation.navigate('TermsOfService' as never)}>Termos de Uso</Text> e a <Text style={styles.checkboxLabelGold} onPress={() => navigation.navigate('PrivacyPolicy' as never)}>Política de Privacidade</Text>.
                </Text>
              </TouchableOpacity>

              {/* Botão Continuar */}
              <TouchableOpacity
                style={[styles.button, !aceitaTermos && styles.buttonDisabled]}
                onPress={() => {
                  if (!aceitaTermos) {
                    Alert.alert('Aviso', 'Você precisa aceitar os Termos de Uso e Política de Privacidade para continuar.');
                    return;
                  }
                  setStep(2);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Continuar</Text>
                <Ionicons name="chevron-forward" size={16} color="#000000" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          ) : (
            /* Passo 2: Formulário de Cadastro */
            <View style={styles.formStep}>
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>Junte-se ao Fit & Rápido</Text>

              <View style={styles.form}>
                {/* Input Nome */}
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#8A8892" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome"
                    placeholderTextColor="#8A8892"
                    value={nome}
                    onChangeText={setNome}
                    autoCapitalize="words"
                  />
                </View>

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

                {/* Botão Registrar */}
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Criando...' : 'Criar Conta'}
                  </Text>
                  {!loading && <Ionicons name="arrow-forward" size={18} color="#000000" style={{ marginLeft: 8 }} />}
                </TouchableOpacity>

                {/* Já tem conta? Entrar */}
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.linkText}>
                    Já tem conta? <Text style={styles.linkTextBold}>Entrar</Text>
                  </Text>
                </TouchableOpacity>

                <SocialLoginButtons onLoading={setLoading} isSignUp />

                {/* Rodapé de privacidade */}
                <View style={styles.footerContainer}>
                  <Ionicons name="lock-closed-outline" size={12} color="#8A8892" style={{ marginRight: 6 }} />
                  <Text style={styles.footerText}>
                    Seus dados estão <Text style={styles.footerTextGold}>protegidos e seguros</Text> conosco.
                  </Text>
                </View>
              </View>
            </View>
          )}
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 28,
    left: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  content: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 96 : 76,
  },
  wizardStep: {
    width: '100%',
  },
  formStep: {
    width: '100%',
  },
  shieldIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  wizardTitle: {
    fontSize: 26,
    fontFamily: fonts.title,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  wizardTitleGold: {
    color: colors.primary,
  },
  wizardSubtitle: {
    fontSize: 13.5,
    fontFamily: fonts.body,
    color: '#B8B8C0',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  conditionsBox: {
    backgroundColor: 'rgba(35, 33, 41, 0.45)',
    borderWidth: 1.2,
    borderColor: 'rgba(231, 196, 138, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 210, 111, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  conditionTextContainer: {
    flex: 1,
  },
  conditionTitle: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: '#ffffff',
    marginBottom: 2,
  },
  conditionDesc: {
    fontSize: 11.5,
    fontFamily: fonts.body,
    color: '#8A8892',
    lineHeight: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkboxLabel: {
    flex: 1,
    color: '#B8B8C0',
    fontSize: 12.5,
    fontFamily: fonts.body,
    lineHeight: 17,
  },
  checkboxLabelGold: {
    color: colors.primary,
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
  title: {
    fontSize: 28,
    fontFamily: fonts.title,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 24,
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
  linkButton: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
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

