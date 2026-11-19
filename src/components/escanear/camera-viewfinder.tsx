import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Colors, Radius, Spacing } from '@/constants/theme';

type CameraViewfinderProps = {
  /** Solo se enciende la cámara cuando la pantalla está visible. */
  active: boolean;
  procesando: boolean;
  onBarcodeScanned?: (resultado: BarcodeScanningResult) => void;
};

/** Visor de cámara con guía para encuadrar la etiqueta y manejo del permiso. */
export function CameraViewfinder({
  active,
  procesando,
  // Función que recibe de escanear.tsx (el componente padre).
 // Este componente no la ejecuta: se la reenvía a CameraView como prop,
 // que la llama cuando detecta un código de barras.
  onBarcodeScanned,
}: CameraViewfinderProps) {
  //Permiso: estado actual del permiso. (objeto o null si todavía se está consultando el estado del permiso).
  //PedirPermiso: función (de expo-camera) que solicita el permiso al usuario. 
  //Lo que dispara el re-render es el setStatus(...) de la librería, dentro del hook (que presta su estado al componente que lo usa: CameraViewFinder).
  const [permiso, pedirPermiso] = useCameraPermissions();

  if (!permiso) {
    // Todavía se está consultando el estado del permiso.
    return <View style={styles.container} />;
  }

  if (!permiso.granted) {
    //aca se agrega el icono, el Necesitamos acceso a la cámara, el texto explicativo y el botón para pedir permiso o abrir configuración.
  return (
      <View style={[styles.container, styles.permission]}>
        <Icon name="camera" size={32} color="textOnPrimary" />
        <AppText variant="bodyBold" color="textOnPrimary" align="center">
          Necesitamos acceso a la cámara
        </AppText>
        <AppText variant="caption" align="center" style={styles.permissionText}>
          La usamos para leer el código de barras del vino.
        </AppText>
        <Button
        //aca, segun si ya denegue acceso o no, el boton dice "Permitir cámara" o "Abrir configuración".
          title={permiso.canAskAgain ? 'Permitir cámara' : 'Abrir configuración'}
          variant="secondary"
          onPress={permiso.canAskAgain ? pedirPermiso : () => Linking.openSettings()}
        />
      </View>
    );
  }

  //al re-renderizar con permiso concedido, se ejecuta el return que contiene a CameraView, que es el componente de expo-camera que muestra la cámara del dispositivo.
  return (
    <View style={styles.container}>
      {active && (
        //CameraView es un componente de expo-camera que muestra la cámara del dispositivo.
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          //callback que dispara la camara cuando detecta un código de barras.
          //nombre izq: expo-camera, nombre der: componente padre
          onBarcodeScanned={onBarcodeScanned}
          barcodeScannerSettings={{
            //es la lista de formatos que acepta la cámara. Se usan los más comunes en etiquetas de vino.
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
          }}
        />
      )}

      {/* Guía para encuadrar la etiqueta. */}
      {active && <View style={styles.guide} pointerEvents="none" />}

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
