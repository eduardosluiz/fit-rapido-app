import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { notificationService } from '../../services/notifications';
import * as Notifications from 'expo-notifications';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    loadNotificationStatus();
  }, []);

  const loadNotificationStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(status === 'granted');
      
      const currentToken = notificationService.getCurrentToken();
      setToken(currentToken);
    } catch (error) {
      console.error('Erro ao carregar status de notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    try {
      if (value) {
        const hasPermission = await notificationService.requestPermission();
        if (hasPermission) {
          const newToken = await notificationService.getToken();
          setToken(newToken);
          await notificationService.registerToken();
          setNotificationsEnabled(true);
          Alert.alert('Sucesso', 'Notificações ativadas com sucesso!');
        } else {
          Alert.alert(
            'Permissão Negada',
            'Para receber notificações, você precisa permitir notificações nas configurações do dispositivo.'
          );
        }
      } else {
        await notificationService.unregisterToken();
        setNotificationsEnabled(false);
        setToken(null);
        Alert.alert('Notificações Desativadas', 'Você não receberá mais notificações push.');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao alterar configurações de notificações');
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.scheduleLocalNotification(
        'Teste de Notificação',
        'Esta é uma notificação de teste do Fit & Rápido!',
        { type: 'test' }
      );
      Alert.alert('Sucesso', 'Notificação de teste enviada!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao enviar notificação de teste');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status das Notificações */}
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notificações Push</Text>
              <Text style={styles.settingDescription}>
                Receba notificações sobre novas receitas, treinos e atualizações
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={notificationsEnabled ? colors.text : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Informações do Token */}
        {token && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Token Registrado</Text>
              <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
                {token}
              </Text>
              <Text style={styles.infoSubtext}>
                Seu dispositivo está registrado para receber notificações
              </Text>
            </View>
          </View>
        )}

        {/* Teste de Notificação */}
        {notificationsEnabled && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestNotification}
            >
              <Text style={styles.testButtonText}>🔔 Enviar Notificação de Teste</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Informações Adicionais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre Notificações</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              • Você receberá notificações sobre novas receitas e treinos
            </Text>
            <Text style={styles.infoText}>
              • As notificações podem ser gerenciadas nas configurações do dispositivo
            </Text>
            <Text style={styles.infoText}>
              • Você pode desativar as notificações a qualquer momento
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.title,
    color: colors.text,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.title,
    color: colors.text,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textMuted,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.primary,
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
  infoText: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 8,
  },
  testButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.bodyBold,
  },
});

