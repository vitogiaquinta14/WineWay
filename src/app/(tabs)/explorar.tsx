import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, PanResponder, Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { BodegaCard } from '@/components/bodega/bodega-card';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { bodegas, formatPrecio, zonas, type Bodega, type Zona } from '@/data/bodegas';

type Vista = 'lista' | 'mapa';
type Precio = Bodega['precio'];

const PRECIO_MINIMO: Precio = 1;
const PRECIO_MAXIMO: Precio = 5;

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
  const [precioMinimo, setPrecioMinimo] = useState<Precio>(PRECIO_MINIMO);
  const [precioMaximo, setPrecioMaximo] = useState<Precio>(PRECIO_MAXIMO);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const resultados = bodegas.filter(
    (bodega) =>
      (zona === null || bodega.zona === zona) &&
      bodega.precio >= precioMinimo &&
      bodega.precio <= precioMaximo &&
      coincide(bodega, busqueda),
  );

  const hayFiltrosActivos =
    zona !== null || precioMinimo !== PRECIO_MINIMO || precioMaximo !== PRECIO_MAXIMO;

  const limpiarFiltros = () => {
    setZona(null);
    setPrecioMinimo(PRECIO_MINIMO);
    setPrecioMaximo(PRECIO_MAXIMO);
  };

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <AppText variant="title">Explorar Bodegas</AppText>
        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <SearchField
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar bodegas, experiencias, vinos..."
            />
          </View>
          <IconButton
            icon="filter"
            color={hayFiltrosActivos ? "malbec" : "text"}
            accessibilityLabel="Abrir filtros"
            onPress={() => setFiltrosAbiertos(true)}
          />
        </View>
        <SegmentedControl options={vistas} value={vista} onChange={setVista} />
      </View>

      <FiltersSheet
        visible={filtrosAbiertos}
        zona={zona}
        precioMinimo={precioMinimo}
        precioMaximo={precioMaximo}
        onClose={() => setFiltrosAbiertos(false)}
        onZonaChange={setZona}
        onPrecioMinimoChange={setPrecioMinimo}
        onPrecioMaximoChange={setPrecioMaximo}
        onClear={limpiarFiltros}
      />

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
          accessibilityLabel={`Resultados de bodegas: ${resultados.length}`}
          renderItem={({ item }) => (
            <BodegaCard
              bodega={item}
              onPress={() => router.push({ pathname: '/bodega/[id]', params: { id: item.id } })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
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

type FiltersSheetProps = {
  visible: boolean;
  zona: Zona | null;
  precioMinimo: Precio;
  precioMaximo: Precio;
  onClose: () => void;
  onZonaChange: (zona: Zona | null) => void;
  onPrecioMinimoChange: (precio: Precio) => void;
  onPrecioMaximoChange: (precio: Precio) => void;
  onClear: () => void;
};

function FiltersSheet({
  visible,
  zona,
  precioMinimo,
  precioMaximo,
  onClose,
  onZonaChange,
  onPrecioMinimoChange,
  onPrecioMaximoChange,
  onClear,
}: FiltersSheetProps) {

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={filterStyles.modal}>
        <Pressable style={filterStyles.backdrop} onPress={onClose} />
        <View style={filterStyles.sheet} accessibilityViewIsModal>
          <View style={filterStyles.header}>
            <AppText variant="heading">Filtros</AppText>
            <Pressable accessibilityRole="button" onPress={onClear} hitSlop={8}>
              <AppText variant="bodyBold" color="malbec">
                Limpiar
              </AppText>
            </Pressable>
          </View>

          <View style={filterStyles.section}>
            <AppText variant="label" color="textMuted">
              Zona
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={filterStyles.chipsContent}>
              <Chip label="Todas" selected={zona === null} onPress={() => onZonaChange(null)} />
              {zonas.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={zona === item}
                  onPress={() => onZonaChange(item)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={filterStyles.section}>
            <View style={filterStyles.priceHeader}>
              <AppText variant="label" color="textMuted">
                Rango de precio
              </AppText>
              <AppText variant="bodyBold" color="malbec">
                {formatPrecio(precioMinimo)} a {formatPrecio(precioMaximo)}
              </AppText>
            </View>
            <PriceRangeSlider
              minimum={precioMinimo}
              maximum={precioMaximo}
              onMinimumChange={onPrecioMinimoChange}
              onMaximumChange={onPrecioMaximoChange}
            />
          </View>

          <Button title="Ver resultados" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

type PriceRangeSliderProps = {
  minimum: Precio;
  maximum: Precio;
  onMinimumChange: (precio: Precio) => void;
  onMaximumChange: (precio: Precio) => void;
};

const THUMB_SIZE = 28;

function PriceRangeSlider({
  minimum,
  maximum,
  onMinimumChange,
  onMaximumChange,
}: PriceRangeSliderProps) {
  const [width, setWidth] = useState(0);
  const usableWidth = Math.max(width - THUMB_SIZE, 0);
  const positionFor = (value: Precio) =>
    THUMB_SIZE / 2 + ((value - PRECIO_MINIMO) / (PRECIO_MAXIMO - PRECIO_MINIMO)) * usableWidth;

  const minimumResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          const next = Math.max(PRECIO_MINIMO, Math.min(maximum, Math.round(minimum + (gesture.dx / Math.max(usableWidth, 1)) * (PRECIO_MAXIMO - PRECIO_MINIMO))));
          onMinimumChange(next as Precio);
        },
      }),
    [maximum, minimum, onMinimumChange, usableWidth],
  );

  const maximumResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          const next = Math.min(
            PRECIO_MAXIMO,
            Math.max(
              minimum,
              Math.round(
                maximum +
                  (gesture.dx / Math.max(usableWidth, 1)) * (PRECIO_MAXIMO - PRECIO_MINIMO),
              ),
            ),
          );
          onMaximumChange(next as Precio);
        },
      }),
    [maximum, minimum, onMaximumChange, usableWidth],
  );

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const minimumPosition = positionFor(minimum);
  const maximumPosition = positionFor(maximum);

  return (
    <View>
      <View style={rangeStyles.labels}>
        <AppText variant="caption" color="textMuted">
          Desde {formatPrecio(minimum)}
        </AppText>
        <AppText variant="caption" color="textMuted">
          Hasta {formatPrecio(maximum)}
        </AppText>
      </View>
      <View style={rangeStyles.control} onLayout={onLayout}>
        <View style={rangeStyles.track} />
        <View
          style={[
            rangeStyles.selectedTrack,
            { left: minimumPosition, width: Math.max(maximumPosition - minimumPosition, 0) },
          ]}
        />
        <View
          accessibilityRole="adjustable"
          accessibilityLabel="Precio mínimo"
          style={[rangeStyles.thumb, { left: minimumPosition - THUMB_SIZE / 2 }]}
          {...minimumResponder.panHandlers}
        />
        <View
          accessibilityRole="adjustable"
          accessibilityLabel="Precio máximo"
          style={[rangeStyles.thumb, { left: maximumPosition - THUMB_SIZE / 2 }]}
          {...maximumResponder.panHandlers}
        />
      </View>
    </View>
  );
}

const rangeStyles = StyleSheet.create({
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  control: {
    height: 48,
    justifyContent: "center",
  },
  track: {
    position: "absolute",
    top: 22,
    right: THUMB_SIZE / 2,
    left: THUMB_SIZE / 2,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.border,
  },
  selectedTrack: {
    position: "absolute",
    top: 22,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.malbec,
  },
  thumb: {
    position: "absolute",
    top: 10,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 3,
    borderColor: Colors.surface,
    backgroundColor: Colors.malbec,
    shadowColor: Colors.wineDark,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});

const filterStyles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(37, 37, 37, 0.35)",
  },
  sheet: {
    gap: Spacing.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  section: {
    gap: Spacing.sm,
  },
  chipsContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  priceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  searchField: {
    flex: 1,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
});
