import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { rangoFechas } from '@/data/rutas';
import { useRuta } from '@/state/ruta-context';
import { useSesion } from '@/state/sesion-context';
export default function MiRutaScreen() {
  const { rutas, cargando, error, recargar } = useRuta();
  const { sesionIniciada } = useSesion();
  return (
    <Screen scroll>
      <View style={{ gap: Spacing.lg, paddingVertical: Spacing.lg }}>
        <AppText variant="title">Mis rutas</AppText>
        {!sesionIniciada ? (
          <Button title="Iniciar sesión para guardar rutas" onPress={() => router.push('/login')} />
        ) : (
          <Button title="Crear una ruta" onPress={() => router.push('/crear-ruta')} />
        )}
        {cargando && <AppText>Cargando rutas…</AppText>}
        {error && (
          <>
            <AppText color="malbec">{error}</AppText>
            <Button title="Reintentar" onPress={() => void recargar()} />
          </>
        )}
        {sesionIniciada && !cargando && !error && rutas.length === 0 && (
          <EmptyState
            icon="route"
            title="Todavía no hay rutas"
            description="Creá una ruta y agregale visitas desde Explorar."
          />
        )}
        {rutas.map((r) => (
          <Card
            key={r.id}
            accessibilityLabel={`${r.nombre}, ${rangoFechas(r)}`}
            onPress={() => router.push({ pathname: '/ruta/[id]', params: { id: r.id } })}
            style={styles.fila}>
            <View style={styles.nombre}>
              <AppText variant="bodyBold" numberOfLines={1}>
                {r.nombre}
              </AppText>
              {r.estado === 'HISTORICA' && <AppText variant="caption">Histórica</AppText>}
            </View>
            <AppText variant="caption" color="text">
              {rangoFechas(r)}
            </AppText>
            <Icon name="chevronRight" size={16} color="textMuted" />
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  nombre: {
    flex: 1,
    gap: Spacing.xxs,
  },
});
