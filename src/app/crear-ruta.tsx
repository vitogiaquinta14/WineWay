import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { TextField } from '@/components/ui/text-field';
import { Chip } from '@/components/ui/chip';
import { VisitaForm } from '@/components/ruta/visita-form';
import { useRuta } from '@/state/ruta-context';
import { useCatalogo } from '@/state/catalogo-context';
import { horaMendoza, type VisitaNueva } from '@/data/rutas';
import { Spacing } from '@/constants/theme';
export default function CrearRutaScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { crear, editar, rutas } = useRuta();
  const existente = rutas.find((r) => r.id === params.id);
  const { filtros, zonas, bodegas } = useCatalogo();
  const [nombre, setNombre] = useState(existente?.nombre ?? '');
  const [fechaInicio, setFecha] = useState(existente?.fechaInicio ?? '');
  const [dias, setDias] = useState(String(existente?.cantidadDias ?? 1));
  const [personas, setPersonas] = useState(String(existente?.cantidadPersonas ?? 1));
  const [presupuesto, setPresupuesto] = useState(
    existente ? String(existente.presupuestoPersonaCentavos / 100) : '',
  );
  const [visitas, setVisitas] = useState<VisitaNueva[]>([]);
  const [preferencias, setPreferencias] = useState<string[]>(
    (existente?.parametros.preferencias as string[] | undefined) ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const datos = {
        nombre,
        fechaInicio,
        cantidadDias: Number(dias),
        cantidadPersonas: Number(personas),
        presupuestoPersonaCentavos: Math.round(Number(presupuesto.replace(',', '.')) * 100),
        parametros: { preferencias },
      };
      if (!presupuesto.trim()) throw new Error('Completá el presupuesto.');
      if (existente) await editar(existente.id, datos);
      else await crear({ ...datos, visitas });
      router.dismissTo('/mi-ruta');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };
  return (
    <Screen scroll>
      <View style={{ gap: Spacing.lg, paddingVertical: Spacing.lg }}>
        <IconButton icon="back" accessibilityLabel="Volver" onPress={() => router.back()} />
        <AppText variant="title">{existente ? 'Editar ruta' : 'Crear mi ruta'}</AppText>
        <TextField label="Nombre de la ruta" value={nombre} onChangeText={setNombre} />
        <TextField
          label="Fecha de inicio (YYYY-MM-DD)"
          value={fechaInicio}
          onChangeText={setFecha}
        />
        <TextField
          label="Cantidad de días"
          value={dias}
          onChangeText={setDias}
          keyboardType="number-pad"
        />
        <TextField
          label="Cantidad de personas"
          value={personas}
          onChangeText={setPersonas}
          keyboardType="number-pad"
        />
        <TextField
          label="Presupuesto ARS por persona para todo el viaje"
          value={presupuesto}
          onChangeText={setPresupuesto}
          keyboardType="decimal-pad"
        />
        <AppText variant="caption">
          Presupuesto del grupo: ARS{' '}
          {(Number(presupuesto.replace(',', '.')) * Number(personas) || 0).toLocaleString('es-AR')}
        </AppText>
        <AppText variant="heading">Preferencias de esta ruta</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
          {[
            ...zonas,
            ...(filtros?.tiposBodega ?? []),
            ...(filtros?.caracteristicas ?? []),
            ...(filtros?.tiposExperiencia.map((t) => t.nombre) ?? []),
          ]
            .filter((v, i, a) => a.indexOf(v) === i)
            .map((p) => (
              <Chip
                key={p}
                label={p}
                selected={preferencias.includes(p)}
                onPress={() =>
                  setPreferencias((a) => (a.includes(p) ? a.filter((v) => v !== p) : [...a, p]))
                }
              />
            ))}
        </View>
        <AppText variant="caption">
          La generación automática se incorporará cuando integremos el algoritmo. Podés planificar y
          guardar tus visitas manualmente.
        </AppText>
        {!existente && (
          <>
            <VisitaForm
              fechaInicial={fechaInicio}
              key={fechaInicio}
              onGuardar={async (visita) => setVisitas((a) => [...a, visita])}
            />
            {visitas.map((v, i) => (
              <View key={`${i}-${v.inicio}`}>
                <AppText>
                  {i + 1}.{' '}
                  {bodegas.flatMap((b) => b.experiencias).find((e) => e.id === v.experienciaId)
                    ?.nombre ?? 'Experiencia'}{' '}
                  · {v.inicio.slice(0, 10)} {horaMendoza(v.inicio)}
                </AppText>
                <Button
                  title="Quitar del borrador"
                  variant="outline"
                  onPress={() => setVisitas((a) => a.filter((_, j) => j !== i))}
                />
              </View>
            ))}
          </>
        )}
        {error && <AppText color="malbec">{error}</AppText>}
        <Button
          title={guardando ? 'Guardando…' : 'Guardar ruta'}
          disabled={guardando || (!existente && !visitas.length)}
          onPress={() => void guardar()}
        />
      </View>
    </Screen>
  );
}
