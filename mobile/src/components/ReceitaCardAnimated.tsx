import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
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
  isLocked?: boolean;
}

export default function ReceitaCardAnimated({ item, isHorizontal, onPress, orderNumber, isLocked }: ReceitaCardProps) {
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
    const thumbnailUrl = item.imagem_url || item.video_thumbnail_url;
    if (thumbnailUrl) {
      return (
        <Image 
          source={{ uri: getImageUrl(thumbnailUrl) || '' }}
          style={styles.image} 
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
        />
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

  const windowWidth = Dimensions.get('window').width;
  const CARD_WIDTH = (windowWidth - 32) / 2;

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={[isHorizontal && { width: CARD_WIDTH, marginRight: 10 }]}>
      <Animated.View style={[styles.card, isHorizontal && styles.horizontalCard, { transform: [{ scale }] }]}>
        <View style={[styles.imageContainer, isHorizontal && styles.horizontalImageContainer]}>
          {renderMedia()}
          
          {isLocked && (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={11} color="#000" />
            </View>
          )}

          {!!orderNumber && (
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

        <View style={[styles.content, isHorizontal && styles.horizontalContent]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: isHorizontal ? 3 : 6, minHeight: isHorizontal ? 18 : 24 }}>
            <Text style={[styles.title, isHorizontal && styles.horizontalTitle, { flex: 1, marginBottom: 0, marginRight: 8 }]} numberOfLines={1}>
              {item.titulo}
            </Text>
            {(item.substituto_id_1 || item.substituto_id_2) && (
              <View style={{ backgroundColor: 'rgba(231,196,138, 0.15)', padding: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(231,196,138, 0.4)' }}>
                <Ionicons name="swap-horizontal" size={12} color="#E7C48A" />
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color={colors.textMuted} />
              <Text style={styles.metaText}>{item.tempo_preparo || 0} min</Text>
            </View>
            {!!item.calorias && (
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={12} color={colors.textMuted} />
                <Text style={styles.metaText}>
                  {(() => {
                    const strVal = String(item.calorias);
                    const match = strVal.match(/(\d+(?:\.\d+)?)/);
                    const num = match ? parseFloat(match[1]) : 0;
                    return Math.round(num);
                  })()} kcal
                </Text>
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
  horizontalCard: {
    borderRadius: 14,
    marginBottom: 12,
  },
  imageContainer: {
    width: '100%',
    height: 120, // Altura reduzida para visual mais compacto e elegante
    backgroundColor: '#222',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(231,196,138, 0.8)', // Borda dourada mais visível na base da imagem
    overflow: 'hidden',
  },
  horizontalImageContainer: {
    height: 96,
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
  horizontalContent: {
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontFamily: fonts.title,
    marginBottom: 6,
  },
  horizontalTitle: {
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
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
    backgroundColor: 'rgba(231,196,138, 0.95)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  lockBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: 'rgba(231,196,138, 0.95)',
    width: 22,
    height: 22,
    borderRadius: 11,
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
