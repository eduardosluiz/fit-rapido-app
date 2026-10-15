import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// No navegador usamos o zoom nativo. No app, dois dedos ampliam e deslocam
// o conteúdo; um dedo continua disponível para a rolagem normal da tela.
export default function ZoomableContent({ children }: { children: React.ReactNode }) {
  const [zoom, setZoom] = useState({ scale: 1, x: 0, y: 0 });
  const current = useRef(zoom);
  const bounds = useRef({ width: 0, height: 0 });
  const start = useRef({ distance: 1, cx: 0, cy: 0, scale: 1, x: 0, y: 0 });
  const apply = (scale: number, x = 0, y = 0) => {
    scale = Math.min(3, Math.max(1, scale));
    const maxX = bounds.current.width * (scale - 1) / 2;
    const maxY = bounds.current.height * (scale - 1) / 2;
    const next = { scale, x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
    current.current = next;
    setZoom(next);
  };
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponderCapture: e => e.nativeEvent.touches.length >= 2,
    onMoveShouldSetPanResponderCapture: e => e.nativeEvent.touches.length >= 2,
    onPanResponderGrant: e => {
      const [a, b] = e.nativeEvent.touches;
      if (!a || !b) return;
      start.current = { ...current.current, distance: Math.max(1, Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY)), cx: (a.pageX + b.pageX) / 2, cy: (a.pageY + b.pageY) / 2 };
    },
    onPanResponderMove: e => {
      const [a, b] = e.nativeEvent.touches;
      if (!a || !b) return;
      const s = start.current;
      apply(s.scale * Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY) / s.distance,
        s.x + (a.pageX + b.pageX) / 2 - s.cx, s.y + (a.pageY + b.pageY) / 2 - s.cy);
    },
    onPanResponderTerminationRequest: () => true,
  }), []);
  if (Platform.OS === 'web') return <>{children}</>;
  return <View style={styles.viewport} onLayout={e => { bounds.current = e.nativeEvent.layout; }}>
    <View style={styles.viewport} {...responder.panHandlers}>
      <View style={[styles.content, { transform: [{ translateX: zoom.x }, { translateY: zoom.y }, { scale: zoom.scale }] }]}>{children}</View>
    </View>
    {zoom.scale > 1 && <View style={styles.controls}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Restaurar tamanho original" onPress={() => apply(1)} style={styles.button}><Text style={styles.percent}>Voltar a 100%</Text></TouchableOpacity>
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  viewport: { flex: 1, overflow: 'hidden' }, content: { flex: 1 },
  controls: { position: 'absolute', right: 8, bottom: 8, backgroundColor: '#171717', borderRadius: 12, borderWidth: 1, borderColor: '#76603A' },
  button: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  percent: { color: '#FFFFFF', fontSize: 12 },
});
