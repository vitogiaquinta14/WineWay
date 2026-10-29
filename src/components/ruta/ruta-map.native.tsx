import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { AppText } from '@/components/ui/app-text';
import { ControlUbicacion } from '@/components/ui/control-ubicacion';
import { Colors, Radius } from '@/constants/theme';
import { useMiUbicacion } from '@/state/use-mi-ubicacion';
import type { RutaMapProps } from './ruta-map.types';

const BORDE = { top: 48, right: 48, bottom: 48, left: 48 };

/** Mapa nativo de la ruta: paradas numeradas, una línea por día y tu ubicación a pedido. */
export function RutaMap({ paradas, onBodegaPress }: RutaMapProps) {
  const mapa = useRef<MapView>(null);
  const encuadrar = useCallback(
    () =>
      mapa.current?.fitToCoordinates(
        paradas.map((p) => p.coordenadas),
        { edgePadding: BORDE, animated: true },
      ),
    [paradas],
  );
  useEffect(() => void encuadrar(), [encuadrar]);
  // Al encontrarte, encuadra tu posición junto con las paradas.
  const ubicacion = useMiUbicacion((coordenadas) =>
    mapa.current?.fitToCoordinates([coordenadas, ...paradas.map((p) => p.coordenadas)], {
      edgePadding: BORDE,
      animated: true,
    }),
  );

  const dias = [...new Set(paradas.map((p) => p.diaId))];
  return (
    <View style={styles.contenedor}>
      <MapView
        ref={mapa}
        style={StyleSheet.absoluteFill}
        onMapReady={encuadrar}
        showsUserLocation={Boolean(ubicacion.ubicacion)}
        showsMyLocationButton={false}
        initialRegion={{ latitude: -33.1, longitude: -68.8, latitudeDelta: 0.8, longitudeDelta: 0.8 }}>
        {dias.map((dia) => {
          const delDia = paradas.filter((p) => p.diaId === dia);
          return delDia.length > 1 ? (
            <Polyline
              key={dia}
              coordinates={delDia.map((p) => p.coordenadas)}
              strokeColor={delDia[0].color}
              strokeWidth={3}
            />
          ) : null;
        })}
        {paradas.map((p) => (
          <Marker
            key={p.id}
            coordinate={p.coordenadas}
            title={`${p.numero}. ${p.bodega.nombre}`}
            description={p.detalle}
            onCalloutPress={() => onBodegaPress(p.bodega)}>
            <View style={[styles.numero, { backgroundColor: p.color }]}>
              <AppText variant="caption" color="textOnPrimary" style={styles.texto}>
                {p.numero}
              </AppText>
            </View>
          </Marker>
        ))}
      </MapView>
      <ControlUbicacion ubicacion={ubicacion} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    height: 360,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  numero: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  texto: {
    fontWeight: '700',
  },
});
