import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type ChipTone = 'malbec' | 'terracota' | 'oliva';

type ChipProps = {
  label: string;
  selected?: boolean;
  /** Color cuando está seleccionado. */
  tone?: ChipTone;
  onPress?: () => void;
};

/** Opción seleccionable en forma de píldora (filtros, preferencias). */
export function Chip({ label, selected = false, tone = 'malbec', onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && { backgroundColor: Colors[tone], borderColor: Colors[tone] },
        pressed && styles.pressed,
      ]}>
      <AppText variant="caption" color={selected ? 'textOnPrimary' : 'text'} style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
});
