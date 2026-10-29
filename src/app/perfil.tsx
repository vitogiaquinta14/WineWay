import { router } from 'expo-router';
import { View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useSesion } from '@/state/sesion-context';
import { confirmar } from '@/utils/confirmar';
import { volver } from '@/utils/navegacion';

export default function PerfilScreen() {
  const { usuario, cerrarSesion } = useSesion();
  if (!usuario) return null;
  const salir = async () => {
    if (!(await confirmar('Cerrar sesión', '¿Querés cerrar tu sesión de WineWay?'))) return;
    try { await cerrarSesion(); } finally { router.replace('/login'); }
  };
  return (
    <Screen scroll edges={['top', 'bottom']}>
      <View style={{ gap: Spacing.lg, paddingVertical: Spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <IconButton icon="back" accessibilityLabel="Volver" onPress={() => volver('/')} />
          <AppText variant="title">Mi perfil</AppText>
        </View>
        <AppText variant="heading">{usuario.apodo ?? usuario.nombre}</AppText>
        <Button title="Mis datos" variant="outline" onPress={() => router.push('/mis-datos')} />
        <Button title="Mis favoritos" icon="heart" variant="outline" onPress={() => router.push('/mis-favoritos')} />
        <Button title="Mis reseñas" variant="outline" onPress={() => router.push('/mis-resenas')} />
        <Button title="Cerrar sesión" variant="outline" onPress={() => void salir()} />
      </View>
    </Screen>
  );
}
