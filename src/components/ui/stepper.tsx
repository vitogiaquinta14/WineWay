import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Colors, Radius, Spacing } from '@/constants/theme';

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Para lectores de pantalla (ej. "personas"). */
  accessibilityLabel: string;
};

/** Control numérico "−  2  +". */
export function Stepper({ value, onChange, min = 0, max = 99, accessibilityLabel }: StepperProps) {
  return (
    <View style={styles.container} accessibilityLabel={`${accessibilityLabel}: ${value}`}>
      <StepButton
        label="−"
        accessibilityLabel={`Restar ${accessibilityLabel}`}
        disabled={value <= min}
        onPress={() => onChange(value - 1)}
      />
      <AppText variant="bodyBold" style={styles.value}>
        {value}
      </AppText>
      <StepButton
        label="+"
        accessibilityLabel={`Sumar ${accessibilityLabel}`}
        disabled={value >= max}
        onPress={() => onChange(value + 1)}
      />
    </View>
  );
}

function StepButton({
  label,
  accessibilityLabel,
  disabled,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <AppText variant="bodyBold">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: Colors.surfaceMuted,
  },
  disabled: {
    opacity: 0.4,
  },
  value: {
    minWidth: 20,
    textAlign: 'center',
  },
});
