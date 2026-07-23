import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { api, Receita, getImageUrl } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';
import AppBackground from '../../components/AppBackground';
import ReceitaCardAnimated from '../../components/ReceitaCardAnimated';
import BuscaAvancada, { BuscaFilters } from '../../components/BuscaAvancada';

interface Categoria {
  id: string;
  nome: string;
  slug: string;
  ativa?: boolean;
  imagem_url?: string;
}

export default function ReceitasScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [receitasPopulares, setReceitasPopulares] = useState<Receita[]>([]);
  const [receitasRapidas, setReceitasRapidas] = useState<Receita[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [buscaAvancadaVisible, setBuscaAvancadaVisible] = useState(false);
  const [filtrosBusca, setFiltrosBusca] = useState<BuscaFilters>({});
  
  // Novos estados para funcionalidades solicitadas
  const [filterMode, setFilterMode] = useState<'todos' | 'populares' | 'rapidas'>('todos');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: false }),
    ]).start();
    
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);
  
  useEffect(() => {
    const params = route.params as { searchQuery?: string } | undefined;
    if (params?.searchQuery) setSearchText(params.searchQuery);
  }, [route.params]);

  const loadCategorias = useCallback(async () => {
    try {
      const data = await api.getCategorias();
      setCategorias(data.filter((cat: any) => cat.ativa !== false));
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }, []);

  const loadReceitas = useCallback(async (currentSearch = searchText, pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const params: any = { page: pageNum, limit: 15 };
      if (currentSearch.trim()) params.search = currentSearch.trim();
      if (selectedCategoria) params.categoria = selectedCategoria;
      
      // Aplicar filtros da busca avançada
      if (filtrosBusca.nome) {
        params.nome = filtrosBusca.nome;
      }
      if (filtrosBusca.ingrediente) {
        params.ingrediente = filtrosBusca.ingrediente;
      }
      if (filtrosBusca.proteinasMin) params.proteinasMin = filtrosBusca.proteinasMin;
      if (filtrosBusca.tempoMaximo) params.tempoMaximo = filtrosBusca.tempoMaximo;
      if (filtrosBusca.semLactose) params.semLactose = true;
      if (filtrosBusca.lowCarb) params.lowCarb = true;

      const response = await api.getReceitas(params);
      
      const isPaginated = !Array.isArray(response) && response && response.data;
      const todasReceitasRaw = isPaginated ? response.data : (Array.isArray(response) ? response : []);
      const totalPages = isPaginated ? response.totalPages : 1;
      
      let receitasAtivas = todasReceitasRaw.filter((r: any) => r && r.ativa);
      
      if (user?.subscription_tier !== 'premium_fit') {
        receitasAtivas = receitasAtivas.filter((r: any) => r.is_free === true);
      }
      
      if (pageNum === 1) {
        setReceitas(receitasAtivas);
        
        // Calculamos apenas prévias para os carrosséis horizontais
        const populares = receitasAtivas
          .filter((r: any) => r.destaque_popular === true)
          .sort((a: any, b: any) => b.avaliacao - a.avaliacao);
        setReceitasPopulares(populares.slice(0, 8));

        const rapidas = receitasAtivas
          .filter((r: any) => (r.tempo_preparo || 0) <= 10);
        setReceitasRapidas(rapidas.slice(0, 8));
      } else {
        setReceitas(prev => {
          const newItems = receitasAtivas.filter((r: any) => !prev.some(p => p.id === r.id));
          return [...prev, ...newItems];
        });
      }
      
      setHasMore(pageNum < totalPages || (!isPaginated && receitasAtivas.length === 15));
      setPage(pageNum);
      
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchText, selectedCategoria, user?.subscription_tier, filtrosBusca]);

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading && filterMode === 'todos') {
      loadReceitas(searchText, page + 1);
    }
  };

  useEffect(() => { loadCategorias(); }, [loadCategorias]);
  
  // Use effect apenas para carregar inicialmente ou quando a categoria/filtros mudarem
  useEffect(() => { 
    loadReceitas(searchText, 1); 
  }, [selectedCategoria, filtrosBusca, user?.subscription_tier]);

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      loadReceitas(text, 1);
    }, 600);
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowBackToTop(offsetY > 400);
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleViewAll = (mode: 'populares' | 'rapidas') => {
    setFilterMode(mode);
    // Rolar até o início da seção de todas as receitas (grid)
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: 0, viewOffset: 100, animated: true });
    }, 100);
  };

  const renderReceitaCard = (item: Receita, isHorizontal = false) => (
    <ReceitaCardAnimated 
      key={item.id} 
      item={item} 
      isHorizontal={isHorizontal} 
      onPress={() => (navigation as any).navigate('ReceitaDetail', { receitaId: item.id })} 
    />
  );

  const renderHeader = () => (
    <View style={{ paddingBottom: 20 }}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Receitas</Text>
        </View>
        <View style={styles.headerDivider} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar receitas..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={handleSearchTextChange}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setBuscaAvancadaVisible(true)} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <BuscaAvancada 
        visible={buscaAvancadaVisible}
        onClose={() => setBuscaAvancadaVisible(false)}
        onSearch={(filters) => setFiltrosBusca(filters)}
        initialFilters={filtrosBusca}
        availableCategories={categorias}
      />

      {categorias.length > 0 && (
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categorias}
            keyExtractor={c => c.id}
            contentContainerStyle={styles.filtersContent}
            renderItem={({ item: cat }) => {
              const isActive = selectedCategoria === cat.id;
              return (
                <TouchableOpacity
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => {
                    setSelectedCategoria(isActive ? null : cat.id);
                    setFilterMode('todos'); 
                  }}
                  activeOpacity={0.8}
                >
                  {cat.imagem_url ? (
                    <Image
                      source={{ uri: getImageUrl(cat.imagem_url) || '' }}
                      style={styles.filterChipImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.filterChipImage, { backgroundColor: '#333' }]} />
                  )}
                  <View style={styles.filterChipOverlay}>
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]} numberOfLines={2}>
                      {cat.nome}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
          {categorias.length > 3 && (
            <View style={styles.scrollIndicator}>
              <Ionicons name="arrow-forward" size={16} color="rgba(231,196,138,0.6)" />
            </View>
          )}
        </View>
      )}

      {receitasPopulares.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <Ionicons name="star" size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Populares</Text>
            </View>
            <TouchableOpacity onPress={() => handleViewAll('populares')}>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={receitasPopulares}
            keyExtractor={r => `pop-${r.id}`}
            contentContainerStyle={styles.horizontalScroll}
            renderItem={({ item }) => renderReceitaCard(item, true)}
          />
          {receitasPopulares.length > 2 && (
            <View style={[styles.scrollIndicator, { marginTop: -5 }]}>
              <Ionicons name="arrow-forward" size={16} color="rgba(231,196,138,0.6)" />
            </View>
          )}
        </View>
      )}

      {receitasRapidas.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <Ionicons name="flash" size={16} color="#FFD700" />
              <Text style={styles.sectionTitle}>Em 10 Minutos</Text>
            </View>
            <TouchableOpacity onPress={() => handleViewAll('rapidas')}>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={receitasRapidas}
            keyExtractor={r => `fast-${r.id}`}
            contentContainerStyle={styles.horizontalScroll}
            renderItem={({ item }) => renderReceitaCard(item, true)}
          />
          {receitasRapidas.length > 2 && (
            <View style={[styles.scrollIndicator, { marginTop: -5 }]}>
              <Ionicons name="arrow-forward" size={16} color="rgba(231,196,138,0.6)" />
            </View>
          )}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <View style={styles.titleWithIcon}>
          <Ionicons name="restaurant" size={16} color={colors.primary} />
          <Text style={styles.sectionTitle}>
            {filterMode === 'populares' ? 'Populares' : filterMode === 'rapidas' ? 'Receitas de 10 min' : 'Todas as Receitas'}
          </Text>
        </View>
        {filterMode !== 'todos' && (
          <TouchableOpacity onPress={() => setFilterMode('todos')}>
            <Text style={[styles.seeAllText, { color: colors.textSecondary }]}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Lógica de exibição final (Grid)
  // Agora filtramos dinamicamente a partir da lista 'receitas' que já respeita categoria e busca
  const displayReceitas = React.useMemo(() => {
    if (filterMode === 'populares') {
      return receitas
        .filter(r => r.destaque_popular === true)
        .sort((a,b) => b.avaliacao - a.avaliacao);
    }
    if (filterMode === 'rapidas') {
      return receitas.filter(r => (r.tempo_preparo || 0) <= 10);
    }
    return receitas;
  }, [receitas, filterMode]);

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <FlatList
          ref={flatListRef}
          key="grid-2-columns"
          data={displayReceitas}
          keyExtractor={item => `grid-${item.id}`}
          numColumns={2}
          ListHeaderComponent={renderHeader()}
          renderItem={({ item, index }) => (
            <View style={[
              styles.gridItem, 
              { paddingLeft: index % 2 === 0 ? 20 : 5, paddingRight: index % 2 === 0 ? 5 : 20 }
            ]}>
              {renderReceitaCard(item)}
            </View>
          )}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
            ) : null
          }
          ListEmptyComponent={!loading ? <View style={styles.emptyContainer}><Text style={styles.emptyText}>Nenhuma receita encontrada</Text></View> : <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />}
        />

        {showBackToTop && (
          <TouchableOpacity 
            style={styles.backToTopButton} 
            onPress={scrollToTop}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-up" size={24} color="#000" />
          </TouchableOpacity>
        )}
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 5,
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
  filtersContainer: { marginBottom: 30 },
  filtersContent: { paddingHorizontal: 20 },
  filterChip: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
    borderWidth: 1.2,
    borderColor: 'rgba(231,196,138,0.3)',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  filterChipActive: {
    borderColor: '#c8921a',
    borderWidth: 2,
    shadowColor: '#c8921a',
    shadowOpacity: 0.8,
  },
  filterChipImage: { width: '100%', height: '100%', position: 'absolute' },
  filterChipOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  filterChipText: {
    fontSize: 9,
    color: '#ffffff',
    fontFamily: fonts.bold,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  filterChipTextActive: {
    color: '#c8921a',
  },
  section: { marginBottom: 20 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    marginBottom: 10, 
    alignItems: 'center' 
  },
  seeAllText: {
    fontSize: 14,
    color: '#c8921a',
    fontWeight: '600',
  },
  titleWithIcon: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontFamily: fonts.title, color: '#fff', marginLeft: 8 },
  horizontalScroll: { paddingLeft: 20 },
  list: { paddingBottom: 40 },
  gridItem: {
    flex: 1,
  },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 14 },
  scrollIndicator: {
    alignItems: 'flex-end',
    paddingRight: 25,
    marginTop: 2,
  },
  backToTopButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
