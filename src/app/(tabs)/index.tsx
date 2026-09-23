import { router } from 'expo-router';

import { PlaceholderScreen } from '@/components/placeholder-screen';
import { Button } from '@/components/ui/button';

export default function HomeScreen() {
  return (
    <PlaceholderScreen title="Inicio" description="Home">
      <Button title="Crear mi ruta" variant="secondary" onPress={() => router.push('/crear-ruta')} />
      <Button
        title="Ver Bodega Salentein"
        variant="outline"
        onPress={() => router.push({ pathname: '/bodega/[id]', params: { id: 'salentein' } })}
      />
      <Button title="Ir a login" variant="outline" onPress={() => router.push('/login')} />
    </PlaceholderScreen>
  );
}
