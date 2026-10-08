import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Colors, Radius, Spacing, type ColorName } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: ButtonVariant;
  icon?: IconName;
  /** Elemento a la izquierda del texto cuando no alcanza con un Icon (ej. marca de Google). */
  leading?: ReactNode;
};

const textColor: Record<ButtonVariant, ColorName> = {
  primary: 'textOnPrimary',
  secondary: 'textOnPrimary',
  outline: 'text',
};

export function Button({ title, variant = 'primary', icon, leading, disabled, ...rest }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...rest}>
      <View style={styles.content}>
        {leading}
        {icon && <Icon name={icon} size={16} color={textColor[variant]} />}
        <AppText variant="bodyBold" color={textColor[variant]}>
          {title}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Colors.malbec,
  },
  secondary: {
    backgroundColor: Colors.terracota,
  },
  outline: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
