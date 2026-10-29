import { View } from 'react-native';
import { AppText } from './app-text';
import { Icon } from './icon';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { fechaVisible } from '@/utils/validar-cuenta';
import type { DateFieldProps } from './date-field.types';

export function DateField({
  label,
  hint = 'Debés tener 18 años cumplidos.',
  minimumDate,
  maximumDate,
  value,
  onChange,
  onBlur,
  required,
  error,
  disabled,
}: DateFieldProps) {
  return (
    <View style={{ gap: Spacing.sm, width: '100%', minWidth: 0 }}>
      <AppText variant="label">
        {label}
        {required && <AppText color="error"> *</AppText>}
      </AppText>
      <View
        style={{
          position: 'relative',
          width: '100%',
          minWidth: 0,
          overflow: 'hidden',
          minHeight: 48,
          borderWidth: error ? 2 : 1,
          borderColor: error ? Colors.error : Colors.border,
          borderRadius: Radius.md,
          backgroundColor: Colors.surface,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            minHeight: 48,
            justifyContent: 'center',
            paddingVertical: Spacing.md,
            paddingLeft: Spacing.md,
            paddingRight: Spacing.md + 18 + Spacing.sm,
          }}
        >
          <AppText color={value ? 'text' : 'textMuted'} numberOfLines={1} style={{ minWidth: 0 }}>
            {fechaVisible(value) || 'Elegí fecha'}
          </AppText>
        </View>
        <View pointerEvents="none" style={{ position: 'absolute', right: Spacing.md, top: 15, width: 18, height: 18 }}>
          <Icon name="route" size={18} color="textMuted" />
        </View>
        <input
          type="date"
          min={minimumDate}
          max={maximumDate}
          value={value}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-label={`${label}${required ? ', obligatorio' : ''}: ${fechaVisible(value) || 'sin elegir'}`}
          onChange={(event) => onChange(event.currentTarget.value)}
          onBlur={onBlur}
          onClick={(event) => {
            if (typeof event.currentTarget.showPicker === 'function') {
              try {
                event.currentTarget.showPicker();
                event.preventDefault();
              } catch {
                // Conserva la apertura nativa si el navegador no permite showPicker aquí.
              }
            }
          }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        />
      </View>
      <AppText
        variant="caption"
        color={error ? 'error' : 'textMuted'}
        accessibilityLiveRegion="polite"
      >
        {error ?? hint}
      </AppText>
    </View>
  );
}
