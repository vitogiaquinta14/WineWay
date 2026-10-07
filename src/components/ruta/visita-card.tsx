import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { Colors, Spacing } from '@/constants/theme';
import type { Bodega } from '@/data/bodegas';
import type { Visita } from '@/data/rutas';

type VisitaCardProps = {
  visita: Visita;
  bodega: Bodega;
  onPress: () => void;
  /** Por defecto "Planificado": la visita está planificada, no reservada. */
  badge?: string;
  /** Sin onEdit/onDelete no se muestran acciones (ej. en una propuesta). */
  onEdit?: () => void;
  onDelete?: () => void;
};

/** Una visita del itinerario: horario, bodega, actividad y acciones. */
export function VisitaCard({
  visita,
  bodega,
  onPress,
  badge = 'Planificado',
  onEdit,
  onDelete,
}: VisitaCardProps) {
  return (
    <Card onPress={onPress} style={styles.card} accessibilityLabel={bodega.nombre}>
      <View style={styles.time}>
        <AppText variant="subtitle">{visita.hora ?? '--:--'}</AppText>
        <AppText variant="caption">HS</AppText>
      </View>

      <View style={styles.info}>
        <AppText variant="bodyBold" numberOfLines={1}>
          {bodega.nombre}
        </AppText>
        <AppText variant="caption" numberOfLines={1}>
          {visita.actividad}
        </AppText>
        <AppText variant="caption">Duración: {visita.duracionMin} min</AppText>
      </View>

      <View style={styles.side}>
        <Badge label={badge} tone="terracota" />
        {(onEdit || onDelete) && (
          <View style={styles.actions}>
            {onEdit && (
              <SmallAction icon="edit" label={`Editar ${bodega.nombre}`} onPress={onEdit} />
            )}
            {onDelete && (
              <SmallAction icon="delete" label={`Quitar ${bodega.nombre}`} onPress={onDelete} />
            )}
          </View>
        )}
      </View>
    </Card>
  );
}

function SmallAction({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={8} onPress={onPress}>
      <Icon name={icon} size={16} color="malbec" />
    </Pressable>
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
