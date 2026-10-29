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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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

  if (!ready) {
    return null;
  }

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
function DatosPersonales() {
  const { usuario } = useSesion();
  return (
    <RutaProvider key={usuario?.id ?? 'visitante'}>
      <CavaProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </CavaProvider>
    </RutaProvider>
  );
}
