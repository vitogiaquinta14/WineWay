import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { VinoCavaCard } from '@/components/cava/vino-cava-card';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { Colors, Shadow, Spacing } from '@/constants/theme';
import { useCava } from '@/state/cava-context';
import { normalizar } from '@/utils/texto';

export default function MiCavaScreen() {
  const { vinos } = useCava();
  const [busqueda, setBusqueda] = useState('');

  const consulta = normalizar(busqueda.trim());
  const resultados = vinos.filter((vino) =>
    normalizar([vino.nombre, vino.bodega, vino.varietal, vino.anio].join(' ')).includes(consulta),
  );

  const irAEscanear = () => router.navigate('/escanear');

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titles}>
            <AppText variant="title">Mi Cava</AppText>
            <AppText variant="caption">Colección personal de vinos degustados</AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Agregar un vino escaneando su etiqueta"
            onPress={irAEscanear}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
            <Icon name="plus" size={20} color="textOnPrimary" />
          </Pressable>
        </View>

        {vinos.length > 0 && (
          <SearchField
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por vino, bodega o varietal..."
          />
        )}
      </View>

      {vinos.length === 0 ? (
        <View style={styles.empty}>
          <EmptyState
            icon="cellar"
            title="Tu cava está vacía"
            description="Escaneá la etiqueta de un vino que probaste para guardarlo con tu puntuación y tus notas."
          />
          <Button title="Escanear un vino" icon="scan" onPress={irAEscanear} />
        </View>
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(vino) => vino.id}
          renderItem={({ item }) => <VinoCavaCard vino={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="Sin resultados"
              description="Ningún vino de tu cava coincide con la búsqueda."
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
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  titles: {
    flex: 1,
    gap: Spacing.xs,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.terracota,
    ...Shadow.card,
  },
  pressed: {
    opacity: 0.85,
  },
  empty: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
});
