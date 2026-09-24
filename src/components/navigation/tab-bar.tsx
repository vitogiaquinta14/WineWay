import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Colors, Shadow, Spacing } from '@/constants/theme';

/** Ícono de cada pestaña según el nombre del archivo de la ruta. */
const tabIcons: Record<string, IconName> = {
  index: 'home',
  explorar: 'explore',
  escanear: 'scan',
  'mi-ruta': 'route',
  'mi-cava': 'cellar',
};

/** Etiquetas estables para que cada categoría siempre se vea bajo su ícono. */
const tabLabels: Record<string, string> = {
  index: 'Inicio',
  explorar: 'Explorar',
  escanear: 'Escanear',
  'mi-ruta': 'Mi Ruta',
  'mi-cava': 'Mi Cava',
};

/** La pestaña central se dibuja como un botón circular destacado. */
const CENTER_TAB = 'escanear';

export function TabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label = tabLabels[route.name] ?? options.title ?? route.name;
        const icon = tabIcons[route.name] ?? 'home';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        if (route.name === CENTER_TAB) {
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}>
              <View style={[styles.centerButton, focused && styles.centerButtonFocused]}>
                <Icon name={icon} size={24} color="textOnPrimary" />
              </View>
              <AppText
                variant="caption"
                color={focused ? 'malbec' : 'textMuted'}
                style={[styles.label, focused && styles.labelFocused]}>
                {label}
              </AppText>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}>
            <Icon name={icon} size={20} color={focused ? 'malbec' : 'textMuted'} />
            <AppText
              variant="caption"
              color={focused ? 'malbec' : 'textMuted'}
              style={[styles.label, focused && styles.labelFocused]}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    minHeight: 66,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxs,
  },
  label: {
    fontSize: 10,
  },
  labelFocused: {
    fontWeight: '700',
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.malbec,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -Spacing.lg,
    borderWidth: 4,
    borderColor: Colors.surface,
    ...Shadow.card,
  },
  centerButtonFocused: {
    backgroundColor: Colors.wineDark,
  },
});
