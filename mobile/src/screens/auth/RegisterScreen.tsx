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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [aceitaTermos, setAceitaTermos] = useState(false);
  const [aceitaPrivacidade, setAceitaPrivacidade] = useState(false);

  const handleRegister = async () => {
    if (!nome || !email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Junte-se ao Fit & Rápido</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor="#666"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />

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

            <View style={styles.consentContainer}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAceitaTermos(!aceitaTermos)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox, 
                  aceitaTermos && styles.checkboxChecked,
                  !aceitaTermos && { borderColor: '#444' }
                ]}>
                  {aceitaTermos && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={styles.consentText}>
                  Li e aceito os{' '}
                  <Text
                    style={styles.consentLink}
                    onPress={() => navigation.navigate('TermsOfService' as never)}
                  >
                    Termos de Uso
                  </Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAceitaPrivacidade(!aceitaPrivacidade)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox, 
                  aceitaPrivacidade && styles.checkboxChecked,
                  !aceitaPrivacidade && { borderColor: '#444' }
                ]}>
                  {aceitaPrivacidade && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={styles.consentText}>
                  Li e aceito a{' '}
                  <Text
                    style={styles.consentLink}
                    onPress={() => navigation.navigate('PrivacyPolicy' as never)}
                  >
                    Política de Privacidade
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Criando...' : 'Criar Conta'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.linkText}>
                Já tem conta? <Text style={styles.linkTextBold}>Entrar</Text>
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
    backgroundColor: '#0f0f0f',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#c8921a',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#c8921a',
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
    fontWeight: 'bold',
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
    color: '#c8921a',
    fontWeight: 'bold',
  },
  consentContainer: {
    marginBottom: 16,
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  checkboxChecked: {
    backgroundColor: '#c8921a',
    borderColor: '#c8921a',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  consentText: {
    color: '#999',
    fontSize: 13,
    flex: 1,
  },
  consentLink: {
    color: '#c8921a',
    fontWeight: '600',
  },
});

