import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { CatalogoProvider } from '@/state/catalogo-context';
import { CavaProvider } from '@/state/cava-context';
import { RutaProvider } from '@/state/ruta-context';
import { SesionProvider, useSesion } from '@/state/sesion-context';

//No ocultar la pantalla de carga hasta que las fuentes estén listas. Esto evita parpadeos de pantalla en blanco al iniciar la app.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  //definicion de fuentes de texto que se van a usar en la app. Se cargan desde Google Fonts usando el paquete @expo-google-fonts/inter.
  //useFonts guarda en fontsLoaded un booleano que indica si las fuentes se cargaron correctamente, y en fontError un error si hubo problemas al cargar las fuentes.
  //es un hook que usa RootLayout. Cuando se cargan, su estado cambia de false a true.
  //Como RootLayout usa ese hook, React sabe que depende de ese estado y vuelve a ejecutar RootLayout. --> ahora ready = true y sela función completa para ver qué devuelve ahora devuelve el arbol de componentes anidados.
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const ready = fontsLoaded || fontError;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  //el splsh sigue tapando la pantalla hasta que las fuentes esten listas.
  if (!ready) {
    return null;
  }
  //Retorna un arbol de componentes anidados. 
  //El componente RootLayout es el componente raiz de la app. 
  //Contiene a los providers de contexto (contexto de sesion y catálogo) y al componente DatosPersonales que contiene a RootNavigator que contiene al Stack que maneja la navegacion entre pantallas.
  return (
    <SesionProvider>
      <CatalogoProvider>
        <DatosPersonales />
      </CatalogoProvider>
    </SesionProvider>
  );
}

/**
 * El catálogo es público. Crear rutas requiere cuenta; las operaciones privadas
 * se autorizan además en Express.
 */
function RootNavigator() {
  const { sesionIniciada, cargando } = useSesion();
  if (cargando) return null;

  return (
    //Stack es un componente que viene de expo-router. Maneja la navegacion entre pantallas. Cada Stack.Screen es una pantalla.
    //El nombre de la pantalla es el nombre del archivo en src/app. 
    //El Stack.Protected es un componente que protege las pantallas que requieren sesion iniciada. Si el usuario no tiene sesion iniciada, lo redirige a la pantalla "(auth)".
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="bodega/[id]" />

      <Stack.Protected guard={sesionIniciada}>
        <Stack.Screen name="crear-ruta" />
        <Stack.Screen name="ruta/[id]" />
        <Stack.Screen name="perfil" />
        <Stack.Screen name="mis-datos" />
        <Stack.Screen name="mis-favoritos" />
        <Stack.Screen name="mis-resenas" />
      </Stack.Protected>
      <Stack.Protected guard={!sesionIniciada}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

/** Cambiar de cuenta desmonta los datos privados de la sesión anterior. */
//es una funcion aparte para poder leer la key del provider de sesion y reiniciar el estado de la sesion cuando cambia la cuenta.
// RootLayout está por encima de SesionProvider, así que no puede usar useSesion().
// Por eso la lectura de la sesión se hace en DatosPersonales desde adentro.
function DatosPersonales() {
  const { usuario } = useSesion();
  return (
    //RutaProvider en sesion-context.tsx
    //CavaProvider en cava-context.tsx
    //StatusBar en expo-status-bar --> Instrucciones al SO para mostrar hora, bateria, etc. en la parte superior de la pantalla. style="dark" --> texto oscuro
    //RootNavigator maneja la navegacion, contiene al Stack.

    //la key del provider es el id del usuario. Cuando cambia, React desmonta el provider y monta uno nuevo. Esto hace que se reinicie el estado de la sesión y se borren los datos privados de la sesión anterior.
    <RutaProvider key={usuario?.id ?? 'visitante'}>
      <CavaProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </CavaProvider>
    </RutaProvider>
  );
}
