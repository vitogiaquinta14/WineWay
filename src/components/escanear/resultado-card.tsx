import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { AppTextInput } from '@/components/ui/app-text-input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Photo } from '@/components/ui/photo';
import { StarRating } from '@/components/ui/star-rating';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { VinoIdentificado } from '@/data/vinos';

type ResultadoCardProps = {
  vino: VinoIdentificado;
  rating: number;
  nota: string;
  onRatingChange: (rating: number) => void;
  onNotaChange: (nota: string) => void;
  onGuardar: () => void;
};

/** Vino identificado + puntuación y nota personales para guardarlo en Mi Cava. */
export function ResultadoCard({
  vino,
  rating,
  nota,
  onRatingChange,
  onNotaChange,
  onGuardar,
}: ResultadoCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.wine}>
        <Photo source={vino.imagen} style={styles.image} />
        <View style={styles.info}>
          <AppText variant="heading">{vino.nombre}</AppText>
          <AppText variant="caption" color="text">
            {vino.bodega}
          </AppText>
          <AppText variant="caption">
            {vino.varietal} · {vino.anio} · {vino.region}
          </AppText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.ratingRow}>
        <AppText variant="bodyBold">Tu puntuación</AppText>
        <StarRating value={rating} size={22} onChange={onRatingChange} />
      </View>

      <AppTextInput
        style={styles.note}
        value={nota}
        onChangeText={onNotaChange}
        placeholder="Agregar una nota de cata..."
        placeholderTextColor={Colors.textMuted}
        selectionColor={Colors.malbec}
        multiline
        textAlignVertical="top"
      />

      <Button title="Guardar en Mi Cava" onPress={onGuardar} disabled={rating === 0} />
      {rating === 0 && (
        <AppText variant="caption" align="center">
          Elegí una puntuación para guardarlo.
        </AppText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  wine: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  image: {
    width: 64,
    height: 88,
    borderRadius: Radius.sm,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  note: {
    minHeight: 72,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    fontSize: 14,
    color: Colors.text,
  },
});
