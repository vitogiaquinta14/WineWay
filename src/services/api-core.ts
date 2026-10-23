export class ErrorAPI extends Error {
  constructor(
    public status: number,
    public codigo: string,
    mensaje: string,
    public campos: Record<string, string> = {},
  ) {
    super(mensaje);
  }
}
type Opciones = { method?: string; body?: unknown; sinSesion?: boolean };
export function crearCliente(config: {
  baseUrl: string;
  getToken: () => string | null;
  fetcher?: typeof fetch;
  onUnauthorized?: () => void;
}) {
  return async function solicitar<T = unknown>(ruta: string, opciones: Opciones = {}): Promise<T> {
    if (!config.baseUrl)
      throw new Error('Configurá EXPO_PUBLIC_API_URL con la dirección del backend.');
    const token = opciones.sinSesion ? null : config.getToken();
    let respuesta: Response;
    try {
      respuesta = await (config.fetcher ?? fetch)(`${config.baseUrl.replace(/\/$/, '')}${ruta}`, {
        method: opciones.method ?? 'GET',
        headers: {
          Accept: 'application/json',
          ...(opciones.body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: opciones.body === undefined ? undefined : JSON.stringify(opciones.body),
      });
    } catch {
      throw new Error(
        'No se pudo conectar con WineWay. Revisá la conexión y la dirección del servidor.',
      );
    }
    if (respuesta.status === 204) return undefined as T;
    const datos = await respuesta.json();
    if (!respuesta.ok) {
      if (respuesta.status === 401 && !opciones.sinSesion) config.onUnauthorized?.();
      throw new ErrorAPI(
        respuesta.status,
        datos.error?.codigo ?? 'ERROR_HTTP',
        datos.error?.mensaje ?? 'No se pudo completar la operación.',
        datos.error?.campos ?? {},
      );
    }
    return datos as T;
  };
}
