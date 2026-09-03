import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView,
  Image, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api, Favorito, getImageUrl, Receita, Treino } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AppBackground from '../../components/AppBackground';
import ReceitaCardAnimated from '../../components/ReceitaCardAnimated';
import colors, { mobileSpacing } from '../../constants/colors';
import fonts from '../../constants/fonts';

type FilterType = 'receitas' | 'treinos';
interface RecipeFilters { query: string; categoryId: string }
interface WorkoutFilters { query: string; categoryId: string; modalityId: string }

const DEFAULT_RECIPE_FILTERS: RecipeFilters = { query: '', categoryId: '' };
const DEFAULT_WORKOUT_FILTERS: WorkoutFilters = { query: '', categoryId: '', modalityId: '' };
const normalize = (value: unknown) => String(value ?? '').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const getModalityIcon = (name: string, index: number): keyof typeof Ionicons.glyphMap => {
  const normalizedName = normalize(name);
  if (normalizedName.includes('casa')) return 'home-outline';
  if (normalizedName.includes('jornada')) return 'navigate-outline';
  if (normalizedName.includes('academia') || normalizedName.includes('musculacao')) return 'barbell-outline';
  const fallback: Array<keyof typeof Ionicons.glyphMap> = [
    'fitness-outline', 'body-outline', 'walk-outline', 'pulse-outline',
  ];
  return fallback[index % fallback.length];
};

export default function FavoritosScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const canAccessWorkouts = user?.subscription_tier === 'premium_fit';
  const [favorites, setFavorites] = useState<Favorito[]>([]);
  const [recipes, setRecipes] = useState<Receita[]>([]);
  const [workouts, setWorkouts] = useState<Treino[]>([]);
  const [recipeCategories, setRecipeCategories] = useState<any[]>([]);
  const [workoutCategories, setWorkoutCategories] = useState<any[]>([]);
  const [workoutModalities, setWorkoutModalities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);
  const [categoryListOpen, setCategoryListOpen] = useState(false);
  const [recipeFilters, setRecipeFilters] = useState<RecipeFilters>(DEFAULT_RECIPE_FILTERS);
  const [workoutFilters, setWorkoutFilters] = useState<WorkoutFilters>(DEFAULT_WORKOUT_FILTERS);
  const [recipeDraftFilters, setRecipeDraftFilters] = useState<RecipeFilters>(DEFAULT_RECIPE_FILTERS);
  const [workoutDraftFilters, setWorkoutDraftFilters] = useState<WorkoutFilters>(DEFAULT_WORKOUT_FILTERS);

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [favoriteData, recipeCategoryData, workoutCategoryData, modalityData] = await Promise.all([
        api.getFavoritos() as Promise<Favorito[]>,
        api.getCategorias(),
        canAccessWorkouts ? api.getCategoriasTreinos() : Promise.resolve([]),
        canAccessWorkouts ? api.getModalidadesTreinos() : Promise.resolve([]),
      ]);
      const recipeFavorites = favoriteData.filter((item) => item.tipo === 'receita' && item.item_id);
      const workoutFavorites = canAccessWorkouts
        ? favoriteData.filter((item) => item.tipo === 'treino' && item.item_id) : [];
      const [recipeData, workoutData] = await Promise.all([
        Promise.all(recipeFavorites.map((item) => api.getReceita(item.item_id).catch(() => null))),
        Promise.all(workoutFavorites.map((item) => api.getTreino(item.item_id).catch(() => null))),
      ]);
      setFavorites(favoriteData);
      setRecipes(recipeData.filter((item): item is Receita => !!item && item.ativa !== false));
      setWorkouts(workoutData.filter((item): item is Treino => !!item && item.ativa !== false));
      setRecipeCategories((recipeCategoryData || []).filter((item: any) => item.ativa !== false));
      setWorkoutCategories((workoutCategoryData || []).filter((item: any) => item.ativa !== false));
      setWorkoutModalities((modalityData || []).filter(
        (item: any) => item.ativo === true || item.ativa === true,
      ));
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      Alert.alert('Não foi possível carregar', 'Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [canAccessWorkouts, user]);

  useFocusEffect(useCallback(() => { loadFavorites(); }, [loadFavorites]));

  const filteredRecipes = useMemo(() => {
    const query = normalize(recipeFilters.query);
    const result = recipes.filter((recipe) => {
      const ingredients = Array.isArray(recipe.ingredientes)
        ? recipe.ingredientes.map((item) => normalize(
          typeof item === 'string' ? item : JSON.stringify(item),
        )).join(' ') : normalize(recipe.ingredientes);
      const matchesQuery = !query
        || normalize(recipe.titulo).includes(query)
        || ingredients.includes(query);
      const matchesCategory = !recipeFilters.categoryId
        || recipe.categorias?.some((category: any) => category.id === recipeFilters.categoryId);
      return matchesQuery && matchesCategory;
    });
    return result;
  }, [recipeFilters, recipes]);

  const filteredWorkouts = useMemo(() => {
    const query = normalize(workoutFilters.query);
    const result = workouts.filter((workout) => {
      const matchesQuery = !query || normalize(workout.titulo).includes(query);
      const matchesCategory = !workoutFilters.categoryId
        || workout.categorias?.some((category: any) => category.id === workoutFilters.categoryId)
        || (workout as any).categoria_id === workoutFilters.categoryId;
      const matchesModality = !workoutFilters.modalityId
        || workout.modalidade_id === workoutFilters.modalityId
        || workout.modalidade?.id === workoutFilters.modalityId;
      return matchesQuery && matchesCategory && matchesModality;
    });
    return result;
  }, [workoutFilters, workouts]);

  const openFilter = (type: FilterType) => {
    if (type === 'receitas') setRecipeDraftFilters(DEFAULT_RECIPE_FILTERS);
    else setWorkoutDraftFilters(DEFAULT_WORKOUT_FILTERS);
    setCategoryListOpen(false);
    setActiveFilter(type);
  };

  const applyFilters = (type: FilterType) => {
    if (type === 'receitas') {
      setRecipeFilters(recipeDraftFilters);
      setRecipeDraftFilters(DEFAULT_RECIPE_FILTERS);
    } else {
      setWorkoutFilters(workoutDraftFilters);
      setWorkoutDraftFilters(DEFAULT_WORKOUT_FILTERS);
    }
    setCategoryListOpen(false);
    setActiveFilter(null);
  };

  const removeFavorite = async (type: 'receita' | 'treino', itemId: string) => {
    const key = `${type}:${itemId}`;
    if (removing.includes(key)) return;
    const previousFavorites = favorites;
    const previousRecipes = recipes;
    const previousWorkouts = workouts;
    setRemoving((current) => [...current, key]);
    setFavorites((current) => current.filter(
      (item) => !(item.tipo === type && item.item_id === itemId),
    ));
    if (type === 'receita') setRecipes((current) => current.filter((item) => item.id !== itemId));
    else setWorkouts((current) => current.filter((item) => item.id !== itemId));
    try {
      await api.removeFavorito(type, itemId);
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      setFavorites(previousFavorites);
      setRecipes(previousRecipes);
      setWorkouts(previousWorkouts);
      Alert.alert('Não foi possível remover', 'O favorito não foi alterado. Tente novamente.');
    } finally {
      setRemoving((current) => current.filter((item) => item !== key));
    }
  };

  const renderCard = (item: Receita | Treino, type: 'receita' | 'treino') => {
    const isRecipe = type === 'receita';
    const workout = item as Treino;
    const displayData: Receita = isRecipe ? item as Receita : ({
      ...workout, ingredientes: [], modo_preparo: [], porcoes: 0,
      tempo_preparo: workout.duracao_minutos, dificuldade: workout.nivel,
      calorias: undefined, imagem_url: workout.imagem_capa_url || workout.imagem_url,
    } as Receita);
    const key = `${type}:${item.id}`;
    return (
      <View key={key} style={styles.cardColumn}>
        <ReceitaCardAnimated
          item={displayData}
          onPress={() => isRecipe
            ? (navigation as any).navigate('Receitas', {
              screen: 'ReceitaDetail', params: { receitaId: item.id },
            })
            : (navigation as any).navigate('Treinos', {
              screen: 'TreinoDetail', params: { treinoId: item.id },
            })}
        />
        <TouchableOpacity
          accessibilityLabel={`Remover ${item.titulo} dos favoritos`}
          disabled={removing.includes(key)} onPress={() => removeFavorite(type, item.id)}
          style={styles.favoriteButton}
        >
          {removing.includes(key)
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <Ionicons name="heart" size={17} color={colors.primary} />}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) return (
    <AppBackground><SafeAreaView style={styles.loadingContainer} edges={['top']}>
      <ActivityIndicator size="large" color={colors.primary} />
    </SafeAreaView></AppBackground>
  );

  return (
    <AppBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Favoritos</Text>
            <Text style={styles.pageSubtitle}>Tudo o que você salvou em um só lugar.</Text>
          </View>
          <FavoriteSection icon="restaurant-outline" title="Receitas favoritas"
            count={filteredRecipes.length} onFilter={() => openFilter('receitas')}
            onClear={() => setRecipeFilters(DEFAULT_RECIPE_FILTERS)}
            emptyTitle={recipes.length ? 'Nenhuma receita corresponde ao filtro' : 'Nenhuma receita favorita'}>
            {filteredRecipes.map((item) => renderCard(item, 'receita'))}
          </FavoriteSection>
          {canAccessWorkouts && (
            <FavoriteSection icon="barbell-outline" title="Treinos favoritos"
              count={filteredWorkouts.length} onFilter={() => openFilter('treinos')}
              onClear={() => setWorkoutFilters(DEFAULT_WORKOUT_FILTERS)}
              emptyTitle={workouts.length ? 'Nenhum treino corresponde ao filtro' : 'Nenhum treino favorito'}>
              {filteredWorkouts.map((item) => renderCard(item, 'treino'))}
            </FavoriteSection>
          )}
        </ScrollView>
        <FilterModal type={activeFilter} onClose={() => {
          setActiveFilter(null); setCategoryListOpen(false);
        }} onApply={applyFilters}
          recipeFilters={recipeDraftFilters} setRecipeFilters={setRecipeDraftFilters}
          workoutFilters={workoutDraftFilters} setWorkoutFilters={setWorkoutDraftFilters}
          recipeCategories={recipeCategories} workoutCategories={workoutCategories}
          workoutModalities={workoutModalities}
          categoryListOpen={categoryListOpen} setCategoryListOpen={setCategoryListOpen} />
      </SafeAreaView>
    </AppBackground>
  );
}

function FavoriteSection({ icon, title, count, onFilter, onClear, emptyTitle, children }: {
  icon: keyof typeof Ionicons.glyphMap; title: string; count: number;
  onFilter: () => void; onClear: () => void; emptyTitle: string; children: React.ReactNode;
}) {
  return <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name={icon} size={15} color={colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.countBadge}><Text style={styles.countText}>{count}</Text></View>
      </View>
      <View style={styles.sectionActions}>
        <TouchableOpacity onPress={onFilter} style={styles.filterLink}>
          <Ionicons name="options-outline" size={14} color={colors.primary} />
          <Text style={styles.filterLinkText}>Filtrar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClear} style={styles.clearLink}>
          <Ionicons name="close-circle-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.clearLinkText}>Limpar</Text>
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.titleUnderline} />
    {count ? <View style={styles.cardGrid}>{children}</View> : <View style={styles.emptySection}>
      <Ionicons name="heart-outline" size={24} color={colors.textMuted} />
      <Text style={styles.emptyText}>{emptyTitle}</Text>
    </View>}
  </View>;
}

function FilterModal({ type, onClose, onApply, recipeFilters, setRecipeFilters, workoutFilters,
  setWorkoutFilters, recipeCategories, workoutCategories, workoutModalities,
  categoryListOpen, setCategoryListOpen }: {
  type: FilterType | null; onClose: () => void; onApply: (type: FilterType) => void;
  recipeFilters: RecipeFilters;
  setRecipeFilters: React.Dispatch<React.SetStateAction<RecipeFilters>>;
  workoutFilters: WorkoutFilters;
  setWorkoutFilters: React.Dispatch<React.SetStateAction<WorkoutFilters>>;
  recipeCategories: any[]; workoutCategories: any[]; workoutModalities: any[];
  categoryListOpen: boolean;
  setCategoryListOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  if (!type) return null;
  const isRecipe = type === 'receitas';
  const filters = isRecipe ? recipeFilters : workoutFilters;
  const selectedCategory = workoutCategories.find((item) => item.id === workoutFilters.categoryId);
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView style={styles.modalOverlay}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      <View style={styles.modalCard}>
        <View style={styles.modalHandle} />
        <View style={styles.modalHeader}>
          <View><Text style={styles.modalTitle}>Filtrar {isRecipe ? 'receitas' : 'treinos'}</Text>
            <Text style={styles.modalSubtitle}>Mostrando apenas os seus favoritos</Text></View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        {isRecipe ? <>
          <Text style={styles.fieldLabel}>Categoria da receita</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recipeCategoriesContent}>
            {recipeCategories.map((category) => {
              const isSelected = recipeFilters.categoryId === category.id;
              return <TouchableOpacity key={category.id}
                style={[styles.recipeCategoryChip, isSelected && styles.recipeCategoryChipActive]}
                onPress={() => setRecipeFilters((current) => ({
                  ...current, categoryId: isSelected ? '' : category.id,
                }))} activeOpacity={0.8}>
                {category.imagem_url
                  ? <Image source={{ uri: getImageUrl(category.imagem_url) }}
                    style={styles.recipeCategoryImage} resizeMode="cover" />
                  : <View style={styles.recipeCategoryFallback} />}
                <View style={styles.recipeCategoryOverlay}>
                  <Text style={[styles.recipeCategoryText,
                    isSelected && styles.recipeCategoryTextActive]} numberOfLines={2}>
                    {category.nome}
                  </Text>
                </View>
              </TouchableOpacity>;
            })}
          </ScrollView>
        </> : <>
          <Text style={styles.fieldLabel}>Modalidade</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.workoutModalitiesContent}>
            {workoutModalities.map((modality, index) => {
              const isSelected = workoutFilters.modalityId === modality.id;
              return <TouchableOpacity key={modality.id}
                style={[styles.workoutModalityButton,
                  isSelected && styles.workoutModalityButtonActive]}
                onPress={() => setWorkoutFilters((current) => ({
                  ...current, modalityId: isSelected ? '' : modality.id,
                }))} activeOpacity={0.8}>
                <Ionicons name={getModalityIcon(modality.nome, index)} size={19}
                  color={isSelected ? '#17130c' : colors.primary} />
                <Text style={[styles.workoutModalityText,
                  isSelected && styles.workoutModalityTextActive]} numberOfLines={2}>
                  {modality.nome}
                </Text>
              </TouchableOpacity>;
            })}
          </ScrollView>
        </>}
        {!isRecipe && <>
          <Text style={styles.fieldLabel}>Categoria do treino</Text>
          <TouchableOpacity style={styles.selectField}
            onPress={() => setCategoryListOpen((value) => !value)}>
            <Text style={[styles.selectText, !selectedCategory && styles.placeholderText]}>
              {selectedCategory?.nome || 'Todas as categorias'}</Text>
            <Ionicons name={categoryListOpen ? 'chevron-up' : 'chevron-down'} size={18}
              color={colors.textMuted} />
          </TouchableOpacity>
          {categoryListOpen && <ScrollView style={styles.categoryList} nestedScrollEnabled>
            {[{ id: '', nome: 'Todas as categorias' }, ...workoutCategories].map((category) =>
              <TouchableOpacity key={category.id || 'all'} style={styles.categoryOption}
                onPress={() => { setWorkoutFilters((current) => ({
                  ...current, categoryId: category.id,
                })); setCategoryListOpen(false); }}>
                <Text style={styles.categoryOptionText}>{category.nome}</Text>
                {workoutFilters.categoryId === category.id
                  && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </TouchableOpacity>)}
          </ScrollView>}
        </>}
        <Text style={styles.fieldLabel}>{isRecipe ? 'Nome ou ingrediente' : 'Nome do treino'}</Text>
        <View style={styles.searchField}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput value={filters.query} onChangeText={(query) => isRecipe
            ? setRecipeFilters((current) => ({ ...current, query }))
            : setWorkoutFilters((current) => ({ ...current, query }))}
            style={styles.searchInput}
            placeholder={isRecipe ? 'Ex.: frango, aveia ou panqueca' : 'Ex.: cardio ou pernas'}
            placeholderTextColor={colors.textMuted} returnKeyType="search" />
        </View>
        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.clearButton} onPress={() => isRecipe
            ? setRecipeFilters(DEFAULT_RECIPE_FILTERS) : setWorkoutFilters(DEFAULT_WORKOUT_FILTERS)}>
            <Text style={styles.clearButtonText}>Limpar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={() => onApply(type)}>
            <Text style={styles.applyButtonText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 108 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pageHeader: { marginBottom: 26 },
  pageTitle: { color: '#E7C48A', fontFamily: fonts.title, fontSize: 25 },
  pageSubtitle: { color: colors.textSecondary, fontFamily: fonts.body, fontSize: 11, marginTop: 5 },
  section: { marginBottom: mobileSpacing.section },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sectionTitle: { color: colors.textPrimary, fontFamily: fonts.bodySemiBold, fontSize: 12, marginLeft: 6 },
  countBadge: { minWidth: 20, height: 18, paddingHorizontal: 5, borderRadius: 9, marginLeft: 7,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,210,111,0.12)' },
  countText: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 9 },
  sectionActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterLink: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingLeft: 10 },
  filterLinkText: { color: colors.primary, fontFamily: fonts.bodyMedium, fontSize: 10 },
  clearLink: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 8 },
  clearLinkText: { color: colors.textSecondary, fontFamily: fonts.bodyMedium, fontSize: 10 },
  titleUnderline: { width: 112, height: 2, borderRadius: 2, backgroundColor: colors.primary,
    marginTop: 5, marginBottom: mobileSpacing.controlToContent },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardColumn: { width: '48.5%', position: 'relative' },
  favoriteButton: { position: 'absolute', top: 8, left: 8, zIndex: 5, width: 30, height: 30,
    borderRadius: 15, backgroundColor: 'rgba(8,8,8,0.78)', borderWidth: 1,
    borderColor: 'rgba(255,210,111,0.32)', alignItems: 'center', justifyContent: 'center' },
  emptySection: { minHeight: 86, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    backgroundColor: 'rgba(35,33,41,0.62)', alignItems: 'center', justifyContent: 'center', gap: 7 },
  emptyText: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.58)' },
  modalCard: { backgroundColor: '#1C1B1E', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 20, paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 22, maxHeight: '88%' },
  modalHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#49464f',
    alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  modalTitle: { color: colors.textPrimary, fontFamily: fonts.bodySemiBold, fontSize: 17 },
  modalSubtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10, marginTop: 3 },
  closeButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.backgroundSoft,
    alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { color: colors.textSecondary, fontFamily: fonts.bodyMedium, fontSize: 11,
    marginBottom: 8, marginTop: 14 },
  recipeCategoriesContent: { paddingRight: 8, gap: 8 },
  recipeCategoryChip: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(231,196,138,0.28)',
    backgroundColor: colors.backgroundSoft,
  },
  recipeCategoryChipActive: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  recipeCategoryImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  recipeCategoryFallback: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.backgroundElevated },
  recipeCategoryOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.56)',
  },
  recipeCategoryText: {
    color: '#fff',
    fontFamily: fonts.bodySemiBold,
    fontSize: 8,
    lineHeight: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  recipeCategoryTextActive: { color: colors.primary },
  workoutModalitiesContent: { paddingRight: 8, gap: 8 },
  workoutModalityButton: {
    width: 88,
    minHeight: 62,
    paddingHorizontal: 7,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(231,196,138,0.3)',
    backgroundColor: colors.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  workoutModalityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  workoutModalityText: {
    color: colors.textPrimary,
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    lineHeight: 11,
    textAlign: 'center',
  },
  workoutModalityTextActive: { color: '#17130c', fontFamily: fonts.bodySemiBold },
  selectField: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.backgroundSoft, paddingHorizontal: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between' },
  selectText: { color: colors.textPrimary, fontFamily: fonts.body, fontSize: 12 },
  placeholderText: { color: colors.textMuted },
  categoryList: { maxHeight: 154, marginTop: 6, borderRadius: 12, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.backgroundSoft },
  categoryOption: { minHeight: 42, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  categoryOptionText: { color: colors.textPrimary, fontFamily: fonts.body, fontSize: 11 },
  searchField: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.backgroundSoft, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, marginLeft: 8, color: colors.textPrimary, fontFamily: fonts.body,
    fontSize: 12, outlineStyle: 'none' as any },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  clearButton: { flex: 0.8, height: 48, borderRadius: 12, borderWidth: 1,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  clearButtonText: { color: colors.textSecondary, fontFamily: fonts.bodySemiBold, fontSize: 12 },
  applyButton: { flex: 1.2, height: 48, borderRadius: 12, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center' },
  applyButtonText: { color: '#17130c', fontFamily: fonts.bodySemiBold, fontSize: 12 },
});
