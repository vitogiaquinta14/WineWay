import * as Location from 'expo-location';
import { useState } from 'react';
import { Linking } from 'react-native';
import type { Coordenadas } from '@/data/bodegas';

export type EstadoUbicacion =
  | 'inicial'
  | 'buscando'
  | 'lista'
  | 'permisoDenegado'
  | 'servicioDesactivado'
  | 'noDisponible';

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

/**
 * Ubicación puntual a pedido (no se sigue en segundo plano). Si el permiso quedó
 * denegado para siempre, el mismo botón abre la configuración del teléfono.
 */
export function useMiUbicacion(alEncontrar: (coordenadas: Coordenadas) => void) {
  const [estado, setEstado] = useState<EstadoUbicacion>('inicial');
  const [ubicacion, setUbicacion] = useState<Coordenadas>();
  const [puedePedirPermiso, setPuedePedirPermiso] = useState(true);
  const abrirConfiguracion = estado === 'permisoDenegado' && !puedePedirPermiso;

  const usar = async () => {
    if (abrirConfiguracion) {
      await Linking.openSettings();
      return;
    }
    setEstado('buscando');
    try {
      if (!(await Location.hasServicesEnabledAsync())) {
        setEstado('servicioDesactivado');
        return;
      }
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (!permiso.granted) {
        setPuedePedirPermiso(permiso.canAskAgain);
        setEstado('permisoDenegado');
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
      setEstado('lista');
      alEncontrar(coordenadas);
    } catch {
      setEstado('noDisponible');
    }
  };

  return {
    estado,
    ubicacion,
    usar,
    mensaje: mensajeUbicacion(estado),
    textoBoton: abrirConfiguracion ? 'Abrir configuración' : 'Usar mi ubicación',
  };
}
