import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Colors, Radius, Spacing } from '@/constants/theme';

type SearchFieldProps = Pick<TextInputProps, 'value' | 'onChangeText' | 'placeholder'>;

export function SearchField(props: SearchFieldProps) {
  return (
    <View style={styles.container}>
      <Icon name="search" size={16} color="textMuted" />
      <TextInput
        style={styles.input}
        placeholderTextColor={Colors.textMuted}
        selectionColor={Colors.malbec}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="while-editing"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.text,
  },
});
