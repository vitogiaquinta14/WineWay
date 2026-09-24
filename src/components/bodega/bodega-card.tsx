import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Photo } from '@/components/ui/photo';
import { Colors, Spacing } from '@/constants/theme';
import { formatPrecio, type Bodega } from '@/data/bodegas';

type BodegaCardProps = {
  bodega: Bodega;
  onPress: () => void;
};

/** Tarjeta grande del listado de Explorar. */
export function BodegaCard({ bodega, onPress }: BodegaCardProps) {
  return (
    <Card onPress={onPress} accessibilityLabel={bodega.nombre}>
      <Photo source={bodega.imagen} style={styles.image} />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText variant="heading" style={styles.title} numberOfLines={1}>
            {bodega.nombre}
          </AppText>
          <View style={styles.rating}>
            <Icon name="star" size={12} color="star" />
            <AppText variant="bodyBold">{bodega.rating.toFixed(1)}</AppText>
          </View>
        </View>

        <View style={styles.location}>
          <Icon name="pin" size={11} color="oliva" />
          <AppText variant="caption">{bodega.zona}</AppText>
        </View>
      </View>

      <View style={styles.footer}>
        <AppText variant="caption" color="text" numberOfLines={1} style={styles.experience}>
          {bodega.experienciaDestacada}
        </AppText>
        <AppText variant="bodyBold" color="malbec">
          {formatPrecio(bodega.precio)}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 170,
  },
  body: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  experience: {
    flex: 1,
  },
});
