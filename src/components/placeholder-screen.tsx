import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';

type PlaceholderScreenProps = {
  title: string;
  description?: string;
  /** Links o botones para probar la navegación mientras se construye la pantalla. */
  children?: ReactNode;
};

/** Pantalla provisoria: se reemplaza por el diseño real en los próximos pasos. */
export function PlaceholderScreen({ title, description, children }: PlaceholderScreenProps) {
  return (
    <Screen>
      <View style={styles.container}>
        <AppText variant="title" align="center">
          {title}
        </AppText>
        <AppText variant="caption" align="center">
          {description ?? 'Pantalla en construcción'}
        </AppText>
        {children && <View style={styles.actions}>{children}</View>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
});
