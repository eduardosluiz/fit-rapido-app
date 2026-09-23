import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

interface BackButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** Botão de retorno compartilhado por todas as telas internas do aplicativo. */
export default function BackButton({
  onPress,
  style,
  accessibilityLabel = 'Voltar',
}: BackButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name="arrow-back" size={19} color={colors.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
