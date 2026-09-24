import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import type { Experiencia } from '@/data/bodegas';

export function ExperienciaCard({ experiencia }: { experiencia: Experiencia }) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText variant="bodyBold" style={styles.title}>
          {experiencia.nombre}
        </AppText>
        <AppText variant="bodyBold" color="malbec">
          USD {experiencia.precioUsd}
        </AppText>
      </View>
      <AppText variant="caption">{experiencia.descripcion}</AppText>
      <View style={styles.duration}>
        <Icon name="clock" size={12} color="textMuted" />
        <AppText variant="caption">Duración: {experiencia.duracionHoras} h</AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
});
