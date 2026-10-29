import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { useRecurso } from '@/state/use-recurso';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BodegaHero } from '@/components/bodega/bodega-hero';
import { ExperienciaCard } from '@/components/bodega/experiencia-card';
import { VinoCard } from '@/components/bodega/vino-card';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import type { Bodega } from '@/data/bodegas';
import { useCatalogo } from '@/state/catalogo-context';
import { useSesion } from '@/state/sesion-context';
import { api } from '@/services/api';
import { TextField } from '@/components/ui/text-field';
import { StarRating } from '@/components/ui/star-rating';
import { AgregarARutaSheet } from '@/components/ruta/agregar-a-ruta-sheet';
import { useRuta } from '@/state/ruta-context';
import { confirmar } from '@/utils/confirmar';

function volver() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

export default function BodegaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useSesion();
  return <DetalleBodega key={`${id}-${usuario?.id ?? 'visitante'}`} id={id} />;
}
function DetalleBodega({ id }: { id: string }) {
  const { getBodega, recargar } = useCatalogo();
  const { sesionIniciada, usuario } = useSesion();
  const { rutas } = useRuta();
  const [agregando, setAgregando] = useState(false);
  const abrirAgregar = () => {
    if (!sesionIniciada) router.push('/login');
    else if (rutas.length === 0)
      router.push({ pathname: '/crear-ruta', params: { aviso: 'sin-rutas' } });
    else setAgregando(true);
  };
  type Resena = {
    id: string;
    valoracion: number;
    comentario: string | null;
    usuario: { username: string; apodo: string | null };
  };
  const leerDetalle = useCallback(async () => {
    const [detalle, resenas, favoritos] = await Promise.all([
      api<Bodega>(`/bodegas/${id}`),
      api<Resena[]>(`/bodegas/${id}/resenas`),
      sesionIniciada ? api<Bodega[]>('/favoritos') : Promise.resolve([]),
    ]);
    return { detalle, resenas, favorita: favoritos.some((f) => f.id === id) };
  }, [id, sesionIniciada]);
  const {
    datos,
    cargando,
    error: errorCarga,
    recargar: cargar,
  } = useRecurso<{ detalle: Bodega | null; resenas: Resena[]; favorita: boolean }>(leerDetalle, {
    detalle: null,
    resenas: [],
    favorita: false,
  });
  const bodega = datos.detalle ?? getBodega(id);
  const { resenas, favorita } = datos;
  const propia = resenas.find((r) => r.usuario.username === usuario?.username);
  const [valoracionEditada, setValoracion] = useState<number | null>(null);
  const [comentarioEditado, setComentario] = useState<string | null>(null);
  const valoracion = valoracionEditada ?? propia?.valoracion ?? 0;
  const comentario = comentarioEditado ?? propia?.comentario ?? '';
  const [fallo, setError] = useState<string | null>(null);
  const error = fallo ?? errorCarga;
  const [enviando, setEnviando] = useState(false);
  const mutar = async (path: string, method: string, body?: unknown) => {
    setEnviando(true);
    setError(null);
    try {
      await api(path, { method, body });
      await cargar();
      await recargar();
      setValoracion(null);
      setComentario(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  if (!bodega) {
    return (
      <Screen>
        <EmptyState
          icon="winery"
          title={cargando ? 'Cargando bodega…' : 'Bodega no encontrada'}
          description={error ?? 'Puede que ya no esté disponible.'}
        />
        <IconButton icon="back" accessibilityLabel="Volver" onPress={volver} />
      </Screen>
    );
  }

  return (
    <Screen scroll padded={false} edges={['bottom']}>
      <StatusBar style="light" />

      <BodegaHero
        bodega={bodega}
        favorita={favorita}
        onBack={volver}
        onToggleFavorita={() =>
          sesionIniciada
            ? void mutar(`/favoritos/${id}`, favorita ? 'DELETE' : 'PUT')
            : router.push('/login')
        }
      />

      <View style={styles.sections}>
        {error && <AppText color="malbec">{error}</AppText>}
        {!bodega.activa && <AppText color="malbec">Esta bodega está inactiva.</AppText>}
        <AppText variant="caption">
          Rating de demostración: {bodega.rating ?? 'sin datos'}. WineWay:{' '}
          {bodega.ratingWineWay?.toFixed(1) ?? 'sin reseñas'} ({bodega.cantidadResenas}).
        </AppText>
        <View style={styles.section}>
          <AppText variant="label">La bodega</AppText>
          <AppText variant="body" style={styles.description}>
            {bodega.descripcion}
          </AppText>
        </View>

        <View style={styles.section}>
          <View style={styles.actions}>
            <View style={styles.action}>
              <Button
                title="Reservar"
                icon="external"
                variant="outline"
                onPress={() => WebBrowser.openBrowserAsync(bodega.sitioWeb)}
              />
            </View>
            {bodega.activa && (
              <View style={styles.action}>
                <Button title="Agregar a ruta" icon="plus" onPress={abrirAgregar} />
              </View>
            )}
          </View>
          <AppText variant="caption" align="center">
            La reserva se realiza en el sitio de la bodega.
          </AppText>
        </View>

        {bodega.experiencias.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Experiencias disponibles" />
            {bodega.experiencias.map((experiencia) => (
              <ExperienciaCard key={experiencia.id} experiencia={experiencia} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader title="Reseñas WineWay" />
          {resenas.length === 0 && <AppText>Todavía no hay reseñas.</AppText>}
          {resenas.map((r) => (
            <View key={r.id} style={styles.resena}>
              <View style={styles.resenaTexto}>
                <AppText variant="bodyBold">
                  {r.usuario.apodo ?? r.usuario.username} · {r.valoracion}/5
                </AppText>
                {r.comentario ? <AppText>{r.comentario}</AppText> : null}
              </View>
              {r.id === propia?.id && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Borrar mi reseña"
                  hitSlop={8}
                  disabled={enviando}
                  onPress={() =>
                    void (async () => {
                      if (await confirmar('Borrar reseña', 'Tu reseña deja de verse en esta bodega.'))
                        await mutar(`/bodegas/${id}/mi-resena`, 'DELETE');
                    })()
                  }>
                  <Icon name="delete" size={18} color="malbec" />
                </Pressable>
              )}
            </View>
          ))}
          {sesionIniciada && !propia && (
            <>
              <AppText variant="heading">Tu reseña</AppText>
              <StarRating value={valoracion} onChange={setValoracion} />
              <TextField
                label="Comentario (opcional)"
                value={comentario}
                onChangeText={setComentario}
              />
              <Button
                title={enviando ? 'Publicando…' : 'Publicar reseña'}
                disabled={!valoracion || enviando}
                onPress={() =>
                  void mutar(`/bodegas/${id}/mi-resena`, 'PUT', {
                    valoracion,
                    comentario: comentario || null,
                  })
                }
              />
            </>
          )}
        </View>
        {bodega.vinos.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Vinos destacados" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
              contentContainerStyle={styles.carouselContent}
            >
              {bodega.vinos.map((vino) => (
                <VinoCard key={vino.id} vino={vino} />
              ))}
            </ScrollView>
          </View>
        )}
      </View>
      {agregando && <AgregarARutaSheet bodega={bodega} onClose={() => setAgregando(false)} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sections: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  resena: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  resenaTexto: {
    flex: 1,
  },
  description: {
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  action: {
    flex: 1,
  },
  carousel: {
    marginHorizontal: -Spacing.lg,
  },
  carouselContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    gap: Spacing.md,
  },
});
