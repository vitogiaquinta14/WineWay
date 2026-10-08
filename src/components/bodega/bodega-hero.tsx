import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Photo } from '@/components/ui/photo';
import { Colors, Spacing } from '@/constants/theme';
import type { Bodega } from '@/data/bodegas';

type BodegaHeroProps = {
  bodega: Bodega;
  favorita: boolean;
  onBack: () => void;
  onToggleFavorita: () => void;
};

/** Portada del detalle: foto, botones de volver y favorito, nombre y ubicación. */
export function BodegaHero({ bodega, favorita, onBack, onToggleFavorita }: BodegaHeroProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {bodega.imagen ? (
        <Photo source={bodega.imagen} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]} />
      )}
      <View style={styles.overlay} />

      <View style={[styles.actions, { top: insets.top + Spacing.sm }]}>
        <IconButton icon="back" variant="overlay" accessibilityLabel="Volver" onPress={onBack} />
        <IconButton
          icon={favorita ? 'heartFill' : 'heart'}
          variant="overlay"
          color={favorita ? 'terracota' : 'textOnPrimary'}
          accessibilityLabel={favorita ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          onPress={onToggleFavorita}
        />
      </View>

      <View style={styles.content}>
        <AppText variant="display" color="textOnPrimary">
          {bodega.nombre}
        </AppText>
        <View style={styles.location}>
          <Icon name="pin" size={12} color="textOnPrimary" />
          <AppText variant="caption" color="textOnPrimary">
            {bodega.localidad}, {bodega.zona}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    justifyContent: 'flex-end',
  },
  fallback: {
    backgroundColor: Colors.wineDark,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(50, 30, 32, 0.3)',
  },
  actions: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
