import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { TextField } from '@/components/ui/text-field';
import { formatPrecio, type Bodega } from '@/data/bodegas';
import type { VisitaNueva } from '@/data/rutas';
import { useCatalogo } from '@/state/catalogo-context';
import { Spacing } from '@/constants/theme';
export function VisitaForm({
  bodega,
  fechaInicial = '',
  experienciaInicial = '',
  horaInicial = '',
  onGuardar,
  titulo = 'Agregar visita',
}: {
  bodega?: Bodega;
  fechaInicial?: string;
  experienciaInicial?: string;
  horaInicial?: string;
  onGuardar: (visita: VisitaNueva) => Promise<void>;
  titulo?: string;
}) {
  const { bodegas } = useCatalogo();
  const opciones = (bodega ? [bodega] : bodegas)
    .filter((b) => b.activa)
    .flatMap((b) => b.experiencias.map((e) => ({ ...e, bodegaNombre: b.nombre })));
  const [experienciaId, setExperiencia] = useState(experienciaInicial);
  const [fecha, setFecha] = useState(fechaInicial);
  const [hora, setHora] = useState(horaInicial);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const seleccion = opciones.find((e) => e.id === experienciaId);
  const enviar = async () => {
    setError(null);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
      setError('Completá fecha YYYY-MM-DD y hora HH:MM.');
      return;
    }
    const inicio = new Date(`${fecha}T${hora}:00-03:00`);
    if (Number.isNaN(inicio.getTime())) {
      setError('Fecha inválida.');
      return;
    }
    setGuardando(true);
    try {
      await onGuardar({ experienciaId, inicio: inicio.toISOString() });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };
  return (
    <View style={{ gap: Spacing.md }}>
      <AppText variant="heading">{titulo}</AppText>
      <ScrollView horizontal contentContainerStyle={{ gap: Spacing.sm }}>
        {opciones.map((e) => (
          <Chip
            key={e.id}
            label={`${e.bodegaNombre}: ${e.nombre}`}
            selected={experienciaId === e.id}
            onPress={() => setExperiencia(e.id)}
          />
        ))}
      </ScrollView>
      {seleccion && (
        <>
          <AppText>
            {formatPrecio(seleccion.precioCentavos / 100)} / persona · {seleccion.duracionMin} min
          </AppText>
          <AppText variant="caption">
            {seleccion.horarios
              .map(
                (h) =>
                  `${['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][h.dia]} ${horaDeMin(h.desde)}${h.tipo === 'FLEXIBLE' ? `–${horaDeMin(h.hasta)}` : ''}`,
              )
              .join(' · ')}
          </AppText>
        </>
      )}
      <TextField label="Fecha (YYYY-MM-DD)" value={fecha} onChangeText={setFecha} />
      <TextField
        label="Hora local de Mendoza (HH:MM)"
        value={hora}
        onChangeText={setHora}
        placeholder="09:00"
      />
      {error && <AppText color="malbec">{error}</AppText>}
      <Button
        title={guardando ? 'Guardando…' : titulo}
        disabled={!experienciaId || guardando}
        onPress={() => void enviar()}
      />
    </View>
  );
}
function horaDeMin(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}
