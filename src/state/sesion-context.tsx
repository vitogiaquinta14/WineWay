import { api, configurarSesion } from '@/services/api';
import { borrarToken, guardarToken, leerToken } from '@/services/token-store';
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';

export type Usuario = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  fechaNacimiento: string;
  apodo: string | null;
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

export type DatosPerfil = Pick<Usuario, 'nombre' | 'apellido' | 'email' | 'username' | 'apodo'>;

type Sesion = {
  usuario: Usuario | null;
  sesionIniciada: boolean;
  cargando: boolean;
  iniciarSesion: (identificador: string, password: string) => Promise<void>;
  registrarse: (datos: Registro) => Promise<void>;
  actualizarPerfil: (datos: DatosPerfil) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

//createContext es una funcion de React. Si hay un componente SesionProvider por encima, el contenido va a tener la forma de Sesion. Si no hay, es null.
//escrita dentro de React, en node_modules
const Contexto = createContext<Sesion | null>(null);

//Definimos al componente SesionProvider que va a envolver a los componentes que necesitan acceder a la sesión. Va a entregar al contexto el objeto indicado en value. Los componentes que están dentro de {children} pueden leerlo con use(Contexto).
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
          //manda el token en el header, y el backend lo verifica con exigirSesion y devuelve el usuario
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

  //recibe ruta y los datos: mail/username y password. 
  //si la ruta es /auth/login, el backend crea una sesion.
  //si la ruta es /auth/registro, el backend crea un usuario y una sesion.
  //en ambos casos, el backend devuelve un token y los datos del usuario. 
  const autenticar = async (ruta: string, body: unknown) => {
    const r = await api<{ token: string; usuario: Usuario }>(ruta, {
      method: 'POST',
      body,
      //sinSesion no va al backend. Se usa para avisar a api-core que no mande el token de sesion en el header de la consulta.
      sinSesion: true,
    });
    //lo guarda en SecureStorage del dispositivo.
    await guardarToken(r.token);
    //lo guarda en una nueva variable en memoria, que es la que usa api-core para mandar el token en el header de las consultas al backend.
    configurarSesion(r.token, limpiar);
    //guarda el usuario en el estado de React. 
    //Eso hace que SesionProvider se vuelva a ejecutar, que sesionIniciada pase a true, y que el Stack.Protected habilite las pantallas protegidas.
    setUsuario(r.usuario);
  };

  //llama a logout, que elimina la sesion en el backend. Luego limpia la sesion en el frontend.
  const cerrarSesion = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } finally {
      limpiar();
    }
  };

  //actualiza el perfil del usuario para actualizar los datos personales. 
  const actualizarPerfil = async (datos: DatosPerfil) => {
    const actualizado = await api<Usuario>('/yo', { method: 'PATCH', body: datos });
    setUsuario(actualizado);
  };

  return (
    //Contexo se crea con createContext (de React). Es el canal por el que SesionProvider comparte la sesión. No se exporta: los componentes la leen con useSesion().
    //Cuando React dibuja SesionProvider, llega a la etiqueta <Contexto value={...}>.
    //el _currentValue de Contexto va a ser el objeto que se pasa a value. 
    //Entonces use(Contexto) recibe Contexto y devuelve el _currentValue, que es el objeto con usuario, iniciarSesion, etc. que se pasa a value.
    <Contexto
      value={{
        usuario,
        cargando,
        sesionIniciada: usuario !== null,
        //aca se define la función iniciarSesion que se pasa al contexto. Recibe un identificador y un password, llama a autenticar con la ruta de login y los datos, y actualiza el estado del usuario.
        iniciarSesion: (identificador, password) =>
          autenticar('/auth/login', { identificador, password }),
        registrarse: (datos) => autenticar('/auth/registro', datos),
        actualizarPerfil,
        cerrarSesion,
      }}
      //los children son los que RootLayout envuelve con SesionProvider. 
      //Pueden leer el contexto con use(Contexto).
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
