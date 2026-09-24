import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Photo } from '@/components/ui/photo';
import { Spacing } from '@/constants/theme';
import type { VinoDestacado } from '@/data/bodegas';

/** Tarjeta de vino destacado para el carrusel del detalle de bodega. */
export function VinoCard({ vino }: { vino: VinoDestacado }) {
  return (
    <Card style={styles.card}>
      <Photo source={vino.imagen} style={styles.image} />
      <View style={styles.body}>
        <AppText variant="bodyBold" numberOfLines={1}>
          {vino.nombre}
        </AppText>
        <View style={styles.meta}>
          <AppText variant="caption">{vino.anio}</AppText>
          <AppText variant="caption" color="malbec" style={styles.score}>
            {vino.puntaje} pts
          </AppText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
  },
  image: {
    width: '100%',
    height: 100,
  },
  body: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  score: {
    fontWeight: '700',
  },
});
