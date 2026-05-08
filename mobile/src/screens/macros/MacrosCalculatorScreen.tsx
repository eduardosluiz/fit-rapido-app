import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../services/api';

interface MacrosDiarios {
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
}

export default function MacrosCalculatorScreen() {
  const navigation = useNavigation();
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [idade, setIdade] = useState('');
  const [genero, setGenero] = useState<'masculino' | 'feminino'>('masculino');
  const [nivelAtividade, setNivelAtividade] = useState<
    'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso'
  >('moderado');
  const [objetivo, setObjetivo] = useState<'perder_peso' | 'manter_peso' | 'ganhar_peso'>('manter_peso');
  const [loading, setLoading] = useState(false);
  const [macros, setMacros] = useState<MacrosDiarios | null>(null);

  const niveisAtividade = [
    { value: 'sedentario', label: 'Sedentário', desc: 'Pouco ou nenhum exercício' },
    { value: 'leve', label: 'Leve', desc: 'Exercício leve 1-3 dias/semana' },
    { value: 'moderado', label: 'Moderado', desc: 'Exercício moderado 3-5 dias/semana' },
    { value: 'intenso', label: 'Intenso', desc: 'Exercício intenso 6-7 dias/semana' },
    { value: 'muito_intenso', label: 'Muito Intenso', desc: 'Exercício muito intenso, trabalho físico' },
  ];

  const objetivos = [
    { value: 'perder_peso', label: 'Perder Peso', icon: '⬇️' },
    { value: 'manter_peso', label: 'Manter Peso', icon: '➡️' },
    { value: 'ganhar_peso', label: 'Ganhar Peso', icon: '⬆️' },
  ];

  const calcularMacros = async () => {
    if (!peso || !altura || !idade) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    const idadeNum = parseInt(idade, 10);

    if (pesoNum <= 0 || alturaNum <= 0 || idadeNum <= 0) {
      Alert.alert('Erro', 'Valores devem ser maiores que zero');
      return;
    }

    if (pesoNum > 300 || alturaNum > 250) {
      Alert.alert('Erro', 'Valores inválidos. Verifique os dados inseridos.');
      return;
    }

    setLoading(true);
    try {
      const resultado = await api.calcularMacrosDiarios({
        peso: pesoNum,
        altura: alturaNum,
        idade: idadeNum,
        genero,
        nivelAtividade,
        objetivo,
      });
      setMacros(resultado);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao calcular macros');
    } finally {
      setLoading(false);
    }
  };

  const percentualProteinas = macros
    ? ((macros.proteinas * 4) / macros.calorias) * 100
    : 0;
  const percentualCarboidratos = macros
    ? ((macros.carboidratos * 4) / macros.calorias) * 100
    : 0;
  const percentualGorduras = macros
    ? ((macros.gorduras * 9) / macros.calorias) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calculadora de Macros</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Formulário */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Peso (kg) *</Text>
            <TextInput
              style={styles.input}
              value={peso}
              onChangeText={setPeso}
              placeholder="Ex: 70"
              keyboardType="decimal-pad"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Altura (cm) *</Text>
            <TextInput
              style={styles.input}
              value={altura}
              onChangeText={setAltura}
              placeholder="Ex: 175"
              keyboardType="decimal-pad"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Idade *</Text>
            <TextInput
              style={styles.input}
              value={idade}
              onChangeText={setIdade}
              placeholder="Ex: 30"
              keyboardType="number-pad"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gênero</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioButton, genero === 'masculino' && styles.radioButtonActive]}
                onPress={() => setGenero('masculino')}
              >
                <Text style={[styles.radioText, genero === 'masculino' && styles.radioTextActive]}>
                  Masculino
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioButton, genero === 'feminino' && styles.radioButtonActive]}
                onPress={() => setGenero('feminino')}
              >
                <Text style={[styles.radioText, genero === 'feminino' && styles.radioTextActive]}>
                  Feminino
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Nível de Atividade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nível de Atividade</Text>
          {niveisAtividade.map((nivel) => (
            <TouchableOpacity
              key={nivel.value}
              style={[
                styles.optionCard,
                nivelAtividade === nivel.value && styles.optionCardActive,
              ]}
              onPress={() => setNivelAtividade(nivel.value as any)}
            >
              <Text
                style={[
                  styles.optionTitle,
                  nivelAtividade === nivel.value && styles.optionTitleActive,
                ]}
              >
                {nivel.label}
              </Text>
              <Text
                style={[
                  styles.optionDesc,
                  nivelAtividade === nivel.value && styles.optionDescActive,
                ]}
              >
                {nivel.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Objetivo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objetivo</Text>
          <View style={styles.objectivesGrid}>
            {objetivos.map((obj) => (
              <TouchableOpacity
                key={obj.value}
                style={[
                  styles.objectiveCard,
                  objetivo === obj.value && styles.objectiveCardActive,
                ]}
                onPress={() => setObjetivo(obj.value as any)}
              >
                <Text style={styles.objectiveIcon}>{obj.icon}</Text>
                <Text
                  style={[
                    styles.objectiveLabel,
                    objetivo === obj.value && styles.objectiveLabelActive,
                  ]}
                >
                  {obj.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botão Calcular */}
        <TouchableOpacity
          style={[styles.calculateButton, loading && styles.calculateButtonDisabled]}
          onPress={calcularMacros}
          disabled={loading}
        >
          <Text style={styles.calculateButtonText}>
            {loading ? 'Calculando...' : 'Calcular Macros'}
          </Text>
        </TouchableOpacity>

        {/* Resultados */}
        {macros && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>Seus Macros Diários</Text>

            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{Math.round(macros.calorias)}</Text>
              <Text style={styles.macroLabel}>Calorias (kcal)</Text>
            </View>

            <View style={styles.macrosGrid}>
              <View style={styles.macroItem}>
                <Text style={styles.macroItemValue}>{macros.proteinas}g</Text>
                <Text style={styles.macroItemLabel}>Proteínas</Text>
                <Text style={styles.macroItemPercent}>{percentualProteinas.toFixed(1)}%</Text>
              </View>

              <View style={styles.macroItem}>
                <Text style={styles.macroItemValue}>{macros.carboidratos}g</Text>
                <Text style={styles.macroItemLabel}>Carboidratos</Text>
                <Text style={styles.macroItemPercent}>{percentualCarboidratos.toFixed(1)}%</Text>
              </View>

              <View style={styles.macroItem}>
                <Text style={styles.macroItemValue}>{macros.gorduras}g</Text>
                <Text style={styles.macroItemLabel}>Gorduras</Text>
                <Text style={styles.macroItemPercent}>{percentualGorduras.toFixed(1)}%</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Estes valores são estimativas baseadas na fórmula de Mifflin-St Jeor. Consulte um nutricionista para um plano personalizado.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#c8921a',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#c8921a',
    backgroundColor: '#1f1a0f',
  },
  radioText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  radioTextActive: {
    color: '#c8921a',
  },
  optionCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  optionCardActive: {
    borderColor: '#c8921a',
    backgroundColor: '#1f1a0f',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  optionTitleActive: {
    color: '#c8921a',
  },
  optionDesc: {
    fontSize: 13,
    color: '#999',
  },
  optionDescActive: {
    color: '#c8921a',
  },
  objectivesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  objectiveCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  objectiveCardActive: {
    borderColor: '#c8921a',
    backgroundColor: '#1f1a0f',
  },
  objectiveIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  objectiveLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textAlign: 'center',
  },
  objectiveLabelActive: {
    color: '#c8921a',
  },
  calculateButton: {
    backgroundColor: '#c8921a',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  calculateButtonDisabled: {
    opacity: 0.6,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsSection: {
    marginTop: 24,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#c8921a',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c8921a',
    marginBottom: 20,
    textAlign: 'center',
  },
  macroCard: {
    backgroundColor: '#0f0f0f',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  macroValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#c8921a',
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 16,
    color: '#999',
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  macroItem: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  macroItemValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  macroItemLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  macroItemPercent: {
    fontSize: 14,
    color: '#c8921a',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#0f0f0f',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#c8921a',
  },
  infoText: {
    fontSize: 13,
    color: '#999',
    lineHeight: 20,
  },
});

