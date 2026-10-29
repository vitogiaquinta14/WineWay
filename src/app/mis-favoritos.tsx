import { router, useIsFocused } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, View } from 'react-native';

import { BodegaCard } from '@/components/bodega/bodega-card';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import type { Bodega } from '@/data/bodegas';
import { api } from '@/services/api';
import { useRecurso } from '@/state/use-recurso';
import { useSesion } from '@/state/sesion-context';

export default function FavoritosScreen() {
  const { sesionIniciada } = useSesion();
  const enfocada = useIsFocused();
  const cargar = useCallback(
    () => (sesionIniciada && enfocada ? api<Bodega[]>('/favoritos') : Promise.resolve([])),
    [sesionIniciada, enfocada],
  );
  const { datos, error, cargando, recargar } = useRecurso<Bodega[]>(cargar, []);



  return (
    <Screen padded={false} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md }}>
        <IconButton icon="back" accessibilityLabel="Volver a Mi perfil" onPress={() => router.canGoBack() ? router.back() : router.replace('/perfil')} />
        <AppText variant="title">Mis favoritos</AppText>
        <AppText variant="caption">Bodegas que guardaste para tenerlas a mano.</AppText>
        {error && <><AppText color="malbec">{error}</AppText><Button title="Reintentar" variant="outline" onPress={() => void recargar()} /></>}
      </View>
      {!sesionIniciada ? (
        <View style={{ paddingHorizontal: Spacing.lg, gap: Spacing.md }}>
          <AppText>Iniciá sesión para guardar y consultar tus bodegas favoritas.</AppText>
          <Button title="Iniciar sesión" onPress={() => router.push('/login')} />
        </View>
      ) : (
        <FlatList
          data={datos}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.md, flexGrow: 1 }}
          refreshing={cargando}
          onRefresh={() => void recargar()}
          ListEmptyComponent={
            <View style={{ gap: Spacing.md }}>
              {cargando ? <AppText>Cargando favoritos…</AppText> : error ? null : <AppText>Todavía no guardaste bodegas favoritas. Podés marcarlas desde la ficha de cada bodega.</AppText>}
              {!cargando && !error && <Button title="Explorar bodegas" onPress={() => router.navigate('/explorar')} />}
            </View>
          }
          renderItem={({ item }) => <BodegaCard bodega={item} onPress={() => router.push(`/bodega/${item.id}`)} />}
        />
      )}
    </Screen>
  );
}
