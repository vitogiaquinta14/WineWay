import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { ItinerarioDia } from '@/components/ruta/itinerario-dia';
import { VisitaForm } from '@/components/ruta/visita-form';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { formatPrecio } from '@/data/bodegas';
import { agruparDias, fechaMendoza, horaMendoza, type Visita } from '@/data/rutas';
import { useRuta } from '@/state/ruta-context';
import { useSesion } from '@/state/sesion-context';
import { ErrorAPI } from '@/services/api-core';
import { confirmar } from '@/utils/confirmar';
export default function MiRutaScreen() {
  const {
    rutas,
    ruta,
    seleccionar,
    quitarVisita,
    eliminar,
    editarVisita,
    agregarVisita,
    cargando,
    error,
    recargar,
  } = useRuta();
  const { sesionIniciada } = useSesion();
  const [editando, setEditando] = useState<Visita | null>(null);
  const [agregando, setAgregando] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);
  const quitar = async (v: Visita) => {
    if (!ruta || !(await confirmar('Quitar visita', `¿Quitar ${v.nombreExperiencia}?`))) return;
    try {
      await quitarVisita(ruta.id, v.id);
    } catch (e) {
      if (e instanceof ErrorAPI && e.codigo === 'ULTIMA_VISITA') {
        if (
          await confirmar('Eliminar ruta', 'Es la última visita. ¿Querés eliminar también la ruta?')
        )
          try {
            await eliminar(ruta.id);
          } catch (error) {
            setFallo((error as Error).message);
          }
      } else setFallo((e as Error).message);
    }
  };
  return (
    <Screen scroll>
      <View style={{ gap: Spacing.lg, paddingVertical: Spacing.lg }}>
        <AppText variant="title">Mis rutas</AppText>
        {!sesionIniciada ? (
          <Button title="Iniciar sesión para guardar rutas" onPress={() => router.push('/login')} />
        ) : (
          <Button title="Crear una ruta" onPress={() => router.push('/crear-ruta')} />
        )}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
          {rutas.map((r) => (
            <Chip
              key={r.id}
              label={r.nombre}
              selected={ruta?.id === r.id}
              onPress={() => {
                seleccionar(r.id);
                setEditando(null);
                setAgregando(false);
              }}
            />
          ))}
        </View>
        {cargando && <AppText>Cargando rutas…</AppText>}
        {(error || fallo) && <AppText color="malbec">{error ?? fallo}</AppText>}
        {error && <Button title="Reintentar" onPress={() => void recargar()} />}
        {!ruta && !cargando && <AppText>Todavía no hay rutas guardadas.</AppText>}
        {ruta && (
          <>
            <AppText variant="heading">{ruta.nombre}</AppText>
            <AppText>
              {ruta.estado === 'HISTORICA' ? 'Histórica' : 'Vigente'} · {ruta.cantidadPersonas}{' '}
              personas
            </AppText>
            <AppText>
              Costo actual / persona: {formatPrecio(ruta.costoPersonaCentavos / 100)}
            </AppText>
            <AppText>Costo actual del grupo: {formatPrecio(ruta.costoGrupoCentavos / 100)}</AppText>
            <AppText>
              Presupuesto del grupo: {formatPrecio(ruta.presupuestoGrupoCentavos / 100)}
            </AppText>
            {agruparDias(ruta).map((dia) => (
              <ItinerarioDia
                key={dia.id}
                dia={dia}
                badge={ruta.estado === 'HISTORICA' ? 'Histórica' : 'Planificada'}
                onVisitaPress={(b) =>
                  router.push({ pathname: '/bodega/[id]', params: { id: b.id } })
                }
                onQuitarVisita={(v) => void quitar(v)}
                onEditarVisita={(v) => {
                  setEditando(v);
                  setAgregando(false);
                }}
              />
            ))}
            {ruta.visitas.some((v) => v.advertenciaInactiva) && (
              <AppText color="malbec">
                Hay visitas a experiencias o bodegas inactivas. Se conservan; podés reemplazarlas o
                quitarlas.
              </AppText>
            )}
            <Button
              title="Editar datos de la ruta"
              variant="outline"
              onPress={() => router.push({ pathname: '/crear-ruta', params: { id: ruta.id } })}
            />
            <Button
              title="Agregar visita"
              onPress={() => {
                setAgregando(true);
                setEditando(null);
              }}
            />
            {(agregando || editando) && (
              <VisitaForm
                key={editando?.id ?? `nueva-${ruta.id}`}
                fechaInicial={editando ? fechaMendoza(editando.inicio) : ruta.fechaInicio}
                horaInicial={editando ? horaMendoza(editando.inicio) : ''}
                experienciaInicial={editando?.experienciaId}
                titulo={editando ? 'Guardar cambios de visita' : 'Guardar visita'}
                onGuardar={async (v) => {
                  if (editando) await editarVisita(ruta.id, editando.id, v);
                  else await agregarVisita(ruta.id, v);
                  setEditando(null);
                  setAgregando(false);
                }}
              />
            )}
            <Button
              title="Eliminar ruta"
              variant="outline"
              onPress={() =>
                void (async () => {
                  if (await confirmar('Eliminar ruta', 'Se eliminarán todas sus visitas.')) {
                    try {
                      await eliminar(ruta.id);
                    } catch (e) {
                      setFallo((e as Error).message);
                    }
                  }
                })()
              }
            />
          </>
        )}
      </View>
    </Screen>
  );
}
