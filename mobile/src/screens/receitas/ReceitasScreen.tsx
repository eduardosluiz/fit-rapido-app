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
import CategoryChip from '../../components/CategoryChip';
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
  const flatListRef = useRef<FlatList>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: false }),
    ]).start();
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

  const loadReceitas = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchText.trim()) params.search = searchText.trim();
      if (selectedCategoria) params.categoria = selectedCategoria;

      const todasReceitasRaw = await api.getReceitas(params);
      const todasReceitas = Array.isArray(todasReceitasRaw) ? todasReceitasRaw : [];
      let receitasAtivas = todasReceitas.filter((r) => r && r.ativa);
      
      if (user?.subscription_tier !== 'premium_fit') {
        receitasAtivas = receitasAtivas.filter(r => r.is_free === true);
      }
      
      setReceitas(receitasAtivas);
      
      // Calculamos apenas prévias para os carrosséis horizontais
      const populares = receitasAtivas
        .filter(r => r.avaliacao > 0)
        .sort((a,b) => b.avaliacao - a.avaliacao);
      setReceitasPopulares(populares.slice(0, 8));

      const rapidas = receitasAtivas
        .filter(r => (r.tempo_preparo || 0) <= 10);
      setReceitasRapidas(rapidas.slice(0, 8));
      
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    } finally {
      setLoading(false);
    }
  }, [searchText, selectedCategoria, user?.subscription_tier]);

  useEffect(() => { loadCategorias(); }, [loadCategorias]);
  useEffect(() => { loadReceitas(); }, [loadReceitas]);

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
      <View style={styles.headerTopBar}>
        <View style={styles.headerDateContainer}></View>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>Receitas</Text>
        <View style={styles.titleUnderline} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar receitas..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
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
        .filter(r => r.avaliacao > 0)
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
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
  headerTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, marginBottom: 20 },
  headerDateContainer: { flex: 1 },
  titleContainer: { paddingHorizontal: 20, marginBottom: 5 }, 
  headerTitle: { 
    fontSize: 34, 
    fontFamily: fonts.title, 
    color: '#E7C48A', 
    marginBottom: 6,
    textShadowColor: 'rgba(231,196,138,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  titleUnderline: { height: 2, backgroundColor: '#E7C48A', width: 90, borderRadius: 1 },
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
  searchInput: { flex: 1, color: '#fff', marginLeft: 10, fontSize: 14 },
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
    fontSize: 10,
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
