import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { api, Treino, getImageUrl } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import VideoPlayer from '../../components/VideoPlayer';
import { useAuth } from '../../contexts/AuthContext';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';

const { width } = Dimensions.get('window');

interface Substituto {
  id: string;
  nome: string;
  video_url: string;
  imagem_capa_url?: string;
  info?: {
    series?: string;
    repeticoes?: string;
    descanso?: string;
    peso?: string;
    observacoes?: string;
  };
  descricao?: string;
}

export default function ExerciseDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { treinoId } = route.params as { treinoId: string };
  
  const [treino, setTreino] = useState<Treino | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  
  // Estado para controlar qual exercício está sendo exibido (principal ou substituto)
  const [currentView, setCurrentView] = useState<'main' | 'sub1' | 'sub2'>('main');
  const [substitutos, setSubstitutos] = useState<Substituto[]>([]);

  useEffect(() => {
    loadTreino();
  }, [treinoId]);

  const loadTreino = async () => {
    try {
      setLoading(true);
      const data = await api.getTreino(treinoId);
      setTreino(data);
      
      // Carregar dados dos substitutos se houver
      const subs: Substituto[] = [];
      if (data.substituto_id_1) {
        try {
          const sub1 = await api.getExercicioBiblioteca(data.substituto_id_1);
          subs.push({
            id: sub1.id,
            nome: sub1.nome,
            video_url: sub1.video_url,
            imagem_capa_url: data.substituto_1_info?.imagem_capa_url || sub1.imagem_capa_url || sub1.imagem_url,
            descricao: data.substituto_1_info?.observacoes || sub1.descricao_tecnica || sub1.descricao,
            info: data.substituto_1_info
          });
        } catch (e) { console.error('Erro ao carregar substituto 1', e); }
      }
      if (data.substituto_id_2) {
        try {
          const sub2 = await api.getExercicioBiblioteca(data.substituto_id_2);
          subs.push({
            id: sub2.id,
            nome: sub2.nome,
            video_url: sub2.video_url,
            imagem_capa_url: data.substituto_2_info?.imagem_capa_url || sub2.imagem_capa_url || sub2.imagem_url,
            descricao: data.substituto_2_info?.observacoes || sub2.descricao_tecnica || sub2.descricao,
            info: data.substituto_2_info
          });
        } catch (e) { console.error('Erro ao carregar substituto 2', e); }
      }
      setSubstitutos(subs);

    } catch (error) {
      console.error('Erro ao carregar detalhes do exercício:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!treino) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#fff' }}>Exercício não encontrado</Text>
      </View>
    );
  }

  // Determinar quais dados exibir baseados na visão atual
  const getDisplayData = () => {
    if (currentView === 'main') {
      const tecnico = treino.exercicios_detalhados?.[0] || {};
      return {
        titulo: treino.titulo,
        video_url: treino.video_url,
        imagem_capa: treino.imagem_capa_url || treino.imagem_url,
        series: tecnico.series || treino.series || '',
        repeticoes: tecnico.repeticoes || treino.repeticoes || '',
        descanso: tecnico.intervalo || treino.descanso || '',
        peso: tecnico.carga || treino.peso || '',
        descricao: treino.descricao_tecnica // PRIORIZA APENAS A DESCRIÇÃO TÉCNICA
      };
    } else if (currentView === 'sub1' && substitutos[0]) {
      const sub = substitutos[0];
      return {
        titulo: sub.nome,
        video_url: sub.video_url,
        imagem_capa: sub.imagem_capa_url,
        series: sub.info?.series || '',
        repeticoes: sub.info?.repeticoes || '',
        descanso: sub.info?.descanso || '',
        peso: sub.info?.peso || '',
        descricao: sub.descricao || treino.descricao_tecnica // USA DESCRIÇÃO DO SUBSTITUTO OU MANTÉM A DO TREINO
      };
    } else if (currentView === 'sub2' && substitutos[1]) {
      const sub = substitutos[1];
      return {
        titulo: sub.nome,
        video_url: sub.video_url,
        imagem_capa: sub.imagem_capa_url,
        series: sub.info?.series || '',
        repeticoes: sub.info?.repeticoes || '',
        descanso: sub.info?.descanso || '',
        peso: sub.info?.peso || '',
        descricao: sub.descricao || treino.descricao_tecnica
      };
    }
    return null;
  };

  const display = getDisplayData();

  if (!display) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E7C48A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{display.titulo}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Container do Vídeo/Capa */}
        <TouchableOpacity 
          style={styles.mediaContainer} 
          activeOpacity={0.9}
          onPress={() => setShowVideoPlayer(true)}
        >
          {display.imagem_capa ? (
            <Image 
              source={{ uri: getImageUrl(display.imagem_capa) }} 
              style={styles.coverImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.coverImage, { backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="barbell-outline" size={60} color="#333" />
            </View>
          )}
          
          <View style={styles.playButtonOverlay}>
            <View style={styles.playButtonCircle}>
              <Ionicons name="play" size={32} color="#000" style={{ marginLeft: 4 }} />
            </View>
          </View>
          
          <View style={styles.mediaBadge}>
            <Text style={styles.mediaBadgeText}>VÍDEO AULA</Text>
          </View>
        </TouchableOpacity>

        {/* Seleção de Substitutos (Tabs) */}
        {substitutos.length > 0 && (
          <View style={styles.substitutosContainer}>
            <Text style={styles.subTitle}>OPÇÕES DE EXERCÍCIO:</Text>
            <View style={styles.tabsRow}>
              <TouchableOpacity 
                style={[styles.tab, currentView === 'main' && styles.activeTab]}
                onPress={() => setCurrentView('main')}
              >
                <Text style={[styles.tabText, currentView === 'main' && styles.activeTabText]}>PRINCIPAL</Text>
              </TouchableOpacity>
              
              {substitutos.map((sub, idx) => {
                const viewName = idx === 0 ? 'sub1' : 'sub2';
                return (
                  <TouchableOpacity 
                    key={sub.id}
                    style={[styles.tab, currentView === viewName && styles.activeTab]}
                    onPress={() => setCurrentView(viewName as any)}
                  >
                    <Text style={[styles.tabText, currentView === viewName && styles.activeTabText]}>SUBSTITUTO {idx + 1}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Informações Técnicas */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={[styles.infoLabel, { color: colors.primary }]}>SÉRIES</Text>
            <Text style={styles.infoValue}>{display.series || '-'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={[styles.infoLabel, { color: colors.primary }]}>REPETIÇÕES</Text>
            <Text style={styles.infoValue}>{display.repeticoes || '-'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={[styles.infoLabel, { color: colors.primary }]}>DESCANSO</Text>
            <Text style={styles.infoValue}>{display.descanso || '-'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={[styles.infoLabel, { color: colors.primary }]}>CARGA</Text>
            <Text style={styles.infoValue}>{display.peso || '-'}</Text>
          </View>
        </View>

        {/* Descrição / Observações */}
        <View style={styles.descriptionSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>ORIENTAÇÕES TÉCNICAS</Text>
          </View>
          <View style={styles.descriptionCard}>
            <Text style={[styles.descriptionText, !display.descricao && { fontStyle: 'italic', opacity: 0.5 }]}>
              {display.descricao || 'Sem orientações técnicas para esse exercício'}
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal do Player de Vídeo */}
      <Modal 
        visible={showVideoPlayer} 
        animationType="fade" 
        transparent={true}
        onRequestClose={() => setShowVideoPlayer(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <VideoPlayer 
              videoUrl={display.video_url} 
              title={display.titulo} 
              onClose={() => setShowVideoPlayer(false)} 
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
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
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
  },
  mediaContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#222',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  mediaBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mediaBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: fonts.bold,
    letterSpacing: 1,
  },
  substitutosContainer: {
    marginBottom: 24,
  },
  subTitle: {
    color: '#9CA3AF',
    fontSize: 9,
    fontFamily: fonts.bold,
    letterSpacing: 1,
    marginBottom: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tab: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  activeTab: {
    backgroundColor: 'rgba(200, 146, 26, 0.1)',
    borderColor: colors.primary,
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 9,
    fontFamily: fonts.bold,
  },
  activeTabText: {
    color: colors.primary,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoCard: {
    width: '48%',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(231,196,138, 0.4)', // BORDA DOURADA MAIS VISÍVEL
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#555',
    fontSize: 8,
    fontFamily: fonts.bold,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  infoValue: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  descriptionSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 1,
  },
  descriptionCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(231,196,138, 0.25)', // BORDA DOURADA MAIS VISÍVEL
  },
  descriptionText: {
    color: '#D1D5DB', // TEXTO MAIS CLARO PARA LEITURA
    fontSize: 13,
    fontFamily: fonts.body,
    lineHeight: 20,
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
