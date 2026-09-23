import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Fonts, type ColorName } from '@/constants/theme';

export type AppTextVariant =
  | 'display' // Títulos grandes serif (ej. "Bienvenido de nuevo")
  | 'title' // Título de pantalla serif (ej. "Explorar Bodegas")
  | 'heading' // Título de sección serif (ej. "Próximo viaje")
  | 'subtitle' // Nombre de tarjeta en sans bold
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
    fontFamily: Fonts.serif,
    fontSize: 30,
    lineHeight: 36,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 30,
  },
  heading: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyBold: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  caption: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
