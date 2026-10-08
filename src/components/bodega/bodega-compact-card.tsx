import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Photo } from '@/components/ui/photo';
import { StarRating } from '@/components/ui/star-rating';
import { Spacing } from '@/constants/theme';
import type { Bodega } from '@/data/bodegas';

type BodegaCompactCardProps = {
  bodega: Bodega;
  onPress: () => void;
};

/** Tarjeta chica para carruseles horizontales (ej. "Bodegas recomendadas"). */
export function BodegaCompactCard({ bodega, onPress }: BodegaCompactCardProps) {
  return (
    <Card onPress={onPress} style={styles.card} accessibilityLabel={bodega.nombre}>
      <Photo source={bodega.imagen} style={styles.image} />
      <View style={styles.body}>
        <AppText variant="bodyBold" numberOfLines={1}>
          {bodega.nombre}
        </AppText>
        <View style={styles.location}>
          <Icon name="pin" size={11} color="oliva" />
          <AppText variant="caption" numberOfLines={1}>
            {bodega.localidad}
          </AppText>
        </View>
        <View style={styles.rating}>
          <StarRating value={bodega.rating} />
          <AppText variant="caption" color="text">
            {bodega.rating.toFixed(1)}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
  },
  image: {
    width: '100%',
    height: 120,
  },
  body: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
});
