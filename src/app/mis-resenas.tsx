import { router, useIsFocused } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { api } from '@/services/api';
import { useRecurso } from '@/state/use-recurso';

type Resena = {
  id: string;
  valoracion: number;
  comentario: string | null;
  bodega: { id: string; nombre: string; zona: string };
};
export default function MisResenasScreen() {
  const enfocada = useIsFocused();
  const cargar = useCallback(() => enfocada ? api<Resena[]>('/mis-resenas') : Promise.resolve([]), [enfocada]);
  const { datos, cargando, error, recargar } = useRecurso<Resena[]>(cargar, []);
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ gap: Spacing.sm, paddingVertical: Spacing.lg }}>
        <IconButton icon="back" accessibilityLabel="Volver a Mi perfil" onPress={() => router.canGoBack() ? router.back() : router.replace('/perfil')} />
        <AppText variant="title">Mis reseñas</AppText>
        {error && <><AppText color="malbec">{error}</AppText><Button title="Reintentar" onPress={() => void recargar()} /></>}
      </View>
      <FlatList
        data={datos}
        keyExtractor={(r) => r.id}
        refreshing={cargando}
        onRefresh={() => void recargar()}
        contentContainerStyle={{ gap: Spacing.md, paddingBottom: Spacing.lg }}
        ListEmptyComponent={<AppText>{cargando ? 'Cargando reseñas…' : error ? '' : 'Todavía no escribiste reseñas. Podés hacerlo desde la ficha de cada bodega.'}</AppText>}
        renderItem={({ item }) => (
          <Card accessibilityLabel={`Ver reseña de ${item.bodega.nombre}`} onPress={() => router.push(`/bodega/${item.bodega.id}`)}>
            <View style={{ gap: Spacing.sm, padding: Spacing.lg }}>
              <AppText variant="heading">{item.bodega.nombre}</AppText>
              <AppText variant="caption">{item.bodega.zona}</AppText>
              <AppText variant="bodyBold">Tu valoración: {item.valoracion}/5</AppText>
              {item.comentario && <AppText>{item.comentario}</AppText>}
              <AppText variant="caption" color="malbec">Ver bodega y editar reseña</AppText>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}
