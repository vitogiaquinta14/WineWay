import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';

import { Colors, type ColorName } from '@/constants/theme';

type SymbolName = Exclude<ComponentProps<typeof SymbolView>['name'], string>;

/**
 * Iconos de la app: SF Symbols en iOS y Material Symbols en Android/web.
 * Para sumar uno nuevo, agregalo acá con su nombre en cada plataforma.
 */
const icons = {
  home: { ios: 'house', android: 'home', web: 'home' },
  explore: { ios: 'safari', android: 'explore', web: 'explore' },
  scan: { ios: 'barcode.viewfinder', android: 'barcode_scanner', web: 'barcode_scanner' },
  route: { ios: 'calendar', android: 'calendar_today', web: 'calendar_today' },
  cellar: { ios: 'archivebox', android: 'inventory_2', web: 'inventory_2' },
  wine: { ios: 'wineglass', android: 'wine_bar', web: 'wine_bar' },
  back: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  eye: { ios: 'eye', android: 'visibility', web: 'visibility' },
  eyeOff: { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' },
  star: { ios: 'star.fill', android: 'star', web: 'star' },
  pin: { ios: 'mappin', android: 'location_on', web: 'location_on' },
  arrowRight: { ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' },
  winery: { ios: 'building.2', android: 'domain', web: 'domain' },
  restaurant: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
  camera: { ios: 'camera.aperture', android: 'camera', web: 'camera' },
} satisfies Record<string, SymbolName>;

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorName;
};

export function Icon({ name, size = 22, color = 'text' }: IconProps) {
  return <SymbolView name={icons[name]} size={size} tintColor={Colors[color]} />;
}
