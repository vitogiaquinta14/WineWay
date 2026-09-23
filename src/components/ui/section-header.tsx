import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';

type SectionHeaderProps = {
  title: string;
  /** Texto del link a la derecha (ej. "Ver todas"). */
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({ title, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText variant="heading">{title}</AppText>
      {actionLabel && (
        <Pressable accessibilityRole="link" hitSlop={8} onPress={onActionPress}>
          <AppText variant="caption" color="malbec">
            {actionLabel}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
