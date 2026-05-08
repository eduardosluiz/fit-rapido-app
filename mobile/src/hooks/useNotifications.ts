import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { notificationService } from '../services/notifications';
import { Alert } from 'react-native';

export function useNotifications() {
  const navigation = useNavigation();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    // Configurar listeners de notificações
    const listeners = notificationService.setupNotificationListeners(
      // Quando uma notificação é recebida (foreground)
      (notification) => {
        console.log('Notificação recebida:', notification);
        // Você pode mostrar um alerta ou atualizar o estado aqui
        const { title, body } = notification.request.content;
        Alert.alert(title || 'Nova notificação', body || '');
      },
      // Quando o usuário toca em uma notificação
      (response) => {
        console.log('Notificação tocada:', response);
        const data = response.notification.request.content.data;
        
        // Navegar para a tela apropriada baseado nos dados da notificação
        if (data?.type === 'receita' && data?.receitaId) {
          (navigation as any).navigate('Receitas', { screen: 'ReceitaDetail', params: { receitaId: data.receitaId } });
        } else if (data?.type === 'treino' && data?.treinoId) {
          (navigation as any).navigate('Treinos', { screen: 'TreinoDetail', params: { treinoId: data.treinoId } });
        }
      }
    );

    notificationListener.current = listeners;

    // Registrar token quando o hook é montado (só se autenticado)
    // O AuthContext já faz isso no login, mas garantimos aqui também
    notificationService.registerToken().catch((error) => {
      console.error('Erro ao registrar token de notificação:', error);
    });

    return () => {
      // Limpar listeners ao desmontar
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
    };
  }, [navigation]);

  return {
    // Funções úteis que podem ser expostas
    scheduleNotification: notificationService.scheduleLocalNotification.bind(notificationService),
    cancelAll: notificationService.cancelAllNotifications.bind(notificationService),
  };
}

