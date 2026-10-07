import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Fonts, type ColorName } from '@/constants/theme';

export type AppTextVariant =
  | 'display' // Títulos grandes (ej. "Bienvenido de nuevo")
  | 'title' // Título de pantalla (ej. "Explorar Bodegas")
  | 'heading' // Título de sección (ej. "Próximo viaje")
  | 'subtitle' // Nombre de tarjeta en semibold
  | 'body'
  | 'bodyBold'
  | 'caption' // Texto secundario pequeño
  | 'label'; // Etiqueta en mayúsculas (ej. "EMAIL", "LA BODEGA")

export type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  color?: ColorName;
  align?: 'left' | 'center' | 'right';
};

const defaultColor: Record<AppTextVariant, ColorName> = {
  display: 'textTitle',
  title: 'textTitle',
  heading: 'textTitle',
  subtitle: 'text',
  body: 'text',
  bodyBold: 'text',
  caption: 'textMuted',
  label: 'text',
};

export function AppText({ variant = 'body', color, align, style, ...rest }: AppTextProps) {
  return (
    <Text
      style={[
        styles[variant],
        { color: Colors[color ?? defaultColor[variant]] },
        align && { textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: Fonts.bold,
    fontSize: 30,
    lineHeight: 36,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 24,
    lineHeight: 30,
  },
  heading: {
    fontFamily: Fonts.semiBold,
    fontSize: 19,
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyBold: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
