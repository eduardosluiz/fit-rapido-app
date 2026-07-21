import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api, Treino, getImageUrl } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';
import AppBackground from '../../components/AppBackground';
import { Video, ResizeMode } from 'expo-av';

interface ModalityParams {
  modalityId: string;
  modalityName: string;
  modalityImage?: string;
  hasNivelamento: boolean;
  descricao_iniciante?: string;
  descricao_intermediario?: string;
  descricao_avancado?: string;
}

const TreinoListItem = ({ item, index, initiallyExpanded }: { item: Treino, index: number, initiallyExpanded?: boolean }) => {
  const [expanded, setExpanded] = useState(initiallyExpanded || false);
  const [detail, setDetail] = useState<Treino | null>(null);
  const [loading, setLoading] = useState(false);

  // Se inicialmente expandido, carrega os detalhes automaticamente
  useEffect(() => {
    if (initiallyExpanded && !detail && !item.video_url) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const fullTreino = await api.getTreino(item.id);
          setDetail(fullTreino);
        } catch(e) {}
        setLoading(false);
      };
      fetchDetail();
    }
  }, [initiallyExpanded]);

  const handleExpand = async () => {
    if (!expanded && !detail && !item.video_url) {
      setLoading(true);
      try {
        const fullTreino = await api.getTreino(item.id);
        setDetail(fullTreino);
      } catch(e) {}
      setLoading(false);
    }
    setExpanded(!expanded);
  };

  const displayData = detail || item;
  const tecnico = displayData.exercicios_detalhados?.[0] || {};
  const series = tecnico.series || displayData.series || '';
  const repeticoes = tecnico.repeticoes || displayData.repeticoes || '';
  const descanso = tecnico.intervalo || displayData.descanso || '';
  const descricao = displayData.descricao_tecnica || displayData.descricao || '';
  const videoUrl = displayData.video_url;

  return (
    <View style={styles.accordionCard}>
      <Text style={styles.accordionTitle}>{index + 1}. {displayData.titulo}</Text>
      
      {(series || repeticoes) ? (
         <Text style={styles.accordionInfo}>{series} Séries | {repeticoes} repetições</Text>
      ) : null}
      
      {descricao ? (
         <Text style={styles.accordionDesc}>Instruções: {descricao.replace(/<[^>]*>?/gm, '')}</Text>
      ) : null}
      
      {descanso ? (
         <Text style={styles.accordionInfo}>Descanso: {descanso}</Text>
      ) : null}

      <TouchableOpacity onPress={handleExpand} style={styles.expandButton}>
        <Ionicons name={expanded ? "chevron-up-circle" : "chevron-down-circle"} size={16} color="#FFF" />
        <Text style={styles.expandText}>{expanded ? "Ocultar vídeo" : "Ver vídeo"}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.videoContainer}>
          {loading ? <ActivityIndicator color={colors.primary} /> : 
             videoUrl ? (
               Platform.OS === 'web' ? (
                 React.createElement('video', {
                   key: `video-${item.id}`,
                   src: getImageUrl(videoUrl),
                   controls: true,
                   poster: getImageUrl(displayData.imagem_url),
                   style: { width: '100%', height: '100%', backgroundColor: '#000', objectFit: 'cover' }
                 })
               ) : (
                 <Video
                   key={`video-${item.id}`}
                   source={{ uri: getImageUrl(videoUrl) }}
                   posterSource={displayData.imagem_url ? { uri: getImageUrl(displayData.imagem_url) } : undefined}
                   usePoster={!!displayData.imagem_url}
                   style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
                   useNativeControls
                   resizeMode={ResizeMode.COVER}
                   shouldPlay={false}
                 />
               )
             ) : <Text style={{color: '#888', textAlign: 'center'}}>Vídeo não disponível</Text>
          }
        </View>
      )}
    </View>
  );
};

export default function ModalityWorkoutsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { 
    modalityId, 
    modalityName, 
    modalityImage, 
    hasNivelamento,
    descricao_iniciante,
    descricao_intermediario,
    descricao_avancado,
    expandTreinoId
  } = route.params as ModalityParams & { expandTreinoId?: string };
  
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNivel, setSelectedNivel] = useState<'iniciante' | 'intermediario' | 'avancado'>('iniciante');
  const [expandedDay, setExpandedDay] = useState<number | null>(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

  const loadTreinos = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { modalidade_id: modalityId };
      const treinosRaw = await api.getTreinos(params);
      let data = Array.isArray(treinosRaw) ? treinosRaw : [];
      
      if (hasNivelamento) {
        data = data.filter((t: any) => t.nivel === selectedNivel);
      }

      let treinosAtivos = data.filter((t: any) => t && (t.ativa === true || t.ativo === true));
      
      if (user?.subscription_tier !== 'premium_fit') {
        treinosAtivos = treinosAtivos.filter(t => t.is_premium === false);
      }
      
      setTreinos(treinosAtivos);
      
      // Auto-scroll to the expanded workout if specified
      if (expandTreinoId) {
        const foundTreino = treinosAtivos.find(t => t.id === expandTreinoId);
        if (foundTreino && hasNivelamento) {
          // ensure we are on the correct level tab if the workout belongs to a specific level
          if (foundTreino.nivel && ['iniciante', 'intermediario', 'avancado'].includes(foundTreino.nivel)) {
            setSelectedNivel(foundTreino.nivel as any);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar treinos da modalidade:', error);
    } finally {
      setLoading(false);
    }
  }, [modalityId, hasNivelamento, selectedNivel, user?.subscription_tier, expandTreinoId]);

  useEffect(() => { loadTreinos(); }, [loadTreinos]);

    // Componente renderTreinoCard removido pois agora usamos TreinoListItem

  const diasSemana = [
    'TREINO 1 (Segunda)',
    'TREINO 2 (Terça)',
    'TREINO 3 (Quarta)',
    'TREINO 4 (Quinta)',
    'TREINO 5 (Sexta)',
    'TREINO 6 (Sábado)',
    'TREINO 7 (Domingo)'
  ];

  const handleDayPress = (index: number, treinosDoDia: Treino[]) => {
    if (treinosDoDia.length === 0) return;
    setExpandedDay(expandedDay === index ? null : index);
  };

  const renderHeader = () => {
    // Pega a descrição correta baseada no nível selecionado
    const getDescricaoNivel = () => {
      if (selectedNivel === 'iniciante') return descricao_iniciante;
      if (selectedNivel === 'intermediario') return descricao_intermediario;
      if (selectedNivel === 'avancado') return descricao_avancado;
      return null;
    };

    const currentDescricao = getDescricaoNivel();

    return (
      <View style={{ paddingBottom: hasNivelamento ? 10 : 10 }}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#E7C48A" />
            </TouchableOpacity>
            <View style={styles.titleWrapper}>
              <Text style={styles.headerTitle} numberOfLines={2}>{modalityName}</Text>
              {!loading && (
                <View style={styles.premiumBadgeRow}>
                  <Ionicons 
                    name={(modalityName || '').toLowerCase().includes('jornada') || (modalityName || '').toLowerCase().includes('começa') ? 'play-circle' : 'fitness'} 
                    size={12} 
                    color="#E7C48A" 
                  />
                  <Text style={styles.headerSubtitle}>
                    {treinos.length} {(modalityName || '').toLowerCase().includes('jornada') || (modalityName || '').toLowerCase().includes('começa') ? (treinos.length === 1 ? 'Aula' : 'Aulas') : (treinos.length === 1 ? 'Treino' : 'Treinos')}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.headerDivider} />
        </View>

        {hasNivelamento && (
          <View style={styles.nivelTabsContainer}>
            {(['iniciante', 'intermediario', 'avancado'] as const).map((nivel) => (
              <TouchableOpacity
                key={nivel}
                style={[styles.nivelTab, selectedNivel === nivel && styles.nivelTabActive]}
                onPress={() => setSelectedNivel(nivel)}
              >
                <Text style={[styles.nivelTabText, selectedNivel === nivel && styles.nivelTabTextActive]}>
                  {nivel === 'iniciante' ? 'Básico' : nivel === 'intermediario' ? 'Intermediário' : 'Avançado'}
                </Text>
                {selectedNivel === nivel && <View style={styles.nivelTabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Descrição Técnica do Nível (Exibida em cima dos exercícios) */}
        {hasNivelamento && currentDescricao ? (
          <View style={styles.nivelDescContainer}>
            <View style={styles.nivelDescHeader}>
              <Ionicons name="information-circle-outline" size={16} color="#E7C48A" />
              <Text style={styles.nivelDescTitle}>ORIENTAÇÕES DA TRILHA</Text>
            </View>
            <Text style={styles.nivelDescText}>
              {currentDescricao.replace(/\s*(\d+\))/g, '\n$1').trim()}
            </Text>
          </View>
        ) : null}

        {/* Horizontal Day Cards */}
        {hasNivelamento && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysScrollContainer}
          >
            {diasSemana.map((dia, index) => {
              const treinosDoDia = treinos
                .filter((t) => t.dia_semana === index)
                .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
                
              const isSelected = expandedDay === index;
              const temTreino = treinosDoDia.length > 0;
              const title = dia.split(' ')[2]?.replace('(', '').replace(')', '') || dia.split('-')[0].trim();

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCard,
                    isSelected && temTreino && styles.dayCardActive,
                    isSelected && !temTreino && styles.dayCardActiveRest
                  ]}
                  onPress={() => handleDayPress(index, treinosDoDia)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dayCardTitle, 
                    { color: temTreino ? '#FFFFFF' : 'rgba(255,255,255,0.4)' },
                    isSelected && { color: temTreino ? colors.primary : '#FFFFFF' }
                  ]}>
                    {title.substring(0, 3).toUpperCase()}
                  </Text>
                  {temTreino ? (
                    <View style={[styles.dayCardDot, isSelected && { backgroundColor: colors.primary }]} />
                  ) : (
                    <View style={styles.dayCardRestDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderWorkoutForSelectedDay = ({ item, index }: { item: Treino, index: number }) => (
    <View style={{ width: '100%', paddingHorizontal: 15, marginBottom: 15 }}>
      <TreinoListItem 
        item={item} 
        index={index} 
        initiallyExpanded={expandTreinoId === item.id} 
      />
    </View>
  );



  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        {hasNivelamento ? (
          <FlatList
            data={expandedDay !== null ? treinos.filter(t => t.dia_semana === expandedDay).sort((a, b) => (a.ordem || 0) - (b.ordem || 0)) : []}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            renderItem={renderWorkoutForSelectedDay}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              loading ? <ActivityIndicator color={colors.primary} /> : 
              (expandedDay !== null && treinos.filter(t => t.dia_semana === expandedDay).length === 0) ? 
              <View style={{padding: 40, alignItems: 'center'}}>
                <Ionicons name="cafe-outline" size={48} color="rgba(255,255,255,0.2)" />
                <Text style={{color: '#999', textAlign: 'center', marginTop: 16, fontFamily: fonts.body}}>Hoje é dia de descanso!{'\n'}Aproveite para recarregar as energias.</Text>
              </View> : null
            }
          />
        ) : (
          <FlatList
            data={treinos.sort((a, b) => (a.ordem || 0) - (b.ordem || 0))}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            renderItem={({ item, index }) => (
              <View style={{ width: '100%', paddingHorizontal: 15, marginBottom: 15 }}>
                <TreinoListItem 
                  item={item} 
                  index={index} 
                  initiallyExpanded={expandTreinoId === item.id} 
                />
              </View>
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={loading ? <ActivityIndicator color={colors.primary} /> : <View style={{padding: 20}}><Text style={{color: '#999', textAlign: 'center'}}>Nenhum vídeo encontrado.</Text></View>}
          />
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
    marginBottom: 15,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  titleWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: { 
    flexShrink: 1,
    fontSize: 20, 
    fontFamily: fonts.title, 
    color: '#E7C48A', 
    lineHeight: 24,
  },
  premiumBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231,196,138,0.1)',
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(231,196,138,0.2)',
  },
  headerSubtitle: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    color: '#E7C48A',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
  },
  nivelTabsContainer: { flexDirection: 'row', marginTop: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  nivelTab: { flex: 1, paddingVertical: 15, alignItems: 'center', position: 'relative' },
  nivelTabActive: {},
  nivelTabText: { fontSize: 11, fontFamily: fonts.body, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 1 },
  nivelTabTextActive: { color: colors.primary, fontFamily: fonts.bold },
  nivelTabIndicator: { position: 'absolute', bottom: 0, height: 3, width: '100%', backgroundColor: colors.primary },
  
  daysScrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 12,
  },
  dayCard: {
    width: 65,
    height: 85,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCardActive: {
    backgroundColor: 'rgba(231,196,138, 0.15)',
    borderColor: 'rgba(231,196,138, 0.5)',
  },
  dayCardActiveRest: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dayCardTitle: {
    fontSize: 14,
    fontFamily: fonts.title,
    marginBottom: 8,
  },
  dayCardDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dayCardRestDot: {
    width: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  
  expandedContent: { marginTop: 5 },
  gridContainer: { width: '100%' },
  list: { paddingBottom: 40 },
  carouselIndicator: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-end', 
    paddingRight: 35, 
    marginTop: -10,
    marginBottom: 10,
    gap: 4 
  },
  indicatorText: { 
    fontSize: 8, 
    fontFamily: fonts.bold, 
    color: '#E7C48A', 
    letterSpacing: 1 
  },
  nivelDescContainer: {
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
    padding: 18,
    backgroundColor: 'rgba(231,196,138, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(231,196,138, 0.2)',
  },
  nivelDescHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  nivelDescTitle: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: '#E7C48A',
    letterSpacing: 1.5,
  },
  nivelDescText: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  accordionCard: {
    backgroundColor: '#262626',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    width: '100%',
  },
  accordionTitle: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    marginBottom: 8,
  },
  accordionInfo: {
    color: '#CCC',
    fontSize: 12,
    fontFamily: fonts.body,
    marginBottom: 6,
  },
  accordionDesc: {
    color: '#AAA',
    fontSize: 12,
    fontFamily: fonts.body,
    marginBottom: 6,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  expandText: {
    color: '#FFF',
    fontSize: 12,
    marginLeft: 4,
    fontFamily: fonts.bodySemiBold,
  },
  videoContainer: {
    marginTop: 15,
    width: '100%',
    height: 400,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
});
