import * as Linking from 'expo-linking';
import type { Ruta } from '@/data/rutas';
import { crearCalendario } from '@/utils/calendario';
import { api, baseUrlAPI } from './api';

export async function exportarCalendario(ruta: Ruta) {
  const { path } = await api<{ path: string }>('/calendarios', {
    method: 'POST',
    body: { contenido: crearCalendario(ruta) },
  });
  if (!/^\/calendarios\/[a-f0-9]{64}\.ics$/.test(path)) {
    throw new Error('El servidor devolvió un enlace de calendario inválido.');
  }
  await Linking.openURL(`${baseUrlAPI.replace(/\/$/, '')}${path}`);
}
