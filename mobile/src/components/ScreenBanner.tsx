import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ScreenBannerProps {
  imageUrl?: string;
  defaultImage?: ImageSourcePropType;
}

export default function ScreenBanner({ imageUrl, defaultImage }: ScreenBannerProps) {
  // Por enquanto, usar uma imagem padrão (pode ser um gradiente ou placeholder)
  // Depois você pode substituir por imagens específicas de cada tela
  
  return (
    <View style={styles.bannerContainer}>
      {imageUrl ? (
        <ImageBackground 
          source={{ uri: imageUrl }} 
          style={styles.bannerImage} 
          resizeMode="cover"
          imageStyle={styles.bannerImageStyle}
        />
      ) : defaultImage ? (
        <ImageBackground 
          source={defaultImage} 
          style={styles.bannerImage} 
          resizeMode="cover"
          imageStyle={styles.bannerImageStyle}
        />
      ) : (
        <LinearGradient
          colors={['#c8921a', '#b88217', '#a67214']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerPlaceholder}
        >
          {/* Placeholder com gradiente dourado */}
        </LinearGradient>
      )}
      {/* Overlay escuro para melhorar legibilidade do texto */}
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
    height: 90,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '120%', // Aumenta a altura para permitir ajuste de posição
  },
  bannerImageStyle: {
    resizeMode: 'cover',
    // Posiciona a imagem para mostrar o rosto completo (olhos e sorriso)
    // Usa bottom e top negativos para ajustar o posicionamento vertical
    bottom: -50, // Move a imagem 50px para baixo (mostra mais a parte inferior)
    top: -15, // Move a imagem 15px para cima (mostra mais a parte superior - olhos)
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

