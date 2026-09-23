import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Colors, Spacing } from '@/constants/theme';

/** Línea horizontal con un texto al centro (ej. "o continuar con"). */
export function TextDivider({ text }: { text: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <AppText variant="caption">{text}</AppText>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
});
