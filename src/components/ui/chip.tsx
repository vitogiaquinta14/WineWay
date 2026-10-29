import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type ChipTone = 'malbec' | 'terracota' | 'oliva';

type ChipProps = {
  label: string;
  selected?: boolean;
  /** Color cuando está seleccionado. */
  tone?: ChipTone;
  /** Gris y sin respuesta al toque (ej. un horario ocupado). */
  disabled?: boolean;
  onPress?: () => void;
};

/** Opción seleccionable en forma de píldora (filtros, preferencias). */
export function Chip({
  label,
  selected = false,
  tone = 'malbec',
  disabled = false,
  onPress,
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && { backgroundColor: Colors[tone], borderColor: Colors[tone] },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <AppText
        variant="caption"
        color={selected ? 'textOnPrimary' : disabled ? 'textMuted' : 'text'}
        style={styles.label}>
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
  disabled: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.surfaceMuted,
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
