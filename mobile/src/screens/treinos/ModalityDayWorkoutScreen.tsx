import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api, getImageUrl, Treino } from '../../services/api';
import AppBackground from '../../components/AppBackground';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';

interface DayWorkoutParams {
  modalityId: string;
  modalityName: string;
  dayIndex: number;
  dayLabel: string;
  workoutTitle: string;
  workoutImage?: string;
  nivel?: 'iniciante' | 'intermediario' | 'avancado';
}

const levelLabel = (nivel?: string) => nivel === 'intermediario'
  ? 'Intermediário'
  : nivel === 'avancado' ? 'Avançado' : nivel === 'iniciante' ? 'Iniciante' : '';

export default function ModalityDayWorkoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as DayWorkoutParams;
  const [exercicios, setExercicios] = useState<Treino[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExercises = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getTreinos({ modalidade_id: params.modalityId });
      const items = Array.isArray(response) ? response : [];
      setExercicios(items
        .filter((item: Treino) => Number(item.dia_semana) === params.dayIndex)
        .filter((item: Treino) => !params.nivel || item.nivel === params.nivel)
        .filter((item: Treino) => item.ativa !== false)
        .sort((a: Treino, b: Treino) => (a.ordem || 0) - (b.ordem || 0)));
    } catch (error) {
      console.error('Erro ao carregar exercícios do dia:', error);
    } finally {
      setLoading(false);
    }
  }, [params.dayIndex, params.modalityId, params.nivel]);

  useEffect(() => { loadExercises(); }, [loadExercises]);

  const totalMinutes = useMemo(() => exercicios.reduce((total, item) => total + (Number(item.duracao_minutos) || 0), 0), [exercicios]);

  const openExercise = (treinoId: string, exerciseIndex = 1) => (navigation as any).navigate('ExerciseDetail', { treinoId, exerciseIndex });

  return (
    <AppBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{params.dayLabel.replace('(', '• ').replace(')', '')}</Text>
              <Text style={styles.title}>{params.workoutTitle}</Text>
            </View>
            <View style={styles.iconButton}>
              <Ionicons name="barbell-outline" size={21} color={colors.primary} />
            </View>
          </View>

          <View style={styles.hero}>
            {params.workoutImage ? (
              <Image source={{ uri: getImageUrl(params.workoutImage) }} style={styles.heroImage} resizeMode="cover" />
            ) : <View style={styles.heroFallback} />}
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>FOCO DO DIA</Text>
              <Text style={styles.heroTitle}>{params.workoutTitle}</Text>
              <View style={styles.heroMeta}>
                {totalMinutes > 0 && <Text style={styles.heroMetaText}>◷ {totalMinutes} min</Text>}
                {!!params.nivel && <Text style={styles.heroMetaText}>◆ {levelLabel(params.nivel)}</Text>}
                <Text style={styles.heroMetaText}>{exercicios.length} exercícios</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercícios do treino</Text>
            <Text style={styles.sectionCount}>{exercicios.length}</Text>
          </View>

          {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} /> : exercicios.map((item, index) => {
            const details = item.exercicios_detalhados?.[0] || {};
            const image = item.imagem_capa_url || item.imagem_url;
            const series = details.series || item.series;
            const repetitions = details.repeticoes || item.repeticoes;
            const rest = details.intervalo || item.descanso;
            const weight = details.carga || item.peso;
            return (
              <TouchableOpacity key={item.id} style={styles.exerciseCard} onPress={() => openExercise(item.id, index + 1)} activeOpacity={0.78}>
                <Text style={styles.exerciseNumber}>{String(index + 1).padStart(2, '0')}</Text>
                <View style={styles.thumb}>
                  {image ? <Image source={{ uri: getImageUrl(image) }} style={styles.thumbImage} resizeMode="cover" /> : <Ionicons name="barbell-outline" size={24} color="#777" />}
                </View>
                <View style={styles.exerciseCopy}>
                  <Text style={styles.exerciseTitle} numberOfLines={2}>{item.titulo}</Text>
                  <Text style={styles.exerciseMeta} numberOfLines={1}>
                    {[series && `${series} séries`, repetitions && `${repetitions} reps`].filter(Boolean).join(' • ') || 'Ver detalhes'}
                  </Text>
                  {!!rest && <Text style={styles.exerciseRest}>◷ {rest} descanso</Text>}
                  {!!weight && <Text style={styles.exerciseWeight}>Carga: {weight}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </TouchableOpacity>
            );
          })}

          {!loading && exercicios.length > 0 && (
            <TouchableOpacity style={styles.startButton} onPress={() => openExercise(exercicios[0].id, 1)} activeOpacity={0.85}>
              <Ionicons name="play" size={20} color="#17110a" />
              <Text style={styles.startButtonText}>INICIAR TREINO</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.36)', borderWidth: 1, borderColor: 'rgba(231,196,138,0.22)' },
  headerCopy: { flex: 1, alignItems: 'center' },
  eyebrow: { color: colors.primary, fontSize: 10, fontFamily: fonts.bodySemiBold, textTransform: 'uppercase' },
  title: { color: '#fff', fontSize: 22, lineHeight: 27, fontFamily: fonts.title, textAlign: 'center', marginTop: 2 },
  hero: { height: 185, borderRadius: 14, overflow: 'hidden', marginTop: 10, borderWidth: 1, borderColor: 'rgba(231,196,138,0.2)', backgroundColor: '#141414' },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroFallback: { ...StyleSheet.absoluteFillObject, backgroundColor: '#1d1d1d' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.43)' },
  heroContent: { position: 'absolute', left: 16, right: 16, bottom: 15 },
  heroLabel: { color: colors.primary, fontSize: 10, fontFamily: fonts.bold, letterSpacing: 0.8 },
  heroTitle: { color: '#fff', fontSize: 17, fontFamily: fonts.bodySemiBold, marginTop: 6 },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  heroMetaText: { color: '#eee', fontSize: 10, fontFamily: fonts.body },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 },
  sectionTitle: { color: '#fff', fontSize: 14, fontFamily: fonts.bodySemiBold },
  sectionCount: { color: colors.primary, fontSize: 11, fontFamily: fonts.bold },
  exerciseCard: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 9, borderRadius: 12, backgroundColor: 'rgba(13,13,13,0.9)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', marginBottom: 9 },
  exerciseNumber: { width: 26, color: colors.primary, fontSize: 16, fontFamily: fonts.title, textAlign: 'center' },
  thumb: { width: 68, height: 64, borderRadius: 9, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#222' },
  thumbImage: { width: '100%', height: '100%' },
  exerciseCopy: { flex: 1 },
  exerciseTitle: { color: '#fff', fontSize: 13, lineHeight: 17, fontFamily: fonts.bodySemiBold },
  exerciseMeta: { color: '#a9a9a9', fontSize: 10, fontFamily: fonts.body, marginTop: 4 },
  exerciseRest: { color: colors.primary, fontSize: 9, fontFamily: fonts.body, marginTop: 3 },
  exerciseWeight: { color: colors.textSecondary, fontSize: 9, fontFamily: fonts.body, marginTop: 2 },
  startButton: { height: 52, borderRadius: 12, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 14 },
  startButtonText: { color: '#17110a', fontSize: 12, fontFamily: fonts.bold, letterSpacing: 0.4 },
});
