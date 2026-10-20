import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppBackground from '../../components/AppBackground';
import fonts from '../../constants/fonts';

export default function WorkoutCompleteScreen() {
  const navigation = useNavigation<any>();
  const { exerciseCount = 0 } = (useRoute().params || {}) as { exerciseCount?: number };

  const focused = useIsFocused();
  const [reduceMotion, setReduceMotion] = useState(true);
  const medal = useRef(new Animated.Value(1)).current;
  const title = useRef(new Animated.Value(1)).current;
  const details = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const particles = useRef(Array.from({ length: 24 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    let active = true;
    let changed = false;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active && !changed) setReduceMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => { changed = true; setReduceMotion(value); });
    return () => { active = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (reduceMotion || !focused) {
      medal.setValue(1); title.setValue(1); details.setValue(1); glow.setValue(0);
      particles.forEach(value => value.setValue(0));
      return;
    }
    const useNativeDriver = Platform.OS !== 'web';
    medal.setValue(0); title.setValue(0); details.setValue(0);
    particles.forEach(value => value.setValue(0));
    const entrance = Animated.stagger(160, [
      Animated.spring(medal, { toValue: 1, damping: 12, stiffness: 130, mass: 0.8, useNativeDriver }),
      Animated.timing(title, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver }),
      Animated.timing(details, { toValue: 1, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver }),
    ]);
    const shimmer = Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1000, useNativeDriver }),
      Animated.timing(glow, { toValue: 0, duration: 1400, useNativeDriver }),
    ]);
    const confetti = Animated.parallel(particles.map((value, index) => Animated.sequence([
      Animated.delay((index % 8) * 110),
      Animated.timing(value, { toValue: 1, duration: 2800 + (index % 5) * 220, easing: Easing.linear, useNativeDriver, isInteraction: false }),
    ])));
    entrance.start(); shimmer.start(); confetti.start();
    return () => { entrance.stop(); shimmer.stop(); confetti.stop(); };
  }, [focused, reduceMotion, medal, title, details, glow, particles]);

  return (
    <AppBackground>
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.celebration} accessible={false} pointerEvents="none">
            {Array.from({ length: 24 }, (_, index) => (
              <Animated.View key={index} style={[styles.confetti, {
                left: `${(index * 37 + 3) % 96}%`,
                top: reduceMotion ? `${(index * 19 + 7) % 92}%` : '0%',
                opacity: reduceMotion ? 0.3 + (index % 4) * 0.2 : particles[index].interpolate({ inputRange: [0, 0.12, 0.72, 1], outputRange: [0, 0.9, 0.8, 0] }),
                transform: reduceMotion ? [{ rotate: `${index * 47}deg` }] : [
                  { translateY: particles[index].interpolate({ inputRange: [0, 1], outputRange: [-20, 240] }) },
                  { translateX: particles[index].interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, index % 2 ? 18 : -18, index % 2 ? -8 : 8] }) },
                  { rotate: particles[index].interpolate({ inputRange: [0, 1], outputRange: [`${index * 47}deg`, `${index * 47 + 280}deg`] }) },
                ],
              }]} />
            ))}
            <Animated.View style={{ opacity: medal, transform: [{ scale: medal.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }) }] }}>
            <Animated.View style={{ transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] }}>
            <LinearGradient colors={['rgba(255,207,103,0.22)', 'rgba(255,207,103,0)']} style={styles.halo}>
              <View style={styles.medal}>
                <Ionicons name="checkmark" size={90} color="#FFD374" />
              </View>
            </LinearGradient>
            </Animated.View>
            </Animated.View>
          </View>

          <Animated.Text accessibilityRole="header" style={[styles.title, { opacity: title, transform: [{ translateY: title.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }, { scale: title.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }]}>TREINO{'\n'}CONCLUÍDO!</Animated.Text>
          <Animated.View style={{ width: '100%', alignItems: 'center', opacity: details, transform: [{ translateY: details.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
          <Text style={styles.message}>Você deu mais um passo.{'\n'}Parabéns!</Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons name="barbell" size={25} color="#FFD374" />
              <Text style={styles.value}>{exerciseCount}</Text>
              <Text style={styles.label}>{exerciseCount === 1 ? 'exercício concluído' : 'exercícios concluídos'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Ionicons name="trophy-outline" size={25} color="#FFD374" />
              <Text style={styles.value}>Mais</Text>
              <Text style={styles.label}>uma conquista!</Text>
            </View>
          </View>

          <TouchableOpacity accessibilityRole="button" onPress={() => navigation.reset({
            index: 0, routes: [{ name: 'TreinosList' }],
          })} activeOpacity={0.85} style={styles.button}>
            <LinearGradient colors={['#FFE19A', '#F2BE50']} style={styles.buttonFill}>
              <Text style={styles.buttonText}>Voltar aos treinos</Text>
              <Ionicons name="chevron-forward" size={20} color="#211706" />
            </LinearGradient>
          </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, paddingBottom: 36 },
  celebration: { width: '100%', maxWidth: 340, height: 240, alignItems: 'center', justifyContent: 'center' },
  confetti: { position: 'absolute', width: 7, height: 13, backgroundColor: '#EAC16E', borderRadius: 1 },
  halo: { width: 210, height: 210, borderRadius: 105, alignItems: 'center', justifyContent: 'center' },
  medal: { width: 142, height: 142, borderRadius: 71, borderWidth: 7, borderColor: '#FFD374', alignItems: 'center', justifyContent: 'center', backgroundColor: '#312310', shadowColor: '#FFD374', shadowOpacity: 0.6, shadowRadius: 20, shadowOffset: { width: 0, height: 0 } },
  title: { fontFamily: fonts.title, color: '#F5D38C', fontSize: 36, textAlign: 'center', lineHeight: 42 },
  message: { fontFamily: fonts.body, color: '#EEE6D8', textAlign: 'center', fontSize: 15, lineHeight: 23, marginTop: 14 },
  stats: { width: '100%', maxWidth: 400, flexDirection: 'row', alignItems: 'center', marginTop: 28, paddingVertical: 18, borderWidth: 1, borderColor: '#665135', borderRadius: 16, backgroundColor: 'rgba(18,16,13,0.75)' },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: 8, gap: 5 },
  divider: { width: 1, height: 55, backgroundColor: '#665135' },
  value: { fontFamily: fonts.bold, color: '#FFE2A1', fontSize: 18 },
  label: { fontFamily: fonts.body, color: '#E1D7C7', fontSize: 12, textAlign: 'center' },
  button: { width: '100%', maxWidth: 400, marginTop: 24, borderRadius: 28, overflow: 'hidden' },
  buttonFill: { minHeight: 54, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  buttonText: { fontFamily: fonts.semiBold, fontSize: 15, color: '#211706' },
});
