import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { Colors, Spacing } from '@/constants/theme';

type AuthHeaderProps = {
  title: string;
  subtitle: string;
};

/** Logo de Bodegueando + título y subtítulo de las pantallas de acceso. */
export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Icon name="wine" size={24} color="textOnPrimary" />
        </View>
        <AppText variant="heading">Bodegueando</AppText>
      </View>

      <View style={styles.texts}>
        <AppText variant="display" align="center">
          {title}
        </AppText>
        <AppText variant="body" color="textMuted" align="center">
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.xl,
  },
  brand: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.malbec,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
});
