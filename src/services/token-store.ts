// En web se conserva solo durante esta pestaña; el token nativo usa SecureStore.
const clave = 'wineway.sesion';
export const leerToken = async () =>
  typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(clave);
export const guardarToken = async (token: string) => {
  sessionStorage.setItem(clave, token);
};
export const borrarToken = async () => {
  if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(clave);
};
