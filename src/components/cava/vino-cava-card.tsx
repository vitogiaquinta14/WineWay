import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Photo } from '@/components/ui/photo';
import { StarRating } from '@/components/ui/star-rating';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { VinoGuardado } from '@/data/vinos';

/** Vino de la colección personal: datos, rating y nota privados. */
export function VinoCavaCard({ vino }: { vino: VinoGuardado }) {
  return (
    <Card style={styles.card}>
      <Photo source={vino.imagen} style={styles.image} />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText variant="bodyBold" numberOfLines={1} style={styles.name}>
            {vino.nombre}
          </AppText>
          <AppText variant="caption" color="malbec" style={styles.year}>
            {vino.anio}
          </AppText>
        </View>
        <AppText variant="caption">{vino.bodega}</AppText>
        <StarRating value={vino.rating} />

        {vino.nota.length > 0 && (
          <View style={styles.note}>
            <AppText variant="caption" color="text" style={styles.noteText}>
              “{vino.nota}”
            </AppText>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  image: {
    width: 64,
    height: 96,
    borderRadius: Radius.sm,
  },
  body: {
    flex: 1,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
  },
  year: {
    fontFamily: Fonts.bold,
  },
  note: {
    marginTop: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
  },
  noteText: {
    fontStyle: 'italic',
  },
});
