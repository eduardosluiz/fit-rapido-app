import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, ScrollView, TextInput, Animated, Dimensions, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { api, Receita, Treino, getImageUrl } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';
import AppBackground from '../../components/AppBackground';
import ReceitaCardAnimated from '../../components/ReceitaCardAnimated';
import BuscaAvancada, { BuscaFilters } from '../../components/BuscaAvancada';

const { width } = Dimensions.get('window');

interface Favorito {
  id: string;
  item_id: string;
  tipo: 'receita' | 'treino';
  created_at: string;
}

export default function FavoritosScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [categoriasFavoritos, setCategoriasFavoritos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [buscaAvancadaVisible, setBuscaAvancadaVisible] = useState(false);
  const [filtrosBusca, setFiltrosBusca] = useState<BuscaFilters>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useFocusEffect(
    useCallback(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
        Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: false }),
      ]).start();
    }, [])
  );

  const loadFavoritos = async () => {
    try {
      setLoading(true);
      const data = await api.getFavoritos();
      setFavoritos(data);

      try {
        const categoriasData = await api.getCategorias();
        setCategoriasFavoritos(categoriasData.filter((c: any) => c.aparece_favoritos === true));
      } catch (err) {
        console.error('Erro ao carregar categorias', err);
      }

      const receitaIds = data
        .filter(f => f.tipo === 'receita' && f.item_id && f.item_id.trim() !== '')
        .map(f => f.item_id);
      
      const treinoIds = data
        .filter(f => f.tipo === 'treino' && f.item_id && f.item_id.trim() !== '')
        .map(f => f.item_id);

      const receitasPromises = receitaIds.map(async (id) => {
        try { return await api.getReceita(id); } catch { return null; }
      });

      const canAccessWorkouts = user?.subscription_tier === 'premium_fit';
      const treinosPromises = canAccessWorkouts 
        ? treinoIds.map(async (id) => {
            try { return await api.getTreino(id); } catch { return null; }
          })
        : [];

      const [receitasData, treinosData] = await Promise.all([
        Promise.all(receitasPromises),
        canAccessWorkouts ? Promise.all(treinosPromises) : Promise.resolve([]),
      ]);

      setReceitas(receitasData.filter(r => r !== null && r.ativa !== false) as Receita[]);
      setTreinos(treinosData.filter(t => t !== null && t.ativa !== false) as Treino[]);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user) loadFavoritos();
    }, [user])
  );

  const handleRemoveFavorito = async (tipo: 'receita' | 'treino', itemId: string) => {
    try {
      await api.removeFavorito(tipo, itemId);
      await loadFavoritos();
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  };

  const filterBySearch = (items: (Receita | Treino)[]) => {
    if (!searchText.trim()) return items;
    const searchLower = searchText.toLowerCase();
    return items.filter(item => 
      item.titulo.toLowerCase().includes(searchLower) ||
      (item.descricao && item.descricao.toLowerCase().includes(searchLower))
    );
  };

  const filteredReceitas = filterBySearch(receitas);
  const filteredTreinos = filterBySearch(treinos);

  const filteredData = activeTab === 'all' 
    ? [...filteredReceitas.map(r => ({ type: 'receita' as const, data: r })), ...filteredTreinos.map(t => ({ type: 'treino' as const, data: t }))]
    : activeTab === 'receitas'
    ? filteredReceitas.map(r => ({ type: 'receita' as const, data: r }))
    : activeTab === 'treinos'
    ? filteredTreinos.map(t => ({ type: 'treino' as const, data: t }))
    : filteredReceitas
        .filter(r => r.categorias?.some(c => c.id === activeTab))
        .map(r => ({ type: 'receita' as const, data: r }));

  const renderItem = ({ item, index }: { item: { type: 'receita' | 'treino', data: Receita | Treino }, index: number }) => {
    const isReceita = item.type === 'receita';
    const data = item.data;

    const displayData: any = {
      ...data,
      tempo_preparo: isReceita ? (data as Receita).tempo_preparo : (data as Treino).duracao_minutos,
      calorias: isReceita ? (data as Receita).calorias : null,
      dificuldade: isReceita ? (data as Receita).dificuldade : (data as Treino).nivel,
    };

    return (
      <View style={[
        styles.gridItem, 
        { paddingLeft: index % 2 === 0 ? 20 : 5, paddingRight: index % 2 === 0 ? 5 : 20 }
      ]}>
        <View style={{ position: 'relative' }}>
          <ReceitaCardAnimated
            item={displayData}
            onPress={() => {
              if (isReceita) {
                (navigation as any).navigate('Receitas', { screen: 'ReceitaDetail', params: { receitaId: data.id } });
              } else {
                (navigation as any).navigate('Treinos', { screen: 'TreinoDetail', params: { treinoId: data.id } });
              }
            }}
          />
          <TouchableOpacity
            onPress={() => handleRemoveFavorito(item.type, data.id)}
            style={styles.floatingRemoveButton}
          >
            <Ionicons name="heart" size={18} color={colors.primary} />
          </TouchableOpacity>
          {!isReceita && (
            <View style={styles.workoutTypeIcon}>
              <Ionicons name="barbell" size={12} color="#fff" />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={{ paddingBottom: 20 }}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Favoritos</Text>
        </View>
        <View style={styles.headerDivider} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar favoritos..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
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

      <BuscaAvancada
        visible={buscaAvancadaVisible}
        onClose={() => setBuscaAvancadaVisible(false)}
        onSearch={(filters) => setFiltrosBusca(filters)}
        initialFilters={filtrosBusca}
      />

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
          <TouchableOpacity
            style={[styles.filterChip, activeTab === 'all' && styles.filterChipActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={{ fontSize: 22 }}>🌟</Text>
            <Text style={styles.filterChipText}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, activeTab === 'receitas' && styles.filterChipActive]}
            onPress={() => setActiveTab('receitas')}
          >
            <Text style={{ fontSize: 22 }}>🥗</Text>
            <Text style={styles.filterChipText}>Receitas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, activeTab === 'treinos' && styles.filterChipActive]}
            onPress={() => setActiveTab('treinos')}
          >
            <Text style={{ fontSize: 22 }}>💪</Text>
            <Text style={styles.filterChipText}>Treinos</Text>
          </TouchableOpacity>
          {categoriasFavoritos.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.filterChip, activeTab === cat.id && styles.filterChipActive]}
              onPress={() => setActiveTab(cat.id)}
            >
              <Text style={{ fontSize: 22 }}>{cat.icone_emoji || '🍽️'}</Text>
              <Text style={styles.filterChipText}>{cat.nome}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {3 > 3 && ( // Atualmente fixo em 3, não aparecerá. Lógica pronta para expansão.
          <View style={styles.scrollIndicator}>
            <Ionicons name="arrow-forward" size={16} color="rgba(231,196,138,0.6)" />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <AppBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <FlatList
          key="grid-2-favs"
          data={filteredData}
          keyExtractor={(item) => `${item.type}-${item.data.id}`}
          numColumns={2}
          ListHeaderComponent={renderHeader()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-dislike-outline" size={60} color="rgba(255,255,255,0.1)" />
              <Text style={styles.emptyText}>Nenhum favorito encontrado</Text>
              <Text style={styles.emptySubtext}>Seus itens salvos aparecerão aqui.</Text>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        />
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: 'transparent',
  },
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
  loadingContainer: { padding: 40, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: colors.textMuted },
  list: { paddingBottom: 40 },
  gridItem: {
    flex: 1,
    maxWidth: '50%',
  },
  filtersContainer: { 
    marginBottom: 20,
  },
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
    backgroundColor: 'rgba(231,196,138, 0.15)',
    borderColor: 'rgba(231,196,138, 0.8)',
  },
  filterChipText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: fonts.bodySemiBold,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  floatingRemoveButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    padding: 5,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(231,196,138,0.3)',
  },
  workoutTypeIcon: {
    position: 'absolute',
    bottom: 80, 
    right: 10,
    backgroundColor: colors.primaryDark,
    borderRadius: 6,
    padding: 3,
    zIndex: 10,
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 60 },
  emptyText: { fontSize: 18, fontFamily: fonts.title, color: '#fff', marginTop: 20, marginBottom: 8, textAlign: 'center' },
  emptySubtext: { fontSize: 14, color: '#666', textAlign: 'center' },
  scrollIndicator: {
    alignItems: 'flex-end',
    paddingRight: 25,
    marginTop: 2,
  },
});
