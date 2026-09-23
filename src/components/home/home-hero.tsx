import type { ImageSource } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { Photo } from '@/components/ui/photo';
import { Colors, Radius, Spacing } from '@/constants/theme';

type HomeHeroProps = {
  onCreateRoute: () => void;
  image?: ImageSource | number;
};

/** Portada de la Home: foto a sangre con título y CTA para crear una ruta. */
export function HomeHero({ onCreateRoute, image }: HomeHeroProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.xxxl }]}>
      {image ? (
        <Photo source={image} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]} />
      )}
      <View style={styles.overlay} />

      <View style={styles.content}>
        <AppText variant="label" color="terracota">
          Mendoza, Argentina
        </AppText>
        <AppText variant="display" color="textOnPrimary">
          Explorá la cuna del Malbec
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={onCreateRoute}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
          <AppText variant="bodyBold" color="textOnPrimary">
            Crear mi ruta de viaje
          </AppText>
          <Icon name="arrowRight" size={14} color="textOnPrimary" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 320,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  fallback: {
    backgroundColor: Colors.wineDark,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(50, 30, 32, 0.35)',
  },
  content: {
    gap: Spacing.sm,
    maxWidth: 280,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.terracota,
  },
  ctaPressed: {
    opacity: 0.85,
  },
});
