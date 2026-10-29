import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';
import { api, configurarSesion } from '@/services/api';
import { leerToken, guardarToken, borrarToken } from '@/services/token-store';
export type Usuario = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  fechaNacimiento: string;
  apodo: string | null;
  fotoUrl: string | null;
};
export type Registro = {
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  password: string;
  fechaNacimiento: string;
  apodo?: string;
};
export type DatosPerfil = Pick<Usuario, 'nombre' | 'apellido' | 'email' | 'username'> &
  Pick<Usuario, 'apodo' | 'fotoUrl'>;
type Sesion = {
  usuario: Usuario | null;
  sesionIniciada: boolean;
  cargando: boolean;
  iniciarSesion: (identificador: string, password: string) => Promise<void>;
  registrarse: (datos: Registro) => Promise<void>;
  actualizarPerfil: (datos: DatosPerfil) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};
const Contexto = createContext<Sesion | null>(null);
export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const limpiar = useCallback(() => {
    configurarSesion(null);
    setUsuario(null);
    void borrarToken().catch(() => {});
  }, []);
  useEffect(() => {
    let activo = true;
    void (async () => {
      try {
        const token = await leerToken();
        if (token) {
          configurarSesion(token, limpiar);
          const u = await api<Usuario>('/yo');
          if (activo) setUsuario(u);
        }
      } catch {
        limpiar();
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [limpiar]);
  const autenticar = async (ruta: string, body: unknown) => {
    const r = await api<{ token: string; usuario: Usuario }>(ruta, {
      method: 'POST',
      body,
      sinSesion: true,
    });
    await guardarToken(r.token);
    configurarSesion(r.token, limpiar);
    setUsuario(r.usuario);
  };
  const cerrarSesion = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } finally {
      limpiar();
    }
  };
  const actualizarPerfil = async (datos: DatosPerfil) => {
    const actualizado = await api<Usuario>('/yo', { method: 'PATCH', body: datos });
    setUsuario(actualizado);
  };
  return (
    <Contexto
      value={{
        usuario,
        cargando,
        sesionIniciada: usuario !== null,
        iniciarSesion: (identificador, password) =>
          autenticar('/auth/login', { identificador, password }),
        registrarse: (datos) => autenticar('/auth/registro', datos),
        actualizarPerfil,
        cerrarSesion,
      }}
    >
      {children}
    </Contexto>
  );
}
export function useSesion() {
  const contexto = use(Contexto);
  if (!contexto) throw new Error('Falta SesionProvider');
  return contexto;
}
