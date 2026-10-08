import type { CameraView } from 'expo-camera';
import { router, useIsFocused } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CameraViewfinder } from '@/components/escanear/camera-viewfinder';
import { ResultadoCard } from '@/components/escanear/resultado-card';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { Colors, Spacing } from '@/constants/theme';
import { vinoEscaneadoDemo } from '@/data/vinos';
import { useCava } from '@/state/cava-context';

type Fase = 'camara' | 'procesando' | 'resultado';

/** Tiempo simulado de identificación mientras no hay servicio real. */
const DEMORA_IDENTIFICACION_MS = 1500;

export default function EscanearScreen() {
  const focused = useIsFocused();
  const { guardarVino } = useCava();
  const cameraRef = useRef<CameraView>(null);

  const [camaraLista, setCamaraLista] = useState(false);
  const [fase, setFase] = useState<Fase>('camara');
  const [fotoUri, setFotoUri] = useState<string>();
  const [rating, setRating] = useState(0);
  const [nota, setNota] = useState('');

  useEffect(() => {
    if (fase !== 'procesando') return;
    const timer = setTimeout(() => setFase('resultado'), DEMORA_IDENTIFICACION_MS);
    return () => clearTimeout(timer);
  }, [fase]);

  const capturar = async () => {
    if (!camaraLista) return;

    try {
      const foto = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (!foto?.uri) return;
      setFotoUri(foto.uri);
      setFase('procesando');
    } catch {
      return;
    }
  };

  const reintentar = () => {
    setFotoUri(undefined);
    setRating(0);
    setNota('');
    setCamaraLista(false);
    setFase('camara');
  };

  const guardar = () => {
    guardarVino(
      { ...vinoEscaneadoDemo, imagen: fotoUri ? { uri: fotoUri } : undefined },
      rating,
      nota,
    );
    reintentar();
    router.navigate('/mi-cava');
  };

  return (
    <Screen scroll>
      <AppText variant="title" style={styles.title}>
        Escanear vino
      </AppText>

      <CameraViewfinder
        cameraRef={cameraRef}
        active={focused && fase === 'camara'}
        procesando={fase === 'procesando'}
        fotoUri={fotoUri}
        onCameraReady={() => setCamaraLista(true)}
      />

      {fase === 'camara' && (
        <View style={styles.controls}>
          <AppText variant="caption">Enfocá la etiqueta del vino</AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tomar foto de la etiqueta"
            onPress={capturar}
            style={({ pressed }) => [styles.shutter, pressed && styles.shutterPressed]}
          />
        </View>
      )}

      {fase === 'resultado' && (
        <View style={styles.result}>
          <Pressable accessibilityRole="button" onPress={reintentar} style={styles.retry}>
            <AppText variant="bodyBold" color="malbec">
              Reintentar
            </AppText>
          </Pressable>

          <AppText variant="heading">Resultado del escaneo</AppText>
          <ResultadoCard
            vino={vinoEscaneadoDemo}
            rating={rating}
            nota={nota}
            onRatingChange={setRating}
            onNotaChange={setNota}
            onGuardar={guardar}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  controls: {
    alignItems: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.lg,
  },
  shutter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 5,
    borderColor: Colors.malbec,
    backgroundColor: Colors.surface,
  },
  shutterPressed: {
    backgroundColor: Colors.malbecSoft,
  },
  result: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  retry: {
    alignSelf: 'center',
    padding: Spacing.sm,
  },
});
