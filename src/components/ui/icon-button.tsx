import { Pressable, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Colors, type ColorName } from '@/constants/theme';

type IconButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  /** 'overlay' es para usar sobre fotos (fondo oscuro translúcido). */
  variant?: 'overlay' | 'plain';
  color?: ColorName;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = 'plain',
  color,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.button, styles[variant], pressed && styles.pressed]}>
      <Icon
        name={icon}
        size={18}
        color={color ?? (variant === 'overlay' ? 'textOnPrimary' : 'text')}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(37, 37, 37, 0.45)',
  },
  plain: {
    backgroundColor: Colors.surface,
  },
  pressed: {
    opacity: 0.8,
  },
});
