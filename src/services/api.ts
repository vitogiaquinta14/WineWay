import { crearCliente } from './api-core';
let token: string | null = null;
let sesionVencida: () => void = () => {};
export function configurarSesion(valor: string | null, alVencer?: () => void) {
  token = valor;
  if (alVencer) sesionVencida = alVencer;
}
export const baseUrlAPI = process.env.EXPO_PUBLIC_API_URL ?? '';
export const api = crearCliente({
  baseUrl: baseUrlAPI,
  getToken: () => token,
  onUnauthorized: () => sesionVencida(),
});
