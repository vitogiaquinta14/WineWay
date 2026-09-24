import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BodegaHero } from '@/components/bodega/bodega-hero';
import { ExperienciaCard } from '@/components/bodega/experiencia-card';
import { VinoCard } from '@/components/bodega/vino-card';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import { getBodega } from '@/data/bodegas';

function volver() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

export default function BodegaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bodega = getBodega(id);

  // Estado local hasta que exista backend.
  const [favorita, setFavorita] = useState(false);
  const [enRuta, setEnRuta] = useState(false);

  if (!bodega) {
    return (
      <Screen>
        <EmptyState
          icon="winery"
          title="Bodega no encontrada"
          description="Puede que ya no esté disponible."
        />
        <Button title="Volver" variant="outline" icon="back" onPress={volver} />
      </Screen>
    );
  }

  return (
    <Screen scroll padded={false} edges={['bottom']}>
      <StatusBar style="light" />

      <BodegaHero
        bodega={bodega}
        favorita={favorita}
        onBack={volver}
        onToggleFavorita={() => setFavorita((value) => !value)}
      />

      <View style={styles.sections}>
        <View style={styles.section}>
          <AppText variant="label">La bodega</AppText>
          <AppText variant="body" style={styles.description}>
            {bodega.descripcion}
          </AppText>
        </View>

        <View style={styles.section}>
          <View style={styles.actions}>
            <View style={styles.primaryAction}>
              <Button
                title={enRuta ? 'En tu ruta' : 'Agregar a mi ruta'}
                icon={enRuta ? 'check' : 'plus'}
                variant="secondary"
                onPress={() => setEnRuta((value) => !value)}
              />
            </View>
            <Button
              title="Reservar"
              icon="external"
              variant="outline"
              onPress={() => WebBrowser.openBrowserAsync(bodega.sitioWeb)}
            />
          </View>
          <AppText variant="caption" align="center">
            La reserva se realiza en el sitio de la bodega.
          </AppText>
        </View>

        {bodega.experiencias.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Experiencias disponibles" />
            {bodega.experiencias.map((experiencia) => (
              <ExperienciaCard key={experiencia.id} experiencia={experiencia} />
            ))}
          </View>
        )}

        {bodega.vinos.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Vinos destacados" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
              contentContainerStyle={styles.carouselContent}>
              {bodega.vinos.map((vino) => (
                <VinoCard key={vino.id} vino={vino} />
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sections: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  description: {
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryAction: {
    flex: 1,
  },
  carousel: {
    marginHorizontal: -Spacing.lg,
  },
  carouselContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    gap: Spacing.md,
  },
});
