import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import type { Bodega, Coordenadas } from '@/data/bodegas';

type BodegasMapProps = {
  bodegas: Bodega[];
  bodegaDestacada?: Bodega;
  onBodegaPress: (bodega: Bodega) => void;
};

type EstadoUbicacion =
  | 'inicial'
  | 'buscando'
  | 'lista'
  | 'permisoDenegado'
  | 'servicioDesactivado'
  | 'noDisponible';

const REGION_MENDOZA: Region = {
  latitude: -33.48,
  longitude: -69.14,
  latitudeDelta: 0.86,
  longitudeDelta: 0.86,
};

function mensajeUbicacion(estado: EstadoUbicacion): string | undefined {
  switch (estado) {
    case 'buscando':
      return 'Buscando tu ubicación…';
    case 'permisoDenegado':
      return 'Mostramos Mendoza. Podés habilitar tu ubicación cuando quieras.';
    case 'servicioDesactivado':
      return 'Activá la ubicación del teléfono para centrar el mapa en vos.';
    case 'noDisponible':
      return 'No pudimos obtener tu ubicación. El mapa sigue disponible.';
    default:
      return undefined;
  }
}

/** Mapa nativo con marcadores de las bodegas y ubicación puntual opcional. */
export function BodegasMap({ bodegas, bodegaDestacada, onBodegaPress }: BodegasMapProps) {
  const mapRef = useRef<MapView>(null);
  const [estadoUbicacion, setEstadoUbicacion] = useState<EstadoUbicacion>('inicial');
  const [ubicacion, setUbicacion] = useState<Coordenadas>();
  const [puedePedirPermiso, setPuedePedirPermiso] = useState(true);

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
  const usarMiUbicacion = async () => {
    if (estadoUbicacion === 'permisoDenegado' && !puedePedirPermiso) {
      await Linking.openSettings();
      return;
    }

    setEstadoUbicacion('buscando');

    try {
      const serviciosActivos = await Location.hasServicesEnabledAsync();
      if (!serviciosActivos) {
        setEstadoUbicacion('servicioDesactivado');
        return;
      }

      const permiso = await Location.requestForegroundPermissionsAsync();
      if (!permiso.granted) {
        setPuedePedirPermiso(permiso.canAskAgain);
        setEstadoUbicacion('permisoDenegado');
        return;
      }

      const posicion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coordenadas = {
        latitude: posicion.coords.latitude,
        longitude: posicion.coords.longitude,
      };

      setUbicacion(coordenadas);
      setEstadoUbicacion('lista');
      mapRef.current?.animateToRegion(
        { ...coordenadas, latitudeDelta: 0.12, longitudeDelta: 0.12 },
        500,
      );
    } catch {
      setEstadoUbicacion('noDisponible');
    }
  };

  if (bodegas.length === 0) {
    return (
      <EmptyState
        icon="map"
        title="Sin bodegas en el mapa"
        description="Cambiá los filtros para ver marcadores en Mendoza."
      />
    );
  }

  const abrirConfiguracion = estadoUbicacion === 'permisoDenegado' && !puedePedirPermiso;
  const mensaje = mensajeUbicacion(estadoUbicacion);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        initialRegion={REGION_MENDOZA}
        style={styles.map}
        showsUserLocation={Boolean(ubicacion)}
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

      <View style={styles.overlay} pointerEvents="box-none">
        {mensaje && (
          <View style={styles.statusCard} pointerEvents="none">
            <AppText variant="caption" color="text">
              {mensaje}
            </AppText>
          </View>
        )}
        <View pointerEvents="auto">
          <Button
            title={abrirConfiguracion ? 'Abrir configuración' : 'Usar mi ubicación'}
            variant={estadoUbicacion === 'lista' ? 'secondary' : 'outline'}
            icon="pin"
            disabled={estadoUbicacion === 'buscando'}
            onPress={() => void usarMiUbicacion()}
          />
        </View>
      </View>
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
  overlay: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.lg,
    left: Spacing.lg,
    gap: Spacing.sm,
  },
  statusCard: {
    alignSelf: 'stretch',
    borderRadius: Radius.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    ...Shadow.card,
  },
});
