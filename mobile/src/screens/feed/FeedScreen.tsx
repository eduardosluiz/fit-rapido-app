import React, { useState, useEffect, useCallback } from 'react';
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

export default function FeedScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [ultimaNotificacao, setUltimaNotificacao] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buscaAvancadaVisible, setBuscaAvancadaVisible] = useState(false);
  const [filtrosBusca, setFiltrosBusca] = useState<BuscaFilters>({});
  const [buscaRapida, setBuscaRapida] = useState('');
  const [buscaRapidaDebounced, setBuscaRapidaDebounced] = useState('');

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const canAccessWorkouts = user?.subscription_tier === 'premium_fit';
      
      const [receitasData, treinosData] = await Promise.all([
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaRapidaDebounced(buscaRapida);
    }, 500);
    return () => clearTimeout(timer);
  }, [buscaRapida]);

  useEffect(() => {
    if (buscaRapidaDebounced.trim()) {
      (navigation as any).navigate('Tabs', { 
        screen: 'Receitas',
        params: { searchQuery: buscaRapidaDebounced.trim() }
      });
    }
  }, [buscaRapidaDebounced]);

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
        onPress={() => (navigation as any).navigate('Treinos', { screen: 'TreinoDetail', params: { treinoId: treino.id } })}
      />
    );
  };

  if (loading && receitas.length === 0) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.bannerContainer}>
            <ScreenBanner defaultImage={require('../../../assets/banners/bannerinicial.jpg')} />
            <View style={styles.titleOverlay}>
              <Text style={styles.headerTitle}>Fit & Rápido</Text>
              <View style={styles.titleUnderline} />
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Carregando feed...</Text>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.bannerContainer}>
          <ScreenBanner defaultImage={require('../../../assets/banners/bannerinicial.jpg')} />
          <View style={styles.titleOverlay}>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>Fit & Rápido</Text>
              <View style={styles.titleUnderline} />
            </View>
          </View>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
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
                    setBuscaRapidaDebounced(buscaRapida.trim());
                    (navigation as any).navigate('Tabs', { 
                      screen: 'Receitas',
                      params: { searchQuery: buscaRapida.trim() }
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
                <TouchableOpacity onPress={() => (navigation as any).navigate('Tabs', { screen: 'Receitas' })}>
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

        {/* Última Notificação */}
        {ultimaNotificacao && (
          <TouchableOpacity
            style={styles.notificationContainer}
            onPress={() => {
              const itemId = ultimaNotificacao.item_id || ultimaNotificacao.itemId;
              if (itemId) {
                if (ultimaNotificacao.tipo === 'receita') {
                  (navigation as any).navigate('Receitas', { screen: 'ReceitaDetail', params: { receitaId: itemId } });
                } else if (ultimaNotificacao.tipo === 'treino') {
                  (navigation as any).navigate('Treinos', { screen: 'TreinoDetail', params: { treinoId: itemId } });
                }
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.notificationContent}>
              <View style={styles.notificationIconContainer}>
                <Ionicons name="notifications" size={20} color={colors.primary} />
              </View>
              <View style={styles.notificationTextContainer}>
                <Text style={styles.notificationTitle} numberOfLines={1}>
                  {ultimaNotificacao.titulo || 'Nova atualização'}
                </Text>
                <Text style={styles.notificationMessage} numberOfLines={1}>
                  {ultimaNotificacao.mensagem || ultimaNotificacao.message || 'Receita nova disponível!'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        )}

        <BuscaAvancada
          visible={buscaAvancadaVisible}
          onClose={() => setBuscaAvancadaVisible(false)}
          onSearch={(filters) => setFiltrosBusca(filters)}
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
    fontSize: 32,
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
  searchInput: { flex: 1, color: '#fff', marginLeft: 10, fontSize: 14 },
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
