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
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { api, Treino, getImageUrl } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import VideoPlayer from '../../components/VideoPlayer';
import ImageCarousel from '../../components/ImageCarousel';
import { useAuth } from '../../contexts/AuthContext';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';

export default function TreinoDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { treinoId } = route.params as { treinoId: string };
  const [treino, setTreino] = useState<Treino | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorito, setIsFavorito] = useState(false);
  const [loadingFavorito, setLoadingFavorito] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [avaliacaoUsuario, setAvaliacaoUsuario] = useState<number | null>(null);
  const [loadingAvaliacao, setLoadingAvaliacao] = useState(false);

  useEffect(() => {
    loadTreino();
    checkFavorito();
    carregarAvaliacaoUsuario();
  }, [treinoId]);

  const loadTreino = async () => {
    try {
      setLoading(true);
      const data = await api.getTreino(treinoId);
      setTreino(data);
    } catch (error) {
      console.error('Erro ao carregar treino:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorito = async () => {
    try {
      const result = await api.checkIsFavorito('treino', treinoId);
      setIsFavorito(result.is_favorito);
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
    }
  };

  const toggleFavorito = async () => {
    try {
      setLoadingFavorito(true);
      if (isFavorito) {
        await api.removeFavorito('treino', treinoId);
        setIsFavorito(false);
      } else {
        await api.addFavorito('treino', treinoId);
        setIsFavorito(true);
      }
      await checkFavorito();
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      setIsFavorito(!isFavorito);
    } finally {
      setLoadingFavorito(false);
    }
  };

  const carregarAvaliacaoUsuario = async () => {
    if (!treinoId) return;
    try {
      const avaliacao = await api.obterAvaliacao(treinoId, 'treino');
      if (avaliacao) setAvaliacaoUsuario(avaliacao.nota);
    } catch (error) {
      console.error('Erro ao carregar avaliação:', error);
    }
  };

  const avaliarTreino = async (nota: number) => {
    if (!treinoId || loadingAvaliacao) return;
    try {
      setLoadingAvaliacao(true);
      await api.criarAvaliacao(treinoId, 'treino', nota);
      setAvaliacaoUsuario(nota);
      if (treino) {
        const treinoAtualizado = await api.getTreino(treinoId);
        setTreino(treinoAtualizado);
      }
    } catch (error: any) {
      console.error('Erro ao avaliar treino:', error);
      Alert.alert('Erro', 'Não foi possível avaliar o treino');
    } finally {
      setLoadingAvaliacao(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c8921a" />
        </View>
        </SafeAreaView>
        );
        }

        if (!treino) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Treino não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isPremiumLocked = treino.is_premium && user?.subscription_tier !== 'premium_fit';

  if (isPremiumLocked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.premiumLockContainer}>
          <View style={styles.premiumLockIconContainer}>
            <Ionicons name="lock-closed" size={80} color={colors.primary} />
          </View>
          <Text style={styles.premiumLockTitle}>Treino Premium</Text>
          <Text style={styles.premiumLockDescription}>
            Este treino é exclusivo para assinantes Premium Fit. Assine agora para ter acesso a todos os treinos, programas personalizados e suporte da nossa IA.
          </Text>
          <TouchableOpacity style={styles.premiumLockButton} onPress={() => navigation.navigate('Subscription' as any)}>
            <Text style={styles.premiumLockButtonText}>CONHECER PLANOS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.premiumLockBackButton} onPress={() => navigation.goBack()}>
            <Text style={styles.premiumLockBackButtonText}>VOLTAR</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          {(() => {
            const images: string[] = [];
            // Priorizar imagem_capa_url se existir
            const mainImg = (treino as any).imagem_capa_url || treino.imagem_url;

            if (treino.imagens_url && Array.isArray(treino.imagens_url) && treino.imagens_url.length > 0) {
              images.push(...treino.imagens_url.map(img => getImageUrl(img) || '').filter(Boolean));
            } else if (mainImg) {
              const imgUrl = getImageUrl(mainImg);
              if (imgUrl) images.push(imgUrl);
            }
            if (images.length > 0) {
              return <ImageCarousel images={images} height={300} showIndicators={images.length > 1} enableZoom={true} />;
            }
            return null;
          })()}

          <View style={styles.imageOverlay} />

          <View style={styles.ratingOverlayOverlay}>
            {[1, 2, 3, 4, 5].map((nota) => (
              <TouchableOpacity key={nota} onPress={() => avaliarTreino(nota)} disabled={loadingAvaliacao} activeOpacity={0.7}>
                <Ionicons
                  name={avaliacaoUsuario && nota <= avaliacaoUsuario ? 'star' : 'star-outline'}
                  size={16}
                  color={avaliacaoUsuario && nota <= avaliacaoUsuario ? colors.primary : '#ffffff'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={toggleFavorito} disabled={loadingFavorito} style={styles.favoriteButtonOverlay}>
            <Text style={[styles.favoriteIcon, !isFavorito && styles.favoriteIconInactive]}>{isFavorito ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>

          <View style={styles.titleOverlay}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{treino.titulo}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>⏱️</Text>
            <Text style={styles.metaValue}>{treino.duracao_minutos || 0} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.metaValue}>{treino.dias_por_semana || 0} d/sem</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📊</Text>
            <Text style={styles.metaValue}>
              {treino.nivel === 'iniciante' ? 'Iniciante' : treino.nivel === 'intermediario' ? 'Interm.' : 'Avançado'}
            </Text>
          </View>
        </View>

        {!!treino.descricao && treino.descricao !== treino.titulo && treino.descricao.trim() !== '' && (
          <Text style={styles.description}>{treino.descricao}</Text>
        )}

        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="barbell" size={18} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Exercícios</Text>
            </View>
            <View style={styles.sectionTitleUnderline} />
          </View>
          {treino.exercicios && Array.isArray(treino.exercicios) && treino.exercicios.length > 0 ? (
            treino.exercicios
              .filter((ex) => ex && String(ex).trim() !== '')
              .map((ex, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{String(ex).trim()}</Text>
                </View>
              ))
          ) : (
            <Text style={styles.listText}>Nenhum exercício informado</Text>
          )}
        </View>

        {treino.series_repeticoes && treino.series_repeticoes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="repeat" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Séries e Repetições</Text>
              </View>
              <View style={styles.sectionTitleUnderline} />
            </View>
            {treino.series_repeticoes.map((serie, index) => (
              <View key={index} style={styles.serieItem}>
                {serie.exercicio && <Text style={styles.exercicioName}>{String(serie.exercicio).trim()}</Text>}
                <View style={styles.serieDetails}>
                  <Text style={styles.serieText}>{serie.series || 0} séries × {serie.repeticoes || 0}</Text>
                  {serie.carga && String(serie.carga).trim() !== '' && <Text style={styles.serieText}>Carga: {String(serie.carga).trim()}</Text>}
                  {serie.intervalo && String(serie.intervalo).trim() !== '' && <Text style={styles.serieText}>Intervalo: {String(serie.intervalo).trim()}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {treino.grupos_musculares && treino.grupos_musculares.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="body" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Grupos Musculares</Text>
              </View>
              <View style={styles.sectionTitleUnderline} />
            </View>
            <View style={styles.tagsContainer}>
              {treino.grupos_musculares.filter(g => g && String(g).trim() !== '').map((g, i) => (
                <View key={i} style={styles.tag}><Text style={styles.tagText}>{String(g).trim()}</Text></View>
              ))}
            </View>
          </View>
        )}

        {!!treino.observacoes && treino.observacoes.trim() !== '' && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="information-circle" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Observações</Text>
              </View>
              <View style={styles.sectionTitleUnderline} />
            </View>
            <Text style={styles.observacoesText}>{treino.observacoes}</Text>
          </View>
        )}

        {!!treino.video_url && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="videocam" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Vídeo</Text>
              </View>
              <View style={styles.sectionTitleUnderline} />
            </View>
            <TouchableOpacity style={styles.videoButton} onPress={() => setShowVideoPlayer(true)}>
              <Text style={styles.videoButtonText}>▶️ Assistir Vídeo</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {treino && !!treino.video_url && (
        <Modal visible={showVideoPlayer} animationType="slide" onRequestClose={() => setShowVideoPlayer(false)}>
          <VideoPlayer videoUrl={treino.video_url} title={treino.titulo} onClose={() => setShowVideoPlayer(false)} />
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#ff4444', fontSize: 16 },
  content: { paddingBottom: 24 },
  imageContainer: { width: '100%', height: 300, position: 'relative' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: colors.overlay },
  titleOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, flexDirection: 'row', alignItems: 'flex-end' },
  title: { fontSize: 18, fontFamily: fonts.title, color: '#ffffff', flex: 1, lineHeight: 24 },
  favoriteButtonOverlay: { position: 'absolute', top: 16, right: 16, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 8 },
  ratingOverlayOverlay: { position: 'absolute', top: 16, left: 16, zIndex: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, gap: 4 },
  favoriteIcon: { fontSize: 24 },
  favoriteIconInactive: { opacity: 0.3 },
  description: { fontSize: 16, fontFamily: fonts.body, color: '#ffffff', paddingHorizontal: 16, marginTop: 24, marginBottom: 16, lineHeight: 24 },
  metaContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, backgroundColor: colors.backgroundSecondary, borderBottomWidth: 1, borderColor: colors.border },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaIcon: { fontSize: 22, marginRight: 6 },
  metaValue: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  section: { padding: 16 },
  sectionTitleContainer: { marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  sectionTitle: { fontSize: 18, fontFamily: fonts.title, color: colors.primary, flex: 1, letterSpacing: 0.5 },
  sectionTitleUnderline: { height: 1.5, backgroundColor: 'rgba(200, 146, 26, 0.2)', width: '100%', borderRadius: 1, marginTop: 2 },
  listItem: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
  bullet: { color: colors.primary, fontSize: 16, marginRight: 8, marginTop: 2 },
  listText: { flex: 1, fontSize: 16, color: '#ffffff' },
  serieItem: { backgroundColor: colors.backgroundSecondary, padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  exercicioName: { fontSize: 16, fontFamily: fonts.bodyBold, color: '#ffffff', marginBottom: 4 },
  serieDetails: { marginLeft: 8 },
  serieText: { fontSize: 14, fontFamily: fonts.body, color: '#999', marginBottom: 2 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: 'rgba(200, 146, 26, 0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(200, 146, 26, 0.3)' },
  tagText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  observacoesText: { fontSize: 16, fontFamily: fonts.body, color: '#ffffff', lineHeight: 24 },
  videoButton: { backgroundColor: colors.cardBackground, padding: 30, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed' },
  videoButtonText: { color: colors.text, fontSize: 16, fontFamily: fonts.bodyBold, marginTop: 12 },
  premiumLockContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, backgroundColor: '#0a0a0a' },
  premiumLockIconContainer: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(200, 146, 26, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: 'rgba(200, 146, 26, 0.3)' },
  premiumLockTitle: { fontSize: 24, fontFamily: fonts.title, color: colors.primary, marginBottom: 16, textAlign: 'center', textTransform: 'uppercase' },
  premiumLockDescription: { fontSize: 15, fontFamily: fonts.body, color: '#999', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  premiumLockButton: { backgroundColor: colors.primary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, width: '100%', alignItems: 'center', marginBottom: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  premiumLockButtonText: { color: '#000', fontSize: 16, fontFamily: fonts.bold, letterSpacing: 1 },
  premiumLockBackButton: { paddingVertical: 12 },
  premiumLockBackButtonText: { color: '#666', fontSize: 14, fontFamily: fonts.body, letterSpacing: 1 },
});
