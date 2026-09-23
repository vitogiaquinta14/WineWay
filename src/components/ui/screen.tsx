import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

type ScreenProps = {
  children: ReactNode;
  /** Envuelve el contenido en un ScrollView. */
  scroll?: boolean;
  /** Aplica el padding horizontal estándar. */
  padded?: boolean;
  /** Bordes con safe area. Por defecto solo el superior (la tab bar maneja el inferior). */
  edges?: Edge[];
};

export function Screen({ children, scroll = false, padded = true, edges = ['top'] }: ScreenProps) {
  const contentStyle = [padded && styles.padded];

  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[contentStyle, styles.scrollContent]}
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
  },
});
