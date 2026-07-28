import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/notifications';
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (email: string, nome: string, senha: string) => Promise<void>;
  socialLogin: (provider: string, token: string, email?: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const configureRevenueCatUser = async (userId: string) => {
    if (Platform.OS === 'web') return;
    try {
      await Purchases.logIn(userId);
    } catch (e) {
      console.warn('Erro ao fazer login no RevenueCat:', e);
    }
  };

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const profile = await api.getProfile();
        setUser(profile);
        if (profile?.id) {
          await configureRevenueCatUser(profile.id.toString());
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      await AsyncStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, senha: string) => {
    try {
      console.log('Iniciando login para:', email);
      const data = await api.login(email, senha);
      
      // Verificar se a resposta é válida
      if (!data || !data.access_token) {
        throw new Error('Resposta inválida do servidor: token não recebido');
      }
      
      // Verificar se o token foi salvo
      const savedToken = await AsyncStorage.getItem('auth_token');
      
      // Atualizar o estado do usuário
      if (data.user) {
        setUser(data.user);
        if (data.user.id) {
          await configureRevenueCatUser(data.user.id.toString());
        }
      } else {
        throw new Error('Dados do usuário não recebidos');
      }
      
      // Aguardar um pouco para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Registrar token de notificação após login
      try {
        await notificationService.registerToken();
      } catch (notifError) {
        console.warn('Erro ao registrar token de notificação:', notifError);
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const socialLogin = async (provider: string, token: string, email?: string, name?: string) => {
    try {
      const data = await api.socialLogin(provider, token, email, name);
      
      if (!data || !data.access_token) {
        throw new Error('Resposta inválida do servidor: token não recebido');
      }
      
      if (data.user) {
        setUser(data.user);
        if (data.user.id) {
          await configureRevenueCatUser(data.user.id.toString());
        }
      } else {
        throw new Error('Dados do usuário não recebidos');
      }
      
      try {
        await notificationService.registerToken();
      } catch (notifError) {
        console.warn('Erro ao registrar token de notificação:', notifError);
      }
    } catch (error: any) {
      console.error(`Erro no login via ${provider}:`, error);
      throw error;
    }
  };

  const register = async (email: string, nome: string, senha: string) => {
    const data = await api.register(email, nome, senha);
    if (data && data.access_token) {
      await AsyncStorage.setItem('auth_token', data.access_token);
    }
    setUser(data.user);
    if (data.user?.id) {
      await configureRevenueCatUser(data.user.id.toString());
    }
    // Registrar token de notificação após registro
    await notificationService.registerToken();
  };

  const logout = async () => {
    // Remover token de notificação antes de fazer logout
    await notificationService.unregisterToken();
    await api.logout();
    setUser(null);
    if (Platform.OS !== 'web') {
      try {
        await Purchases.logOut();
      } catch (e) {
        console.warn('Erro ao fazer logout no RevenueCat:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

