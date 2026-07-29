import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Purchases from 'react-native-purchases';
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
      
      const productId = `${planTier.toLowerCase()}_${periodo.toLowerCase()}`;
      
      if (Platform.OS === 'web') {
         Alert.alert(
           'Plataforma Web',
           'As compras na plataforma web serão disponibilizadas em breve via Pix/Cartão.',
           [{ text: 'OK', onPress: () => setLoading(false) }]
         );
         return;
      }
      
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current && offerings.current.availablePackages.length !== 0) {
        // Encontra o pacote pelo identifier do RevenueCat
        const packageToBuy = offerings.current.availablePackages.find(p => p.identifier === productId || p.product.identifier === productId);
        
        if (!packageToBuy) {
           Alert.alert('Produto não encontrado', `O plano ${productId} ainda não foi configurado nas lojas.`);
           setLoading(false);
           return;
        }

        const { customerInfo } = await Purchases.purchasePackage(packageToBuy);
        
        // Verifica se o usuário ganhou a permissão premium
        if (typeof customerInfo.entitlements.active['premium'] !== "undefined") {
          Alert.alert('Sucesso!', 'Sua assinatura foi ativada com sucesso. Aproveite o Fit & Rápido Premium!');
          await loadData();
        }
      } else {
         Alert.alert('Indisponível', 'Nenhum plano disponível para compra no momento. Configure o painel do RevenueCat.');
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Erro', error.message || 'Erro ao processar compra');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      if (Platform.OS === 'web') {
        Alert.alert('Plataforma Web', 'Restauração indisponível na web.', [{ text: 'OK', onPress: () => setLoading(false) }]);
        return;
      }
      
      const customerInfo = await Purchases.restorePurchases();
      if (typeof customerInfo.entitlements.active['premium'] !== "undefined") {
        Alert.alert('Sucesso', 'Suas compras foram restauradas com sucesso!');
        await loadData();
      } else {
        Alert.alert('Aviso', 'Nenhuma assinatura ativa encontrada para esta conta nas lojas da Apple/Google.');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao restaurar compras');
    } finally {
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
                    {plan.tier === 'premium_fit' ? 'DAI + COMPLETO' : (plan.tier === 'premium' ? 'DAI + RECEITAS' : plan.nome)}
                  </Text>
                  <Text style={styles.planDesc}>{plan.descricao}</Text>
                </View>

                {/* Benefícios */}
                <View style={styles.beneficiosContainer}>
                  {plan.beneficios.map((beneficio, index) => (
                    <View key={index} style={styles.beneficioItem}>
                      <View style={styles.checkIconContainer}>
                        <Text style={styles.checkIcon}>✓</Text>
                      </View>
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
    backgroundColor: '#0a0a0a',
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
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
  },
  backIcon: {
    fontSize: 20,
    color: '#c8921a',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  currentPlanCard: {
    backgroundColor: 'rgba(200, 146, 26, 0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(200, 146, 26, 0.3)',
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  currentPlanTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: 'rgba(200, 146, 26, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(200, 146, 26, 0.5)',
  },
  badgeText: {
    color: '#e5a93d',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  currentPlanDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
    lineHeight: 20,
  },
  currentPlanExpiry: {
    fontSize: 13,
    color: '#c8921a',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 22,
    fontWeight: '400',
  },
  plansContainer: {
    gap: 24,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  planCardPremium: {
    borderColor: 'rgba(200, 146, 26, 0.4)',
    backgroundColor: 'rgba(200, 146, 26, 0.04)',
    shadowColor: '#c8921a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  planCardCurrent: {
    borderColor: 'rgba(200, 146, 26, 0.4)',
  },
  premiumBadge: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    backgroundColor: '#c8921a',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#c8921a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  planHeader: {
    marginBottom: 24,
    paddingTop: 8,
    alignItems: 'center',
  },
  planName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  planNamePremium: {
    color: '#e5a93d',
  },
  planDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  beneficiosContainer: {
    marginBottom: 28,
    gap: 14,
  },
  beneficioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(200, 146, 26, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkIcon: {
    color: '#c8921a',
    fontSize: 12,
    fontWeight: '900',
  },
  beneficioText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    flex: 1,
    fontWeight: '400',
  },
  periodosContainer: {
    marginBottom: 24,
    gap: 12,
  },
  periodosTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  periodoCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  periodoCardSelected: {
    borderColor: 'rgba(200, 146, 26, 0.5)',
    backgroundColor: 'rgba(200, 146, 26, 0.08)',
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
    gap: 10,
    flex: 1,
  },
  periodoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
  discountBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  discountText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#c8921a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#c8921a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  selectedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  periodoPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  periodoTotalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  periodoTotalLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  periodoMonthlyContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  periodoMonthlyPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e5a93d',
  },
  periodoMonthlyLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 4,
  },
  economiaText: {
    fontSize: 12,
    color: '#34d399',
    fontWeight: '500',
    marginTop: 6,
  },
  subscribeButtonContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 16,
    width: '100%',
    shadowColor: '#c8921a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  subscribeButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonPremium: {
    backgroundColor: '#c8921a',
  },
  subscribeButtonCurrent: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  restoreButton: {
    marginTop: 12,
    marginBottom: 32,
    padding: 16,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: 'rgba(200, 146, 26, 0.8)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 16,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 18,
    fontWeight: '400',
  },
});
