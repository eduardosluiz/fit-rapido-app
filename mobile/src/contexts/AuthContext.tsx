import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/notifications';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (email: string, nome: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const profile = await api.getProfile();
        setUser(profile);
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
      
      console.log('Login response:', { 
        hasUser: !!data.user, 
        hasToken: !!data.access_token,
        userId: data.user?.id,
        userEmail: data.user?.email 
      });
      
      // Verificar se o token foi salvo
      const savedToken = await AsyncStorage.getItem('auth_token');
      console.log('Token salvo no AsyncStorage:', !!savedToken, savedToken ? 'Token presente' : 'Token ausente');
      
      // Atualizar o estado do usuário
      if (data.user) {
        setUser(data.user);
        console.log('Estado do usuário atualizado:', data.user ? 'Usuário definido' : 'Usuário null');
      } else {
        throw new Error('Dados do usuário não recebidos');
      }
      
      // Aguardar um pouco para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar o estado após atualização
      const currentUser = await AsyncStorage.getItem('auth_token');
      console.log('Verificação final - Token ainda presente:', !!currentUser);
      
      // Registrar token de notificação após login
      try {
        await notificationService.registerToken();
      } catch (notifError) {
        console.warn('Erro ao registrar token de notificação:', notifError);
        // Não falhar o login se o registro de notificação falhar
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      // Re-lançar o erro para que o LoginScreen possa tratá-lo
      throw error;
      throw error;
    }
  };

  const register = async (email: string, nome: string, senha: string) => {
    const data = await api.register(email, nome, senha);
    setUser(data.user);
    // Registrar token de notificação após registro
    await notificationService.registerToken();
  };

  const logout = async () => {
    // Remover token de notificação antes de fazer logout
    await notificationService.unregisterToken();
    await api.logout();
    setUser(null);
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

