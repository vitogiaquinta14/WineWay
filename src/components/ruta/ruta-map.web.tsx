import 'leaflet/dist/leaflet.css';

import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { ControlUbicacion } from '@/components/ui/control-ubicacion';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Coordenadas } from '@/data/bodegas';
import { useMiUbicacion } from '@/state/use-mi-ubicacion';
import type { RutaMapProps } from './ruta-map.types';

/** Azul habitual del punto "estás acá", distinto de los colores de los días. */
const COLOR_UBICACION = '#1A73E8';

/** Mapa web de la ruta (Leaflet + OpenStreetMap): paradas numeradas, una línea por día y tu ubicación a pedido. */
export function RutaMap({ paradas, onBodegaPress }: RutaMapProps) {
  const elemento = useRef<HTMLDivElement>(null);
  const mapa = useRef<import('leaflet').Map | null>(null);
  const capa = useRef<import('leaflet').LayerGroup | null>(null);
  const leaflet = useRef<typeof import('leaflet') | null>(null);
  const abrirBodega = useRef(onBodegaPress);
  const [listo, setListo] = useState(false);
  const [miPosicion, setMiPosicion] = useState<Coordenadas>();
  const ubicacion = useMiUbicacion(setMiPosicion);

  useEffect(() => {
    abrirBodega.current = onBodegaPress;
  }, [onBodegaPress]);

  useEffect(() => {
    let cancelado = false;
    void import('leaflet').then((L) => {
      if (cancelado || !elemento.current) return;
      leaflet.current = L;
      mapa.current = L.map(elemento.current).setView([-33.1, -68.8], 9);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(mapa.current);
      capa.current = L.layerGroup().addTo(mapa.current);
      setListo(true);
    });
    return () => {
      cancelado = true;
      mapa.current?.remove();
      mapa.current = null;
      capa.current = null;
      leaflet.current = null;
    };
  }, []);

  useEffect(() => {
    const L = leaflet.current;
    const vista = mapa.current;
    if (!listo || !L || !vista || !capa.current) return;
    capa.current.clearLayers();
    for (const dia of new Set(paradas.map((p) => p.diaId))) {
      const delDia = paradas.filter((p) => p.diaId === dia);
      if (delDia.length > 1)
        L.polyline(
          delDia.map((p) => [p.coordenadas.latitude, p.coordenadas.longitude]),
          { color: delDia[0].color, weight: 3 },
        ).addTo(capa.current);
    }
    const marcadores = paradas.map((p) => {
      const icono = L.divIcon({
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        html: `<div style="width:28px;height:28px;border-radius:14px;background:${p.color};border:2px solid #fff;color:#fff;font:700 12px sans-serif;display:flex;align-items:center;justify-content:center;box-sizing:border-box">${p.numero}</div>`,
      });
      const popup = document.createElement('div');
      const nombre = document.createElement('strong');
      const detalle = document.createElement('div');
      const boton = document.createElement('button');
      nombre.textContent = `${p.numero}. ${p.bodega.nombre}`;
      detalle.textContent = p.detalle;
      boton.type = 'button';
      boton.textContent = 'Ver bodega';
      Object.assign(boton.style, {
        marginTop: `${Spacing.sm}px`,
        padding: `${Spacing.sm}px ${Spacing.md}px`,
        border: '0',
        borderRadius: '8px',
        backgroundColor: Colors.malbec,
        color: '#ffffff',
        cursor: 'pointer',
      });
      boton.addEventListener('click', () => abrirBodega.current(p.bodega));
      popup.append(nombre, detalle, boton);
      return L.marker([p.coordenadas.latitude, p.coordenadas.longitude], { icon: icono })
        .bindPopup(popup)
        .addTo(capa.current!);
    });
    // Lo que tiene que quedar a la vista: las paradas y, si se pidió, tu ubicación.
    const encuadre: (import('leaflet').Marker | import('leaflet').CircleMarker)[] = [...marcadores];
    if (miPosicion)
      encuadre.push(
        L.circleMarker([miPosicion.latitude, miPosicion.longitude], {
          radius: 8,
          color: '#ffffff',
          weight: 3,
          fillColor: COLOR_UBICACION,
          fillOpacity: 1,
        })
          .bindPopup('Estás acá')
          .addTo(capa.current),
      );
    if (encuadre.length === 1) vista.setView(encuadre[0].getLatLng(), 13);
    else if (encuadre.length > 1)
      vista.fitBounds(L.featureGroup(encuadre).getBounds().pad(0.15), { maxZoom: 13 });
  }, [paradas, listo, miPosicion]);

  return (
    <View
      style={{
        height: 360,
        borderRadius: Radius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
      }}>
      <View
        ref={(referencia) => {
          elemento.current = referencia as unknown as HTMLDivElement | null;
        }}
        accessibilityLabel="Mapa de la ruta"
        style={{ width: '100%', height: '100%' }}
      />
      <ControlUbicacion ubicacion={ubicacion} />
    </View>
  );
}
