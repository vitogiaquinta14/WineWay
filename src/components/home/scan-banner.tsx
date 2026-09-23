import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { Colors, Radius, Spacing } from '@/constants/theme';

/** Acceso destacado a escanear una etiqueta de vino. */
export function ScanBanner({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.iconCircle}>
        <Icon name="camera" size={22} color="malbec" />
      </View>
      <View style={styles.texts}>
        <AppText variant="bodyBold" color="textOnPrimary">
          Escanear etiqueta de vino
        </AppText>
        <AppText variant="caption" style={styles.subtitle}>
          Guardalo al instante en tu cava personal
        </AppText>
      </View>
      <Icon name="chevronRight" size={16} color="textOnPrimary" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.malbec,
  },
  pressed: {
    opacity: 0.9,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: Spacing.xxs,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
