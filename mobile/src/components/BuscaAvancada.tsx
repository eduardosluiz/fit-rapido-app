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

interface Categoria {
  id: string;
  nome: string;
}

interface BuscaAvancadaProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (filters: BuscaFilters) => void;
  initialFilters?: BuscaFilters;
  availableCategories?: Categoria[];
}

export interface BuscaFilters {
  nome?: string;
  ingrediente?: string;
  categoria?: string;
  proteinasMin?: number;
  tempoMaximo?: number;
  semLactose?: boolean;
  lowCarb?: boolean;
}

export default function BuscaAvancada({
  visible,
  onClose,
  onSearch,
  initialFilters = {},
  availableCategories = [],
}: BuscaAvancadaProps) {
  const [filters, setFilters] = useState<BuscaFilters>(initialFilters);
  const [showCategorySelect, setShowCategorySelect] = useState(false);

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

              {/* Nome da receita */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome da receita</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Waffle de proteína"
                  value={filters.nome}
                  onChangeText={(text) => setFilters({ ...filters, nome: text })}
                />
              </View>

              {/* Ingrediente */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ingrediente</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: frango, ovo, aveia"
                  value={filters.ingrediente}
                  onChangeText={(text) => setFilters({ ...filters, ingrediente: text })}
                />
              </View>

              {/* Categoria */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoria</Text>
                {availableCategories && availableCategories.length > 0 ? (
                  <View>
                    <TouchableOpacity 
                      style={[styles.input, styles.selectInput]} 
                      onPress={() => setShowCategorySelect(!showCategorySelect)}
                    >
                      <Text style={[styles.selectInputText, !filters.categoria && styles.placeholderText]}>
                        {filters.categoria || "Selecione uma categoria..."}
                      </Text>
                      <Ionicons name={showCategorySelect ? "chevron-up" : "chevron-down"} size={20} color={colors.textMuted} />
                    </TouchableOpacity>

                    {showCategorySelect && (
                      <View style={styles.dropdownContainer}>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            setFilters({ ...filters, categoria: undefined });
                            setShowCategorySelect(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, !filters.categoria && styles.dropdownItemSelectedText]}>
                            Todas as categorias
                          </Text>
                          {!filters.categoria && <Ionicons name="checkmark" size={18} color="#E7C48A" />}
                        </TouchableOpacity>
                        
                        {availableCategories.map((cat) => {
                          const isSelected = filters.categoria === cat.nome;
                          return (
                            <TouchableOpacity
                              key={cat.id}
                              style={styles.dropdownItem}
                              onPress={() => {
                                setFilters({ ...filters, categoria: cat.nome });
                                setShowCategorySelect(false);
                              }}
                            >
                              <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemSelectedText]}>
                                {cat.nome}
                              </Text>
                              {isSelected && <Ionicons name="checkmark" size={18} color="#E7C48A" />}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                ) : (
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Café da manhã, Lanche"
                    value={filters.categoria}
                    onChangeText={(text) => setFilters({ ...filters, categoria: text })}
                  />
                )}
              </View>

              {/* Quantidade de proteína */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Quantidade mínima de proteína (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 20"
                  keyboardType="numeric"
                  value={filters.proteinasMin?.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text);
                    setFilters({
                      ...filters,
                      proteinasMin: isNaN(num) ? undefined : num,
                    });
                  }}
                />
              </View>

              {/* Tempo de preparo */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tempo máximo de preparo (min)</Text>
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

            {/* Filtros rápidos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filtros rápidos:</Text>

              {/* Sem lactose */}
              <View style={styles.switchGroup}>
                <Text style={styles.switchLabel}>Sem lactose</Text>
                <Switch
                  value={filters.semLactose || false}
                  onValueChange={(value) => setFilters({ ...filters, semLactose: value })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={filters.semLactose ? '#fff' : '#f4f3f4'}
                />
              </View>

              {/* Low carb */}
              <View style={styles.switchGroup}>
                <Text style={styles.switchLabel}>Low carb</Text>
                <Switch
                  value={filters.lowCarb || false}
                  onValueChange={(value) => setFilters({ ...filters, lowCarb: value })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={filters.lowCarb ? '#fff' : '#f4f3f4'}
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
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectInputText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownContainer: {
    marginTop: 4,
    backgroundColor: '#1E1B18',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemText: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  dropdownItemSelectedText: {
    color: '#E7C48A',
    fontFamily: fonts.bold,
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
