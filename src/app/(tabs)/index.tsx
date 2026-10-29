import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BodegaCompactCard } from '@/components/bodega/bodega-compact-card';
import { HomeHero } from '@/components/home/home-hero';
import { NextTripCard } from '@/components/home/next-trip-card';
import { ScanBanner } from '@/components/home/scan-banner';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { rangoFechas } from '@/data/rutas';
import { useCatalogo } from '@/state/catalogo-context';
import { useRuta } from '@/state/ruta-context';
import { AppText } from '@/components/ui/app-text';

import { useSesion } from '@/state/sesion-context';

export default function HomeScreen() {
  // El hero es oscuro: la barra de estado va en blanco solo mientras se ve la Home.
  const focused = useIsFocused();
  const { usuario } = useSesion();
  const { bodegas, error, cargando, recargar } = useCatalogo();
  const { rutas } = useRuta();
  const bodegasRecomendadas = bodegas.filter((b) => b.recomendada);
  const siguiente = rutas
    .filter((r) => r.estado === 'VIGENTE')
    .sort((a, b) => a.visitas[0].inicio.localeCompare(b.visitas[0].inicio))[0];
  const proximoViaje = siguiente
    ? {
        titulo: siguiente.nombre,
        fechas: rangoFechas(siguiente),
        cantidadBodegas: new Set(siguiente.visitas.map((v) => v.bodegaId)).size,
        cantidadAlmuerzos: siguiente.visitas.filter(
          (v) => v.bodega.experiencias.find((e) => e.id === v.experienciaId)?.tipo.gastronomia,
        ).length,
      }
    : null;

  return (
    <Screen scroll padded={false} edges={[]}>
      {focused && <StatusBar style="light" />}

      <HomeHero
        onCreateRoute={() => router.push(usuario ? '/crear-ruta' : '/login')}
        onProfilePress={() => router.push(usuario ? '/perfil' : '/login')}
      />

      <View style={styles.sections}>
        {cargando && <AppText>Cargando catálogo…</AppText>}
        {error && (
          <>
            <AppText>{error}</AppText>
            <Button title="Reintentar" onPress={() => void recargar()} />
          </>
        )}
        {proximoViaje && (
          <View style={styles.section}>
            <SectionHeader title="Próximo viaje" />
            <NextTripCard
              viaje={proximoViaje}
              onPress={() =>
                router.push({ pathname: '/ruta/[id]', params: { id: siguiente.id } })
              }
            />
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
            contentContainerStyle={styles.carouselContent}
          >
            {bodegasRecomendadas.map((bodega) => (
              <BodegaCompactCard
                key={bodega.id}
                bodega={bodega}
                onPress={() => router.push({ pathname: '/bodega/[id]', params: { id: bodega.id } })}
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
