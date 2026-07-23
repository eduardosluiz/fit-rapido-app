import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { api, Treino, getImageUrl } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../../constants/colors';
import fonts from '../../constants/fonts';
import BuscaAvancadaTreinos, { BuscaFiltersTreino } from '../../components/BuscaAvancadaTreinos';
import AppBackground from '../../components/AppBackground';
import TreinoCardAnimated from '../../components/TreinoCardAnimated';

interface Modalidade {
  id: string;
  nome: string;
  subtitulo?: string;
  ordem_modalidade?: number;
  descricao?: string;
  imagem_url?: string;
  ativa: boolean;
  tem_nivelamento: boolean;
}

export default function TreinosScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [buscaAvancadaVisible, setBuscaAvancadaVisible] = useState(false);
  const [filtrosBusca, setFiltrosBusca] = useState<BuscaFiltersTreino>({});
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const loadModalidades = useCallback(async () => {
    try {
      const data = await api.getModalidadesTreinos();
      setModalidades(data.filter((m: any) => m.ativa === true || m.ativo === true));
    } catch (error) {
      console.error('Erro ao carregar modalidades:', error);
    }
  }, []);

  const handleModalityPress = (modalidade: Modalidade | any) => {
    (navigation as any).navigate('ModalityWorkouts', {
      modalityId: modalidade.id,
      modalityName: modalidade.nome,
      modalityImage: modalidade.imagem_url,
      hasNivelamento: modalidade.tem_nivelamento,
      descricao_iniciante: modalidade.descricao_iniciante,
      descricao_intermediario: modalidade.descricao_intermediario,
      descricao_avancado: modalidade.descricao_avancado
    });
  };

  const loadTreinos = useCallback(async (currentSearch = searchText, pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const params: any = { page: pageNum, limit: 15 };
      if (currentSearch.trim()) params.search = currentSearch.trim();

      // Aplicar filtros da busca avançada
      if (filtrosBusca.nome) {
        params.nome = filtrosBusca.nome;
      }
      if (filtrosBusca.categoria) {
        // Since backend expects categoriaId, we pass it properly or wait for backend support.
        // If it's used as a filter, pass it as category text without mixing with general search.
        params.categoriaNome = filtrosBusca.categoria;
      }
      if (filtrosBusca.tempoMaximo) params.tempoMaximo = filtrosBusca.tempoMaximo;

      const response = await api.getTreinos(params);
      const isPaginated = !Array.isArray(response) && response && response.data;
      const treinosRaw = isPaginated ? response.data : (Array.isArray(response) ? response : []);
      const totalPages = isPaginated ? response.totalPages : 1;
      
      let treinosAtivos = treinosRaw.filter((t: any) => 
        t && (t.ativa === true || t.ativo === true) && !t.modalidade_id && !t.modalidade
      );
      
      if (user?.subscription_tier !== 'premium_fit') {
        treinosAtivos = treinosAtivos.filter((t: any) => t.is_premium === false);
      }
      
      if (pageNum === 1) {
        setTreinos(treinosAtivos);
      } else {
        setTreinos(prev => {
          const newItems = treinosAtivos.filter((t: any) => !prev.some(p => p.id === t.id));
          return [...prev, ...newItems];
        });
      }
      
      setHasMore(pageNum < totalPages || (!isPaginated && treinosAtivos.length === 15));
      setPage(pageNum);

    } catch (error) {
      console.error('Erro ao carregar treinos:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchText, user?.subscription_tier, filtrosBusca]);

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      loadTreinos(searchText, page + 1);
    }
  };

  useEffect(() => { loadModalidades(); }, [loadModalidades]);
  
  useEffect(() => { 
    loadTreinos(searchText); 
  }, [filtrosBusca, user?.subscription_tier]);

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      loadTreinos(text);
    }, 600);
  };

  const featuredWorkout = treinos.length > 0 ? treinos[0] : null;
  const listWorkouts = treinos.length > 1 ? treinos.slice(1) : treinos;

  const renderFeaturedWorkout = () => {
    if (!featuredWorkout) return null;
    const thumbnail = featuredWorkout.imagem_url ? getImageUrl(featuredWorkout.imagem_url) : null;
    
    return (
      <TouchableOpacity 
        style={styles.featuredBannerContainer} 
        activeOpacity={0.9}
        onPress={() => (navigation as any).navigate('TreinoDetail', { treinoId: featuredWorkout.id })}
      >
        {thumbnail ? (
          <ImageBackground source={{ uri: thumbnail }} style={styles.bannerImage} resizeMode="cover">
            <LinearGradient 
              colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']} 
              style={StyleSheet.absoluteFillObject} 
            />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerBadge}>✨ NOVO TREINO</Text>
              <Text style={styles.headerTitleBanner} numberOfLines={2}>{featuredWorkout.titulo}</Text>
              <View style={styles.titleUnderline} />
              <Text style={styles.bannerSubtitle}>{featuredWorkout.duracao_minutos} min • {
                  featuredWorkout.nivel === 'facil' || featuredWorkout.nivel === 'iniciante' ? 'Iniciante' : 
                   featuredWorkout.nivel === 'medio' || featuredWorkout.nivel === 'intermediario' ? 'Intermediário' : 'Avançado'
              }</Text>
              <TouchableOpacity 
                style={styles.bannerButton}
                onPress={() => (navigation as any).navigate('TreinoDetail', { treinoId: featuredWorkout.id })}
              >
                <Text style={styles.bannerButtonText}>Explorar Agora</Text>
                <Ionicons name="arrow-forward" size={16} color="#000" />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        ) : (
          <View style={[styles.bannerImage, { backgroundColor: colors.backgroundElevated }]} />
        )}
      </TouchableOpacity>
    );
  };

  const getIconForCategory = (name: string, index: number) => {
    const lower = name.toLowerCase();
    if (lower.includes('casa')) return 'home';
    if (lower.includes('jornada')) return 'location';
    if (lower.includes('academia') || lower.includes('musculação')) return 'barbell';
    const fallbackIcons = ['location', 'barbell', 'home', 'fitness', 'body'];
    return fallbackIcons[index % fallbackIcons.length] as any;
  };

  const renderCategories = () => {
    if (!modalidades.length) return null;
    const windowWidth = Dimensions.get('window').width;
    // Calculate card width: screen width - horizontal padding (24) - gaps. 
    // Less padding and gap to give cards more space.
    const gap = 8;
    const totalPaddings = 24; // 12 on each side
    const visibleCount = Math.min(modalidades.length, 3);
    const cardWidth = modalidades.length <= 3 
      ? (windowWidth - totalPaddings - (gap * (visibleCount - 1))) / visibleCount 
      : 115;

    const sortedModalidades = [...modalidades].sort((a, b) => {
      const orderA = a.ordem_modalidade ?? 0;
      const orderB = b.ordem_modalidade ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return (a.nome || '').localeCompare(b.nome || '');
    });

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.categoriesScroll}
      >
        {sortedModalidades.map((mod, index) => {
          return (
            <TouchableOpacity 
              key={mod.id} 
              style={[styles.categoryCard, { width: cardWidth, height: 110 }]} 
              onPress={() => handleModalityPress(mod)}
            >
              <Ionicons name={getIconForCategory(mod.nome, index)} size={26} color={colors.primary} style={{marginBottom: 6}} />
              <Text style={styles.categoryTitle} numberOfLines={2}>{mod.nome}</Text>
              <Text style={styles.categoryDesc} numberOfLines={2}>
                {mod.subtitulo || mod.descricao || 'Acompanhe sua evolução'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderTreinoCard = (item: Treino, index: number) => {
    return (
      <View style={[
        styles.gridItem, 
        { paddingLeft: index % 2 === 0 ? 20 : 5, paddingRight: index % 2 === 0 ? 5 : 20 }
      ]}>
        <TreinoCardAnimated
          item={item}
          onPress={() => navigation.navigate('TreinoDetail' as never, { treinoId: item.id } as never)}
        />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={{ paddingBottom: 10 }}>
      {canAccessWorkouts && renderFeaturedWorkout()}

      <View style={{ height: canAccessWorkouts ? 20 : 0 }} />

      {!canAccessWorkouts ? (
        <View style={styles.lockedContainer}>
          <Ionicons name="lock-closed" size={64} color={colors.primary} />
          <Text style={styles.lockedTitle}>Conteúdo Premium</Text>
          <Text style={styles.lockedDescription}>
            Assine o plano Premium Fit para acessar todas as modalidades e rotinas de treino.
          </Text>
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradePress}>
            <Text style={styles.upgradeButtonText}>Ver Planos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {renderCategories()}

          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar treino"
                placeholderTextColor={colors.textMuted}
                value={searchText}
                onChangeText={handleSearchTextChange}
              />
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => (navigation as any).navigate('BibliotecaTreinos')}
              activeOpacity={0.7}
            >
              <Ionicons name="play-circle-outline" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setBuscaAvancadaVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <BuscaAvancadaTreinos
            visible={buscaAvancadaVisible}
            onClose={() => setBuscaAvancadaVisible(false)}
            onSearch={(filters) => {
              setFiltrosBusca(filters);
            }}
            initialFilters={filtrosBusca}
            availableCategories={modalidades}
          />

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Todos os treinos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.inlineFilters}>
               {['Todos', 'Iniciante', 'Intermediário', 'Avançado'].map(filter => (
                 <TouchableOpacity 
                   key={filter}
                   style={[styles.inlineFilterChip, activeFilter === filter && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                   onPress={() => setActiveFilter(filter)}
                 >
                   <Text style={[styles.inlineFilterText, activeFilter === filter && { color: '#000' }]}>{filter}</Text>
                 </TouchableOpacity>
               ))}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );

  const canAccessWorkouts = user?.subscription_tier === 'premium_fit';
  const handleUpgradePress = () => (navigation as any).navigate('Subscriptions' as never);

  // Filter listWorkouts based on activeFilter mock logic
  const displayedWorkouts = listWorkouts.filter(w => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Iniciante' && (w.nivel === 'facil' || w.nivel === 'iniciante')) return true;
    if (activeFilter === 'Intermediário' && (w.nivel === 'medio' || w.nivel === 'intermediario')) return true;
    if (activeFilter === 'Avançado' && (w.nivel === 'dificil' || w.nivel === 'avancado')) return true;
    return false;
  });

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <FlatList
          key="grid-2-treinos"
          data={canAccessWorkouts ? displayedWorkouts : []}
          keyExtractor={item => `grid-${item.id}`}
          numColumns={2}
          ListHeaderComponent={renderHeader()}
          renderItem={({ item, index }) => renderTreinoCard(item, index)}
          contentContainerStyle={styles.list}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
            ) : null
          }
          ListEmptyComponent={!loading && canAccessWorkouts ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.1)" />
              <Text style={styles.emptyText}>Nenhum treino encontrado</Text>
            </View>
          ) : loading && canAccessWorkouts ? (
            <ActivityIndicator color={colors.primary} style={{marginTop: 40}} />
          ) : null}
        />
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  headerTitle: { 
    fontSize: 24, 
    fontFamily: fonts.title, 
    color: '#E7C48A', 
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
  },
  libButton: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(201,162,74,0.1)', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(201,162,74,0.3)'
  },
  libButtonText: { 
    color: '#E7C48A', 
    fontSize: 12, 
    marginLeft: 6, 
    fontFamily: fonts.bold 
  },
  
  // Featured Workout
  featuredBannerContainer: {
    width: Dimensions.get('window').width,
    height: 250,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  headerTitleBanner: {
    fontSize: 26,
    fontFamily: fonts.title,
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerBadge: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.bold,
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  titleUnderline: {
    height: 3,
    backgroundColor: colors.primary,
    width: '30%',
    borderRadius: 2,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: '#e0e0e0',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bannerButton: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerButtonText: {
    color: '#000',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: fonts.bodySemiBold,
  },

  // Categories
  categoriesScroll: {
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: 'rgba(15,15,15,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1.2,
    borderColor: 'rgba(231,196,138,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: fonts.bold,
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryDesc: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: { flex: 1, color: '#fff', marginLeft: 10, fontSize: 14, outlineStyle: 'none' as any },

  // List Header
  sectionHeaderRow: {
    paddingHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sectionTitle: { 
    fontSize: 14, 
    fontFamily: fonts.title, 
    color: colors.textPrimary,
    marginBottom: 0,
    marginRight: 8,
    flexShrink: 0,
  },
  inlineFilters: {
    flexDirection: 'row',
    gap: 4,
  },
  inlineFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  inlineFilterText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontFamily: fonts.medium,
  },

  list: { paddingBottom: 40 },
  gridItem: {
    flex: 1,
    maxWidth: '50%',
  },
  lockedContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  lockedTitle: { fontSize: 22, color: '#fff', fontFamily: fonts.title, marginTop: 20, marginBottom: 10 },
  lockedDescription: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20, marginBottom: 30 },
  upgradeButton: { backgroundColor: '#c8921a', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  upgradeButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#444', fontSize: 14, marginTop: 10 },
});
