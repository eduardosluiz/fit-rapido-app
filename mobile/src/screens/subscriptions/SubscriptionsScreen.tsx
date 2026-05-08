import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../../theme'; // Importar do tema se disponível, senão usaremos valores locais

// Se os imports acima falharem devido ao caminho, usaremos os backups manuais abaixo

interface PlanPeriod {
  periodo: string;
  periodoDisplay: string;
  precoTotal: number;
  precoMensal: number;
  descontoPercentual: number;
  meses: number;
}

interface Plan {
  tier: string;
  nome: string;
  descricao: string;
  beneficios: string[];
  periodos: PlanPeriod[];
}

export default function SubscriptionsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    active: boolean;
    tier: string;
    expiresAt: Date | null;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, status] = await Promise.all([
        api.getSubscriptionPlans(),
        api.getSubscriptionStatus().catch(() => null),
      ]);
      setPlans(plansData.plans);
      if (status) {
        setSubscriptionStatus(status);
      }
    } catch (error: any) {
      console.error('Erro ao carregar planos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os planos disponíveis.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planTier: string, periodo: string) => {
    try {
      setLoading(true);
      
      // TODO: Implementar compra real quando tiver contas de desenvolvedor
      Alert.alert(
        'Compra em Desenvolvimento',
        'A funcionalidade de compra será ativada em breve. Por enquanto, você pode testar o app com conteúdo gratuito.',
        [{ text: 'OK', onPress: () => setLoading(false) }]
      );
      
      // Quando implementar IAP real:
      // 1. Iniciar compra com expo-in-app-purchases
      // 2. Obter receipt
      // 3. Enviar para API para validação com periodo
      // 4. Atualizar status local
      
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao processar compra');
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      // TODO: Implementar restauração de compras
      Alert.alert(
        'Restaurar Compras',
        'Funcionalidade de restauração será implementada em breve.',
        [{ text: 'OK', onPress: () => setLoading(false) }]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao restaurar compras');
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const getCurrentPlan = () => {
    if (!subscriptionStatus?.active) return null;
    return plans.find(p => p.tier === subscriptionStatus.tier);
  };

  const currentPlan = getCurrentPlan();

  if (loading && plans.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c8921a" />
          <Text style={styles.loadingText}>Carregando planos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assinaturas</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status atual */}
        {subscriptionStatus?.active && currentPlan && (
          <View style={styles.currentPlanCard}>
            <View style={styles.currentPlanHeader}>
              <Text style={styles.currentPlanTitle}>Plano Atual</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{currentPlan.nome.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.currentPlanDesc}>{currentPlan.descricao}</Text>
            {subscriptionStatus.expiresAt && (
              <Text style={styles.currentPlanExpiry}>
                Válido até: {new Date(subscriptionStatus.expiresAt).toLocaleDateString('pt-BR')}
              </Text>
            )}
          </View>
        )}

        {!subscriptionStatus?.active && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🎯 Escolha seu Plano</Text>
            <Text style={styles.infoText}>
              Desbloqueie todo o conteúdo premium e tenha acesso a receitas e treinos exclusivos.
            </Text>
          </View>
        )}

        {/* Planos */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            const isCurrentPlan = subscriptionStatus?.tier === plan.tier && subscriptionStatus?.active;
            const isPremiumFit = plan.tier === 'premium_fit';

            return (
              <View
                key={plan.tier}
                style={[
                  styles.planCard,
                  isPremiumFit && styles.planCardPremium,
                  isCurrentPlan && styles.planCardCurrent,
                ]}
              >
                {isPremiumFit && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>⭐ MAIS COMPLETO</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <Text style={[styles.planName, isPremiumFit && styles.planNamePremium]}>
                    {plan.nome}
                  </Text>
                  <Text style={styles.planDesc}>{plan.descricao}</Text>
                </View>

                {/* Benefícios */}
                <View style={styles.beneficiosContainer}>
                  {plan.beneficios.map((beneficio, index) => (
                    <View key={index} style={styles.beneficioItem}>
                      <Text style={styles.beneficioText}>{beneficio}</Text>
                    </View>
                  ))}
                </View>

                {/* Períodos */}
                <View style={styles.periodosContainer}>
                  <Text style={styles.periodosTitle}>Escolha o período:</Text>
                  {plan.periodos.map((periodo) => {
                    const isSelected = selectedPlan === plan.tier && selectedPeriod === periodo.periodo;
                    const hasDiscount = periodo.descontoPercentual > 0;

                    return (
                      <TouchableOpacity
                        key={periodo.periodo}
                        style={[
                          styles.periodoCard,
                          isSelected && styles.periodoCardSelected,
                        ]}
                        onPress={() => {
                          setSelectedPlan(plan.tier);
                          setSelectedPeriod(periodo.periodo);
                        }}
                      >
                        <View style={styles.periodoHeader}>
                          <View style={styles.periodoInfo}>
                            <Text style={styles.periodoName}>{periodo.periodoDisplay}</Text>
                            {hasDiscount && (
                              <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>
                                  {periodo.descontoPercentual}% OFF
                                </Text>
                              </View>
                            )}
                          </View>
                          {isSelected && (
                            <View style={styles.selectedIndicator}>
                              <Text style={styles.selectedText}>✓</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.periodoPriceContainer}>
                          <View>
                            <Text style={styles.periodoTotalPrice}>
                              {formatPrice(periodo.precoTotal)}
                            </Text>
                            <Text style={styles.periodoTotalLabel}>
                              Total ({periodo.meses} {periodo.meses === 1 ? 'mês' : 'meses'})
                            </Text>
                          </View>
                          <View style={styles.periodoMonthlyContainer}>
                            <Text style={styles.periodoMonthlyPrice}>
                              {formatPrice(periodo.precoMensal)}
                            </Text>
                            <Text style={styles.periodoMonthlyLabel}>/mês</Text>
                          </View>
                        </View>
                        {hasDiscount && (
                          <Text style={styles.economiaText}>
                            Economize {formatPrice(plan.periodos[0].precoMensal * periodo.meses - periodo.precoTotal)}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Botão de assinar */}
                <TouchableOpacity
                  style={[
                    styles.subscribeButtonContainer,
                    isCurrentPlan && styles.subscribeButtonCurrent,
                    (!selectedPlan || selectedPlan !== plan.tier || !selectedPeriod) && styles.subscribeButtonDisabled,
                    loading && styles.subscribeButtonDisabled,
                  ]}
                  onPress={() => {
                    if (selectedPlan === plan.tier && selectedPeriod) {
                      handlePurchase(plan.tier, selectedPeriod);
                    } else {
                      Alert.alert('Atenção', 'Selecione um período antes de assinar.');
                    }
                  }}
                  disabled={loading || isCurrentPlan || !selectedPlan || selectedPlan !== plan.tier || !selectedPeriod}
                >
                  {isCurrentPlan ? (
                    <View style={[styles.subscribeButton, styles.subscribeButtonCurrent]}>
                      <Text style={styles.subscribeButtonText}>Plano Ativo</Text>
                    </View>
                  ) : (
                    <LinearGradient
                      colors={['#c8921a', '#e5a93d']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.subscribeButton}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.subscribeButtonText}>Assinar Agora</Text>
                      )}
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Botão de restaurar compras */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={loading}
        >
          <Text style={styles.restoreButtonText}>Restaurar Compras</Text>
        </TouchableOpacity>

        {/* Informações adicionais */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💳 As assinaturas são renovadas automaticamente. Você pode cancelar a qualquer momento nas configurações da loja.
          </Text>
          <Text style={styles.footerText}>
            🔒 Seus pagamentos são processados de forma segura pela Apple/Google.
          </Text>
          <Text style={styles.footerText}>
            💰 Descontos aplicados automaticamente em planos trimestrais, semestrais e anuais.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    marginTop: 16,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#c8921a',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  currentPlanCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#c8921a',
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    backgroundColor: '#c8921a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  currentPlanDesc: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  currentPlanExpiry: {
    fontSize: 14,
    color: '#c8921a',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#c8921a',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  plansContainer: {
    gap: 24,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#333',
  },
  planCardPremium: {
    borderColor: '#c8921a',
    backgroundColor: '#1f1a0f',
  },
  planCardCurrent: {
    borderColor: '#c8921a',
    backgroundColor: '#1f1a0f',
  },
  premiumBadge: {
    position: 'absolute',
    top: -12,
    right: 24,
    backgroundColor: '#c8921a',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: 20,
    paddingTop: 8,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  planNamePremium: {
    color: '#c8921a',
  },
  planDesc: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  beneficiosContainer: {
    marginBottom: 24,
    gap: 12,
  },
  beneficioItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  beneficioText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
    flex: 1,
  },
  periodosContainer: {
    marginBottom: 24,
    gap: 12,
  },
  periodosTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  periodoCard: {
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#333',
  },
  periodoCardSelected: {
    borderColor: '#c8921a',
    backgroundColor: '#1f1a0f',
  },
  periodoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  periodoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  discountBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#c8921a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  periodoPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  periodoTotalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  periodoTotalLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  periodoMonthlyContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  periodoMonthlyPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#c8921a',
  },
  periodoMonthlyLabel: {
    fontSize: 14,
    color: '#999',
    marginLeft: 4,
  },
  economiaText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 4,
  },
  subscribeButtonContainer: {
    borderRadius: 25, // Mais arredondado e moderno
    overflow: 'hidden',
    marginTop: 12,
    alignSelf: 'center', // Centraliza o botão
    width: '90%', // Não ocupa a largura total do card, fica mais elegante
  },
  subscribeButton: {
    paddingVertical: 12, // Um pouco mais fino
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  subscribeButtonPremium: {
    backgroundColor: '#c8921a',
  },
  subscribeButtonCurrent: {
    backgroundColor: '#10b981',
  },
  subscribeButtonDisabled: {
    opacity: 0.5,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 14, // Fonte ligeiramente menor para elegância
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  restoreButton: {
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#c8921a',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    gap: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
  },
});
