import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, View } from 'react-native';
import { VinoCavaCard } from '@/components/cava/vino-cava-card';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { TextField } from '@/components/ui/text-field';
import { StarRating } from '@/components/ui/star-rating';
import { Spacing } from '@/constants/theme';
import type { VinoGuardado } from '@/data/vinos';
import { useCava } from '@/state/cava-context';
import { useSesion } from '@/state/sesion-context';
import { normalizar } from '@/utils/texto';
import { confirmar } from '@/utils/confirmar';
export default function MiCavaScreen() {
  const { vinos, error, cargando, recargar, quitarVino, editarEntrada } = useCava();
  const { sesionIniciada } = useSesion();
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState<VinoGuardado | null>(null);
  const [anada, setAnada] = useState('');
  const [rating, setRating] = useState(0);
  const [nota, setNota] = useState('');
  const [fallo, setFallo] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const resultados = vinos.filter((v) =>
    normalizar([v.nombre, v.bodega, v.varietal, v.anio].join(' ')).includes(normalizar(busqueda)),
  );
  const editar = (vino: VinoGuardado) => {
    setEditando(vino);
    setAnada(vino.anio ? String(vino.anio) : '');
    setRating(vino.rating ?? 0);
    setNota(vino.nota);
    setFallo(null);
  };
  const guardar = async () => {
    if (!editando) return;
    setGuardando(true);
    try {
      await editarEntrada(editando.id, {
        anada: anada ? Number(anada) : null,
        valoracion: rating || null,
        nota: nota || null,
      });
      setEditando(null);
    } catch (e) {
      setFallo((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };
  return (
    <Screen>
      <View style={{ gap: Spacing.md, paddingVertical: Spacing.lg }}>
        <AppText variant="title">Mi cava</AppText>
        <Button
          title={sesionIniciada ? 'Escanear o cargar un vino' : 'Iniciar sesión para guardar vinos'}
          onPress={() => router.push(sesionIniciada ? '/escanear' : '/login')}
        />
        <SearchField
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar vino, bodega o cepa"
        />
        {cargando && <AppText>Cargando cava…</AppText>}
        {(error || fallo) && !editando && <AppText color="malbec">{error ?? fallo}</AppText>}
        {error && <Button title="Reintentar" onPress={() => void recargar()} />}
      </View>
      <FlatList
        data={resultados}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ gap: Spacing.md, paddingBottom: Spacing.lg }}
        refreshing={cargando}
        onRefresh={() => void recargar()}
        ListEmptyComponent={<AppText>{cargando ? '' : 'No hay vinos para mostrar.'}</AppText>}
        renderItem={({ item }) => (
          <View style={{ gap: Spacing.sm }}>
            <VinoCavaCard
              vino={item}
              onQuitar={() =>
                void (async () => {
                  if (await confirmar('Quitar vino', 'Solo se elimina esta entrada de tu cava.'))
                    try {
                      await quitarVino(item.id);
                    } catch (e) {
                      setFallo((e as Error).message);
                    }
                })()
              }
            />
            <Button
              title="Editar añada, valoración o nota"
              variant="outline"
              onPress={() => editar(item)}
            />
          </View>
        )}
      />
      <Modal
        visible={editando !== null}
        onRequestClose={() => setEditando(null)}
        animationType="slide"
      >
        <Screen scroll>
          <View style={{ gap: Spacing.lg, paddingVertical: Spacing.lg }}>
            <AppText variant="heading">{editando?.nombre}</AppText>
            <TextField
              label="Añada (opcional)"
              value={anada}
              onChangeText={setAnada}
              keyboardType="number-pad"
            />
            <StarRating value={rating} onChange={setRating} />
            <Button title="Omitir valoración" variant="outline" onPress={() => setRating(0)} />
            <TextField label="Nota privada (opcional)" value={nota} onChangeText={setNota} />
            {fallo && <AppText color="malbec">{fallo}</AppText>}
            <Button
              title={guardando ? 'Guardando…' : 'Guardar cambios'}
              disabled={guardando}
              onPress={() => void guardar()}
            />
            <Button title="Cancelar" variant="outline" onPress={() => setEditando(null)} />
          </View>
        </Screen>
      </Modal>
    </Screen>
  );
}
