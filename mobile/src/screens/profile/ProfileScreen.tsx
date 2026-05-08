import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';

import AppBackground from '../../components/AppBackground';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão apagados permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir permanentemente', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteAccount();
              await logout();
              Alert.alert('Sucesso', 'Sua conta foi excluída com sucesso.');
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível excluir sua conta. Tente novamente mais tarde.');
            }
          }
        },
      ]
    );
  };

  const getPlanDisplayName = () => {
    if (user?.subscription_tier === 'premium_fit') return 'Premium Fit';
    if (user?.subscription_tier === 'premium') return 'Premium';
    if (user?.subscription_tier === 'basic') return 'Básico';
    return 'Nenhum';
  };

  const getPlanColor = () => {
    if (user?.subscription_tier === 'premium_fit' || user?.subscription_tier === 'premium') {
      return colors.primary;
    }
    return colors.textMuted;
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerTopBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={styles.titleUnderline} />
        </View>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Profile Card Modernizado */}
            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={32} color={colors.primary} />
                  </View>
                </View>
                <View style={styles.profileHeaderText}>
                  <Text style={styles.profileName}>{user?.nome || 'Usuário'}</Text>
                  <View style={styles.planBadge}>
                    <Ionicons name="diamond" size={14} color={getPlanColor()} />
                    <Text style={[styles.planText, { color: getPlanColor() }]}>
                      {getPlanDisplayName()}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.profileInfo}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user?.email || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons Modernizados */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Subscriptions' as never)}
              >
                <View style={styles.actionButtonContent}>
                  <View style={[styles.actionIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                    <Ionicons name="diamond" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.actionButtonTextContainer}>
                    <Text style={styles.actionButtonTitle}>Gerenciar Assinatura</Text>
                    <Text style={styles.actionButtonSubtitle}>Atualizar ou cancelar seu plano</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('NotificationSettings' as never)}
              >
                <View style={styles.actionButtonContent}>
                  <View style={[styles.actionIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                    <Ionicons name="notifications-outline" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.actionButtonTextContainer}>
                    <Text style={styles.actionButtonTitle}>Notificações</Text>
                    <Text style={styles.actionButtonSubtitle}>Configurar alertas e avisos</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <View style={styles.logoutButtonContent}>
                <Ionicons name="log-out-outline" size={20} color={colors.text} />
                <Text style={styles.logoutButtonText}>Sair da Conta</Text>
              </View>
            </TouchableOpacity>

            {/* Account Deletion */}
            <TouchableOpacity 
              style={styles.deleteAccountButton} 
              onPress={handleDeleteAccount}
            >
              <Text style={styles.deleteAccountText}>Excluir minha conta permanentemente</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: fonts.title,
    color: colors.primaryLight,
    marginBottom: 8,
  },
  titleUnderline: {
    height: 2,
    backgroundColor: colors.primaryDark,
    width: 100,
    borderRadius: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}20`,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeaderText: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontFamily: fonts.title,
    color: colors.text,
    marginBottom: 6,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planText: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 20,
  },
  profileInfo: {
    marginBottom: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.text,
    lineHeight: 22,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionButtonTextContainer: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: colors.text,
    marginBottom: 2,
  },
  actionButtonSubtitle: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
  logoutButton: {
    backgroundColor: colors.error,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
    width: '100%',
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.bodyBold,
    textAlign: 'center',
  },
  deleteAccountButton: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  deleteAccountText: {
    color: '#ff4444',
    fontSize: 12,
    fontFamily: fonts.body,
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
});
