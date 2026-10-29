import { View } from 'react-native';
import { AppText } from './app-text';
import { Icon } from './icon';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { TimeFieldProps } from './time-field.types';

/** Selector de hora y minutos del navegador, con el aspecto de los demás campos. */
export function TimeField({ label, value, onChange, minimo, required, error, disabled }: TimeFieldProps) {
  return (
    <View style={{ gap: Spacing.sm, width: '100%', minWidth: 0 }}>
      <AppText variant="label">
        {label}
        {required && <AppText color="error"> *</AppText>}
      </AppText>
      <View
        style={{
          position: 'relative',
          minHeight: 48,
          justifyContent: 'center',
          borderWidth: error ? 2 : 1,
          borderColor: error ? Colors.error : Colors.border,
          borderRadius: Radius.md,
          backgroundColor: Colors.surface,
        }}
      >
        <View pointerEvents="none" style={{ paddingHorizontal: Spacing.md }}>
          <AppText color={value ? 'text' : 'textMuted'}>{value || 'Elegí hora'}</AppText>
        </View>
        <View pointerEvents="none" style={{ position: 'absolute', right: Spacing.md, top: 15 }}>
          <Icon name="clock" size={18} color="textMuted" />
        </View>
        <input
          type="time"
          step={60}
          min={minimo}
          value={value}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-label={`${label}: ${value || 'sin elegir'}`}
          onChange={(event) => event.currentTarget.value && onChange(event.currentTarget.value)}
          onClick={(event) => {
            try {
              event.currentTarget.showPicker?.();
            } catch {
              // Si el navegador no deja abrirlo acá, queda la apertura nativa.
            }
          }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
        />
      </View>
      {error && <AppText variant="caption" color="error">{error}</AppText>}
    </View>
  );
}
