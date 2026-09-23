import { Platform } from 'react-native';

/**
 * Paleta de Bodegueando (ver wiki/03-pantallas-y-diseno.md).
 * La app se diseña solo en modo claro.
 */
export const Colors = {
  // Branding
  malbec: '#722F37',
  wineDark: '#321E20',
  crema: '#F7F2EA',
  oliva: '#6F7255',
  terracota: '#C4775A',
  carbon: '#252525',

  // Superficies y neutros
  background: '#F7F2EA',
  surface: '#FFFFFF',
  surfaceMuted: '#EFE8DD',
  border: '#E6DED2',

  // Texto
  text: '#252525',
  textTitle: '#321E20',
  textMuted: '#8A807A',
  textOnPrimary: '#FFFFFF',

  // Estados
  malbecSoft: '#F1E4E3',
  olivaSoft: '#E9EADF',
  terracotaSoft: '#F6E6DE',
  star: '#C4775A',
  error: '#B3261E',
} as const;

export type ColorName = keyof typeof Colors;

/**
 * Familias tipográficas. La serif (Young Serif) se carga en src/app/_layout.tsx
 * y solo tiene peso 400: no combinarla con fontWeight.
 */
export const Fonts = {
  sans: Platform.select({ ios: 'System', default: 'sans-serif' }),
  serif: 'YoungSerif_400Regular',
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#321E20',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;
