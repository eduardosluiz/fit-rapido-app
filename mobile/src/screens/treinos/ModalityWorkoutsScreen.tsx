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

const formatDescription = (text: string) => {
  if (!text) return '';
  let formatted = text.replace(/<(br|p|div|li)[^>]*>/gi, '\n');
  formatted = formatted.replace(/<[^>]*>?/gm, '');
  // Normalize literal string \n
  formatted = formatted.replace(/\\n/g, '\n');
  // Normalize Windows \r\n to \n
  formatted = formatted.replace(/\r\n/g, '\n');
  // Normalize remaining carriage returns and unicode line breaks
  formatted = formatted.replace(/[\r\v\f\u2028\u2029]/g, '\n');
  return formatted.trim();
};

interface ModalityParams {
  modalityId: string;
  modalityName: string;
  modalityImage?: string;
  hasNivelamento: boolean;
  descricao?: string;
  descricao_iniciante?: string;
  descricao_intermediario?: string;
  descricao_avancado?: string;
  configuracaoDias?: Record<string, Record<string, { titulo?: string; imagem_url?: string }>>;
}

const TreinoListItem = ({ item, index, initiallyExpanded }: { item: Treino, index: number, initiallyExpanded?: boolean }) => {
  const [expandedVideo, setExpandedVideo] = useState<'execucao' | 'explicativo' | 'substituicao' | null>(initiallyExpanded ? 'execucao' : null);
  const [detail, setDetail] = useState<Treino | null>(null);
  const [loading, setLoading] = useState(false);
  const [substitutes, setSubstitutes] = useState<any[]>([]);

  useEffect(() => {
    if (initiallyExpanded && !detail && !item.video_url && !item.video_explicativo_url) {
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

  const handleExpand = async (type: 'execucao' | 'explicativo' | 'substituicao') => {
    if (expandedVideo === type) {
      setExpandedVideo(null);
      return;
    }
    
    if (type === 'substituicao') {
      if (substitutes.length === 0) {
        setLoading(true);
        try {
          const subs = [];
          const data = detail || item;
          if (data.substituto_id_1) {
            const sub1 = await api.getExercicioBiblioteca(data.substituto_id_1);
            if (sub1) subs.push({ ...sub1, info: data.substituto_1_info || {} });
          }
          if (data.substituto_id_2) {
            const sub2 = await api.getExercicioBiblioteca(data.substituto_id_2);
            if (sub2) subs.push({ ...sub2, info: data.substituto_2_info || {} });
          }
          setSubstitutes(subs);
        } catch(e) {
          console.error('Erro ao buscar substitutos:', e);
        }
        setLoading(false);
      }
    } else {
      if (!detail && !item.video_url && !item.video_explicativo_url) {
        setLoading(true);
        try {
          const fullTreino = await api.getTreino(item.id);
          setDetail(fullTreino);
        } catch(e) {}
        setLoading(false);
      }
    }
    setExpandedVideo(type);
  };

  const displayData = detail || item;
  const tecnico = displayData.exercicios_detalhados?.[0] || {};
  const series = tecnico.series || displayData.series || '';
  const repeticoes = tecnico.repeticoes || displayData.repeticoes || '';
  const descanso = tecnico.intervalo || displayData.descanso || '';
  const descricao = displayData.descricao_tecnica || displayData.descricao || '';
  const videoExecucaoUrl = displayData.video_url;
  const videoExplicativoUrl = displayData.video_explicativo_url;

  const showVideoContainer = expandedVideo === 'execucao' || expandedVideo === 'explicativo';
  const currentVideoUrl = expandedVideo === 'execucao' ? videoExecucaoUrl : videoExplicativoUrl;
  const hasSubstituicao = !!(displayData.substituto_id_1 || displayData.substituto_id_2);

  return (
    <View style={styles.accordionCard}>
      <Text style={styles.accordionTitle}>{index + 1}. {displayData.titulo}</Text>
      
      {(series || repeticoes) ? (
         <Text style={styles.accordionInfo}>{series} Séries | {repeticoes} repetições</Text>
      ) : null}
      
      {descricao ? (
         <Text style={styles.accordionDesc}>Instruções: {formatDescription(descricao)}</Text>
      ) : null}
      
      {descanso ? (
         <Text style={styles.accordionInfo}>Descanso: {descanso}</Text>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'nowrap', alignItems: 'center' }}>
        {(videoExecucaoUrl || loading || !detail) && (
          <TouchableOpacity onPress={() => handleExpand('execucao')} style={[styles.expandButton, { marginTop: 0 }]}>
            <Ionicons name={expandedVideo === 'execucao' ? "chevron-up-circle" : "chevron-down-circle"} size={14} color="#FFF" />
            <Text style={[styles.expandText, { fontSize: 11 }]} numberOfLines={1}>{expandedVideo === 'execucao' ? "Ocultar" : "Exercício"}</Text>
          </TouchableOpacity>
        )}
        
        {(videoExplicativoUrl || (loading && !videoExecucaoUrl) || (!detail && item.video_explicativo_url)) && (
          <TouchableOpacity onPress={() => handleExpand('explicativo')} style={[styles.expandButton, { marginTop: 0 }]}>
            <Ionicons name={expandedVideo === 'explicativo' ? "chevron-up-circle" : "information-circle"} size={14} color="#E7C48A" />
            <Text style={[styles.expandText, { color: '#E7C48A', fontSize: 11 }]} numberOfLines={1}>{expandedVideo === 'explicativo' ? "Ocultar" : "Vídeo Explicativo"}</Text>
          </TouchableOpacity>
        )}

        {hasSubstituicao && (
          <TouchableOpacity onPress={() => handleExpand('substituicao')} style={[styles.expandButton, { marginTop: 0, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 12, backgroundColor: expandedVideo === 'substituicao' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }]}>
            <Ionicons name={expandedVideo === 'substituicao' ? "chevron-up-circle" : "swap-horizontal"} size={14} color="#FFF" />
            <Text style={[styles.expandText, { color: '#FFF', fontSize: 11 }]} numberOfLines={1}>{expandedVideo === 'substituicao' ? "Ocultar" : "Substituição"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {showVideoContainer && (
        <View style={styles.videoContainer}>
          {loading ? <ActivityIndicator color={colors.primary} /> : 
             currentVideoUrl ? (
               Platform.OS === 'web' ? (
                 React.createElement('video', {
                   key: `video-${item.id}-${expandedVideo}`,
                   src: getImageUrl(currentVideoUrl),
                   controls: true,
                   poster: getImageUrl(displayData.imagem_url),
                   style: { width: '100%', height: '100%', backgroundColor: '#000', objectFit: 'cover' }
                 })
               ) : (
                 <Video
                   key={`video-${item.id}-${expandedVideo}`}
                   source={{ uri: getImageUrl(currentVideoUrl) || '' }}
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

      {expandedVideo === 'substituicao' && (
        <View style={{ marginTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 15 }}>
          <Text style={{ fontFamily: fonts.bold, color: '#E7C48A', fontSize: 12, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Opções de Substituição</Text>
          {loading ? <ActivityIndicator color={colors.primary} /> : 
             substitutes.length > 0 ? (
               substitutes.map((sub, i) => (
                 <View key={sub.id} style={{ marginBottom: i < substitutes.length - 1 ? 20 : 5, backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8 }}>
                   <Text style={[styles.accordionTitle, { fontSize: 13, color: '#FFF', marginBottom: 4 }]}>{i + 1}. {sub.nome}</Text>
                   
                   {(sub.info?.series || sub.info?.repeticoes) ? (
                     <Text style={styles.accordionInfo}>{sub.info?.series} Séries | {sub.info?.repeticoes} repetições</Text>
                   ) : null}
                   
                   {sub.descricao_tecnica ? (
                     <Text style={[styles.accordionDesc, { marginTop: 4 }]}>Instruções: {formatDescription(sub.descricao_tecnica)}</Text>
                   ) : null}
                   
                   {sub.info?.descanso ? (
                     <Text style={styles.accordionInfo}>Descanso: {sub.info?.descanso}</Text>
                   ) : null}

                   {/* Vídeo de Execução do substituto */}
                   {sub.video_url && (
                     <View style={[styles.videoContainer, { marginTop: 10, backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                        {Platform.OS === 'web' ? (
                          React.createElement('video', {
                            src: getImageUrl(sub.video_url),
                            controls: true,
                            style: { width: '100%', height: '100%', objectFit: 'cover' }
                          })
                        ) : (
                          <Video
                            source={{ uri: getImageUrl(sub.video_url) || '' }}
                            style={{ width: '100%', height: '100%' }}
                            useNativeControls
                            resizeMode={ResizeMode.COVER}
                            shouldPlay={false}
                          />
                        )}
                     </View>
                   )}

                   {/* Vídeo Explicativo do substituto */}
                   {sub.info?.video_explicativo_url && (
                     <View style={[styles.videoContainer, { marginTop: 15, backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                        <View style={{ position: 'absolute', top: 15, left: 15, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#E7C48A' }}>
                          <Text style={{ color: '#E7C48A', fontSize: 11, fontFamily: fonts.bold, textTransform: 'uppercase' }}>Vídeo Explicativo</Text>
                        </View>
                        {Platform.OS === 'web' ? (
                          React.createElement('video', {
                            src: getImageUrl(sub.info.video_explicativo_url),
                            controls: true,
                            style: { width: '100%', height: '100%', objectFit: 'cover' }
                          })
                        ) : (
                          <Video
                            source={{ uri: getImageUrl(sub.info.video_explicativo_url) || '' }}
                            style={{ width: '100%', height: '100%' }}
                            useNativeControls
                            resizeMode={ResizeMode.COVER}
                            shouldPlay={false}
                          />
                        )}
                     </View>
                   )}
                 </View>
               ))
             ) : <Text style={{color: '#888', textAlign: 'center'}}>Nenhuma substituição carregada</Text>
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
  
  const canAccessWorkouts = user?.subscription_tier === 'premium_fit';

  useEffect(() => {
    if (!canAccessWorkouts) {
      navigation.navigate('Subscriptions' as never);
    }
  }, [canAccessWorkouts, navigation]);
  const { 
    modalityId, 
    modalityName, 
    modalityImage, 
    hasNivelamento,
    descricao,
    descricao_iniciante,
    descricao_intermediario,
    descricao_avancado,
    configuracaoDias = {},
    expandTreinoId
  } = route.params as ModalityParams & { expandTreinoId?: string };
  
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNivel, setSelectedNivel] = useState<'iniciante' | 'intermediario' | 'avancado'>('iniciante');

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
    const { titulo, imagem } = getDayData(index);
    (navigation as any).navigate('ModalityDayWorkout', {
      modalityId,
      modalityName,
      dayIndex: index,
      dayLabel: diasSemana[index],
      workoutTitle: titulo,
      workoutImage: imagem,
      nivel: hasNivelamento ? selectedNivel : undefined,
    });
  };

  const renderHeader = () => {
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
                    {treinos.length} {(modalityName || '').toLowerCase().includes('jornada') || (modalityName || '').toLowerCase().includes('começa') ? (treinos.length === 1 ? 'Aula' : 'Aulas') : (treinos.length === 1 ? 'Exercício' : 'Exercícios')}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.headerDivider} />
          
          {/* Descrição Global da Modalidade */}
          {descricao ? (
            <View style={{ marginTop: 10, marginBottom: hasNivelamento ? 0 : 0 }}>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 16, fontFamily: fonts.body }}>
                {formatDescription(descricao)}
              </Text>
            </View>
          ) : null}
        </View>

        {hasNivelamento && (
          <View style={[styles.nivelTabsContainer, { marginTop: 0 }]}>
            {(['iniciante', 'intermediario', 'avancado'] as const).map((nivel) => (
              <TouchableOpacity
                key={nivel}
                style={[styles.nivelTab, selectedNivel === nivel && styles.nivelTabActive]}
                onPress={() => setSelectedNivel(nivel)}
              >
                <Text style={[styles.nivelTabText, selectedNivel === nivel && styles.nivelTabTextActive]}>
                  {nivel === 'iniciante' ? 'Iniciante' : nivel === 'intermediario' ? 'Intermediário' : 'Avançado'}
                </Text>
                {selectedNivel === nivel && <View style={styles.nivelTabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

      </View>
    );
  };

  const getDayData = (index: number) => {
    const levelKey = hasNivelamento ? selectedNivel : 'geral';
    const config = configuracaoDias[levelKey]?.[String(index)] || {};
    const treinosDoDia = treinos
      .filter((t) => t.dia_semana === index)
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    return {
      config,
      treinosDoDia,
      titulo: config.titulo || treinosDoDia[0]?.titulo || 'Descanso',
      // A capa do card do dia é uma configuração própria. Não reutilizar a
      // imagem do primeiro exercício, pois ela pertence à ficha do exercício.
      imagem: config.imagem_url,
    };
  };

  const renderDayCard = (dia: string, index: number) => {
    // Ordenar treinos do dia pelo campo ordem
    const { treinosDoDia, titulo, imagem } = getDayData(index);
      
    const temTreino = treinosDoDia.length > 0;

    return (
      <TouchableOpacity
        key={dia}
        style={styles.dayCard}
        onPress={() => handleDayPress(index, treinosDoDia)}
        activeOpacity={temTreino ? 0.78 : 1}
      >
        <View style={styles.dayImageArea}>
          {imagem ? <Image source={{ uri: getImageUrl(imagem) }} style={styles.dayImage} resizeMode="cover" /> : <View style={styles.dayImagePlaceholder} />}
          <View style={styles.dayImageOverlay} />
          <View style={styles.dayBadge}>
            <Ionicons name={temTreino ? 'barbell-outline' : 'moon-outline'} size={15} color={colors.primary} />
          </View>
        </View>
        <View style={styles.dayCardCopy}>
          <Text style={[styles.dayName, !temTreino && styles.dayNameDisabled]}>{dia.split('(')[1]?.replace(')', '') || dia}</Text>
          <Text style={[styles.dayWorkoutName, !temTreino && styles.dayWorkoutDisabled]} numberOfLines={2}>{titulo}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  if (!canAccessWorkouts) {
    return (
      <AppBackground>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </SafeAreaView>
      </AppBackground>
    );
  }

  const shouldShowDayCards = hasNivelamento ||
    treinos.some((treino) => treino.dia_semana !== null && treino.dia_semana !== undefined) ||
    Object.keys(configuracaoDias.geral || {}).length > 0;

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        {shouldShowDayCards ? (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {renderHeader()}
            {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} /> : (
              <>
                <View style={styles.daysGrid}>
                  {diasSemana.map(renderDayCard)}
                </View>
              </>
            )}
          </ScrollView>
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
    marginBottom: 0,
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
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 12, paddingTop: 14 },
  dayCard: { width: '48.4%', minHeight: 178, borderRadius: 12, overflow: 'hidden', backgroundColor: '#171717', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  dayImageArea: { height: 112, position: 'relative', backgroundColor: '#111' },
  dayImage: { width: '100%', height: '100%' },
  dayImagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#202020' },
  dayImageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },
  dayBadge: { position: 'absolute', left: 10, bottom: 8, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,8,8,0.88)', borderWidth: 1, borderColor: colors.primary },
  dayCardCopy: { minHeight: 66, paddingHorizontal: 11, paddingVertical: 9, justifyContent: 'center' },
  dayName: { color: colors.primary, fontSize: 14, lineHeight: 18, fontFamily: fonts.bold, textTransform: 'uppercase' },
  dayNameDisabled: { color: 'rgba(231,196,138,0.65)' },
  dayWorkoutName: { color: '#f3f4f6', fontSize: 11, lineHeight: 15, fontFamily: fonts.body, marginTop: 2 },
  dayWorkoutDisabled: { color: 'rgba(255,255,255,0.48)' },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(231,196,138, 0.2)',
    overflow: 'hidden',
  },
  glassCardActive: { backgroundColor: 'rgba(231,196,138, 0.1)', borderColor: 'rgba(231,196,138, 0.5)' },
  glassContent: { flexDirection: 'row', alignItems: 'center', padding: 18, justifyContent: 'space-between' },
  glassInfo: { flex: 1 },
  glassDayTitle: { fontSize: 20, fontFamily: fonts.title, fontWeight: 'bold' },
  glassStatusText: { fontSize: 10, fontFamily: fonts.body, fontWeight: 'bold', marginTop: 4 },
  glassIconContainer: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.03)' },
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
