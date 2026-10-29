import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatPrecio, type Bodega } from '@/data/bodegas';
import { diaCorto, fechaMendoza, horaMendoza, rangoFechas } from '@/data/rutas';
import { useRuta } from '@/state/ruta-context';
import { diasParaAgregar, horariosParaAgregar, visitaExistente } from '@/utils/agregar-a-ruta';

type Props = {
  bodega: Bodega;
  onClose: () => void;
};

/**
 * Agrega una experiencia de la bodega a una ruta en cuatro pasos: ruta, experiencia,
 * día y horario. Sólo deja elegir días en que abre y horarios libres; la API valida igual.
 * Se monta al abrirse, así cada apertura empieza de cero.
 */
export function AgregarARutaSheet({ bodega, onClose }: Props) {
  const { rutas, agregarVisita } = useRuta();
  const experiencias = bodega.experiencias.filter((e) => e.activa);
  const [rutaId, setRutaId] = useState(rutas.length === 1 ? rutas[0].id : '');
  const [experienciaId, setExperienciaId] = useState(
    experiencias.length === 1 ? experiencias[0].id : '',
  );
  const [fecha, setFecha] = useState('');
  const [inicio, setInicio] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  const ruta = rutas.find((r) => r.id === rutaId);
  const experiencia = experiencias.find((e) => e.id === experienciaId);
  const repetida = ruta && experiencia && visitaExistente(ruta, experiencia.id);
  const dias = ruta && experiencia ? diasParaAgregar(ruta, experiencia) : [];
  const horarios = ruta && experiencia && fecha ? horariosParaAgregar(ruta, experiencia, fecha) : [];

  const elegirRuta = (id: string) => {
    setRutaId(id);
    setFecha('');
    setInicio('');
  };
  const elegirExperiencia = (id: string) => {
    setExperienciaId(id);
    setFecha('');
    setInicio('');
  };
  const agregar = async () => {
    if (!ruta || !experiencia || !inicio) return;
    setGuardando(true);
    setError(null);
    try {
      await agregarVisita(ruta.id, { experienciaId: experiencia.id, inicio });
      setListo(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <View style={styles.modal}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar" />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.header}>
            <AppText variant="heading">Agregar a ruta</AppText>
            <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
              <AppText variant="bodyBold" color="malbec">
                Cerrar
              </AppText>
            </Pressable>
          </View>

          {listo && ruta && experiencia ? (
            <View style={styles.paso}>
              <AppText>
                Agregaste {experiencia.nombre} a {ruta.nombre} el {diaCorto(fechaMendoza(inicio))} a
                las {horaMendoza(inicio)}.
              </AppText>
              <Button
                title="Ver ruta"
                onPress={() => {
                  onClose();
                  router.push({ pathname: '/ruta/[id]', params: { id: ruta.id } });
                }}
              />
              <Button title="Seguir explorando" variant="outline" onPress={onClose} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.pasos} keyboardShouldPersistTaps="handled">
              <Paso numero={1} titulo="Ruta">
                <View style={styles.chips}>
                  {rutas.map((r) => (
                    <Chip
                      key={r.id}
                      label={`${r.nombre} · ${rangoFechas(r)}`}
                      selected={r.id === rutaId}
                      onPress={() => elegirRuta(r.id)}
                    />
                  ))}
                </View>
              </Paso>

              {ruta && (
                <Paso numero={2} titulo="Experiencia">
                  {experiencias.length === 0 && (
                    <AppText variant="caption">Esta bodega no tiene experiencias activas.</AppText>
                  )}
                  <View style={styles.chips}>
                    {experiencias.map((e) => (
                      <Chip
                        key={e.id}
                        label={e.nombre}
                        selected={e.id === experienciaId}
                        onPress={() => elegirExperiencia(e.id)}
                      />
                    ))}
                  </View>
                  {experiencia && (
                    <AppText variant="caption">
                      {formatPrecio(experiencia.precioCentavos / 100)} por persona ·{' '}
                      {experiencia.duracionMin} min
                    </AppText>
                  )}
                  {repetida && (
                    <AppText color="malbec">
                      Esta experiencia ya está en tu ruta: {diaCorto(fechaMendoza(repetida.inicio))}{' '}
                      a las {horaMendoza(repetida.inicio)}.
                    </AppText>
                  )}
                </Paso>
              )}

              {ruta && experiencia && (
                <Paso numero={3} titulo="Día">
                  <View style={styles.chips}>
                    {dias.map((d) => (
                      <Chip
                        key={d.fecha}
                        label={diaCorto(d.fecha)}
                        selected={d.fecha === fecha}
                        disabled={!d.abierto}
                        onPress={() => {
                          setFecha(d.fecha);
                          setInicio('');
                        }}
                      />
                    ))}
                  </View>
                  {dias.every((d) => !d.abierto) && (
                    <AppText variant="caption">
                      Esta experiencia no se ofrece en ninguno de los días de tu ruta.
                    </AppText>
                  )}
                </Paso>
              )}

              {ruta && experiencia && fecha && (
                <Paso numero={4} titulo="Horario">
                  <View style={styles.chips}>
                    {horarios.map((h) => (
                      <Chip
                        key={h.inicio}
                        label={h.hora}
                        selected={h.inicio === inicio}
                        disabled={!h.libre}
                        onPress={() => setInicio(h.inicio)}
                      />
                    ))}
                  </View>
                  {horarios.length > 0 && horarios.every((h) => !h.libre) && (
                    <AppText variant="caption">
                      Todos los horarios de ese día se superponen con otras visitas.
                    </AppText>
                  )}
                </Paso>
              )}

              {error && <AppText color="malbec">{error}</AppText>}
              <Button
                title={guardando ? 'Agregando…' : 'Agregar a la ruta'}
                disabled={!inicio || guardando}
                onPress={() => void agregar()}
              />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Paso({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <View style={styles.paso}>
      <AppText variant="label" color="textMuted">
        {numero}. {titulo}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(37, 37, 37, 0.35)',
  },
  sheet: {
    maxHeight: '88%',
    gap: Spacing.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pasos: {
    gap: Spacing.xl,
  },
  paso: {
    gap: Spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
