import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';

/** Línea entre dos visitas con el tiempo estimado de traslado. */
export function TrasladoInfo({ minutos, destino }: { minutos: number; destino: string }) {
  return (
    <View style={styles.container}>
      <Icon name="car" size={12} color="textMuted" />
      <AppText variant="caption">
        {minutos} min en auto hasta {destino}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
});
