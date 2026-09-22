// lib/theme.ts
// Los colores de Daytona en un solo lugar. Se usa desde StyleSheet
// importando estas constantes, y desde styled-components via ThemeProvider.

export const theme = {
  colors: {
    navy: '#001F3F',
    navySoft: '#0B3F85',
    red: '#C41E3A',
    green: '#28A745',
    greenSoft: '#D4EDDA',
    yellow: '#C47700',
    yellowSoft: '#FFF3CD',
    redSoft: '#F8D7DA',
    bg: '#F5F6F8',
    card: '#FFFFFF',
    border: '#DEE2E6',
    text: '#212529',
    muted: '#6C757D',
    accent: '#1266D1',
    accentSoft: '#E8F1FF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  radius: { sm: 6, md: 10, lg: 14 },
  font: { sm: 12, md: 14, lg: 16, xl: 20, xxl: 26 },
};

export type Theme = typeof theme;
