import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Colors, Spacing } from '@/constants/theme';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  description?: string;
};

/** Estado vacío o sin resultados. */
export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={26} color="malbec" />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      {description && (
        <AppText variant="body" color="textMuted" align="center">
          {description}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.malbecSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
});
