import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable, Dimensions, Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, shadows, spacing } from "../constants/colors";
import fonts from "../constants/fonts";
import { Treino, getImageUrl } from "../services/api";

interface TreinoCardProps {
  item: Treino | any;
  isHorizontal?: boolean;
  onPress: () => void;
}

export default function TreinoCardAnimated({ item, isHorizontal, onPress }: TreinoCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: false, 
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const windowWidth = Dimensions.get('window').width;
  const CARD_WIDTH = (windowWidth - 50) / 2;
  const CARD_HEIGHT = 160;

  const renderTags = () => {
    return (
      <View style={styles.tagsContainer}>
        {item.is_inedito && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>Novo</Text>
          </View>
        )}
        
        {!item.is_inedito && item.avaliacao && item.avaliacao > 0 ? (
          <View style={[styles.badge, { backgroundColor: 'rgba(28,27,30,0.8)', borderWidth: 1, borderColor: colors.border }]}>
            <Ionicons name="star" size={10} color={colors.primary} style={{ marginRight: 2 }} />
            <Text style={[styles.badgeText, { color: colors.textPrimary }]}>{item.avaliacao.toFixed(1).replace('.', ',')}</Text>
          </View>
        ) : null}

        {item.popular && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>Popular</Text>
          </View>
        )}
      </View>
    );
  };

  const thumbnail = item.imagem_url 
    ? getImageUrl(item.imagem_url)
    : item.video_url?.includes('supabase.co') 
      ? `${item.video_url}?width=400&height=225&resize=contain` 
      : null;

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={[isHorizontal && { width: CARD_WIDTH, marginRight: spacing.lg }]}>
      <Animated.View style={[styles.card, { transform: [{ scale }], height: CARD_HEIGHT }]}>
        
        {/* Background Media */}
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundElevated }]}>
            <Ionicons name="barbell-outline" size={40} color="rgba(255, 210, 111, 0.15)" />
          </View>
        )}

        {/* Gradient for text readability */}
        <LinearGradient
          colors={['transparent', 'rgba(28,27,30,0.5)', 'rgba(28,27,30,0.95)']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Top Tags */}
        {renderTags()}

        {/* Bottom Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {item.titulo || item.nome}
          </Text>
          
          <Text style={styles.metaText}>
            {item.duracao_minutos ? `${item.duracao_minutos} min` : ''} 
            {item.duracao_minutos && item.nivel ? ' • ' : ''}
            {item.nivel === 'facil' || item.nivel === 'iniciante' ? 'Iniciante' : 
             item.nivel === 'medio' || item.nivel === 'intermediario' ? 'Intermediário' : 
             item.nivel === 'dificil' || item.nivel === 'avancado' ? 'Avançado' : ''}
          </Text>
        </View>

      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundSoft,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "600",
  },
  content: {
    padding: spacing.md,
    paddingTop: 0,
    justifyContent: 'flex-end',
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: fonts.title,
    marginBottom: 2,
    lineHeight: 18,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: fonts.medium,
  },
});
