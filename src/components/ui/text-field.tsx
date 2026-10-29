import { useState } from 'react';
import { Pressable, StyleSheet, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { AppTextInput } from '@/components/ui/app-text-input';
import { Icon } from '@/components/ui/icon';
import { Colors, Radius, Spacing } from '@/constants/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  /** Muestra el botón de ojo para ver u ocultar la contraseña. */
  password?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
};

export function TextField({
  label,
  password = false,
  required,
  error,
  hint,
  style,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const [hidden, setHidden] = useState(password);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <AppText variant="label">
        {label}
        {required && <AppText color="error"> *</AppText>}
      </AppText>
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
          !!error && styles.invalid,
        ]}
      >
        <AppTextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.malbec}
          secureTextEntry={hidden}
          autoCapitalize={password ? 'none' : undefined}
          autoCorrect={!password}
          accessibilityLabel={`${label}${required ? ', obligatorio' : ''}`}
          accessibilityHint={error ?? hint}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            hitSlop={8}
            onPress={() => setHidden((value) => !value)}
          >
            <Icon name={hidden ? 'eye' : 'eyeOff'} size={18} color="textMuted" />
          </Pressable>
        )}
      </View>
      {(error || hint) && (
        <AppText
          variant="caption"
          color={error ? 'error' : 'textMuted'}
          accessibilityLiveRegion="polite"
        >
          {error ?? hint}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },
  inputWrapperFocused: {
    borderColor: Colors.malbec,
  },
  invalid: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: 14,
    color: Colors.text,
  },
});
