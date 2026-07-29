import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';
import AppBackground from '../../components/AppBackground';

interface GlossarioItem {
  id: string;
  nome: string;
  descricao: string;
}

export default function GlossarioScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState<GlossarioItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GlossarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await api.getGlossario();
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Erro ao carregar glossário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredItems(items);
    } else {
      const lowerQuery = text.toLowerCase();
      setFilteredItems(
        items.filter(item => 
          item.nome.toLowerCase().includes(lowerQuery) || 
          item.descricao.toLowerCase().includes(lowerQuery)
        )
      );
    }
  };

  const renderItem = ({ item }: { item: GlossarioItem }) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <Ionicons name="book-outline" size={20} color="#c8921a" style={styles.itemIcon} />
          <Text style={styles.itemTitle}>{item.nome}</Text>
        </View>
        <Text style={styles.itemDesc}>{item.descricao}</Text>
      </View>
    );
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Glossário de Ingredientes</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { outlineStyle: 'none' } as any]}
            placeholder="Buscar ingrediente..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Carregando glossário...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum ingrediente encontrado.</Text>
            }
          />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  itemContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemIcon: {
    marginRight: 8,
  },
  itemTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  itemDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
  separator: {
    height: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 40,
  },
});
