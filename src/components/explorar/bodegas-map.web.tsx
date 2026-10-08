import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacing } from '@/constants/theme';
import type { Bodega } from '@/data/bodegas';

type BodegasMapProps = {
  bodegas: Bodega[];
};

/** react-native-maps es nativo; en web se conserva una alternativa clara. */
export function BodegasMap({ bodegas }: BodegasMapProps) {
  if (bodegas.length === 0) {
    return (
      <EmptyState
        icon="map"
        title="Sin bodegas en el mapa"
        description="Cambiá los filtros para ver marcadores en Mendoza."
      />
    );
  }

  return (
    <View style={styles.container}>
      <EmptyState
        icon="map"
        title="Mapa disponible en la app móvil"
        description="Abrí WineWay en Android o iOS para ver las bodegas y usar tu ubicación."
      />
      <AppText variant="caption" align="center">
        {bodegas.length} bodegas coinciden con tus filtros.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.md,
  },
});
