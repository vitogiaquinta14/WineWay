import { router, useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/placeholder-screen';
import { Button } from '@/components/ui/button';

export default function BodegaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PlaceholderScreen title="Detalle de bodega" description={`id: ${id}`}>
      <Button title="Volver" variant="outline" icon="back" onPress={() => router.back()} />
    </PlaceholderScreen>
  );
}
