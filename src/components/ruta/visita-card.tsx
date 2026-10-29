import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Colors, Spacing } from '@/constants/theme';
import type { Bodega } from '@/data/bodegas';
import { horaMendoza, type Visita } from '@/data/rutas';

type VisitaCardProps = {
  visita: Visita;
  bodega: Bodega;
  onPress: () => void;
  /** Por defecto "Planificado": la visita está planificada, no reservada. */
  badge?: string;
  /** Sin onDelete no se muestra el tachito (ej. en una propuesta). */
  onDelete?: () => void;
};

/** Una visita del itinerario: horario, bodega, actividad y acciones. */
export function VisitaCard({
  visita,
  bodega,
  onPress,
  badge = 'Planificado',
  onDelete,
}: VisitaCardProps) {
  return (
    <Card onPress={onPress} style={styles.card} accessibilityLabel={bodega.nombre}>
      <View style={styles.time}>
        <AppText variant="subtitle">{horaMendoza(visita.inicio) ?? '--:--'}</AppText>
        <AppText variant="caption">HS</AppText>
      </View>

      <View style={styles.info}>
        <AppText variant="bodyBold" numberOfLines={1}>
          {bodega.nombre}
        </AppText>
        <AppText variant="caption" numberOfLines={1}>
          {visita.nombreExperiencia}
        </AppText>
        <AppText variant="caption">Duración: {visita.duracionMin} min</AppText>
      </View>

      <View style={styles.side}>
        <Badge label={badge} tone="terracota" />
        {onDelete && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Quitar ${bodega.nombre}`}
            hitSlop={8}
            onPress={onDelete}>
            <Icon name="delete" size={18} color="malbec" />
          </Pressable>
        )}
      </View>
    </Card>
  );
}


const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  time: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: Spacing.md,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: Colors.border,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.xxs,
  },
  side: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
});
