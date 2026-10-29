import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Keyboard, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './app-text';
import { Button } from './button';
import { Icon } from './icon';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { TimeFieldProps } from './time-field.types';

// Sólo importan hora y minutos: el día del Date es indistinto.
function comoFecha(hora: string) {
  const [h, m] = (hora || '10:00').split(':').map(Number);
  const fecha = new Date();
  fecha.setHours(h, m, 0, 0);
  return fecha;
}
function comoHora(fecha: Date) {
  return `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
}

/** Reloj nativo de hora y minutos (24 h): diálogo en Android, ruedas en iOS. */
export function TimeField({ label, value, onChange, required, error, disabled }: TimeFieldProps) {
  const [abierto, setAbierto] = useState(false);
  const [borrador, setBorrador] = useState(value);
  const reloj = (
    <DateTimePicker
      value={comoFecha(borrador || value)}
      mode="time"
      is24Hour
      display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
      presentation="dialog"
      themeVariant="light"
      locale="es_AR"
      accentColor={Colors.malbec}
      positiveButton={{ label: 'Elegir hora' }}
      negativeButton={{ label: 'Cancelar' }}
      onDismiss={() => setAbierto(false)}
      onValueChange={(_, fecha) => {
        if (Platform.OS === 'android') {
          onChange(comoHora(fecha));
          setAbierto(false);
        } else setBorrador(comoHora(fecha));
      }}
    />
  );
  return (
    <View style={{ gap: Spacing.sm, width: '100%', minWidth: 0 }}>
      <AppText variant="label">
        {label}
        {required && <AppText color="error"> *</AppText>}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || 'sin elegir'}`}
        accessibilityHint={error ?? 'Abrir reloj'}
        disabled={disabled}
        style={[styles.entrada, !!error && styles.invalid]}
        onPress={() => {
          Keyboard.dismiss();
          setBorrador(value);
          setAbierto(true);
        }}
      >
        <AppText color={value ? 'text' : 'textMuted'}>{value || 'Elegí hora'}</AppText>
        <Icon name="clock" size={18} color="textMuted" />
      </Pressable>
      {error && <AppText variant="caption" color="error">{error}</AppText>}
      {abierto &&
        (Platform.OS === 'android' ? (
          reloj
        ) : (
          <Modal transparent animationType="fade" visible onRequestClose={() => setAbierto(false)}>
            <View style={styles.fondo}>
              <View style={styles.modal} accessibilityViewIsModal>
                <AppText variant="heading">{label}</AppText>
                {reloj}
                <Button
                  title="Elegir hora"
                  onPress={() => {
                    onChange(borrador);
                    setAbierto(false);
                  }}
                />
                <Button title="Cancelar" variant="outline" onPress={() => setAbierto(false)} />
              </View>
            </View>
          </Modal>
        ))}
    </View>
  );
}
const styles = StyleSheet.create({
  entrada: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  invalid: { borderColor: Colors.error, borderWidth: 2 },
  fondo: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: Spacing.lg,
  },
  modal: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
});
