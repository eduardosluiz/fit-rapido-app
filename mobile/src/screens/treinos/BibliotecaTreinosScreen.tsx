import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  TextInput,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api, getImageUrl } from '../../services/api';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';
import VideoPlayer from '../../components/VideoPlayer';
import AppBackground from '../../components/AppBackground';

export default function BibliotecaTreinosScreen({ navigation }: any) {
  const [exercicios, setExercicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedExercicio, setSelectedExercicio] = useState<any>(null);

  const loadExercicios = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getExerciciosBiblioteca({ search: searchText, limit: 100, exibir_mobile: 'true' });
      const data = res?.items || (Array.isArray(res) ? res : (res?.data || []));
      // Garante a ordenação alfabética
      const sortedData = data.sort((a: any, b: any) => a.nome?.localeCompare(b.nome));
      setExercicios(sortedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  useEffect(() => { loadExercicios(); }, [loadExercicios]);

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const capaUrl = item.video_thumbnail_url || item.imagem_url;
    
    return (
      <TouchableOpacity
        style={[styles.card, { paddingLeft: index % 2 === 0 ? 20 : 5, paddingRight: index % 2 === 0 ? 5 : 20 }]}
        activeOpacity={0.8}
        onPress={() => setSelectedExercicio(item)}
      >
        <View style={styles.cardInner}>
          <View style={styles.imageContainer}>
            {capaUrl ? (
              <Image
                source={{ uri: getImageUrl(capaUrl) }}
                style={styles.image}
                resizeMode="cover"
              />
          ) : (
            <View style={[styles.image, { backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="barbell" size={32} color="#555" />
            </View>
          )}
          <View style={styles.playOverlay}>
            <Ionicons name="play-circle" size={40} color={colors.primary} />
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.title} numberOfLines={2}>{item.nome}</Text>
          {item.categoria && (
            <Text style={styles.subtitle}>{item.categoria}</Text>
          )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#E7C48A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BIBLIOTECA DE EXECUÇÕES</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar exercícios..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={exercicios}
            keyExtractor={item => item.id}
            numColumns={2}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>Nenhum exercício encontrado</Text>
              </View>
            }
          />
        )}

        <Modal
          visible={!!selectedExercicio}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setSelectedExercicio(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedExercicio && (
                <VideoPlayer
                  videoUrl={selectedExercicio.video_url}
                  title={selectedExercicio.nome}
                  onClose={() => setSelectedExercicio(null)}
                />
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.primary,
    fontSize: 16,
    fontFamily: fonts.title,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,15,15,0.75)',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(231,196,138,0.35)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
    // @ts-ignore
    outlineStyle: 'none',
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    width: '50%',
    marginBottom: 20,
  },
  cardInner: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.bold,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.primary,
    fontSize: 9,
    fontFamily: fonts.bold,
    textTransform: 'uppercase',
    opacity: 0.8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    marginTop: 10,
    fontFamily: fonts.body,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
  }
});
