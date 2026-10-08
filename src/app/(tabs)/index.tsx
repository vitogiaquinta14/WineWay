import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { BodegaCompactCard } from '@/components/bodega/bodega-compact-card';
import { HomeHero } from '@/components/home/home-hero';
import { NextTripCard } from '@/components/home/next-trip-card';
import { ScanBanner } from '@/components/home/scan-banner';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import { bodegasRecomendadas } from '@/data/bodegas';
import { proximoViaje } from '@/data/viajes';
import { useSesion } from '@/state/sesion-context';

export default function HomeScreen() {
  // El hero es oscuro: la barra de estado va en blanco solo mientras se ve la Home.
  const focused = useIsFocused();
  const { cerrarSesion } = useSesion();

  // Hasta que exista la pantalla de Perfil, el botón solo ofrece cerrar sesión.
  const abrirPerfil = () =>
    Alert.alert('Mi cuenta', 'El perfil va a estar disponible pronto.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: cerrarSesion },
    ]);

  return (
    <Screen scroll padded={false} edges={[]}>
      {focused && <StatusBar style="light" />}

      <HomeHero onCreateRoute={() => router.push('/crear-ruta')} onProfilePress={abrirPerfil} />

      <View style={styles.sections}>
        {proximoViaje && (
          <View style={styles.section}>
            <SectionHeader title="Próximo viaje" />
            <NextTripCard viaje={proximoViaje} onPress={() => router.navigate('/mi-ruta')} />
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader
            title="Bodegas recomendadas"
            actionLabel="Ver todas"
            onActionPress={() => router.navigate('/explorar')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
            contentContainerStyle={styles.carouselContent}>
            {bodegasRecomendadas.map((bodega) => (
              <BodegaCompactCard
                key={bodega.id}
                bodega={bodega}
                onPress={() =>
                  router.push({ pathname: '/bodega/[id]', params: { id: bodega.id } })
                }
              />
            ))}
          </ScrollView>
        </View>

        <ScanBanner onPress={() => router.navigate('/escanear')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sections: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.xxl,
  },
  section: {
    gap: Spacing.md,
  },
  // El carrusel ocupa todo el ancho aunque la sección tenga padding.
  carousel: {
    marginHorizontal: -Spacing.lg,
  },
  carouselContent: {
    paddingHorizontal: Spacing.lg,
    // Deja lugar para que no se corte la sombra de las tarjetas.
    paddingVertical: Spacing.xs,
    gap: Spacing.md,
  },
});
