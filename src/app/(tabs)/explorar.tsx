import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { BodegaCard } from '@/components/bodega/bodega-card';
import { AppText } from '@/components/ui/app-text';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Spacing } from '@/constants/theme';
import { bodegas, zonas, type Bodega, type Zona } from '@/data/bodegas';

type Vista = 'lista' | 'mapa';

const vistas = [
  { value: 'lista', label: 'Lista' },
  { value: 'mapa', label: 'Mapa' },
] as const;

/** Minúsculas y sin tildes, para que "lujan" encuentre "Luján". */
function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function coincide(bodega: Bodega, busqueda: string) {
  const texto = normalizar(
    [bodega.nombre, bodega.experienciaDestacada, bodega.localidad, bodega.zona].join(' '),
  );
  return texto.includes(normalizar(busqueda.trim()));
}

export default function ExplorarScreen() {
  const [busqueda, setBusqueda] = useState('');
  const [vista, setVista] = useState<Vista>('lista');
  const [zona, setZona] = useState<Zona | null>(null);

  const resultados = bodegas.filter(
    (bodega) => (zona === null || bodega.zona === zona) && coincide(bodega, busqueda),
  );

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <AppText variant="title">Explorar Bodegas</AppText>
        <SearchField
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar bodegas, experiencias, vinos..."
        />
        <SegmentedControl options={vistas} value={vista} onChange={setVista} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chips}
        contentContainerStyle={styles.chipsContent}>
        <Chip label="Todas" selected={zona === null} onPress={() => setZona(null)} />
        {zonas.map((item) => (
          <Chip key={item} label={item} selected={zona === item} onPress={() => setZona(item)} />
        ))}
      </ScrollView>

      {vista === 'mapa' ? (
        <EmptyState
          icon="map"
          title="Mapa en camino"
          description="Pronto vas a poder ver las bodegas sobre el mapa de Mendoza."
        />
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(bodega) => bodega.id}
          renderItem={({ item }) => (
            <BodegaCard
              bodega={item}
              onPress={() => router.push({ pathname: '/bodega/[id]', params: { id: item.id } })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="Sin resultados"
              description="Probá con otro nombre o cambiá la zona seleccionada."
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  chips: {
    flexGrow: 0,
  },
  chipsContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
});
