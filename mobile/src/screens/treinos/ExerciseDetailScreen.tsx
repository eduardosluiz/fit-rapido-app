import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { api, getImageUrl, Treino } from '../../services/api';
import AppBackground from '../../components/AppBackground';
import VideoPlayer from '../../components/VideoPlayer';
import { useAuth } from '../../contexts/AuthContext';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';

interface Substituto {
  id: string;
  nome: string;
  video_url: string;
  video_explicativo_url?: string;
  imagem_capa_url?: string;
  descricao?: string;
  info?: { series?: string; repeticoes?: string; descanso?: string; peso?: string; observacoes?: string };
}

type DetailTab = 'instructions' | 'muscles' | 'substitutes' | 'explanation';

export default function ExerciseDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { treinoId, exerciseIndex = 1 } = route.params as { treinoId: string; exerciseIndex?: number };
  const canAccessWorkouts = user?.subscription_tier === 'premium_fit';

  const [treino, setTreino] = useState<Treino | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [playerVideo, setPlayerVideo] = useState<{ url: string; title: string } | null>(null);
  const [currentView, setCurrentView] = useState<'main' | 'sub1' | 'sub2'>('main');
  const [substitutos, setSubstitutos] = useState<Substituto[]>([]);
  const [activeTab, setActiveTab] = useState<DetailTab>('instructions');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [savingComplete, setSavingComplete] = useState(false);
  const videoThumbnailRef = useRef<Video | null>(null);
  const explanationThumbnailRef = useRef<Video | null>(null);

  useEffect(() => {
    if (!canAccessWorkouts) navigation.navigate('Subscriptions' as never);
  }, [canAccessWorkouts, navigation]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getTreino(treinoId);
        setTreino(data);
        const subs: Substituto[] = [];

        if (data.substituto_id_1) {
          try {
            const sub = await api.getExercicioBiblioteca(data.substituto_id_1);
            subs.push({
              id: sub.id,
              nome: sub.nome,
              video_url: sub.video_url,
              video_explicativo_url: data.substituto_1_info?.video_explicativo_url || sub.video_explicativo_url,
              imagem_capa_url: data.substituto_1_info?.imagem_capa_url || sub.imagem_capa_url || sub.imagem_url,
              descricao: data.substituto_1_info?.observacoes || sub.descricao_tecnica || sub.descricao,
              info: data.substituto_1_info,
            });
          } catch (error) {
            console.error('Erro ao carregar substituto 1:', error);
          }
        }
        if (data.substituto_id_2) {
          try {
            const sub = await api.getExercicioBiblioteca(data.substituto_id_2);
            subs.push({
              id: sub.id,
              nome: sub.nome,
              video_url: sub.video_url,
              video_explicativo_url: data.substituto_2_info?.video_explicativo_url || sub.video_explicativo_url,
              imagem_capa_url: data.substituto_2_info?.imagem_capa_url || sub.imagem_capa_url || sub.imagem_url,
              descricao: data.substituto_2_info?.observacoes || sub.descricao_tecnica || sub.descricao,
              info: data.substituto_2_info,
            });
          } catch (error) {
            console.error('Erro ao carregar substituto 2:', error);
          }
        }
        setSubstitutos(subs);

        const [favorite, complete] = await Promise.all([
          api.checkIsFavorito('treino', treinoId),
          api.verificarFezHoje(treinoId, 'treinei_hoje'),
        ]);
        setIsFavorite(Boolean(favorite?.is_favorito));
        setIsComplete(Boolean(complete));
      } catch (error) {
        console.error('Erro ao carregar detalhes do exercício:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [treinoId]);

  const display = useMemo(() => {
    if (!treino) return null;
    const technical = treino.exercicios_detalhados?.[0] || {};
    if (currentView === 'main') {
      return {
        titulo: treino.titulo,
        video_url: treino.video_url,
        video_explicativo_url: treino.video_explicativo_url || technical.video_explicativo_url,
        imagem_capa: treino.imagem_capa_url || treino.imagem_url || technical.imagem_capa_url || technical.imagem_url || technical.video_thumbnail_url,
        series: technical.series || treino.series || '',
        repeticoes: technical.repeticoes || treino.repeticoes || '',
        descanso: technical.intervalo || treino.descanso || '',
        peso: technical.carga || treino.peso || '',
        descricao: [
          treino.descricao_tecnica,
          technical.observacoes,
          technical.descricao_tecnica,
          (treino as any).observacoes,
          treino.descricao,
        ].filter((value, index, values) => value?.trim() && values.indexOf(value) === index).join('\n'),
      };
    }
    const substitute = substitutos[currentView === 'sub1' ? 0 : 1];
    if (!substitute) return null;
    return {
      titulo: substitute.nome,
      video_url: substitute.video_url,
      video_explicativo_url: substitute.video_explicativo_url,
      imagem_capa: substitute.imagem_capa_url,
      series: substitute.info?.series || '',
      repeticoes: substitute.info?.repeticoes || '',
      descanso: substitute.info?.descanso || '',
      peso: substitute.info?.peso || '',
      descricao: substitute.descricao || treino.descricao_tecnica || treino.descricao || '',
    };
  }, [currentView, substitutos, treino]);

  const muscleGroups = useMemo(() => {
    const groups = (treino as any)?.grupos_musculares;
    if (Array.isArray(groups)) return groups.filter(Boolean);
    if (typeof groups === 'string') return groups.split(',').map((item: string) => item.trim()).filter(Boolean);
    return [];
  }, [treino]);

  const toggleFavorite = async () => {
    if (savingFavorite) return;
    try {
      setSavingFavorite(true);
      const result = await api.toggleFavorito(treinoId, 'treino');
      setIsFavorite(result.is_favorito);
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o favorito.');
    } finally {
      setSavingFavorite(false);
    }
  };

  const toggleComplete = async () => {
    if (savingComplete) return;
    try {
      setSavingComplete(true);
      if (isComplete) await api.removerAtividade(treinoId, 'treinei_hoje');
      else await api.criarAtividade(treinoId, 'treinei_hoje');
      setIsComplete((value) => !value);
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar a conclusão do exercício.');
    } finally {
      setSavingComplete(false);
    }
  };

  const showNextSubstitute = () => {
    if (!substitutos.length) return;
    if (currentView === 'main') setCurrentView('sub1');
    else if (currentView === 'sub1' && substitutos[1]) setCurrentView('sub2');
    else setCurrentView('main');
    setActiveTab('instructions');
  };

  if (loading || !canAccessWorkouts) {
    return <AppBackground><SafeAreaView style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></SafeAreaView></AppBackground>;
  }
  if (!treino || !display) {
    return <AppBackground><SafeAreaView style={styles.centered}><Text style={styles.emptyText}>Exercício não encontrado</Text></SafeAreaView></AppBackground>;
  }

  const tabs: Array<{ key: DetailTab; label: string }> = [
    { key: 'instructions', label: 'Instruções' },
    // Aba de músculos mantida pronta para reativação caso a cliente solicite.
    // { key: 'muscles', label: 'Músculos' },
    { key: 'substitutes', label: 'Substitutos' },
    ...(display.video_explicativo_url ? [{ key: 'explanation' as DetailTab, label: 'Explicativo' }] : []),
  ];
  const selectedVideoUrl = activeTab === 'explanation' ? display.video_explicativo_url : display.video_url;

  return (
    <AppBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
          <View style={styles.detailFrame}>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton} accessibilityLabel="Voltar">
                <Ionicons name="arrow-back" size={25} color={colors.primary} />
              </TouchableOpacity>
              <View style={styles.topActions}>
                <TouchableOpacity onPress={toggleFavorite} disabled={savingFavorite} style={styles.iconButton} accessibilityLabel="Favoritar exercício">
                  <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={25} color={colors.primary} />
                </TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={22} color={colors.primary} />
              </View>
            </View>

            <View style={styles.titleRow}>
              <View style={styles.exerciseIndexBox}><Text style={styles.exerciseIndex}>{String(exerciseIndex).padStart(2, '0')}</Text></View>
              <View style={styles.titleCopy}>
                <Text style={styles.exerciseTitle}>{display.titulo}</Text>
                {!!muscleGroups.length && <Text style={styles.exerciseSubtitle}>{muscleGroups.join(' • ')}</Text>}
              </View>
            </View>

            <TouchableOpacity
              style={styles.mediaContainer}
              activeOpacity={0.9}
              onPress={() => {
                if (!display.video_url) return;
                setPlayerVideo({ url: display.video_url, title: `${display.titulo} — execução` });
                setShowVideoPlayer(true);
              }}
            >
              {display.video_url ? (
                Platform.OS === 'web' ? React.createElement('video', {
                  key: display.video_url,
                  src: `${getImageUrl(display.video_url)}#t=0.5`,
                  muted: true,
                  preload: 'metadata',
                  playsInline: true,
                  style: { width: '100%', height: '100%', objectFit: 'cover' },
                }) : (
                  <Video
                    key={display.video_url}
                    ref={videoThumbnailRef}
                    source={{ uri: getImageUrl(display.video_url) || '' }}
                    style={styles.videoThumbnail}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={false}
                    isMuted
                    onLoad={() => videoThumbnailRef.current?.setPositionAsync(500)}
                  />
                )
              ) : (
                <View style={styles.mediaFallback}>
                  <Ionicons name="videocam-outline" size={42} color="#6f6b72" />
                  <Text style={styles.mediaFallbackText}>Sem vídeo de execução cadastrado</Text>
                </View>
              )}
              {display.video_url && <View style={styles.playOverlay}><View style={styles.playCircle}><Ionicons name="play" size={30} color="#fff" style={{ marginLeft: 3 }} /></View></View>}
            </TouchableOpacity>

            <View style={styles.infoStrip}>
              {[
                { icon: 'layers-outline', value: display.series || '-', label: 'SÉRIES' },
                { icon: 'barbell-outline', value: display.repeticoes || '-', label: 'REPETIÇÕES' },
                { icon: 'time-outline', value: display.descanso || '-', label: 'DESCANSO' },
                { icon: 'speedometer-outline', value: display.peso || '-', label: 'CARGA' },
              ].map((item, index) => (
                <View key={item.label} style={[styles.infoItem, index < 3 && styles.infoDivider]}>
                  <Ionicons name={item.icon as any} size={16} color={colors.primary} />
                  <Text style={styles.infoValue} numberOfLines={2} adjustsFontSizeToFit>{item.value}</Text>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.tabs}>
              {tabs.map((tab) => (
                <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.tab, activeTab === tab.key && styles.activeTab]}>
                  <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.tabContent}>
              {activeTab === 'instructions' && (display.descricao?.trim() ? (
                <View style={styles.instructionsList}>
                  {display.descricao.split(/\n+/).filter(Boolean).map((line: string, index: number) => (
                    <View key={`${line}-${index}`} style={styles.instructionRow}>
                      <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
                      <Text style={styles.instructionText}>{line.trim()}</Text>
                    </View>
                  ))}
                </View>
              ) : <Text style={styles.emptyTabText}>Nenhuma instrução cadastrada para este exercício.</Text>)}

              {/* Conteúdo da aba de músculos mantido pronto para reativação. */}
              {activeTab === 'muscles' && (muscleGroups.length ? (
                <View style={styles.chips}>{muscleGroups.map((group: string) => <Text key={group} style={styles.chip}>{group}</Text>)}</View>
              ) : <Text style={styles.emptyTabText}>Nenhum grupo muscular cadastrado.</Text>)}

              {activeTab === 'explanation' && (
                <TouchableOpacity
                  style={styles.mediaContainer}
                  activeOpacity={0.9}
                  onPress={() => {
                    if (!display.video_explicativo_url) return;
                    setPlayerVideo({ url: display.video_explicativo_url, title: `${display.titulo} — explicativo` });
                    setShowVideoPlayer(true);
                  }}
                >
                  {selectedVideoUrl ? (
                    Platform.OS === 'web' ? React.createElement('video', {
                      key: selectedVideoUrl,
                      src: `${getImageUrl(selectedVideoUrl)}#t=0.5`,
                      muted: true,
                      preload: 'metadata',
                      playsInline: true,
                      style: { width: '100%', height: '100%', objectFit: 'cover' },
                    }) : (
                      <Video
                        key={selectedVideoUrl}
                        ref={explanationThumbnailRef}
                        source={{ uri: getImageUrl(selectedVideoUrl) || '' }}
                        style={styles.videoThumbnail}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false}
                        isMuted
                        onLoad={() => explanationThumbnailRef.current?.setPositionAsync(500)}
                      />
                    )
                  ) : (
                    <View style={styles.mediaFallback}>
                      <Ionicons name="videocam-outline" size={42} color="#6f6b72" />
                      <Text style={styles.mediaFallbackText}>Sem vídeo cadastrado</Text>
                    </View>
                  )}
                  {selectedVideoUrl && <View style={styles.playOverlay}><View style={styles.playCircle}><Ionicons name="play" size={30} color="#fff" style={{ marginLeft: 3 }} /></View></View>}
                </TouchableOpacity>
              )}

              {activeTab === 'substitutes' && (substitutos.length ? (
                <View style={styles.substituteList}>
                  <TouchableOpacity style={[styles.substituteOption, currentView === 'main' && styles.selectedSubstitute]} onPress={() => { setCurrentView('main'); setActiveTab('instructions'); }}>
                    <View style={styles.substituteCopy}>
                      <Text style={styles.substituteName}>Exercício principal</Text>
                      <Text style={styles.substituteMeta}>{[treino.series && `${treino.series} séries`, treino.repeticoes && `${treino.repeticoes} repetições`, treino.descanso && `${treino.descanso} descanso`].filter(Boolean).join(' • ') || 'Ver informações do exercício'}</Text>
                    </View>
                    {currentView === 'main' && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                  {substitutos.map((sub, index) => {
                    const view = index === 0 ? 'sub1' : 'sub2';
                    return (
                      <TouchableOpacity key={sub.id} style={[styles.substituteOption, currentView === view && styles.selectedSubstitute]} onPress={() => { setCurrentView(view); setActiveTab('instructions'); }}>
                        <View style={styles.substituteThumb}>
                          {sub.imagem_capa_url ? <Image source={{ uri: getImageUrl(sub.imagem_capa_url) }} style={styles.substituteThumbImage} resizeMode="cover" /> : <Ionicons name="barbell-outline" size={20} color="#777" />}
                        </View>
                        <View style={styles.substituteCopy}>
                          <Text style={styles.substituteName}>{sub.nome}</Text>
                          <Text style={styles.substituteMeta}>{[sub.info?.series && `${sub.info.series} séries`, sub.info?.repeticoes && `${sub.info.repeticoes} repetições`, sub.info?.descanso && `${sub.info.descanso} descanso`].filter(Boolean).join(' • ') || 'Ver informações do substituto'}</Text>
                          <View style={styles.substituteMediaLabels}>
                            {!!sub.video_url && <Text style={styles.substituteMediaLabel}>▶ Execução</Text>}
                            {!!sub.video_explicativo_url && <Text style={styles.substituteMediaLabel}>ⓘ Explicativo</Text>}
                          </View>
                        </View>
                        {currentView === view && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : <Text style={styles.emptyTabText}>Nenhum exercício substituto cadastrado.</Text>)}
            </View>

            <View style={styles.actions}>
              {substitutos.length > 0 && (
                <TouchableOpacity style={styles.secondaryButton} onPress={showNextSubstitute}>
                  <Ionicons name="swap-horizontal" size={22} color={colors.primary} />
                  <Text style={styles.secondaryButtonText}>Substituir{`\n`}exercício</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.completeButton, !substitutos.length && styles.completeButtonFull, isComplete && styles.completeButtonDone]} onPress={toggleComplete} disabled={savingComplete}>
                {savingComplete ? <ActivityIndicator size="small" color="#1b150c" /> : <Ionicons name={isComplete ? 'checkmark-circle' : 'checkmark-circle-outline'} size={23} color="#1b150c" />}
                <Text style={styles.completeButtonText}>{isComplete ? 'Exercício concluído' : 'Marcar como concluído'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Modal visible={showVideoPlayer} animationType="fade" transparent onRequestClose={() => setShowVideoPlayer(false)}>
          <View style={styles.modalContent}><VideoPlayer videoUrl={playerVideo?.url || ''} title={playerVideo?.title || display.titulo} onClose={() => setShowVideoPlayer(false)} /></View>
        </Modal>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.text, fontFamily: fonts.body, fontSize: 14 },
  page: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 110 },
  detailFrame: { backgroundColor: 'rgba(8,8,9,0.72)', borderRadius: 14, padding: 13 },
  topBar: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 9, paddingHorizontal: 2 },
  exerciseIndexBox: { width: 34, height: 34, borderRadius: 7, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  exerciseIndex: { color: colors.primary, fontFamily: fonts.bodyMedium, fontSize: 13 },
  titleCopy: { flex: 1 },
  exerciseTitle: { color: '#fff', fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 18 },
  exerciseSubtitle: { color: '#c8c5ca', fontFamily: fonts.body, fontSize: 11, marginTop: 3 },
  mediaContainer: { height: 210, overflow: 'hidden', borderRadius: 5, backgroundColor: '#171719', position: 'relative' },
  videoThumbnail: { width: '100%', height: '100%' },
  mediaFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mediaFallbackText: { color: '#8d8990', fontFamily: fonts.body, fontSize: 12, marginTop: 8 },
  playOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.16)' },
  playCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: 'rgba(0,0,0,0.42)', alignItems: 'center', justifyContent: 'center' },
  infoStrip: { flexDirection: 'row', minHeight: 82, marginTop: 10, backgroundColor: 'rgba(19,19,21,0.96)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 10, paddingVertical: 12 },
  infoItem: { width: '25%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  infoDivider: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.09)' },
  infoValue: { width: '100%', color: colors.primary, textAlign: 'center', fontFamily: fonts.bodySemiBold, fontSize: 13, lineHeight: 16, marginTop: 4 },
  infoLabel: { color: '#a8a4ab', fontFamily: fonts.body, fontSize: 7, marginTop: 2 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)', marginTop: 9 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: colors.primary },
  tabText: { color: '#aaa6ad', fontFamily: fonts.body, fontSize: 11 },
  activeTabText: { color: colors.primary, fontFamily: fonts.bodyMedium },
  tabContent: { minHeight: 114, paddingVertical: 14, paddingHorizontal: 3 },
  instructionsList: { gap: 10 },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  instructionText: { flex: 1, color: '#dedbe0', fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
  emptyTabText: { color: '#8f8b92', fontFamily: fonts.body, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 24 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { color: colors.primary, fontFamily: fonts.bodyMedium, fontSize: 11, backgroundColor: 'rgba(211,154,20,0.1)', borderWidth: 1, borderColor: 'rgba(211,154,20,0.35)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7 },
  substituteList: { gap: 7 },
  substituteOption: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 9, padding: 8 },
  selectedSubstitute: { borderColor: 'rgba(211,154,20,0.65)', backgroundColor: 'rgba(211,154,20,0.08)' },
  substituteThumb: { width: 48, height: 48, borderRadius: 7, overflow: 'hidden', backgroundColor: '#19191b', alignItems: 'center', justifyContent: 'center' },
  substituteThumbImage: { width: '100%', height: '100%' },
  substituteCopy: { flex: 1 },
  substituteName: { color: '#e8e5e9', fontFamily: fonts.bodyMedium, fontSize: 12 },
  substituteMeta: { color: '#aaa6ad', fontFamily: fonts.body, fontSize: 9, lineHeight: 13, marginTop: 3 },
  substituteMediaLabels: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 4 },
  substituteMediaLabel: { color: colors.primary, fontFamily: fonts.body, fontSize: 8 },
  actions: { flexDirection: 'row', gap: 9, backgroundColor: 'rgba(18,18,20,0.94)', borderRadius: 10, padding: 8 },
  secondaryButton: { width: '45%', minHeight: 58, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryButtonText: { color: '#f1eef2', fontFamily: fonts.body, fontSize: 11, lineHeight: 15 },
  completeButton: { flex: 1, minHeight: 58, borderRadius: 9, backgroundColor: '#f2c65d', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 8 },
  completeButtonFull: { width: '100%' },
  completeButtonDone: { backgroundColor: '#d8aa3f' },
  completeButtonText: { flexShrink: 1, color: '#1b150c', fontFamily: fonts.bodySemiBold, fontSize: 11, lineHeight: 15, textAlign: 'center' },
  modalContent: { flex: 1, backgroundColor: '#000' },
});
