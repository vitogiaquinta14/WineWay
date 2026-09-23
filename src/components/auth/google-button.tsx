import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';

type GoogleButtonProps = {
  title: string;
  onPress?: () => void;
};

/** Botón de acceso con Google. Por ahora solo visual (sin integración). */
export function GoogleButton({ title, onPress }: GoogleButtonProps) {
  return <Button title={title} variant="outline" leading={<GoogleMark />} onPress={onPress} />;
}

function GoogleMark() {
  return (
    <View style={styles.mark}>
      <AppText style={styles.letter}>G</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
});
