import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Keyboard, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './app-text';
import { Button } from './button';
import { Icon } from './icon';
import { IconButton } from './icon-button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { fechaVisible, hoyMendoza } from '@/utils/validar-cuenta';
import type { DateFieldProps } from './date-field.types';

// El control Android devuelve el día en UTC; iOS devuelve una fecha local.
function fechaLocal(fecha: string) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(anio, mes - 1, dia, 12);
}
function fechaElegida(fecha: Date) {
  return Platform.OS === 'android'
    ? fecha.toISOString().slice(0, 10)
    : `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}
export function DateField({
  label,
  value,
  onChange,
  onBlur,
  required,
  error,
  disabled,
}: DateFieldProps) {
  const [abierto, setAbierto] = useState(false);
  const [borrador, setBorrador] = useState('');
  const cerrar = () => {
    setAbierto(false);
    onBlur();
  };
  const calendario = (
    <DateTimePicker
      value={fechaLocal(borrador || value || hoyMendoza())}
      mode="date"
      display={Platform.OS === 'ios' ? 'inline' : 'default'}
      presentation="dialog"
      themeVariant="light"
      locale="es_AR"
      accentColor={Colors.malbec}
      positiveButton={{ label: 'Elegir fecha' }}
      negativeButton={{ label: 'Cancelar' }}
      onDismiss={cerrar}
      onValueChange={(_, fecha) => {
        const elegida = fechaElegida(fecha);
        if (Platform.OS === 'android') {
          onChange(elegida);
          cerrar();
        } else setBorrador(elegida);
      }}
    />
  );
  return (
    <View style={{ gap: Spacing.sm }}>
      <AppText variant="label">
        {label}
        {required && <AppText color="error"> *</AppText>}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}${required ? ', obligatorio' : ''}: ${fechaVisible(value) || 'sin elegir'}`}
        accessibilityHint={error ?? 'Abrir calendario'}
        disabled={disabled}
        style={[styles.entrada, !!error && styles.invalid]}
        onPress={() => {
          Keyboard.dismiss();
          setBorrador(value || hoyMendoza());
          setAbierto(true);
        }}
      >
        <AppText color={value ? 'text' : 'textMuted'}>
          {fechaVisible(value) || 'Elegí tu fecha en el calendario'}
        </AppText>
        <Icon name="route" size={18} color="textMuted" />
      </Pressable>
      <AppText
        variant="caption"
        color={error ? 'error' : 'textMuted'}
        accessibilityLiveRegion="polite"
      >
        {error ?? 'Debés tener 18 años cumplidos.'}
      </AppText>
      {abierto &&
        (Platform.OS === 'android' ? (
          calendario
        ) : (
          <Modal transparent animationType="fade" visible onRequestClose={cerrar}>
            <View style={styles.fondo}>
              <View style={styles.modal} accessibilityViewIsModal>
                <IconButton
                  icon="back"
                  accessibilityLabel="Volver al formulario"
                  onPress={cerrar}
                />
                <AppText variant="heading">Fecha de nacimiento</AppText>
                {calendario}
                <Button
                  title="Elegir fecha"
                  onPress={() => {
                    onChange(borrador);
                    cerrar();
                  }}
                />
                <Button title="Cancelar" variant="outline" onPress={cerrar} />
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
    gap: Spacing.sm,
    minHeight: 48,
    padding: Spacing.md,
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
