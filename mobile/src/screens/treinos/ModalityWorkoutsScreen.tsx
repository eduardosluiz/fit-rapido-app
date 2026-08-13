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

        {/* Descrição Técnica do Nível (Exibida em cima dos exercícios) */}
        {hasNivelamento && currentDescricao ? (
          <View style={styles.nivelDescContainer}>
            <View style={styles.nivelDescHeader}>
              <Ionicons name="information-circle-outline" size={16} color="#E7C48A" />
              <Text style={styles.nivelDescTitle}>ORIENTAÇÕES DA TRILHA</Text>
            </View>
            <Text style={styles.nivelDescText}>
              {formatDescription(currentDescricao)}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderDayItem = ({ item: dia, index }: { item: string, index: number }) => {
    // Ordenar treinos do dia pelo campo ordem
    const treinosDoDia = treinos
      .filter((t) => t.dia_semana === index)
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
      
    const isExpanded = expandedDay === index;
    const temTreino = treinosDoDia.length > 0;

    return (
      <View style={{ marginBottom: 12 }}>
        <View style={{ paddingHorizontal: 0 }}>
          <TouchableOpacity 
            style={[
              styles.glassCard, 
              isExpanded && temTreino && styles.glassCardActive,
              { borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0 }
            ]}
            onPress={() => handleDayPress(index, treinosDoDia)}
            activeOpacity={0.7}
          >
            <View style={[styles.glassContent, { paddingHorizontal: 20 }]}>
              <View style={styles.glassInfo}>
                <Text style={[styles.glassDayTitle, { color: temTreino ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }]}>
                  {dia.split('-')[0].toUpperCase()}
                </Text>
                <Text style={[styles.glassStatusText, { color: temTreino ? '#fff' : 'rgba(255,255,255,0.3)' }]}>
                  {temTreino 
                    ? (treinosDoDia.length === 1 ? treinosDoDia[0].titulo.toUpperCase() : `${treinosDoDia.length} EXERCÍCIOS DISPONÍVEIS`)
                    : 'DESCANSO'}
                </Text>
              </View>
              <View style={[styles.glassIconContainer, { borderColor: temTreino ? colors.primary : 'rgba(255,255,255,0.1)' }]}>
                <Ionicons 
                  name={isExpanded && temTreino ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={temTreino ? colors.primary : 'rgba(255,255,255,0.2)'} 
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {isExpanded && temTreino && (
          <View style={{ paddingHorizontal: 15, marginTop: 15 }}>
            {treinosDoDia.map((treino) => (
              <TreinoListItem 
                key={treino.id} 
                item={treino} 
                index={treinosDoDia.indexOf(treino)}
                initiallyExpanded={expandTreinoId === treino.id} 
              />
            ))}
          </View>
        )}
      </View>
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

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        {hasNivelamento ? (
          <FlatList
            data={diasSemana}
            keyExtractor={(item) => item}
            ListHeaderComponent={renderHeader}
            renderItem={renderDayItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={loading ? <ActivityIndicator color={colors.primary} /> : null}
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
