import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { TextField } from '@/components/ui/text-field';
import { SearchField } from '@/components/ui/search-field';
import { normalizar } from '@/utils/texto';
import { Chip } from '@/components/ui/chip';
import { useRuta } from '@/state/ruta-context';
import { useCatalogo } from '@/state/catalogo-context';
import { useRecurso } from '@/state/use-recurso';
import { api } from '@/services/api';
import type { Bodega } from '@/data/bodegas';
import { DateRangeField } from '@/components/ui/date-range-field';
import { TimeField } from '@/components/ui/time-field';
import { hoyMendoza } from '@/utils/validar-cuenta';
import { sumarDias, diasEntre, limiteRuta, validarFormularioRuta, ajustarFin } from '@/utils/formulario-ruta';
import { Colors, Radius, Spacing } from '@/constants/theme';

const horaValida = (hora: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
const minutos = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

export default function CrearRutaScreen() {
  // `aviso=sin-rutas` llega desde "Agregar a ruta" cuando todavía no hay ninguna.
  const params = useLocalSearchParams<{ id?: string; aviso?: string }>();
  const { generar, editar, rutas } = useRuta();
  const existente = rutas.find((r) => r.id === params.id);
  const { bodegas, cargando: cargandoCatalogo, error: errorCatalogo, recargar: recargarCatalogo } = useCatalogo();
  const [busqueda, setBusqueda] = useState('');
  const cargarFavoritas = useCallback(
    () => (existente ? Promise.resolve([]) : api<Bodega[]>('/favoritos')),
    [existente],
  );
  const { datos: favoritas } = useRecurso<Bodega[]>(cargarFavoritas, []);
  const [nombre, setNombre] = useState(existente?.nombre ?? '');
  const [fechaInicio, setFecha] = useState(existente?.fechaInicio ?? '');
  const [fechaFin, setFechaFin] = useState(existente ? sumarDias(existente.fechaInicio, existente.cantidadDias - 1) : '');
  const [errores, setErrores] = useState<Record<string, string>>({});
  // La API persiste inicio + duración; las dos fechas son la fuente del formulario.
  const cantidadDias = diasEntre(fechaInicio, fechaFin);
  const [personas, setPersonas] = useState(String(existente?.cantidadPersonas ?? 1));
  const [presupuesto, setPresupuesto] = useState(
    existente ? String(existente.presupuestoPersonaCentavos / 100) : '',
  );
  const [cantidadVisitas, setCantidadVisitas] = useState('2');
  const [cantidadAlmuerzos, setCantidadAlmuerzos] = useState('0');
  const [imprescindibles, setImprescindibles] = useState<string[]>([]);
  const [desde, setDesde] = useState('10:00');
  const [hasta, setHasta] = useState('18:00');
  const [finRechazado, setFinRechazado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const validar = (generacion: boolean) => {
    const fallos = validarFormularioRuta({ fechaInicio, fechaFin, personas, presupuesto, cantidadVisitas, cantidadAlmuerzos, automatico: generacion });
    if (generacion) {
      if (Number(cantidadVisitas) < imprescindibles.length) fallos.cantidadVisitas = 'La cantidad debe incluir todas las imprescindibles seleccionadas.';
      if (!horaValida(desde)) fallos.desde = 'Ingresá una hora válida (HH:MM).';
      if (!horaValida(hasta)) fallos.hasta = 'Ingresá una hora válida (HH:MM).';
      if (!fallos.desde && !fallos.hasta && hasta <= desde) fallos.hasta = 'El fin debe ser posterior al comienzo.';
    }
    return fallos;
  };
  const fallosActuales = validar(!existente);
  const formularioValido = Object.keys(fallosActuales).length === 0;
  const errorCampo = (campo: string, valor: string) =>
    valor.trim() ? fallosActuales[campo] : errores[campo];
  const guardar = async () => {
    const fallos = validar(!existente);
    setErrores(fallos);
    if (Object.keys(fallos).length) { setError('Revisá los campos indicados antes de continuar.'); return; }
    setGuardando(true);
    setError(null);
    try {
      const datos = {
        nombre: nombre.trim() || `Mi ruta ${fechaInicio}`,
        fechaInicio,
        cantidadDias,
        cantidadPersonas: Number(personas),
        presupuestoPersonaCentavos: Number(presupuesto) * 100,
      };
      if (existente) {
        await editar(existente.id, datos);
        router.back();
      } else {
        const nueva = await generar({ ...datos, cantidadVisitas: Number(cantidadVisitas), cantidadAlmuerzos: Number(cantidadAlmuerzos), imprescindibles,
          desdeMin: minutos(desde), hastaMin: minutos(hasta) });
        router.replace({ pathname: '/ruta/[id]', params: { id: nueva.id } });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };
  // Imprescindibles: arriba favoritas y ya elegidas; el buscador suma el resto del catálogo.
  const fijas = bodegas.filter((b) => b.activa && (imprescindibles.includes(b.id) || favoritas.some((f) => f.id === b.id)));
  const encontradas = busqueda.trim()
    ? bodegas.filter((b) => b.activa && !fijas.includes(b) && normalizar(`${b.nombre} ${b.zona}`).includes(normalizar(busqueda)))
    : [];
  const alternarImprescindible = (id: string) => {
    if (imprescindibles.includes(id)) {
      setImprescindibles(imprescindibles.filter((i) => i !== id));
    } else if (imprescindibles.length < 12) {
      const siguientes = [...imprescindibles, id];
      setImprescindibles(siguientes);
      setCantidadVisitas((valor) => String(Math.max(Number(valor) || 0, siguientes.length)));
    }
  };
  const chipImprescindible = (b: Bodega) => (
    <Chip key={b.id} label={b.nombre} selected={imprescindibles.includes(b.id)} onPress={() => alternarImprescindible(b.id)} />
  );
  return (
    <Screen scroll>
      <View style={{ gap: Spacing.lg, paddingVertical: Spacing.lg }}>
        <IconButton icon="back" accessibilityLabel="Volver" onPress={() => router.back()} />
        <AppText variant="title">{existente ? 'Recalcular ruta' : 'Crear mi ruta'}</AppText>
        {!existente && params.aviso === 'sin-rutas' && (
          <AppText color="malbec">Todavía no tenés una ruta planeada. Creala para poder agregarle visitas.</AppText>
        )}
        {existente && <AppText variant="caption">Cambiá fechas, personas o presupuesto y se recalculan los costos de la ruta. Las visitas se mantienen.</AppText>}
        <AppText variant="caption">Los campos con * son obligatorios.</AppText>
        <TextField label="Nombre de la ruta (opcional)" value={nombre} onChangeText={setNombre} />
        <View style={styles.booking}>
          <AppText variant="heading">Tu viaje</AppText>
          <DateRangeField inicio={fechaInicio} fin={fechaFin} minimo={hoyMendoza()} maximo={limiteRuta()} disabled={guardando}
            error={errorCampo('fechaInicio', fechaInicio) || errorCampo('fechaFin', fechaFin)}
            onChange={(inicio, fin) => { setFecha(inicio); setFechaFin(fin); }} />
          <View style={styles.row}>
            <View style={styles.field}><TextField label="Personas" required value={personas} onChangeText={setPersonas} keyboardType="number-pad" inputMode="numeric" error={errorCampo('personas', personas)} /></View>
          </View>
          <TextField label="Presupuesto por persona (ARS)" required value={presupuesto} onChangeText={setPresupuesto} keyboardType="number-pad" inputMode="numeric" error={errorCampo('presupuesto', presupuesto)} placeholder="Ej. 150000" hint="Para las experiencias de todo el viaje." />
          <View style={styles.summary}>
            <AppText variant="caption">Presupuesto total del grupo</AppText>
            <AppText variant="heading">ARS {(Number(presupuesto) * Number(personas) || 0).toLocaleString('es-AR')}</AppText>
          </View>
        </View>
        {!existente && (
          <>
            <View style={styles.booking}>
              <AppText variant="heading">Tus preferencias</AppText>
              <View style={styles.row}>
                <View style={styles.field}><TextField label="Visitas (máx. 12)" required value={cantidadVisitas}
                  onChangeText={setCantidadVisitas} keyboardType="number-pad" inputMode="numeric" error={errorCampo('cantidadVisitas', cantidadVisitas)} /></View>
                <View style={styles.field}><TextField label="Almuerzos en bodegas" required value={cantidadAlmuerzos}
                  onChangeText={setCantidadAlmuerzos} keyboardType="number-pad" inputMode="numeric" error={errorCampo('cantidadAlmuerzos', cantidadAlmuerzos)}
                  hint="Hasta uno por día." /></View>
              </View>
              <View style={styles.row}>
                <View style={styles.field}><TimeField label="Desde" required value={desde} disabled={guardando} error={errorCampo('desde', desde)}
                  onChange={(hora) => { setDesde(hora); setHasta((fin) => ajustarFin(hora, fin)); setFinRechazado(false); }} /></View>
                <View style={styles.field}><TimeField label="Hasta" required value={hasta} minimo={desde} disabled={guardando}
                  error={finRechazado ? `Elegí una hora posterior a las ${desde}.` : errorCampo('hasta', hasta)}
                  onChange={(hora) => { setFinRechazado(hora <= desde); if (hora > desde) setHasta(hora); }} /></View>
              </View>
            </View>
            <View style={styles.booking}>
              <View style={{ gap: Spacing.xs }}>
                <AppText variant="heading">Bodegas imprescindibles</AppText>
                <AppText variant="caption">Opcional · {imprescindibles.length} de 12 elegidas</AppText>
              </View>
              {cargandoCatalogo && <AppText>Cargando bodegas…</AppText>}
              {errorCatalogo && <><AppText color="malbec">{errorCatalogo}</AppText><Button title="Reintentar" onPress={() => void recargarCatalogo()} /></>}
              {fijas.length > 0
                ? <View style={styles.chips}>{fijas.map(chipImprescindible)}</View>
                : !cargandoCatalogo && <AppText variant="caption">Todavía no tenés favoritas. Buscá una bodega.</AppText>}
              <SearchField value={busqueda} onChangeText={setBusqueda} placeholder="Buscar otra bodega o zona" />
              {encontradas.length > 0 && <View style={styles.chips}>{encontradas.map(chipImprescindible)}</View>}
              {busqueda.trim() && encontradas.length === 0 && <AppText variant="caption">Sin resultados.</AppText>}
            </View>
          </>
        )}
        {!formularioValido && <AppText variant="caption" color="textMuted">Completá los campos obligatorios con datos válidos para continuar.</AppText>}
        {error && <AppText color="malbec">{error}</AppText>}
        <Button
          title={guardando ? existente ? 'Recalculando…' : 'Analizando recorrido…' : !existente ? 'Generar y guardar ruta' : 'Recalcular ruta'}
          disabled={guardando || !formularioValido || (!existente && (cargandoCatalogo || !!errorCatalogo))}
          onPress={() => void guardar()}
        />
        {guardando && !existente && <AppText variant="caption">Estamos seleccionando experiencias disponibles y organizando los horarios.</AppText>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  booking: { gap: Spacing.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, backgroundColor: Colors.surface },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  field: { flexGrow: 1, flexBasis: 140, minWidth: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  summary: { gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.background },
});
