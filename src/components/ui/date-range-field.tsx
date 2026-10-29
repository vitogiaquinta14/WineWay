import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './app-text';
import { Button } from './button';
import { Icon } from './icon';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { fechaVisible } from '@/utils/validar-cuenta';
import { diasEntre } from '@/utils/formulario-ruta';

type Props = {
  inicio: string;
  fin: string;
  minimo: string;
  maximo: string;
  disabled?: boolean;
  error?: string;
  onChange: (inicio: string, fin: string) => void;
};
const semana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
function fechaUTC(fecha: string) { return new Date(`${fecha}T12:00:00Z`); }
function moverMes(mes: string, cantidad: number) {
  const fecha = fechaUTC(`${mes}-01`);
  fecha.setUTCMonth(fecha.getUTCMonth() + cantidad);
  return fecha.toISOString().slice(0, 7);
}

/** Un único calendario selecciona ambos extremos y destaca el tramo completo. */
export function DateRangeField({ inicio, fin, minimo, maximo, disabled, error, onChange }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [mes, setMes] = useState((inicio >= minimo && inicio <= maximo ? inicio : minimo).slice(0, 7));
  const [desde, setDesde] = useState(inicio);
  const [hasta, setHasta] = useState(fin);
  const [paso, setPaso] = useState<'inicio' | 'fin'>('inicio');
  const abrir = (campo: 'inicio' | 'fin') => {
    if (disabled) return;
    setDesde(inicio); setHasta(fin); setPaso(campo);
    const referencia = campo === 'fin' ? fin || inicio : inicio;
    setMes((referencia >= minimo && referencia <= maximo ? referencia : minimo).slice(0, 7));
    setAbierto(true);
  };
  const elegir = (fecha: string) => {
    if (paso === 'inicio' || !desde || fecha < desde) {
      setDesde(fecha); setHasta(''); setPaso('fin');
    } else {
      setHasta(fecha); setPaso('inicio');
    }
  };
  const primero = fechaUTC(`${mes}-01`);
  const espacios = (primero.getUTCDay() + 6) % 7;
  const ultimo = fechaUTC(`${moverMes(mes, 1)}-01`);
  ultimo.setUTCDate(0);
  const celdas = Math.ceil((espacios + ultimo.getUTCDate()) / 7) * 7;
  const titulo = primero.toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  return (
    <View style={{ gap: Spacing.sm }}>
      <View style={styles.fechas}>
        {(['inicio', 'fin'] as const).map((campo) => (
          <Pressable key={campo} disabled={disabled} accessibilityRole="button"
            accessibilityLabel={`Fecha de ${campo}: ${fechaVisible(campo === 'inicio' ? inicio : fin) || 'sin elegir'}`}
            onPress={() => abrir(campo)} style={[styles.fecha, abierto && paso === campo && styles.activa]}>
            <AppText variant="label">{campo === 'inicio' ? 'Inicio' : 'Fin'} <AppText color="error">*</AppText></AppText>
            <View style={styles.valor}>
              <AppText numberOfLines={1} style={{ flex: 1, minWidth: 0 }}>{fechaVisible(campo === 'inicio' ? inicio : fin) || 'Elegí fecha'}</AppText>
              <Icon name="route" size={18} color="textMuted" />
            </View>
          </Pressable>
        ))}
      </View>
      {abierto && (
        <View style={styles.calendario}>
          <AppText variant="bodyBold" accessibilityLiveRegion="polite">{paso === 'fin' ? 'Ahora elegí la fecha de fin' : 'Elegí la fecha de inicio'}</AppText>
          <View style={styles.mes}>
            <Pressable accessibilityRole="button" accessibilityLabel="Mes anterior" disabled={mes <= minimo.slice(0, 7)} onPress={() => setMes(moverMes(mes, -1))} style={styles.flecha}>
              <AppText color={mes <= minimo.slice(0, 7) ? 'textMuted' : 'malbec'}>‹</AppText>
            </Pressable>
            <AppText variant="bodyBold" style={{ flex: 1, textAlign: 'center' }}>{titulo}</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel="Mes siguiente" disabled={mes >= maximo.slice(0, 7)} onPress={() => setMes(moverMes(mes, 1))} style={styles.flecha}>
              <AppText color={mes >= maximo.slice(0, 7) ? 'textMuted' : 'malbec'}>›</AppText>
            </Pressable>
          </View>
          <View style={styles.grilla}>
            {semana.map((dia, i) => <View key={`s${i}`} style={styles.celda}><AppText variant="caption">{dia}</AppText></View>)}
            {Array.from({ length: celdas }, (_, i) => {
              const dia = i - espacios + 1;
              if (dia < 1 || dia > ultimo.getUTCDate()) return <View key={i} style={styles.celda} />;
              const fecha = `${mes}-${String(dia).padStart(2, '0')}`;
              const bloqueada = disabled || fecha < minimo || fecha > maximo;
              const extremo = fecha === desde || fecha === hasta;
              const dentro = !!desde && !!hasta && fecha >= desde && fecha <= hasta;
              return (
                <Pressable key={i} disabled={bloqueada} accessibilityRole="button"
                  accessibilityLabel={`${fechaVisible(fecha)}${fecha === desde ? ', inicio' : fecha === hasta ? ', fin' : dentro ? ', dentro del tramo' : ''}`}
                  accessibilityState={{ disabled: bloqueada, selected: extremo || dentro }}
                  onPress={() => elegir(fecha)} style={[styles.celda, dentro && styles.tramo, extremo && styles.extremo]}>
                  <AppText color={bloqueada ? 'textMuted' : extremo ? 'textOnPrimary' : 'text'} style={bloqueada && { opacity: 0.4 }}>{dia}</AppText>
                </Pressable>
              );
            })}
          </View>
          <AppText variant="caption" accessibilityLiveRegion="polite">{desde && hasta ? `${fechaVisible(desde)} al ${fechaVisible(hasta)} · ${diasEntre(desde, hasta)} días` : 'Tocá primero el inicio y después el fin del viaje.'}</AppText>
          <Button title="Confirmar fechas" disabled={disabled || !desde || !hasta || desde < minimo || hasta > maximo} onPress={() => { onChange(desde, hasta); setAbierto(false); }} />
          <Button title="Cancelar" variant="outline" onPress={() => setAbierto(false)} />
        </View>
      )}
      {error && <AppText variant="caption" color="error">{error}</AppText>}
    </View>
  );
}
const styles = StyleSheet.create({
  fechas: { flexDirection: 'row', gap: Spacing.sm },
  fecha: { flex: 1, minWidth: 0, padding: Spacing.md, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.surface },
  activa: { borderColor: Colors.malbec },
  valor: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  calendario: { padding: Spacing.sm, gap: Spacing.md, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.surface },
  mes: { flexDirection: 'row', alignItems: 'center' },
  flecha: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  grilla: { flexDirection: 'row', flexWrap: 'wrap' },
  celda: { width: '14.285714%', minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  tramo: { backgroundColor: Colors.malbecSoft },
  extremo: { backgroundColor: Colors.malbec, borderRadius: Radius.sm },
});
