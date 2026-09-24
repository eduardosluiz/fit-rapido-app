import React, { useCallback, useMemo, useRef, useState } from 'react';
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
type ContentFilter = 'tudo' | FilterType;
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
  const [contentFilter, setContentFilter] = useState<ContentFilter>('tudo');
  const [favoritesQuery, setFavoritesQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);
  const [categoryListOpen, setCategoryListOpen] = useState(false);
  const [recipeFilters, setRecipeFilters] = useState<RecipeFilters>(DEFAULT_RECIPE_FILTERS);
  const [workoutFilters, setWorkoutFilters] = useState<WorkoutFilters>(DEFAULT_WORKOUT_FILTERS);
  const [recipeDraftFilters, setRecipeDraftFilters] = useState<RecipeFilters>(DEFAULT_RECIPE_FILTERS);
  const [workoutDraftFilters, setWorkoutDraftFilters] = useState<WorkoutFilters>(DEFAULT_WORKOUT_FILTERS);
  const hasLoadedFavorites = useRef(false);

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    try {
      if (!hasLoadedFavorites.current) setLoading(true);
      const favoriteData = await api.getFavoritos() as Favorito[];
      const recipeData = favoriteData
        .filter((item) => item.tipo === 'receita' && item.receita?.ativa !== false)
        .map((item) => item.receita)
        .filter((item): item is Receita => !!item);
      const workoutData = canAccessWorkouts
        ? favoriteData
          .filter((item) => item.tipo === 'treino' && item.treino?.ativa !== false)
          .map((item) => item.treino)
          .filter((item): item is Treino => !!item)
        : [];
      setFavorites(favoriteData);
      setRecipes(recipeData);
      setWorkouts(workoutData);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      Alert.alert('Não foi possível carregar', 'Verifique sua conexão e tente novamente.');
    } finally {
      hasLoadedFavorites.current = true;
      setLoading(false);
    }
  }, [canAccessWorkouts, user]);

  useFocusEffect(useCallback(() => { loadFavorites(); }, [loadFavorites]));

  const filteredRecipes = useMemo(() => {
    const query = normalize(recipeFilters.query);
    const generalQuery = normalize(favoritesQuery);
    const result = recipes.filter((recipe) => {
      const ingredients = Array.isArray(recipe.ingredientes)
        ? recipe.ingredientes.map((item) => normalize(
          typeof item === 'string' ? item : JSON.stringify(item),
        )).join(' ') : normalize(recipe.ingredientes);
      const searchableContent = `${normalize(recipe.titulo)} ${ingredients}`;
      const matchesGeneralQuery = !generalQuery || searchableContent.includes(generalQuery);
      const matchesQuery = !query
        || normalize(recipe.titulo).includes(query)
        || ingredients.includes(query);
      const matchesCategory = !recipeFilters.categoryId
        || recipe.categorias?.some((category: any) => category.id === recipeFilters.categoryId);
      return matchesGeneralQuery && matchesQuery && matchesCategory;
    });
    return result;
  }, [favoritesQuery, recipeFilters, recipes]);

  const filteredWorkouts = useMemo(() => {
    const query = normalize(workoutFilters.query);
    const generalQuery = normalize(favoritesQuery);
    const result = workouts.filter((workout) => {
      const matchesGeneralQuery = !generalQuery || normalize(workout.titulo).includes(generalQuery);
      const matchesQuery = !query || normalize(workout.titulo).includes(query);
      const matchesCategory = !workoutFilters.categoryId
        || workout.categorias?.some((category: any) => category.id === workoutFilters.categoryId)
        || (workout as any).categoria_id === workoutFilters.categoryId;
      const matchesModality = !workoutFilters.modalityId
        || workout.modalidade_id === workoutFilters.modalityId
        || workout.modalidade?.id === workoutFilters.modalityId;
      return matchesGeneralQuery && matchesQuery && matchesCategory && matchesModality;
    });
    return result;
  }, [favoritesQuery, workoutFilters, workouts]);

  const showRecipes = contentFilter !== 'treinos';
  const showWorkouts = canAccessWorkouts && contentFilter !== 'receitas';
  const visibleFavoritesCount = contentFilter === 'receitas'
    ? recipes.length
    : contentFilter === 'treinos'
      ? workouts.length
      : recipes.length + workouts.length;

  const openFilter = (type: FilterType) => {
    if (type === 'receitas') setRecipeDraftFilters(DEFAULT_RECIPE_FILTERS);
    else setWorkoutDraftFilters(DEFAULT_WORKOUT_FILTERS);
    setCategoryListOpen(false);
    setActiveFilter(type);
    if (type === 'receitas' && recipeCategories.length === 0) {
      void api.getCategorias().then((items) => setRecipeCategories(
        (items || []).filter((item: any) => item.ativa !== false),
      ));
    }
    if (type === 'treinos' && workoutCategories.length === 0) {
      void api.getCategoriasTreinos().then((items) => setWorkoutCategories(
        (items || []).filter((item: any) => item.ativa !== false),
      ));
    }
    if (type === 'treinos' && workoutModalities.length === 0) {
      void api.getModalidadesTreinos().then((items) => setWorkoutModalities(
        (items || []).filter((item: any) => item.ativo === true || item.ativa === true),
      ));
    }
  };

  const openVisibleFilter = () => {
    openFilter(contentFilter === 'treinos' ? 'treinos' : 'receitas');
  };

  const clearVisibleFilters = () => {
    setFavoritesQuery('');
    if (contentFilter === 'receitas') setRecipeFilters(DEFAULT_RECIPE_FILTERS);
    else if (contentFilter === 'treinos') setWorkoutFilters(DEFAULT_WORKOUT_FILTERS);
    else {
      setRecipeFilters(DEFAULT_RECIPE_FILTERS);
      setWorkoutFilters(DEFAULT_WORKOUT_FILTERS);
    }
  };

  const showAllOfType = (type: FilterType) => {
    setContentFilter(type);
    setFavoritesQuery('');
    if (type === 'receitas') setRecipeFilters(DEFAULT_RECIPE_FILTERS);
    else setWorkoutFilters(DEFAULT_WORKOUT_FILTERS);
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
          <View style={styles.contentTabs}>
            <ContentTab icon="grid-outline" label="Tudo" active={contentFilter === 'tudo'}
              onPress={() => setContentFilter('tudo')} />
            <View style={styles.tabDivider} />
            <ContentTab icon="restaurant-outline" label="Receitas"
              active={contentFilter === 'receitas'} onPress={() => setContentFilter('receitas')} />
            {canAccessWorkouts && <>
              <View style={styles.tabDivider} />
              <ContentTab icon="barbell-outline" label="Treinos"
                active={contentFilter === 'treinos'} onPress={() => setContentFilter('treinos')} />
            </>}
          </View>
          <View style={styles.mainSearchField}>
            <Ionicons name="search-outline" size={21} color={colors.textMuted} />
            <TextInput value={favoritesQuery} onChangeText={setFavoritesQuery}
              style={styles.mainSearchInput} placeholder="Buscar nos favoritos"
              placeholderTextColor={colors.textMuted} returnKeyType="search"
              clearButtonMode="while-editing" />
          </View>
          <View style={styles.filterToolbar}>
            <TouchableOpacity onPress={openVisibleFilter} activeOpacity={0.8}
              style={styles.toolbarButton}>
              <Ionicons name="options-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.toolbarButtonText}>Filtrar</Text>
              <Ionicons name="chevron-down" size={13} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.favoriteTotal}>
              <Ionicons name="heart-outline" size={21} color={colors.textMuted} />
              <Text style={styles.favoriteTotalLabel}>
                {visibleFavoritesCount} {visibleFavoritesCount === 1 ? 'favorito' : 'favoritos'}
              </Text>
            </View>
            <TouchableOpacity onPress={clearVisibleFilters} activeOpacity={0.8}
              style={[styles.toolbarButton, styles.toolbarClearButton]}>
              <Ionicons name="close-circle-outline" size={15} color={colors.textSecondary} />
              <Text style={styles.toolbarButtonText}>Limpar</Text>
            </TouchableOpacity>
          </View>
          {showRecipes && <FavoriteSection icon="restaurant-outline" title="Receitas favoritas"
            count={filteredRecipes.length} seeAllLabel="Ver todas"
            onSeeAll={() => showAllOfType('receitas')}
            emptyTitle={recipes.length ? 'Nenhuma receita encontrada' : 'Você ainda não salvou nenhuma receita favorita.'}
            emptyHint={recipes.length ? 'Tente outra busca ou limpe os filtros desta seção.'
              : 'Toque no coração das receitas para encontrá-las aqui.'}>
            {filteredRecipes.map((item) => renderCard(item, 'receita'))}
          </FavoriteSection>}
          {showWorkouts && (
            <FavoriteSection icon="barbell-outline" title="Treinos favoritos"
              count={filteredWorkouts.length} seeAllLabel="Ver todos"
              onSeeAll={() => showAllOfType('treinos')}
              emptyTitle={workouts.length ? 'Nenhum treino encontrado' : 'Você ainda não salvou nenhum treino favorito.'}
              emptyHint={workouts.length ? 'Tente outra busca ou limpe os filtros desta seção.'
                : 'Toque no coração dos treinos para encontrá-los aqui.'}>
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

function ContentTab({ icon, label, active, onPress }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; active: boolean; onPress: () => void;
}) {
  return <TouchableOpacity onPress={onPress} activeOpacity={0.82}
    accessibilityRole="tab" accessibilityState={{ selected: active }}
    style={[styles.contentTab, active && styles.contentTabActive]}>
    <Ionicons name={icon} size={18} color={active ? '#17130c' : colors.textSecondary} />
    <Text style={[styles.contentTabText, active && styles.contentTabTextActive]}>{label}</Text>
  </TouchableOpacity>;
}

function FavoriteSection({ icon, title, count, seeAllLabel, onSeeAll, emptyTitle, emptyHint, children }: {
  icon: keyof typeof Ionicons.glyphMap; title: string; count: number;
  seeAllLabel: string; onSeeAll: () => void; emptyTitle: string; emptyHint: string;
  children: React.ReactNode;
}) {
  return <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name={icon} size={13} color={colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.countBadge}><Text style={styles.countText}>{count}</Text></View>
      </View>
      <TouchableOpacity onPress={onSeeAll} hitSlop={8}>
        <Text style={styles.seeAllText}>{seeAllLabel}</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.titleUnderline} />
    {count ? <View style={styles.cardGrid}>{children}</View> : <View style={styles.emptySection}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={23} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyText}>{emptyTitle}</Text>
      <Text style={styles.emptyHint}>{emptyHint}</Text>
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
  content: { paddingHorizontal: mobileSpacing.pageGutter, paddingTop: 24, paddingBottom: 108 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pageHeader: { marginBottom: mobileSpacing.section },
  pageTitle: { color: '#E7C48A', fontFamily: fonts.title, fontSize: 25 },
  pageSubtitle: { color: colors.textSecondary, fontFamily: fonts.body, fontSize: 11, marginTop: 5 },
  contentTabs: { height: 44, marginBottom: 12, padding: 3, borderRadius: 13, borderWidth: 1,
    borderColor: 'rgba(231,196,138,0.28)', backgroundColor: 'rgba(18,17,18,0.68)',
    flexDirection: 'row', alignItems: 'center' },
  contentTab: { flex: 1, height: 36, borderRadius: 10, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6 },
  contentTabActive: { backgroundColor: colors.primary },
  contentTabText: { color: colors.textSecondary, fontFamily: fonts.bodyMedium, fontSize: 11 },
  contentTabTextActive: { color: '#17130c', fontFamily: fonts.bodySemiBold },
  tabDivider: { width: StyleSheet.hairlineWidth, height: 24,
    backgroundColor: 'rgba(231,196,138,0.2)' },
  mainSearchField: { width: '100%', height: 48, borderRadius: 15, borderWidth: 1,
    borderColor: colors.border, backgroundColor: 'rgba(35,33,41,0.72)', paddingHorizontal: 15,
    flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  mainSearchInput: { flex: 1, marginLeft: 10, color: colors.textPrimary,
    fontFamily: fonts.body, fontSize: 12, outlineStyle: 'none' as any },
  filterToolbar: { minHeight: 46, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: mobileSpacing.section },
  toolbarButton: { width: 88, height: 34, borderRadius: 10, borderWidth: 1,
    borderColor: colors.border, backgroundColor: 'rgba(18,17,18,0.58)', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 5 },
  toolbarClearButton: { width: 84 },
  toolbarButtonText: { color: colors.textSecondary, fontFamily: fonts.bodyMedium, fontSize: 10 },
  favoriteTotal: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 1 },
  favoriteTotalLabel: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 9 },
  section: { marginBottom: mobileSpacing.section },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sectionTitle: { color: colors.textPrimary, fontFamily: fonts.body, fontSize: 11, marginLeft: 6 },
  countBadge: { minWidth: 20, height: 18, paddingHorizontal: 5, borderRadius: 9, marginLeft: 7,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,210,111,0.12)' },
  countText: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 9 },
  seeAllText: { color: colors.primary, fontFamily: fonts.body, fontSize: 12 },
  titleUnderline: { width: 112, height: 2, borderRadius: 2, backgroundColor: colors.primary,
    marginTop: 5, marginBottom: mobileSpacing.sectionHeaderToContent },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardColumn: { width: '48.5%', position: 'relative' },
  favoriteButton: { position: 'absolute', top: 8, left: 8, zIndex: 5, width: 30, height: 30,
    borderRadius: 15, backgroundColor: 'rgba(8,8,8,0.78)', borderWidth: 1,
    borderColor: 'rgba(255,210,111,0.32)', alignItems: 'center', justifyContent: 'center' },
  emptySection: { minHeight: 154, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    backgroundColor: 'rgba(25,23,25,0.72)', alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingHorizontal: 28, paddingVertical: 22 },
  emptyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  emptyText: { color: colors.textSecondary, fontFamily: fonts.bodyMedium, fontSize: 12,
    lineHeight: 17, textAlign: 'center' },
  emptyHint: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10,
    lineHeight: 15, textAlign: 'center' },
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
