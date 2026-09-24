import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { TrasladoInfo } from '@/components/ruta/traslado-info';
import { VisitaCard } from '@/components/ruta/visita-card';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { getBodega, type Bodega } from '@/data/bodegas';
import type { Visita } from '@/data/rutas';
import { useRuta } from '@/state/ruta-context';

export default function MiRutaScreen() {
  const { ruta, quitarVisita } = useRuta();
  const cantidadVisitas = ruta.dias.reduce((total, dia) => total + dia.visitas.length, 0);

  const confirmarQuitar = (visita: Visita, bodega: Bodega) => {
    Alert.alert('Quitar visita', `¿Querés quitar ${bodega.nombre} de tu ruta?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: () => quitarVisita(visita.id) },
    ]);
  };

  // Sin backend todavía: estas acciones solo muestran lo que va a pasar.
  const guardarRuta = () => Alert.alert('Ruta guardada', 'Tu itinerario quedó guardado.');

  const agregarACalendar = () =>
    Alert.alert(
      'Agregar a Google Calendar',
      `Se creará un evento por cada visita (${cantidadVisitas} en total).\n\nAgregar una visita al calendario no equivale a reservarla.`,
      [{ text: 'Cancelar', style: 'cancel' }, { text: 'Agregar' }],
    );

  const editarVisita = () =>
    Alert.alert('Editar visita', 'La edición de horarios va a estar disponible pronto.');

  return (
    <Screen scroll>
      <View style={styles.header}>
        <AppText variant="title">Mi Ruta de Viaje</AppText>
        <AppText variant="caption">{ruta.descripcion}</AppText>
      </View>

      {cantidadVisitas === 0 ? (
        <View style={styles.empty}>
          <EmptyState
            icon="route"
            title="Tu ruta está vacía"
            description="Agregá bodegas desde Explorar para armar tu itinerario."
          />
          <Button title="Explorar bodegas" onPress={() => router.navigate('/explorar')} />
        </View>
      ) : (
        <>
          {ruta.dias.map((dia) => (
            <View key={dia.id} style={styles.day}>
              <AppText variant="heading">{dia.titulo}</AppText>

              {dia.visitas.length === 0 && (
                <AppText variant="caption">Sin visitas para este día.</AppText>
              )}

              {dia.visitas.map((visita, index) => {
                const bodega = getBodega(visita.bodegaId);
                if (!bodega) return null;

                return (
                  <View key={visita.id} style={styles.visit}>
                    {index > 0 && visita.trasladoMin !== undefined && (
                      <TrasladoInfo minutos={visita.trasladoMin} destino={bodega.nombre} />
                    )}
                    <VisitaCard
                      visita={visita}
                      bodega={bodega}
                      onPress={() =>
                        router.push({ pathname: '/bodega/[id]', params: { id: bodega.id } })
                      }
                      onEdit={editarVisita}
                      onDelete={() => confirmarQuitar(visita, bodega)}
                    />
                  </View>
                );
              })}
            </View>
          ))}

          <View style={styles.actions}>
            <Button title="Guardar ruta" onPress={guardarRuta} />
            <Button
              title="Agregar a Google Calendar"
              icon="route"
              variant="outline"
              onPress={agregarACalendar}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing.lg,
    gap: Spacing.xs,
  },
  empty: {
    gap: Spacing.lg,
  },
  day: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  visit: {
    gap: Spacing.md,
  },
  actions: {
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },
});
