import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import colors from '../constants/colors';
import fonts from '../constants/fonts';

interface CategoryChipProps {
  label: string;
  icon?: string;
  isActive: boolean;
  onPress: () => void;
  compact?: boolean; // Nova propriedade para o estilo ultra-compacto
}

export default function CategoryChip({ label, icon, isActive, onPress, compact }: CategoryChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isActive && styles.chipActive,
        compact && styles.compactChip,
        compact && isActive && styles.compactChipActive
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && <Text style={[styles.emoji, compact && styles.compactEmoji]}>{icon}</Text>}
      <Text style={[
        styles.label,
        isActive && styles.labelActive,
        compact && styles.compactLabel,
        compact && isActive && styles.compactLabelActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: '#27272a', // Zinc 800
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    elevation: 5,
  },
  compactChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  compactChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 16,
    marginRight: 8,
  },
  compactEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  label: {
    color: '#a1a1aa', // Zinc 400
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: '#FFFFFF',
  },
  compactLabel: {
    fontSize: 11,
  },
  compactLabelActive: {
    color: '#000', // Texto preto no fundo dourado quando compacto para melhor leitura
  },
});
