import { router } from 'expo-router';

import { PlaceholderScreen } from '@/components/placeholder-screen';
import { Button } from '@/components/ui/button';

export default function CrearRutaScreen() {
  return (
    <PlaceholderScreen title="Crear mi ruta">
      <Button title="Volver" variant="outline" icon="back" onPress={() => router.back()} />
    </PlaceholderScreen>
  );
}
