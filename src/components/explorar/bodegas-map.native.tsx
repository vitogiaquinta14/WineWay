import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import { ControlUbicacion } from '@/components/ui/control-ubicacion';
import { EmptyState } from '@/components/ui/empty-state';
import { Colors } from '@/constants/theme';
import type { Bodega } from '@/data/bodegas';
import { useMiUbicacion } from '@/state/use-mi-ubicacion';

type BodegasMapProps = {
  bodegas: Bodega[];
  bodegaDestacada?: Bodega;
  onBodegaPress: (bodega: Bodega) => void;
};

const REGION_MENDOZA: Region = {
  latitude: -33.48,
  longitude: -69.14,
  latitudeDelta: 0.86,
  longitudeDelta: 0.86,
};

/** Mapa nativo con marcadores de las bodegas y ubicación puntual opcional. */
export function BodegasMap({ bodegas, bodegaDestacada, onBodegaPress }: BodegasMapProps) {
  const mapRef = useRef<MapView>(null);
  const ubicacion = useMiUbicacion((coordenadas) =>
    mapRef.current?.animateToRegion(
      { ...coordenadas, latitudeDelta: 0.12, longitudeDelta: 0.12 },
      500,
    ),
  );

  useEffect(() => {
    if (!bodegaDestacada) return;

    mapRef.current?.animateToRegion(
      {
        ...bodegaDestacada.coordenadas,
        latitudeDelta: 0.12,
        longitudeDelta: 0.12,
      },
      500,
    );
  }, [bodegaDestacada]);
  if (bodegas.length === 0) {
    return (
      <EmptyState
        icon="map"
        title="Sin bodegas en el mapa"
        description="Cambiá los filtros para ver marcadores en Mendoza."
      />
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        initialRegion={REGION_MENDOZA}
        style={styles.map}
        showsUserLocation={Boolean(ubicacion.ubicacion)}
        showsMyLocationButton={false}>
        {bodegas.map((bodega) => (
          <Marker
            key={bodega.id}
            coordinate={bodega.coordenadas}
            title={bodega.nombre}
            description="Tocá para ver la bodega"
            onCalloutPress={() => onBodegaPress(bodega)}
            pinColor={Colors.malbec}
          />
        ))}
      </MapView>

      <ControlUbicacion ubicacion={ubicacion} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
