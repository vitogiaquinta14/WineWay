import { crearCliente } from './api-core';
let token: string | null = null;
let sesionVencida: () => void = () => {};
export function configurarSesion(valor: string | null, alVencer?: () => void) {
  token = valor;
  if (alVencer) sesionVencida = alVencer;
}
export const api = crearCliente({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
  getToken: () => token,
  onUnauthorized: () => sesionVencida(),
});
