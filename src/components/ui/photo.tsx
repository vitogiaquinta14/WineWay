import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Colors } from '@/constants/theme';

type PhotoProps = {
  source?: ImageSource | number;
  style?: StyleProp<ViewStyle>;
  /** Ícono que se muestra mientras no haya foto. */
  placeholderIcon?: IconName;
};

/** Foto con placeholder mientras todavía no hay imagen cargada. */
export function Photo({ source, style, placeholderIcon = 'wine' }: PhotoProps) {
  return (
    <View style={[styles.container, style]}>
      {source ? (
        <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      ) : (
        <Icon name={placeholderIcon} size={28} color="textMuted" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
