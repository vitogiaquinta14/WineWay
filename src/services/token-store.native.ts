import * as SecureStore from 'expo-secure-store';
const clave = 'wineway.sesion';
export const leerToken = () => SecureStore.getItemAsync(clave);
export const guardarToken = (token: string) => SecureStore.setItemAsync(clave, token);
export const borrarToken = () => SecureStore.deleteItemAsync(clave);
