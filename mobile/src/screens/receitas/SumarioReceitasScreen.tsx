import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api, Receita } from '../../services/api';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';
import AppBackground from '../../components/AppBackground';

export default function SumarioReceitasScreen() {
  const navigation = useNavigation();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [filteredReceitas, setFilteredReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'free' | 'premium'>('all');

  const groupedReceitas = React.useMemo(() => {
    const groups: { [key: string]: Receita[] } = {};
    filteredReceitas.forEach(r => {
      const cleanTitle = r.titulo.replace(/^[^a-zA-ZÀ-ÿ0-9]+/g, '').trim();
      const firstLetter = cleanTitle.charAt(0).toUpperCase();
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(r);
    });
    return Object.keys(groups).sort().map(key => ({
      title: key,
      data: groups[key]
    }));
  }, [filteredReceitas]);

  useEffect(() => {
    loadReceitas();
  }, []);

  const loadReceitas = async () => {
    try {
      setLoading(true);
      const response = await api.getReceitas({ page: 1, limit: 1000, summary: true });
      const receitasData = !Array.isArray(response) && response && response.data ? response.data : (Array.isArray(response) ? response : []);
      const safeReceitasData = Array.isArray(receitasData) ? receitasData : [];
      
      const ordenadas = safeReceitasData
        .filter((r) => r && r.ativa && r.titulo)
        .sort((a, b) => {
          // Remove TUDO que não for letra ou número do início da string (emojis, espaços, pontuações)
          const cleanA = a.titulo.replace(/^[^a-zA-ZÀ-ÿ0-9]+/g, '').trim();
          const cleanB = b.titulo.replace(/^[^a-zA-ZÀ-ÿ0-9]+/g, '').trim();
          return cleanA.localeCompare(cleanB, 'pt-BR');
        });

      setReceitas(ordenadas);
      setFilteredReceitas(ordenadas);
    } catch (error) {
      console.error('Erro ao carregar sumário de receitas:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (text: string, filter: 'all' | 'free' | 'premium') => {
    let filtered = receitas;
    
    // Filtro por tipo
    if (filter === 'free') {
      filtered = filtered.filter(r => r.is_free);
    } else if (filter === 'premium') {
      filtered = filtered.filter(r => r.is_premium && !r.is_free);
    }
    
    // Filtro por texto
    if (text.trim() !== '') {
      const lowerQuery = text.toLowerCase();
      filtered = filtered.filter(r => r.titulo && r.titulo.toLowerCase().includes(lowerQuery));
    }
    
    setFilteredReceitas(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(text, activeFilter);
  };

  const handleFilter = (filter: 'all' | 'free' | 'premium') => {
    setActiveFilter(filter);
    applyFilters(searchQuery, filter);
  };

  const renderItem = ({ item }: { item: Receita }) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.7}
        onPress={() => (navigation as any).navigate('Tabs', {
          screen: 'Receitas',
          params: { screen: 'ReceitaDetail', params: { receitaId: item.id } }
        })}
      >
        <Text style={styles.itemTitle}>{item.titulo.replace(/^[^a-zA-ZÀ-ÿ0-9]+/g, '').trim()}</Text>
        
        {item.is_free ? (
          <View style={styles.iconContainer}>
            <Ionicons name="lock-open-outline" size={16} color="#10b981" />
          </View>
        ) : item.is_premium ? (
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={16} color="#c8921a" />
          </View>
        ) : null}
        
        <Ionicons name="arrow-forward-outline" size={18} color={colors.textMuted} style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sumário de Receitas</Text>
          <View style={styles.headerRight} />
        </View>

      <View style={styles.filtersRow}>
        <View style={styles.pillsContainer}>
          <TouchableOpacity 
            style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
            onPress={() => handleFilter('all')}
          >
            <Ionicons name="list" size={14} color={activeFilter === 'all' ? '#c8921a' : '#999'} style={styles.filterIcon} />
            <Text style={[styles.filterPillText, activeFilter === 'all' && styles.filterPillTextActive]}>Todas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterPill, activeFilter === 'free' && styles.filterPillActive]}
            onPress={() => handleFilter('free')}
          >
            <Ionicons name="lock-open-outline" size={14} color={activeFilter === 'free' ? '#c8921a' : '#999'} style={styles.filterIcon} />
            <Text style={[styles.filterPillText, activeFilter === 'free' && styles.filterPillTextActive]}>Gratuitas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterPill, activeFilter === 'premium' && styles.filterPillActive]}
            onPress={() => handleFilter('premium')}
          >
            <Ionicons name="lock-closed-outline" size={14} color={activeFilter === 'premium' ? '#c8921a' : '#999'} style={styles.filterIcon} />
            <Text style={[styles.filterPillText, activeFilter === 'premium' && styles.filterPillTextActive]}>Assinadas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.headerCount}>{filteredReceitas.length}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { outlineStyle: 'none' } as any]}
          placeholder="Buscar no sumário..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando índice...</Text>
        </View>
      ) : (
        <View style={styles.listWrapper}>
        <SectionList
          sections={groupedReceitas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          initialNumToRender={15}
          maxToRenderPerBatch={15}
          windowSize={5}
          removeClippedSubviews={true}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma receita encontrada.</Text>
          }
        />
      </View>
      )}
    </SafeAreaView>
  </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#fff',
  },
  headerRight: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerCount: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: '#c8921a',
    backgroundColor: 'rgba(200, 146, 26, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  countBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterPillActive: {
    backgroundColor: 'rgba(200, 146, 26, 0.15)',
    borderColor: '#c8921a',
  },
  filterPillText: {
    color: '#999',
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  filterPillTextActive: {
    color: '#c8921a',
    fontFamily: fonts.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  listWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  itemTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#e0e0e0',
    lineHeight: 20,
  },
  iconContainer: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    marginTop: 12,
    fontFamily: fonts.medium,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: fonts.regular,
  },
  sectionHeader: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginTop: 8,
  },
  sectionHeaderText: {
    color: '#c8921a',
    fontSize: 20,
    fontFamily: fonts.bold,
  },
});
