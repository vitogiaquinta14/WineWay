import 'leaflet/dist/leaflet.css';

import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { EmptyState } from '@/components/ui/empty-state';
import { Colors, Spacing } from '@/constants/theme';
import type { Bodega } from '@/data/bodegas';

type BodegasMapProps = {
  bodegas: Bodega[];
  bodegaDestacada?: Bodega;
  onBodegaPress: (bodega: Bodega) => void;
};

/** Mapa web interactivo con datos del catálogo y teselas de OpenStreetMap. */
export function BodegasMap({ bodegas, bodegaDestacada, onBodegaPress }: BodegasMapProps) {
  const elemento = useRef<HTMLDivElement>(null);
  const mapa = useRef<import('leaflet').Map | null>(null);
  const capaMarcadores = useRef<import('leaflet').LayerGroup | null>(null);
  const leaflet = useRef<typeof import('leaflet') | null>(null);
  const abrirBodega = useRef(onBodegaPress);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    abrirBodega.current = onBodegaPress;
  }, [onBodegaPress]);

  useEffect(() => {
    let cancelado = false;
    void import('leaflet').then((L) => {
      if (cancelado || !elemento.current) return;
      leaflet.current = L;
      mapa.current = L.map(elemento.current, { zoomControl: true }).setView([-33.48, -69.14], 9);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(mapa.current);
      capaMarcadores.current = L.layerGroup().addTo(mapa.current);
      setListo(true);
    });

    return () => {
      cancelado = true;
      mapa.current?.remove();
      mapa.current = null;
      capaMarcadores.current = null;
      leaflet.current = null;
    };
  }, []);

  useEffect(() => {
    const L = leaflet.current;
    const vista = mapa.current;
    const capa = capaMarcadores.current;
    if (!listo || !L || !vista || !capa) return;

    capa.clearLayers();
    const marcadores = bodegas.map((bodega) => {
      const marcador = L.circleMarker([bodega.coordenadas.latitude, bodega.coordenadas.longitude], {
        radius: bodega.id === bodegaDestacada?.id ? 9 : 7,
        color: Colors.malbec,
        fillColor: Colors.malbec,
        fillOpacity: 0.9,
        weight: 2,
      });
      const popup = document.createElement('div');
      const nombre = document.createElement('strong');
      const boton = document.createElement('button');
      nombre.textContent = bodega.nombre;
      boton.type = 'button';
      boton.textContent = 'Ver bodega';
      boton.style.marginTop = `${Spacing.sm}px`;
      boton.style.padding = `${Spacing.sm}px ${Spacing.md}px`;
      boton.style.border = '0';
      boton.style.borderRadius = '8px';
      boton.style.backgroundColor = Colors.malbec;
      boton.style.color = '#ffffff';
      boton.style.cursor = 'pointer';
      boton.addEventListener('click', () => abrirBodega.current(bodega));
      popup.append(nombre, document.createElement('br'), boton);
      marcador.bindPopup(popup, { closeButton: true });
      marcador.addTo(capa);
      return marcador;
    });

    if (bodegaDestacada) {
      vista.setView(
        [bodegaDestacada.coordenadas.latitude, bodegaDestacada.coordenadas.longitude],
        14,
      );
      const indiceDestacado = bodegas.findIndex((bodega) => bodega.id === bodegaDestacada.id);
      marcadores[indiceDestacado]?.openPopup();
    } else if (marcadores.length === 1) {
      vista.setView(marcadores[0].getLatLng(), 12);
    } else if (marcadores.length > 1) {
      vista.fitBounds(L.featureGroup(marcadores).getBounds().pad(0.12), { maxZoom: 12 });
    }
  }, [bodegas, bodegaDestacada, listo]);

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
    <View style={{ flex: 1, minHeight: 320, gap: Spacing.sm }}>
      <View
        ref={(referencia) => {
          elemento.current = referencia as unknown as HTMLDivElement | null;
        }}
        accessibilityLabel="Mapa de bodegas de Mendoza"
        style={{ width: '100%', height: '100%', minHeight: 320, flex: 1 }}
      />
      {!listo && (
        <AppText variant="caption" align="center">
          Cargando mapa…
        </AppText>
      )}
    </View>
  );
}
