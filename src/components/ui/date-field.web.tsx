import { View } from 'react-native';
import { AppText } from './app-text';
import { Icon } from './icon';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { fechaVisible } from '@/utils/validar-cuenta';
import type { DateFieldProps } from './date-field.types';

export function DateField({
  label,
  value,
  onChange,
  onBlur,
  required,
  error,
  disabled,
}: DateFieldProps) {
  return (
    <View style={{ gap: Spacing.sm }}>
      <AppText variant="label">
        {label}
        {required && <AppText color="error"> *</AppText>}
      </AppText>
      <View
        style={{
          position: 'relative',
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
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: Spacing.sm,
            padding: Spacing.md,
          }}
        >
          <AppText color={value ? 'text' : 'textMuted'}>
            {fechaVisible(value) || 'Elegí tu fecha en el calendario'}
          </AppText>
          <Icon name="route" size={18} color="textMuted" />
        </View>
        <input
          type="date"
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
        {error ?? 'Debés tener 18 años cumplidos.'}
      </AppText>
    </View>
  );
}
