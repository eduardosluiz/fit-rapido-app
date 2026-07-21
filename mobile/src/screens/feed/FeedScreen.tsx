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
import { Ionicons } from '@expo/vector-icons';
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
  const [banners, setBanners] = useState<Banner[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [ultimaNotificacao, setUltimaNotificacao] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buscaAvancadaVisible, setBuscaAvancadaVisible] = useState(false);
  const [filtrosBusca, setFiltrosBusca] = useState<BuscaFilters>({});
  const [buscaRapida, setBuscaRapida] = useState('');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const canAccessWorkouts = user?.subscription_tier === 'premium_fit';
      
      const [bannersData, receitasData, treinosData] = await Promise.all([
        api.getBanners(),
        api.getReceitas({}),
        canAccessWorkouts 
          ? api.getTreinos({})
          : Promise.resolve([]),
      ]);

      let notificacoesData: any[] = [];
      try {
        notificacoesData = await api.getNotificationHistory();
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      }

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
        onPress={() => {
          if (treino.modalidade_id) {
            (navigation as any).navigate('Treinos', { 
              screen: 'ModalityWorkouts', 
              params: { 
                modalityId: treino.modalidade_id,
                modalityName: treino.modalidade?.nome || 'Treino da Modalidade',
                hasNivelamento: treino.modalidade?.has_nivelamento || false,
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

          {/* Barra de Busca Rápida - Estilizada como na página de Receitas */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar receitas..."
                placeholderTextColor={colors.textMuted}
                value={buscaRapida}
                onChangeText={setBuscaRapida}
                returnKeyType="search"
                onSubmitEditing={() => {
                  if (buscaRapida.trim()) {
                    (navigation as any).navigate('Receitas', { 
                      searchQuery: buscaRapida.trim() 
                    });
                  }
                }}
              />
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setBuscaAvancadaVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
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
                <TouchableOpacity onPress={() => (navigation as any).navigate('Tabs', { screen: 'Treinos' })}>
                  <Text style={styles.seeAllText}>Ver todos</Text>
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
            (navigation as any).navigate('Receitas', {
              searchQuery: buscaRapida.trim() || undefined,
            });
            // We can't easily pass the entire object via navigation params without stringifying, 
            // but ReceitasScreen now has its own advanced filter logic.
            // Ideally they should use advanced filters within the respective screens.
          }}
          initialFilters={filtrosBusca}
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
    paddingBottom: 100,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    gap: 10,
  },
  searchContainer: { 
    flex: 1,
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(15,15,15,0.75)',
    paddingHorizontal: 15, 
    height: 50, 
    borderRadius: 16, 
    borderWidth: 1.2,
    borderColor: 'rgba(231,196,138,0.35)'
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
  searchInput: { flex: 1, color: '#fff', marginLeft: 10, fontSize: 14, outlineStyle: 'none' as any },
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
    marginBottom: 32,
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
    fontSize: 20,
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
    color: '#c8921a',
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
