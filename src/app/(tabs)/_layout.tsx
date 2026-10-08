import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/navigation/tab-bar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="explorar" options={{ title: 'Explorar' }} />
      <Tabs.Screen name="escanear" options={{ title: 'Escanear' }} />
      <Tabs.Screen name="mi-ruta" options={{ title: 'Mi Ruta' }} />
      <Tabs.Screen name="mi-cava" options={{ title: 'Mi Cava' }} />
    </Tabs>
  );
}
