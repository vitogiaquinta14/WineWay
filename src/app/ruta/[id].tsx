import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ItinerarioDia } from '@/components/ruta/itinerario-dia';
import { RutaMap } from '@/components/ruta/ruta-map';
import type { Parada } from '@/components/ruta/ruta-map.types';
import { Chip } from '@/components/ui/chip';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Colors, Spacing } from '@/constants/theme';
import { formatPrecio } from '@/data/bodegas';
import { agruparDias, horaMendoza, rangoFechas, type Visita } from '@/data/rutas';
import { ErrorAPI } from '@/services/api-core';
import { useRuta } from '@/state/ruta-context';
import { confirmar } from '@/utils/confirmar';

const vistas = [
  { value: 'itinerario', label: 'Itinerario' },
  { value: 'mapa', label: 'Mapa' },
] as const;
/** Un color por día para las paradas y la línea del mapa. */
const COLORES_DIA = [Colors.malbec, Colors.terracota, Colors.oliva, Colors.wineDark, Colors.carbon];

function volver() {
  if (router.canGoBack()) router.back();
  else router.replace('/mi-ruta');
}

export default function RutaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rutas, cargando, quitarVisita, eliminar } = useRuta();
  const ruta = rutas.find((r) => r.id === id);
  const [fallo, setFallo] = useState<string | null>(null);
  const [vista, setVista] = useState<'itinerario' | 'mapa'>('itinerario');
  // Fecha del día elegido; vacío muestra todos.
  const [diaElegido, setDiaElegido] = useState('');
  const dias = useMemo(() => (ruta ? agruparDias(ruta) : []), [ruta]);
  const diasVisibles = diaElegido ? dias.filter((d) => d.id === diaElegido) : dias;
  const paradas = useMemo<Parada[]>(
    () =>
      dias.flatMap((dia, i) =>
        diaElegido && dia.id !== diaElegido
          ? []
          : dia.visitas.map((v, n) => ({
              id: v.id,
              diaId: dia.id,
              numero: n + 1,
              color: COLORES_DIA[i % COLORES_DIA.length],
              coordenadas: v.bodega.coordenadas,
              bodega: v.bodega,
              detalle: `${horaMendoza(v.inicio)} · ${v.nombreExperiencia}`,
            })),
      ),
    [dias, diaElegido],
  );

  if (!ruta) {
    return (
      <Screen>
        <IconButton icon="back" accessibilityLabel="Volver" onPress={volver} />
        <EmptyState
          icon="route"
          title={cargando ? 'Cargando ruta…' : 'Ruta no encontrada'}
          description={cargando ? undefined : 'Puede que la hayas eliminado.'}
        />
      </Screen>
    );
  }

  const eliminarRuta = async () => {
    try {
      await eliminar(ruta.id);
      volver();
    } catch (e) {
      setFallo((e as Error).message);
    }
  };
  const quitar = async (v: Visita) => {
    if (!(await confirmar('Quitar visita', `¿Quitar ${v.nombreExperiencia}?`))) return;
    setFallo(null);
    try {
      await quitarVisita(ruta.id, v.id);
    } catch (e) {
      if (e instanceof ErrorAPI && e.codigo === 'ULTIMA_VISITA') {
        if (await confirmar('Eliminar ruta', 'Es la última visita. ¿Querés eliminar también la ruta?'))
          await eliminarRuta();
      } else setFallo((e as Error).message);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.contenido}>
        <IconButton icon="back" accessibilityLabel="Volver" onPress={volver} />
        <View style={{ gap: Spacing.xs }}>
          <AppText variant="title">{ruta.nombre}</AppText>
          <AppText variant="caption">
            {rangoFechas(ruta)} · {ruta.estado === 'HISTORICA' ? 'Histórica' : 'Vigente'}
          </AppText>
        </View>

        <Card style={styles.resumen}>
          <Dato etiqueta="Personas" valor={String(ruta.cantidadPersonas)} />
          <Dato etiqueta="Costo por persona" valor={formatPrecio(ruta.costoPersonaCentavos / 100)} />
          <Dato etiqueta="Costo del grupo" valor={formatPrecio(ruta.costoGrupoCentavos / 100)} />
          <Dato
            etiqueta="Presupuesto del grupo"
            valor={formatPrecio(ruta.presupuestoGrupoCentavos / 100)}
            alerta={ruta.costoGrupoCentavos > ruta.presupuestoGrupoCentavos}
          />
        </Card>

        {fallo && <AppText color="malbec">{fallo}</AppText>}
        <SegmentedControl options={vistas} value={vista} onChange={setVista} />
        {dias.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}>
            <Chip label="Todos" selected={!diaElegido} onPress={() => setDiaElegido('')} />
            {dias.map((d, i) => (
              <Chip
                key={d.id}
                label={`Día ${i + 1}`}
                selected={d.id === diaElegido}
                onPress={() => setDiaElegido(d.id)}
              />
            ))}
          </ScrollView>
        )}
        {vista === 'mapa' ? (
          paradas.length === 0 ? (
            <AppText variant="caption">No hay visitas para este día.</AppText>
          ) : (
            <>
              <RutaMap
                paradas={paradas}
                onBodegaPress={(b) => router.push({ pathname: '/bodega/[id]', params: { id: b.id } })}
              />
              <View style={styles.leyenda}>
                {diasVisibles
                  .filter((d) => d.visitas.length > 0)
                  .map((d) => (
                    <View key={d.id} style={styles.leyendaItem}>
                      <View
                        style={[
                          styles.punto,
                          { backgroundColor: paradas.find((p) => p.diaId === d.id)?.color },
                        ]}
                      />
                      <AppText variant="caption">{d.titulo}</AppText>
                    </View>
                  ))}
              </View>
            </>
          )
        ) : (
          diasVisibles.map((dia) => (
            <ItinerarioDia
              key={dia.id}
              dia={dia}
              badge={ruta.estado === 'HISTORICA' ? 'Histórica' : 'Planificada'}
              onVisitaPress={(b) => router.push({ pathname: '/bodega/[id]', params: { id: b.id } })}
              onQuitarVisita={(v) => void quitar(v)}
            />
          ))
        )}
        {ruta.visitas.some((v) => v.advertenciaInactiva) && (
          <AppText color="malbec">
            Hay visitas a experiencias o bodegas inactivas. Se conservan; podés quitarlas.
          </AppText>
        )}

        <Button
          title="Recalcular ruta"
          variant="outline"
          onPress={() => router.push({ pathname: '/crear-ruta', params: { id: ruta.id } })}
        />
        <Button
          title="Eliminar ruta"
          variant="outline"
          onPress={() =>
            void (async () => {
              if (await confirmar('Eliminar ruta', 'Se eliminarán todas sus visitas.'))
                await eliminarRuta();
            })()
          }
        />
      </View>
    </Screen>
  );
}

function Dato({ etiqueta, valor, alerta }: { etiqueta: string; valor: string; alerta?: boolean }) {
  return (
    <View style={styles.dato}>
      <AppText variant="caption">{etiqueta}</AppText>
      <AppText variant="bodyBold" color={alerta ? 'malbec' : 'text'}>
        {valor}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  contenido: {
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  resumen: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  chips: {
    gap: Spacing.sm,
  },
  leyenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  punto: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dato: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
});
