/**
 * Cores do tema do aplicativo Fit & Rápido
 * Design System Premium Style (layoutnovo2)
 */

export const colors = {
  // Tokens baseados nas instruções
  background: "#1C1B1E",        // base principal
  backgroundSoft: "#232129",    // variação para cards / inputs
  backgroundElevated: "#2A2830",

  primary: "#FFD26F",           // dourado principal
  primarySoft: "#C9A24A",
  primaryDark: "#A67A15",
  primaryLight: "#FFD26F",

  text: "#F5F5F7",              // Equivalente a textPrimary
  textPrimary: "#F5F5F7",
  textSecondary: "#B8B8C0",
  textMuted: "#8A8892",

  border: "#2F2D35",
  divider: "#2A2830",

  success: "#4CAF50",
  warning: "#FFB020",
  error: "#E5484D",
  info: "#2196F3",
  
  // Elementos do layout
  overlay: 'rgba(0, 0, 0, 0.4)',
  cardBackground: '#232129',
  cardBackgroundActive: '#2A2830',
};

// Constantes de Espaçamento e Formato Adicionadas (tokens)
export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20,
};

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
};

export default colors;

