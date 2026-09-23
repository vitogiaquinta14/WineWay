import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { Colors, Spacing } from '@/constants/theme';
import type { Viaje } from '@/data/viajes';

type NextTripCardProps = {
  viaje: Viaje;
  onPress: () => void;
};

export function NextTripCard({ viaje, onPress }: NextTripCardProps) {
  return (
    <Card onPress={onPress} accessibilityLabel={`Próximo viaje: ${viaje.titulo}`}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <AppText variant="bodyBold">{viaje.titulo}</AppText>
          <AppText variant="caption">{viaje.fechas}</AppText>
        </View>
        <Badge label="Planificado" />
      </View>

      <View style={styles.footer}>
        <Stat icon="winery" label={`${viaje.cantidadBodegas} Bodegas`} />
        <Stat icon="restaurant" label={`${viaje.cantidadAlmuerzos} Almuerzos`} />
      </View>
    </Card>
  );
}

function Stat({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={14} color="terracota" />
      <AppText variant="caption" color="text">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  titles: {
    flex: 1,
    gap: Spacing.xxs,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
