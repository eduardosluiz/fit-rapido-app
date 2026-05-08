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
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { api, Treino, getImageUrl } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';
import BuscaAvancada, { BuscaFilters } from '../../components/BuscaAvancada';
import AppBackground from '../../components/AppBackground';
import ReceitaCardAnimated from '../../components/ReceitaCardAnimated';

interface Modalidade {
  id: string;
  nome: string;
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
  const [filtrosBusca, setFiltrosBusca] = useState<BuscaFilters>({});

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

  const loadTreinos = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchText.trim()) params.search = searchText.trim();

      const treinosRaw = await api.getTreinos(params);
      const data = Array.isArray(treinosRaw) ? treinosRaw : [];
      
      // FILTRO: Apenas treinos que NÃO pertencem a uma modalidade (são treinos avulsos)
      let treinosAtivos = data.filter((t: any) => 
        t && 
        (t.ativa === true || t.ativo === true) && 
        !t.modalidade_id && 
        !t.modalidade
      );
      
      if (user?.subscription_tier !== 'premium_fit') {
        treinosAtivos = treinosAtivos.filter(t => t.is_premium === false);
      }
      
      setTreinos(treinosAtivos);
    } catch (error) {
      console.error('Erro ao carregar treinos:', error);
    } finally {
      setLoading(false);
    }
  }, [searchText, user?.subscription_tier]);

  useEffect(() => { loadModalidades(); }, [loadModalidades]);
  useEffect(() => { loadTreinos(); }, [loadTreinos]);

  const renderTreinoCard = (item: Treino, index: number) => {
    const displayData: any = {
      ...item,
      tempo_preparo: item.duracao_minutos,
      calorias: null,
      dificuldade: item.nivel,
    };

    return (
      <View style={[
        styles.gridItem, 
        { paddingLeft: index % 2 === 0 ? 20 : 5, paddingRight: index % 2 === 0 ? 5 : 20 }
      ]}>
        <ReceitaCardAnimated
          item={displayData}
          onPress={() => navigation.navigate('TreinoDetail' as never, { treinoId: item.id } as never)}
        />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={{ paddingBottom: 20 }}>
      <View style={styles.headerTopBar}>
        <View style={styles.headerDateContainer}></View>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>Treinos</Text>
        <View style={styles.titleUnderline} />
      </View>

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
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="O que vamos treinar hoje?"
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

          {modalidades.length > 0 && (
            <View style={styles.filtersContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
                {modalidades.map((modalidade) => (
                  <TouchableOpacity
                    key={modalidade.id}
                    style={styles.filterChip}
                    onPress={() => handleModalityPress(modalidade)}
                  >
                    {modalidade.imagem_url && (
                      <Image
                        source={{ uri: getImageUrl(modalidade.imagem_url) || '' }}
                        style={styles.filterChipImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.filterChipOverlay}>
                      <Text style={styles.filterChipText} numberOfLines={2}>
                        {modalidade.nome}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <Ionicons name="barbell" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Todos os Treinos</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );

  const canAccessWorkouts = user?.subscription_tier === 'premium_fit';
  const handleUpgradePress = () => (navigation as any).navigate('Subscriptions' as never);

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <FlatList
          key="grid-2-treinos"
          data={canAccessWorkouts ? treinos : []}
          keyExtractor={item => `grid-${item.id}`}
          numColumns={2}
          ListHeaderComponent={renderHeader()}
          renderItem={({ item, index }) => renderTreinoCard(item, index)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!loading && canAccessWorkouts ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.1)" />
              <Text style={styles.emptyText}>Nenhum treino encontrado</Text>
            </View>
          ) : loading && canAccessWorkouts ? (
            <ActivityIndicator color={colors.primary} />
          ) : null}
        />
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
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
    borderWidth: 1.2,
    borderColor: 'rgba(231,196,138,0.3)',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  filterChipImage: { width: '100%', height: '100%', position: 'absolute' },
  filterChipOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  filterChipText: {
    fontSize: 10,
    color: '#ffffff',
    fontFamily: fonts.bold,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  sectionHeader: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, alignItems: 'center' },
  titleWithIcon: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontFamily: fonts.title, color: '#fff', marginLeft: 8 },
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
