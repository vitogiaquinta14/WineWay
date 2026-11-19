import { crearCliente } from './api-core';
//guarda el token en RAM para tenerlo disponible para agregar a cada peticion HTTP; no se guarda en la base de datos ni en el almacenamiento local
let token: string | null = null;
let sesionVencida: () => void = () => {};

export function configurarSesion(valor: string | null, alVencer?: () => void) {
  //se guarda el token en la variable token para que esté disponible para agregarlo a cada petición HTTP. Si se pasa una función alVencer, se guarda en sesionVencida para que se llame cuando la sesión caduque.
  token = valor;
  if (alVencer) sesionVencida = alVencer;
}
export const baseUrlAPI = process.env.EXPO_PUBLIC_API_URL ?? '';
export const api = crearCliente({
  baseUrl: baseUrlAPI,
  getToken: () => token,
  onUnauthorized: () => sesionVencida(),
});
