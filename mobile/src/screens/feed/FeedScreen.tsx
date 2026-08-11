import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { api, Receita, Treino, getImageUrl } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBanner from '../../components/ScreenBanner';
import BuscaAvancada, { BuscaFilters } from '../../components/BuscaAvancada';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';
import AppBackground from '../../components/AppBackground';
import ReceitaCardAnimated from '../../components/ReceitaCardAnimated';

interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  item_id?: string;
  itemId?: string;
  created_at: string;
  createdAt?: string;
  lida: boolean;
  message?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FeedScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const canAccessWorkouts = user?.subscription_tier === 'premium_fit';
  const [banners, setBanners] = useState<Banner[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [ultimaNotificacao, setUltimaNotificacao] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buscaAvancadaVisible, setBuscaAvancadaVisible] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [filtrosBusca, setFiltrosBusca] = useState<BuscaFilters>({});
  const [buscaRapida, setBuscaRapida] = useState('');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const shortcuts = [
    {
      id: 'ineditas',
      label: 'Inéditas',
      iconType: 'Ionicons',
      iconName: 'sparkles',
      onPress: () => (navigation as any).navigate('Receitas', { 
        screen: 'ReceitasList', 
        params: { onlyIneditas: true } 
      }),
    },
    {
      id: 'mais-acessadas',
      label: 'Mais acessadas',
      iconType: 'Ionicons',
      iconName: 'flame',
      onPress: () => (navigation as any).navigate('Receitas', { 
        screen: 'ReceitasList', 
        params: { onlyPopulares: true } 
      }),
    },
    {
      id: 'favoritas-geral',
      label: 'Favoritas de vocês',
      iconType: 'Ionicons',
      iconName: 'heart',
      onPress: () => (navigation as any).navigate('Receitas', { 
        screen: 'ReceitasList', 
        params: { onlyMaisFavoritadas: true } 
      }),
    },
    {
      id: 'ate-10-min',
      label: 'Até 10 minutos',
      iconType: 'Ionicons',
      iconName: 'timer-outline',
      onPress: () => (navigation as any).navigate('Receitas', { 
        screen: 'ReceitasList', 
        params: { tempoMaximo: 10 } 
      }),
    },
    {
      id: 'sumario',
      label: 'Sumário',
      iconType: 'Ionicons',
      iconName: 'list',
      onPress: () => (navigation as any).navigate('SumarioReceitas'),
    },
    {
      id: 'filtros',
      label: 'Filtro',
      iconType: 'Ionicons',
      iconName: 'search-outline',
      onPress: () => setBuscaAvancadaVisible(true),
    },
  ];

  const renderShortcut = (item: typeof shortcuts[0]) => {
    const IconComponent = 
      item.iconType === 'MaterialCommunityIcons' ? MaterialCommunityIcons :
      item.iconType === 'FontAwesome5' ? FontAwesome5 : Ionicons;
      
    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.shortcutItem} 
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.filterButton}>
          <IconComponent name={item.iconName as any} size={24} color={colors.primary} />
        </View>
        <Text style={styles.shortcutLabel} numberOfLines={2}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      
      const [bannersData, receitasResp, treinosResp] = await Promise.all([
        api.getBanners(),
        api.getReceitas({ page: 1, limit: 6 }),
        api.getTreinos({ page: 1, limit: 6 }).catch(() => ({ data: [], totalPages: 0 })),
      ]);

      let notificacoesData: any[] = [];
      try {
        notificacoesData = await api.getNotificationHistory();
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      }

      const receitasData = !Array.isArray(receitasResp) && receitasResp && receitasResp.data ? receitasResp.data : (Array.isArray(receitasResp) ? receitasResp : []);
      const treinosData = !Array.isArray(treinosResp) && treinosResp && treinosResp.data ? treinosResp.data : (Array.isArray(treinosResp) ? treinosResp : []);

      const safeReceitasData = Array.isArray(receitasData) ? receitasData : [];
      const safeTreinosData = Array.isArray(treinosData) ? treinosData : [];

      const receitasOrdenadas = safeReceitasData
        .filter((r) => r && r.ativa)
        .slice(0, 6);

      const treinosOrdenados = safeTreinosData
        .filter((t) => t && t.ativa)
        .slice(0, 6);

      setBanners(Array.isArray(bannersData) ? bannersData : []);
      setReceitas(receitasOrdenadas);
      setTreinos(treinosOrdenados);

      if (notificacoesData && notificacoesData.length > 0) {
        const notificacoesOrdenadas = [...notificacoesData].sort((a, b) => {
          const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
          const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setUltimaNotificacao(notificacoesOrdenadas[0]);
      } else {
        setUltimaNotificacao(null);
      }

      // Carregar categorias para a busca avançada
      try {
        const cats = await api.getCategorias();
        setCategorias(cats.filter((cat: any) => cat.ativa !== false));
      } catch (err) {
        console.error('Erro ao carregar categorias no Feed:', err);
      }
    } catch (error) {
      console.error('Erro ao carregar feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.subscription_tier]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Resetar os filtros da busca avançada ao retornar para o Feed
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setFiltrosBusca({});
    });
    return unsubscribe;
  }, [navigation]);

  // Autoplay Banners
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const intervalId = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [banners.length]);

  // Efeito separado para garantir que o ScrollView acompanhe o índice
  useEffect(() => {
    if (banners.length > 0 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: currentBannerIndex * SCREEN_WIDTH,
        animated: true,
      });
    }
  }, [currentBannerIndex, banners.length]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeed();
  }, [loadFeed]);

  const renderReceita = (receita: Receita) => (
    <ReceitaCardAnimated
      key={receita.id}
      item={receita}
      isHorizontal={true}
      onPress={() => (navigation as any).navigate('Receitas', { screen: 'ReceitaDetail', params: { receitaId: receita.id } })}
    />
  );

  const renderTreino = (treino: Treino) => {
    const canAccessWorkouts = user?.subscription_tier === 'premium_fit';
    const displayData: any = {
      ...treino,
      tempo_preparo: treino.duracao_minutos,
      calorias: null,
      dificuldade: treino.nivel,
    };
    return (
      <ReceitaCardAnimated
        key={treino.id}
        item={displayData}
        isHorizontal={true}
        isLocked={!canAccessWorkouts}
        onPress={() => {
          if (!canAccessWorkouts) {
            (navigation as any).navigate('Subscriptions');
            return;
          }
          if (treino.modalidade_id) {
            (navigation as any).navigate('Treinos', { 
              screen: 'ModalityWorkouts', 
              params: { 
                modalityId: treino.modalidade_id,
                modalityName: treino.modalidade?.nome || 'Treino da Modalidade',
                hasNivelamento: treino.modalidade?.has_nivelamento || false,
                descricao: treino.modalidade?.descricao,
                expandTreinoId: treino.id
              } 
            });
          } else {
            (navigation as any).navigate('Treinos', { screen: 'TreinoDetail', params: { treinoId: treino.id } });
          }
        }}
      />
    );
  };

  if (loading && receitas.length === 0) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.container}>
          <View style={[styles.loadingContainer, { flex: 1, justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Carregando feed...</Text>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  const renderBannerItem = (banner: Banner, index: number) => {
    return (
      <View key={banner.id || index} style={styles.carouselItem}>
        <Image source={{ uri: getImageUrl(banner.imagem_url) }} style={styles.carouselImage} />
        <View style={styles.carouselOverlay}>
          <View style={styles.carouselContent}>
            <Text style={styles.carouselTitle}>{banner.titulo}</Text>
            <View style={styles.carouselUnderline} />
            {banner.subtitulo ? <Text style={styles.carouselSubtitle}>{banner.subtitulo}</Text> : null}
            <TouchableOpacity 
              style={styles.carouselButton}
              activeOpacity={0.8}
              onPress={() => {
                if (banner.acao === 'RECEITAS') (navigation as any).navigate('Tabs', { screen: 'Receitas' });
                else if (banner.acao === 'TREINOS') (navigation as any).navigate('Tabs', { screen: 'Treinos' });
                else if (banner.acao === 'FAVORITOS') (navigation as any).navigate('Tabs', { screen: 'Favoritos' });
              }}
            >
              <Text style={styles.carouselButtonText}>Explorar Agora</Text>
              <Ionicons name="arrow-forward" size={16} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner Container movido para dentro do ScrollView para rolar junto com a página */}
          <View style={styles.bannerContainer}>
            {banners.length > 0 ? (
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={{ width: '100%', height: '100%' }}
                onMomentumScrollEnd={(e) => {
                  const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                  setCurrentBannerIndex(newIndex);
                }}
              >
                {banners.map((b, i) => renderBannerItem(b, i))}
              </ScrollView>
            ) : (
              <>
                <ScreenBanner defaultImage={require('../../../assets/banners/bannerinicial.jpg')} />
                <View style={styles.titleOverlay}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.headerTitle}>Fit & Rápido</Text>
                    <View style={styles.titleUnderline} />
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Seção de Acesso Rápido */}
          <View style={[styles.section, { marginBottom: 16 }]}>
            <View style={[styles.sectionHeader, { marginBottom: 4, marginTop: 6 }]}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.acessoRapidoTitle}>Acesso rápido</Text>
              </View>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.acessoRapidoScroll}
            >
              {shortcuts.map(renderShortcut)}
            </ScrollView>
          </View>

          {/* Novas Receitas */}
          {receitas.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>🍽️ Novas Receitas</Text>
                  <View style={styles.sectionTitleUnderline} />
                </View>
                <TouchableOpacity onPress={() => (navigation as any).navigate('Receitas')}>
                  <Text style={styles.seeAllText}>Ver todas</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {receitas.map(renderReceita)}
              </ScrollView>
            </View>
          )}

          {/* Novos Treinos */}
          {treinos.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>💪 Novos Treinos</Text>
                  <View style={styles.sectionTitleUnderline} />
                </View>
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => {
                    if (!canAccessWorkouts) {
                      (navigation as any).navigate('Subscriptions');
                    } else {
                      (navigation as any).navigate('Tabs', { screen: 'Treinos' });
                    }
                  }}
                >
                  <Text style={styles.seeAllText}>Ver todos</Text>
                  {!canAccessWorkouts && (
                    <Ionicons name="lock-closed" size={12} color="#E7C48A" style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {treinos.map(renderTreino)}
              </ScrollView>
            </View>
          )}

          {/* Mensagem quando não há conteúdo */}
          {receitas.length === 0 && treinos.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>Nenhuma atualização no momento</Text>
              <Text style={styles.emptySubtext}>Novas receitas e treinos aparecerão aqui</Text>
            </View>
          )}
        </ScrollView>


        <BuscaAvancada
          visible={buscaAvancadaVisible}
          onClose={() => setBuscaAvancadaVisible(false)}
          onSearch={(filters) => {
            setFiltrosBusca(filters);
            setBuscaAvancadaVisible(false);
            (navigation as any).navigate('Receitas', {
              screen: 'ReceitasList',
              params: {
                searchQuery: filters.nome || undefined,
                categoriaId: filters.categoria || undefined,
                semLactose: filters.semLactose || false,
                semGluten: filters.semGluten || false,
                ingrediente: filters.ingrediente || undefined,
                proteinasMin: filters.proteinasMin || undefined,
                tempoMaximo: filters.tempoMaximo || undefined,
                lowCarb: filters.lowCarb || false,
              }
            });
          }}
          initialFilters={filtrosBusca}
          availableCategories={categorias}
        />
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
  },
  carouselItem: {
    width: SCREEN_WIDTH,
    height: '100%',
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 30,
  },
  carouselContent: {
    width: '100%',
  },
  carouselTitle: {
    fontSize: 28,
    fontFamily: fonts.title,
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  carouselUnderline: {
    height: 3,
    backgroundColor: colors.primary,
    width: '30%',
    borderRadius: 2,
    marginBottom: 12,
  },
  carouselSubtitle: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: '#e0e0e0',
    marginBottom: 16,
    maxWidth: '45%',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  carouselButton: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  carouselButtonText: {
    color: '#000',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: fonts.bodySemiBold,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: fonts.title,
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleUnderline: {
    height: 3,
    backgroundColor: colors.primary,
    width: '60%',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  acessoRapidoTitle: {
    fontSize: 15,
    fontFamily: fonts.title,
    color: '#ffffff',
    marginBottom: 0,
  },
  acessoRapidoScroll: {
    paddingRight: 20,
    flexDirection: 'row',
  },
  shortcutItem: {
    alignItems: 'center',
    width: 52,
    marginRight: 4,
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(15,15,15,0.75)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(231,196,138,0.35)',
  },
  shortcutLabel: {
    fontSize: 10,
    fontFamily: fonts.body,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#999',
    marginTop: 12,
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.title,
    color: '#ffffff',
    marginBottom: 6,
  },
  sectionTitleUnderline: {
    height: 2,
    backgroundColor: colors.primary,
    width: '50%',
    borderRadius: 1,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  notificationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(200, 146, 26, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.text,
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
