import React from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import fonts from '../constants/fonts';

export default function SubscriptionPrompt({ visible, onClose, contentType = 'recipe' }: {
  visible: boolean; onClose: () => void; contentType?: 'recipe' | 'workout';
}) {
  const navigation = useNavigation<any>();
  const workout = contentType === 'workout';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.panel} accessibilityViewIsModal>
            <Ionicons name="lock-closed" size={32} color="#FFD26F" />
            <Text style={styles.title}>{workout ? 'Libere este treino' : 'Libere esta receita'}</Text>
            <Text style={styles.copy}>Os conteúdos Free ficam disponíveis por 3 dias após o cadastro. Depois desse prazo, é necessário assinar para continuar. Escolha o plano para liberar este conteúdo:</Text>
            <View style={[styles.plan, !workout && styles.recommended]}>
              <Text style={styles.planTitle}>DAI + Receitas</Text>
              <Text style={styles.copy}>Acesso a todas as receitas do aplicativo. Não inclui os treinos pagos.</Text>
            </View>
            <View style={[styles.plan, workout && styles.recommended]}>
              <Text style={styles.planTitle}>DAI + Completo</Text>
              <Text style={styles.copy}>Todas as receitas e os treinos e modalidades pagos, incluindo as aulas de Sua Jornada.</Text>
            </View>
            <Text style={styles.note}>{Platform.OS === 'ios'
              ? 'Escolha o período na próxima tela. O preço e a compra serão confirmados pela App Store.'
              : Platform.OS === 'android' ? 'Escolha o período na próxima tela. O preço e a compra serão confirmados pelo Google Play.'
              : 'Veja as opções na próxima tela. Para contratar, use o aplicativo no celular.'}</Text>
            <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={() => {
              onClose();
              navigation.navigate('Subscriptions', { recommendedTier: workout ? 'premium_fit' : 'premium' });
            }}>
              <Text style={styles.buttonText}>{workout ? 'Ver plano Completo' : 'Ver plano Receitas'}</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" onPress={onClose} style={styles.close}>
              <Text style={styles.copy}>Agora não</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  panel: { width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: '#1B1A19', padding: 22, borderRadius: 22, borderWidth: 1, borderColor: '#665435', gap: 14 },
  title: { color: '#FFD26F', fontFamily: fonts.bold, fontSize: 23 },
  copy: { color: '#EEE9E0', fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  plan: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#444', gap: 5 },
  recommended: { borderColor: '#FFD26F', backgroundColor: '#30291C' },
  planTitle: { color: '#FFD26F', fontFamily: fonts.bold, fontSize: 16 },
  note: { color: '#BFB9AF', fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
  button: { minHeight: 48, padding: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#FFD26F' },
  buttonText: { color: '#211706', fontFamily: fonts.bold, fontSize: 14 },
  close: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
