import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';

type StarRatingProps = {
  /** Valor de 0 a 5. Se redondea a la estrella más cercana. */
  value: number;
  size?: number;
  /** Si se pasa, las estrellas se pueden tocar para elegir el puntaje. */
  onChange?: (value: number) => void;
};

/** Fila de 5 estrellas: de solo lectura, o editable si recibe onChange. */
export function StarRating({ value, size = 12, onChange }: StarRatingProps) {
  const filled = Math.round(value);

  if (!onChange) {
    return (
      <View
        style={styles.row}
        accessible
        accessibilityLabel={`${value.toFixed(1)} de 5 estrellas`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon key={star} name="star" size={size} color={star <= filled ? 'star' : 'border'} />
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.row, styles.editable]} accessibilityRole="adjustable">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          accessibilityRole="button"
          accessibilityLabel={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
          accessibilityState={{ selected: star <= filled }}
          hitSlop={4}
          onPress={() => onChange(star)}>
          <Icon name="star" size={size} color={star <= filled ? 'star' : 'border'} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.xxs,
  },
  editable: {
    gap: Spacing.xs,
  },
});
