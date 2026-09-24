import { YoungSerif_400Regular, useFonts } from '@expo-google-fonts/young-serif';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { RutaProvider } from '@/state/ruta-context';
import { SesionProvider, useSesion } from '@/state/sesion-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ YoungSerif_400Regular });
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
      <RutaProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </RutaProvider>
    </SesionProvider>
  );
}

/**
 * Sin sesión solo se puede acceder a (auth); con sesión, al resto de la app.
 * Cuando la sesión cambia, Expo Router redirige a la primera pantalla disponible.
 */
function RootNavigator() {
  const { sesionIniciada } = useSesion();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Protected guard={sesionIniciada}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="bodega/[id]" />
        <Stack.Screen name="crear-ruta" />
      </Stack.Protected>

      <Stack.Protected guard={!sesionIniciada}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
