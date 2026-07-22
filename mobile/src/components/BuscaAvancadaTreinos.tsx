import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import fonts from '../constants/fonts';

interface BuscaAvancadaProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (filters: BuscaFiltersTreino) => void;
  initialFilters?: BuscaFiltersTreino;
}

export interface BuscaFiltersTreino {
  nome?: string;
  categoria?: string;
  tempoMaximo?: number;
  dificuldade?: string;
}

export default function BuscaAvancadaTreinos({
  visible,
  onClose,
  onSearch,
  initialFilters = {},
}: BuscaAvancadaProps) {
  const [filters, setFilters] = useState<BuscaFiltersTreino>(initialFilters);

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
    onSearch({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔍 Busca Avançada</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Buscar por */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Buscar por:</Text>

              {/* Nome do treino */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome do treino</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Treino de Pernas"
                  value={filters.nome}
                  onChangeText={(text) => setFilters({ ...filters, nome: text })}
                />
              </View>

              {/* Categoria */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoria (Modalidade)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Musculação, Em casa"
                  value={filters.categoria}
                  onChangeText={(text) => setFilters({ ...filters, categoria: text })}
                />
              </View>

              {/* Tempo de preparo */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tempo máximo de duração (min)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 30"
                  keyboardType="numeric"
                  value={filters.tempoMaximo?.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text);
                    setFilters({
                      ...filters,
                      tempoMaximo: isNaN(num) ? undefined : num,
                    });
                  }}
                />
              </View>
            </View>
          </ScrollView>

          {/* Botões */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Limpar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Buscar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    maxHeight: '70%',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    backgroundColor: colors.cardBackground,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  resetButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  searchButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#fff',
  },
});
