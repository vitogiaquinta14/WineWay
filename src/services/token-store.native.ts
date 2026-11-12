//en SSecureStore se guarda en el dispositivo movil
import * as SecureStore from 'expo-secure-store';
const clave = 'wineway.sesion';
//aca se recupera el token del almacenamiento.
export const leerToken = () => SecureStore.getItemAsync(clave);
export const guardarToken = (token: string) => SecureStore.setItemAsync(clave, token);
export const borrarToken = () => SecureStore.deleteItemAsync(clave);
