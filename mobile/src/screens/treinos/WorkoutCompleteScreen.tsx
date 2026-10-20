import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppBackground from '../../components/AppBackground';
import fonts from '../../constants/fonts';

export default function WorkoutCompleteScreen() {
  const navigation = useNavigation<any>();
  const { exerciseCount = 0 } = (useRoute().params || {}) as { exerciseCount?: number };

  return (
    <AppBackground>
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.celebration} accessible={false} pointerEvents="none">
            {Array.from({ length: 24 }, (_, index) => (
              <View key={index} style={[styles.confetti, {
                left: `${(index * 37 + 3) % 96}%`,
                top: `${(index * 19 + 7) % 92}%`,
                opacity: 0.3 + (index % 4) * 0.2,
                transform: [{ rotate: `${index * 47}deg` }],
              }]} />
            ))}
            <LinearGradient colors={['rgba(255,207,103,0.22)', 'rgba(255,207,103,0)']} style={styles.halo}>
              <View style={styles.medal}>
                <Ionicons name="checkmark" size={90} color="#FFD374" />
              </View>
            </LinearGradient>
          </View>

          <Text accessibilityRole="header" style={styles.title}>TREINO{'\n'}CONCLUÍDO!</Text>
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
