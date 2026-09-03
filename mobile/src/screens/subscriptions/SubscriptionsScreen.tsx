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
import { Ionicons } from '@expo/vector-icons';
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

function DaiReceitasBenefits() {
  return (
    <View style={styles.daiReceitasContainer}>
      <Text style={styles.daiReceitasTitle}>O que você encontra no Dai+ Receitas:</Text>

      <View style={styles.daiItem}>
        <Text style={styles.daiItemHeader}>🍴 +200 receitas</Text>
        <Text style={styles.daiItemSub}>Receitas práticas e saudáveis para todos os momentos.</Text>
      </View>
      <View style={styles.daiItem}>
        <Text style={styles.daiItemHeader}>✨ Conteúdo sempre atualizado</Text>
        <Text style={styles.daiItemSub}>🆕 Receitas inéditas todos os meses</Text>
      </View>
      <View style={styles.daiItem}>
        <Text style={styles.daiItemHeader}>🔄 Substituições de ingredientes</Text>
        <Text style={styles.daiItemSub}>Opções para adaptar as receitas de acordo com o que você tem em casa ou prefere consumir.</Text>
      </View>
      <View style={styles.daiItem}>
        <Text style={styles.daiItemHeader}>📊 Macros estimados</Text>
        <Text style={styles.daiItemSub}>Informações nutricionais estimadas para facilitar suas escolhas.</Text>
      </View>
      <View style={styles.daiItem}>
        <Text style={styles.daiItemHeader}>👩🏻‍🍳 Dicas de preparo</Text>
        <Text style={styles.daiItemSub}>Truques e orientações para deixar suas receitas ainda mais fáceis.</Text>
      </View>
      <View style={styles.daiItem}>
        <Text style={styles.daiItemHeader}>⏱️ Tempo médio de preparo</Text>
        <Text style={styles.daiItemSub}>Saiba quanto tempo você vai precisar para preparar cada receita.</Text>
      </View>
      <View style={styles.daiItem}>
        <Text style={styles.daiItemHeader}>🎥 Vídeos explicativos</Text>
        <Text style={styles.daiItemSub}>Veja o passo a passo de algumas receitas.</Text>
      </View>
      <View style={styles.daiItem}>
        <Text style={styles.daiItemHeader}>🔎 Encontre sua receita com facilidade</Text>
        <Text style={styles.daiItemSub}>Busque por categorias como pré-treino, pós-treino e lanche ou pesquise diretamente por palavras-chave, como frango, morango e chocolate.</Text>
      </View>
    </View>
  );
}

function DaiTreinosBenefits() {
  return (
    <View style={styles.daiTreinosContainer}>
      <Text style={styles.daiTreinosTitle}>O que você encontra no Dai + Treinos com Camilla Padilha 💪</Text>
      <Text style={styles.specialistText}>Especialista em Treinamento Feminino</Text>
      <Text style={styles.trainingIntro}>
        Treinos pensados para mulheres que buscam um corpo mais slim e definido, com estratégia e praticidade.
      </Text>

      <View style={styles.daiItem}>
        <Text style={styles.daiItemHeader}>📈 Chega de treinos aleatórios!</Text>
        <Text style={styles.daiItemSub}>
          Planilhas para casa ou academia com progressão inteligente de carga, volume e intensidade. Conforme você evolui, seus treinos também evoluem. Todos os exercícios contam com vídeos de execução e opções de substituição.
        </Text>
      </View>
      <View style={styles.daiItem}>
        <Text style={styles.daiItemHeader}>🏋🏻‍♀️ Do iniciante ao avançado</Text>
        <Text style={styles.daiItemSub}>Treine de acordo com o seu nível e progrida no seu ritmo.</Text>
      </View>
      <View style={styles.daiItem}>
        <Text style={styles.daiItemHeader}>⏱️ Treinos guiados de 10, 15, 20 e 30 minutos</Text>
        <Text style={styles.daiItemSub}>
          Pernas, glúteos, abdômen, superiores, corpo todo e condicionamento. É só dar o play e treinar comigo!
        </Text>
      </View>
      <View style={styles.daiItem}>
        <Text style={styles.daiItemHeader}>✨ Novos treinos todos os meses</Text>
      </View>

      <View style={styles.trainingClosing}>
        <Text style={styles.trainingClosingText}>Eu organizo a estratégia. Você abre o app e treina.</Text>
        <Text style={styles.trainingFormula}>Treino certo + progressão + consistência = resultado.</Text>
      </View>
    </View>
  );
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
          <Ionicons name="arrow-back" size={19} color="#d5a43d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assinaturas</Text>
        <View style={styles.headerSpacer} />
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
            <View style={styles.infoTitleRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="diamond-outline" size={15} color="#e5a93d" />
              </View>
              <Text style={styles.infoTitle}>Escolha seu plano</Text>
            </View>
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
                  {plan.tier === 'premium' ? (
                    <DaiReceitasBenefits />
                  ) : plan.tier === 'premium_fit' ? (
                    <>
                      <DaiReceitasBenefits />
                      <View style={styles.benefitsDivider} />
                      <DaiTreinosBenefits />
                    </>
                  ) : (
                    plan.beneficios.map((beneficio, index) => (
                      <View key={index} style={styles.beneficioItem}>
                        <View style={styles.checkIconContainer}>
                          <Text style={styles.checkIcon}>✓</Text>
                        </View>
                        <Text style={styles.beneficioText}>{beneficio}</Text>
                      </View>
                    ))
                  )}
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
                      <Text style={[styles.subscribeButtonText, styles.subscribeButtonCurrentText]}>Plano ativo</Text>
                    </View>
                  ) : (
                    <LinearGradient
                      colors={['#FFD26F', '#E7B84F']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.subscribeButton}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.subscribeButtonText}>Assinar agora</Text>
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
          <Ionicons name="refresh-outline" size={16} color="#d5a43d" />
          <Text style={styles.restoreButtonText}>Restaurar Compras</Text>
        </TouchableOpacity>

        {/* Informações adicionais */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Informações da assinatura</Text>
          <View style={styles.footerItem}>
            <View style={styles.footerIcon}>
              <Ionicons name="card-outline" size={15} color="#d5a43d" />
            </View>
            <Text style={styles.footerText}>As assinaturas são renovadas automaticamente. Cancele quando quiser nas configurações da loja.</Text>
          </View>
          <View style={styles.footerItem}>
            <View style={styles.footerIcon}>
              <Ionicons name="lock-closed-outline" size={15} color="#d5a43d" />
            </View>
            <Text style={styles.footerText}>Pagamentos processados com segurança pela Apple ou Google.</Text>
          </View>
          <View style={styles.footerItem}>
            <View style={styles.footerIcon}>
              <Ionicons name="pricetag-outline" size={15} color="#d5a43d" />
            </View>
            <Text style={styles.footerText}>Descontos aplicados aos planos trimestrais, semestrais e anuais.</Text>
          </View>
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
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.bodyMedium,
    color: '#fff',
    letterSpacing: 0.1,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  infoIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    backgroundColor: 'rgba(200,146,26,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(200,146,26,0.18)',
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 0.1,
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.68)',
    lineHeight: 18,
    fontFamily: fonts.body,
    paddingLeft: 36,
  },
  plansContainer: {
    gap: 18,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  planCardPremium: {
    borderColor: 'rgba(200, 146, 26, 0.4)',
    backgroundColor: 'rgba(200, 146, 26, 0.04)',
    shadowColor: '#c8921a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
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
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 1,
  },
  planHeader: {
    marginBottom: 24,
    paddingTop: 8,
    alignItems: 'center',
  },
  planName: {
    fontSize: 24,
    fontFamily: fonts.title,
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  planNamePremium: {
    color: '#e5a93d',
  },
  planDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.64)',
    lineHeight: 17,
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
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    color: '#E7C48A',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.2,
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
    fontFamily: fonts.bodyMedium,
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
    fontSize: 17,
    fontFamily: fonts.bodySemiBold,
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
    fontSize: 22,
    fontFamily: fonts.bodySemiBold,
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
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
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
  subscribeButtonCurrentText: {
    color: 'rgba(255,255,255,0.74)',
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: '#17130c',
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 0.1,
  },
  restoreButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 7,
    marginTop: 4,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(200,146,26,0.2)',
    backgroundColor: 'rgba(200,146,26,0.05)',
  },
  restoreButtonText: {
    color: '#d5a43d',
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    letterSpacing: 0.1,
  },
  footer: {
    marginTop: 4,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderRadius: 18,
    gap: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  footerTitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    marginBottom: 2,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  footerIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(200,146,26,0.09)',
  },
  footerText: {
    flex: 1,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 17,
    fontFamily: fonts.body,
  },
  daiReceitasContainer: {
    gap: 12,
    paddingVertical: 4,
  },
  daiReceitasTitle: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: '#e5a93d',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  daiItem: {
    gap: 2,
  },
  daiItemHeader: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: 'rgba(255,255,255,0.9)',
  },
  daiItemSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
    paddingLeft: 4,
  },
  benefitsDivider: {
    height: 1,
    backgroundColor: 'rgba(200,146,26,0.28)',
    marginVertical: 20,
  },
  daiTreinosContainer: {
    gap: 14,
  },
  daiTreinosTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fonts.title,
    color: '#e5a93d',
  },
  specialistText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: -8,
  },
  trainingIntro: {
    fontSize: 11,
    lineHeight: 17,
    color: 'rgba(255,255,255,0.68)',
  },
  trainingClosing: {
    marginTop: 4,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(200,146,26,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(200,146,26,0.2)',
    gap: 7,
  },
  trainingClosingText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    lineHeight: 17,
  },
  trainingFormula: {
    color: '#e5a93d',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '700',
  },
});
