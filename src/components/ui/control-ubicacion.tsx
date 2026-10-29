import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import type { useMiUbicacion } from '@/state/use-mi-ubicacion';

/** Aviso y botón "Usar mi ubicación" que flotan sobre un mapa. */
export function ControlUbicacion({ ubicacion }: { ubicacion: ReturnType<typeof useMiUbicacion> }) {
  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {ubicacion.mensaje && (
        <View style={styles.statusCard} pointerEvents="none">
          <AppText variant="caption" color="text">
            {ubicacion.mensaje}
          </AppText>
        </View>
      )}
      <View pointerEvents="auto">
        <Button
          title={ubicacion.textoBoton}
          variant={ubicacion.estado === 'lista' ? 'secondary' : 'outline'}
          icon="pin"
          disabled={ubicacion.estado === 'buscando'}
          onPress={() => void ubicacion.usar()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.lg,
    left: Spacing.lg,
    gap: Spacing.sm,
    zIndex: 1000,
  },
  statusCard: {
    alignSelf: 'stretch',
    borderRadius: Radius.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    ...Shadow.card,
  },
});
