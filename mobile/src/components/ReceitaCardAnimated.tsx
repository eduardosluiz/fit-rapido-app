import React, { useRef } from "react";
import { View, Text, StyleSheet, Image, Animated, Pressable } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { colors } from "../constants/colors";
import fonts from "../constants/fonts";
import { Receita, getImageUrl } from "../services/api";

interface ReceitaCardProps {
  item: Receita;
  isHorizontal?: boolean;
  onPress: () => void;
  orderNumber?: number;
}

export default function ReceitaCardAnimated({ item, isHorizontal, onPress, orderNumber }: ReceitaCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: false, // Compatibilidade com Web
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const renderMedia = () => {
    if (item.imagem_url) {
      return (
        <Image source={{ uri: getImageUrl(item.imagem_url) || '' }} style={styles.image} />
      );
    }
    
    if (item.video_url) {
      // Se for Supabase, tentamos gerar uma thumbnail via query param de redimensionamento
      // Caso contrário, usamos o componente Video para mostrar o primeiro frame
      const isSupabase = item.video_url.includes('supabase.co');
      const thumbUrl = isSupabase 
        ? `${item.video_url}?width=400&height=225&resize=contain` 
        : item.video_url;

      return (
        <View style={styles.image}>
          <Video
            source={{ uri: thumbUrl }}
            style={styles.image}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            positionMillis={1000} // Mostra o frame de 1 segundo
            isMuted={true}
          />
          <View style={styles.videoOverlay}>
            <Ionicons name="play" size={24} color="rgba(231,196,138, 0.8)" />
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="barbell-outline" size={40} color="rgba(200, 146, 26, 0.3)" />
      </View>
    );
  };

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={[isHorizontal && { width: 280, marginRight: 15 }]}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.imageContainer}>
          {renderMedia()}
          
          {orderNumber && (
            <View style={styles.orderBadge}>
              <Text style={styles.orderText}>{orderNumber}</Text>
            </View>
          )}

          {item.is_inedito && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>INÉDITO</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{item.titulo}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color={colors.textMuted} />
              <Text style={styles.metaText}>{item.tempo_preparo || 0} min</Text>
            </View>
            {item.calorias && (
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={12} color={colors.textMuted} />
                <Text style={styles.metaText}>{Math.round(item.calorias)} kcal</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons name="stats-chart-outline" size={12} color={colors.textMuted} />
              <Text style={styles.metaText}>
                {item.dificuldade === 'facil' || item.dificuldade === 'iniciante' ? 'Iniciante' : 
                 item.dificuldade === 'medio' || item.dificuldade === 'intermediario' ? 'Interm.' : 
                 'Avançado'}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(25, 21, 16, 0.7)', // Fundo glass acastanhado requintado
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 20, // Mais distância linear
    borderWidth: 1.2,
    borderColor: 'rgba(231,196,138, 0.25)', // Borda dourada igual à da imagem de referência
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  imageContainer: {
    width: '100%',
    height: 120, // Altura reduzida para visual mais compacto e elegante
    backgroundColor: '#222',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(231,196,138, 0.8)', // Borda dourada mais visível na base da imagem
    overflow: 'hidden',
  },
  image: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 10,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontFamily: fonts.title,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "600",
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  orderBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: 'rgba(231,196,138, 0.9)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  orderText: {
    color: "#000",
    fontSize: 11,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
});
