import { router, useIsFocused } from 'expo-router';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { CameraView } from 'expo-camera';
import { CameraViewfinder } from '@/components/escanear/camera-viewfinder';
import { ResultadoCard } from '@/components/escanear/resultado-card';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { StarRating } from '@/components/ui/star-rating';
import { Spacing } from '@/constants/theme';
import { identificarVino, type VinoIdentificado, type VinoAPI } from '@/data/vinos';
import { useCava } from '@/state/cava-context';
import { useSesion } from '@/state/sesion-context';
import { api } from '@/services/api';
import { ErrorAPI } from '@/services/api-core';
export default function EscanearScreen() {
  const focused = useIsFocused();
  const { sesionIniciada } = useSesion();
  const { guardarVino, guardarManual } = useCava();
  const cameraRef = useRef<CameraView>(null);
  const bloqueado = useRef(false);
  const [fase, setFase] = useState<'camara' | 'procesando' | 'resultado' | 'manual'>('camara');
  const [codigo, setCodigo] = useState('');
  const [vino, setVino] = useState<VinoIdentificado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [nota, setNota] = useState('');
  const [anada, setAnada] = useState('');
  const [nombre, setNombre] = useState('');
  const [bodega, setBodega] = useState('');
  const [cepas, setCepas] = useState('');
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [guardando, setGuardando] = useState(false);
  const buscar = async (valor: string) => {
    if (bloqueado.current || !valor.trim()) return;
    bloqueado.current = true;
    setCodigo(valor.trim());
    setFase('procesando');
    setError(null);
    try {
      const producto = await api<VinoAPI>(`/vinos/codigo/${encodeURIComponent(valor.trim())}`);
      setVino(identificarVino(producto));
      setFase('resultado');
    } catch (e) {
      if (e instanceof ErrorAPI && e.status === 404) {
        setError('Código no encontrado. Podés cargar el vino de forma privada.');
        setFase('manual');
      } else {
        setError((e as Error).message);
        setFase('camara');
      }
    } finally {
      bloqueado.current = false;
    }
  };
  const reiniciar = () => {
    setFase('camara');
    setVino(null);
    setError(null);
    setCodigo('');
    setRating(0);
    setNota('');
    setAnada('');
    setNombre('');
    setBodega('');
    setCepas('');
    setTipo('');
    setDescripcion('');
    setPrecio('');
  };
  const guardar = async (manual: boolean) => {
    setGuardando(true);
    setError(null);
    try {
      const extras = {
        valoracion: rating || null,
        nota: nota || null,
        anada: anada ? Number(anada) : undefined,
      };
      if (manual)
        await guardarManual({
          nombre,
          bodegaNombre: bodega || undefined,
          cepasTexto: cepas || undefined,
          tipo: tipo || undefined,
          descripcion: descripcion || undefined,
          precioCentavos: precio ? Math.round(Number(precio.replace(',', '.')) * 100) : undefined,
          codigoBarras: codigo || undefined,
          ...extras,
        });
      else await guardarVino(vino!, rating || null, nota, anada ? Number(anada) : undefined);
      reiniciar();
      router.navigate('/mi-cava');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };
  return (
    <Screen scroll>
      <View style={{ gap: Spacing.lg, paddingVertical: Spacing.lg }}>
        <AppText variant="title">Escanear vino</AppText>
        <AppText variant="caption">
          Enfocá el código de barras. La búsqueda usa el catálogo de WineWay.
        </AppText>
        {!sesionIniciada && (
          <Button
            title="Iniciar sesión para guardar en cava"
            onPress={() => router.push('/login')}
          />
        )}
        <CameraViewfinder
          cameraRef={cameraRef}
          active={focused && fase === 'camara'}
          procesando={fase === 'procesando'}
          onCameraReady={() => {}}
          onBarcodeScanned={(r) => void buscar(r.data)}
        />
        {error && <AppText color="malbec">{error}</AppText>}
        {fase === 'camara' && (
          <>
            <TextField
              label="Código de barras (también podés escribirlo)"
              value={codigo}
              onChangeText={setCodigo}
            />
            <Button title="Buscar código" onPress={() => void buscar(codigo)} />
            <Button
              title="Cargar vino manualmente"
              variant="outline"
              onPress={() => setFase('manual')}
            />
          </>
        )}
        {(fase === 'resultado' || fase === 'manual') && (
          <>
            <Button title="Volver a escanear" variant="outline" onPress={reiniciar} />
            <TextField
              label="Añada personal (opcional)"
              value={anada}
              onChangeText={setAnada}
              keyboardType="number-pad"
              maxLength={4}
            />
          </>
        )}
        {fase === 'resultado' && vino && (
          <ResultadoCard
            vino={vino}
            rating={rating}
            nota={nota}
            onRatingChange={setRating}
            onNotaChange={setNota}
            onGuardar={() => void guardar(false)}
            guardando={guardando || !sesionIniciada}
          />
        )}
        {fase === 'manual' && (
          <>
            <AppText variant="heading">Vino privado fuera del catálogo</AppText>
            <TextField label="Nombre (obligatorio)" value={nombre} onChangeText={setNombre} />
            <TextField label="Bodega (opcional)" value={bodega} onChangeText={setBodega} />
            <TextField label="Cepas (opcional)" value={cepas} onChangeText={setCepas} />
            <TextField label="Tipo (opcional)" value={tipo} onChangeText={setTipo} />
            <TextField
              label="Descripción (opcional)"
              value={descripcion}
              onChangeText={setDescripcion}
            />
            <TextField
              label="Precio ARS (opcional)"
              value={precio}
              onChangeText={setPrecio}
              keyboardType="decimal-pad"
            />
            <AppText>Valoración opcional</AppText>
            <StarRating value={rating} onChange={setRating} />
            <TextField label="Nota privada (opcional)" value={nota} onChangeText={setNota} />
            <Button
              title={guardando ? 'Guardando…' : 'Guardar vino en mi cava'}
              disabled={!nombre.trim() || guardando || !sesionIniciada}
              onPress={() => void guardar(true)}
            />
          </>
        )}
      </View>
    </Screen>
  );
}
