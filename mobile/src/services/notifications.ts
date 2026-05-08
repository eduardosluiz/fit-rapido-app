import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurar como as notificações devem ser tratadas quando o app está em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NOTIFICATION_TOKEN_KEY = '@fitrapido:notification_token';

export class NotificationService {
  private static instance: NotificationService;
  private token: string | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Solicita permissão para notificações
   */
  async requestPermission(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Permissão de notificações negada');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificações:', error);
      return false;
    }
  }

  /**
   * Obtém o token FCM/APNS
   */
  async getToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return null;
      }

      // Em desenvolvimento, usar token mock se não tiver Firebase configurado
      if (__DEV__) {
        const mockToken = await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
        if (mockToken) {
          this.token = mockToken;
          return mockToken;
        }

        // Gerar token mock para desenvolvimento
        const newMockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, newMockToken);
        this.token = newMockToken;
        return newMockToken;
      }

      // Em produção, obter token real do Expo
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Substituir quando tiver Firebase configurado
      });

      this.token = tokenData.data;
      await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, this.token);
      return this.token;
    } catch (error) {
      console.error('Erro ao obter token de notificação:', error);
      return null;
    }
  }

  /**
   * Registra o token no backend
   */
  async registerToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.warn('Token de notificação não disponível');
        return false;
      }

      const plataforma = Platform.OS === 'ios' ? 'ios' : 'android';
      await api.registerNotificationToken(token, plataforma);
      console.log('Token de notificação registrado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao registrar token de notificação:', error);
      return false;
    }
  }

  /**
   * Remove o token do backend
   */
  async unregisterToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        return true;
      }

      await api.removeNotificationToken(token);
      await AsyncStorage.removeItem(NOTIFICATION_TOKEN_KEY);
      this.token = null;
      console.log('Token de notificação removido com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao remover token de notificação:', error);
      return false;
    }
  }

  /**
   * Configura listeners de notificações
   */
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ) {
    // Listener para quando uma notificação é recebida (foreground)
    const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notificação recebida:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listener para quando o usuário toca em uma notificação
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notificação tocada:', response);
      if (onNotificationTapped) {
        onNotificationTapped(response);
      }
    });

    return {
      remove: () => {
        // Os listeners retornados por addNotificationReceivedListener e addNotificationResponseReceivedListener
        // têm um método remove() que deve ser chamado diretamente
        if (receivedListener && typeof receivedListener.remove === 'function') {
          receivedListener.remove();
        }
        if (responseListener && typeof responseListener.remove === 'function') {
          responseListener.remove();
        }
      },
    };
  }

  /**
   * Cancela todas as notificações agendadas
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Cancela uma notificação específica
   */
  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  /**
   * Agenda uma notificação local
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: trigger || null, // null = enviar imediatamente
    });

    return identifier;
  }

  /**
   * Obtém o token atual (sem solicitar permissão)
   */
  getCurrentToken(): string | null {
    return this.token;
  }
}

export const notificationService = NotificationService.getInstance();

