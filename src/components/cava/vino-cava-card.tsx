import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Photo } from '@/components/ui/photo';
import { StarRating } from '@/components/ui/star-rating';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { VinoGuardado } from '@/data/vinos';

/** Vino de la colección personal: datos, rating y nota privados. */
export function VinoCavaCard({ vino, onQuitar }: { vino: VinoGuardado; onQuitar?: () => void }) {
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
          {onQuitar && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Quitar ${vino.nombre} de mi cava`}
              hitSlop={8}
              onPress={onQuitar}>
              <Icon name="delete" size={18} color="malbec" />
            </Pressable>
          )}
        </View>
        <AppText variant="caption">{vino.bodega}</AppText>
        {vino.rating === null ? (
          <AppText variant="caption">Sin valoración</AppText>
        ) : (
          <StarRating value={vino.rating} />
        )}

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
