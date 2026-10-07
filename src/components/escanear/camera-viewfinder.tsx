import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import type { Ref } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Colors, Radius, Spacing } from '@/constants/theme';

type CameraViewfinderProps = {
  cameraRef: Ref<CameraView>;
  /** Solo se enciende la cámara cuando la pantalla está visible. */
  active: boolean;
  procesando: boolean;
  /** Foto ya capturada: reemplaza la vista de cámara. */
  fotoUri?: string;
  onCameraReady: () => void;
};

/** Visor de cámara con guía para encuadrar la etiqueta y manejo del permiso. */
export function CameraViewfinder({
  cameraRef,
  active,
  procesando,
  fotoUri,
  onCameraReady,
}: CameraViewfinderProps) {
  const [permiso, pedirPermiso] = useCameraPermissions();

  if (!permiso) {
    // Todavía se está consultando el estado del permiso.
    return <View style={styles.container} />;
  }

  if (!permiso.granted) {
    return (
      <View style={[styles.container, styles.permission]}>
        <Icon name="camera" size={32} color="textOnPrimary" />
        <AppText variant="bodyBold" color="textOnPrimary" align="center">
          Necesitamos acceso a la cámara
        </AppText>
        <AppText variant="caption" align="center" style={styles.permissionText}>
          La usamos solo para fotografiar etiquetas e identificar el vino.
        </AppText>
        <Button
          title={permiso.canAskAgain ? 'Permitir cámara' : 'Abrir configuración'}
          variant="secondary"
          onPress={permiso.canAskAgain ? pedirPermiso : () => Linking.openSettings()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {fotoUri ? (
        <Image source={{ uri: fotoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        active && (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="back"
            onCameraReady={onCameraReady}
          />
        )
      )}

      {/* Guía para encuadrar la etiqueta. */}
      <View style={styles.guide} pointerEvents="none" />

      {procesando && (
        <View style={styles.processing}>
          <ActivityIndicator color={Colors.textOnPrimary} size="large" />
          <AppText variant="bodyBold" color="textOnPrimary">
            Identificando el vino...
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.wineDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permission: {
    gap: Spacing.sm,
    padding: Spacing.xl,
  },
  permissionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Spacing.sm,
  },
  guide: {
    width: '55%',
    height: '70%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: Radius.md,
  },
  processing: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: 'rgba(50, 30, 32, 0.6)',
  },
});
