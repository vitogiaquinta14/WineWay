import { forwardRef } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Fonts } from '@/constants/theme';

/** Campo de texto base: concentra la tipografía de todos los inputs de la app. */
export const AppTextInput = forwardRef<TextInput, TextInputProps>(function AppTextInput(
  { style, ...props },
  ref,
) {
  return <TextInput ref={ref} style={[styles.base, style]} {...props} />;
});

const styles = StyleSheet.create({
  base: {
    fontFamily: Fonts.regular,
  },
});
