import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';

type StarRatingProps = {
  /** Valor de 0 a 5. Se redondea a la estrella más cercana. */
  value: number;
  size?: number;
};

/** Fila de 5 estrellas de solo lectura. */
export function StarRating({ value, size = 12 }: StarRatingProps) {
  const filled = Math.round(value);

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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.xxs,
  },
});
