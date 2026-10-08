import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Colors, Radius, Spacing, type ColorName } from '@/constants/theme';

type BadgeTone = 'oliva' | 'terracota' | 'malbec';

const tones: Record<BadgeTone, { background: ColorName; text: ColorName }> = {
  oliva: { background: 'olivaSoft', text: 'oliva' },
  terracota: { background: 'terracotaSoft', text: 'terracota' },
  malbec: { background: 'malbecSoft', text: 'malbec' },
};

/** Etiqueta de estado pequeña (ej. "PLANIFICADO", "RECOMENDADO"). */
export function Badge({ label, tone = 'oliva' }: { label: string; tone?: BadgeTone }) {
  const colors = tones[tone];

  return (
    <View style={[styles.badge, { backgroundColor: Colors[colors.background] }]}>
      <AppText variant="label" color={colors.text} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.pill,
  },
  text: {
    fontSize: 9,
  },
});
