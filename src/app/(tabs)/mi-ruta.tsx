import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { ItinerarioDia } from '@/components/ruta/itinerario-dia';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import type { Bodega } from '@/data/bodegas';
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
            description="Generá una ruta a tu medida o agregá bodegas desde Explorar."
          />
          <Button title="Crear mi ruta" onPress={() => router.push('/crear-ruta')} />
          <Button
            title="Explorar bodegas"
            variant="outline"
            onPress={() => router.navigate('/explorar')}
          />
        </View>
      ) : (
        <>
          {ruta.dias.map((dia) => (
            <View key={dia.id} style={styles.day}>
              <ItinerarioDia
                dia={dia}
                onVisitaPress={(bodega) =>
                  router.push({ pathname: '/bodega/[id]', params: { id: bodega.id } })
                }
                onEditarVisita={editarVisita}
                onQuitarVisita={confirmarQuitar}
              />
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
  },
  actions: {
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },
});
