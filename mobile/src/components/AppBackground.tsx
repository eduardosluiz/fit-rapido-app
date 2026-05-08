import React from "react";
import { View, StyleSheet, ImageBackground, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface AppBackgroundProps {
  children: React.ReactNode;
}

const texturaBackground = require("../../assets/banners/textura1.png");
// O noise.png que baixamos na etapa anterior
const noiseImage = require("../../assets/noise.png");

export default function AppBackground({ children }: AppBackgroundProps) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={texturaBackground}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Overlay Escuro Pesado (Ajustado para permitir que textura3 brilhe) */}
        <View style={styles.darkOverlay} />

        {/* Glow Dourado Topo super sutil (reduzido drasticamente a pedido do usuário) */}
        <LinearGradient
          colors={['rgba(120,70,30,0.08)', 'rgba(120,70,30,0)']}
          style={styles.topGlow}
        />

        {/* Container blindado para o conteúdo não ser escurecido indevidamente */}
        <View style={{ flex: 1, zIndex: 10, position: 'relative' }}>
          {children}
        </View>

      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1815", // Base preta quente
  },
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 5, 5, 0.15)', // Clareado drasticamente para liberar a textura
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 120,
  },
});
