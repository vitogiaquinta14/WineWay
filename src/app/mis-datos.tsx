import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { View, type ScrollViewInstance } from 'react-native';
import { CamposCuenta } from '@/components/auth/campos-cuenta';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useSesion, type Usuario } from '@/state/sesion-context';
import { useFormularioCuenta } from '@/state/use-formulario-cuenta';
import { cuentaVacia, fechaVisible } from '@/utils/validar-cuenta';
import { confirmar } from '@/utils/confirmar';
import { volver } from '@/utils/navegacion';

function valoresUsuario(usuario: Usuario | null) {
  return {
    ...cuentaVacia,
    nombre: usuario?.nombre ?? '',
    apellido: usuario?.apellido ?? '',
    email: usuario?.email ?? '',
    username: usuario?.username ?? '',
    fechaNacimiento: usuario?.fechaNacimiento ?? '',
    apodo: usuario?.apodo ?? '',
    fotoUrl: usuario?.fotoUrl ?? '',
  };
}
export default function PerfilScreen() {
  const { usuario, actualizarPerfil, cerrarSesion } = useSesion();
  const formulario = useFormularioCuenta(valoresUsuario(usuario), 'perfil', usuario ?? undefined);
  const scroll = useRef<ScrollViewInstance>(null);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const cancelar = () => {
    formulario.reiniciar(valoresUsuario(usuario));
    setEditando(false);
    setGuardado(false);
  };
  const guardar = async () => {
    if (!formulario.validar()) {
      scroll.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setGuardando(true);
    const v = formulario.valores;
    try {
      await actualizarPerfil({
        nombre: v.nombre.trim(),
        apellido: v.apellido.trim(),
        email: v.email.trim().toLowerCase(),
        username: v.username.trim().toLowerCase(),
        apodo: v.apodo.trim() || null,
        fotoUrl: v.fotoUrl.trim() || null,
      });
      setEditando(false);
      setGuardado(true);
    } catch (error) {
      formulario.reportar(error);
      scroll.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setGuardando(false);
    }
  };
  const salir = async () => {
    if (!(await confirmar('Cerrar sesión', '¿Querés cerrar tu sesión de WineWay?'))) return;
    try {
      await cerrarSesion();
    } catch {
      /* La sesión local se limpia también si falla la red. */
    }
    router.replace('/login');
  };
  if (!usuario) return null;

  return (
    <Screen scroll scrollRef={scroll}>
      <View style={{ gap: Spacing.lg, paddingVertical: Spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <IconButton icon="back" accessibilityLabel="Volver" onPress={() => volver('/')} />
          <AppText variant="title" style={{ flex: 1 }}>
            Mis datos personales
          </AppText>
        </View>
        {editando ? (
          <>
            <AppText variant="caption">* Campos obligatorios</AppText>
            {formulario.errorGeneral && <AppText color="error">{formulario.errorGeneral}</AppText>}
            <CamposCuenta formulario={formulario} modo="perfil" disabled={guardando} />
            <Button
              title={guardando ? 'Guardando…' : 'Guardar cambios'}
              disabled={guardando}
              onPress={() => void guardar()}
            />
            <Button title="Cancelar" variant="outline" disabled={guardando} onPress={cancelar} />
          </>
        ) : (
          <>
            {guardado && <AppText color="oliva">Tus datos se guardaron.</AppText>}
            <AppText variant="label">Nombre</AppText>
            <AppText>{usuario.nombre}</AppText>
            <AppText variant="label">Apellido</AppText>
            <AppText>{usuario.apellido}</AppText>
            <AppText variant="label">Email</AppText>
            <AppText>{usuario.email}</AppText>
            <AppText variant="label">Usuario</AppText>
            <AppText>@{usuario.username}</AppText>
            <AppText variant="label">Fecha de nacimiento</AppText>
            <AppText>{fechaVisible(usuario.fechaNacimiento)}</AppText>
            <AppText variant="label">Apodo</AppText>
            <AppText>{usuario.apodo ?? 'Sin apodo'}</AppText>
            <AppText variant="label">Foto de perfil</AppText>
            <AppText>{usuario.fotoUrl ?? 'Sin foto'}</AppText>
            <Button
              title="Editar mis datos"
              onPress={() => {
                formulario.reiniciar(valoresUsuario(usuario));
                setGuardado(false);
                setEditando(true);
              }}
            />
          </>
        )}
        <Button
          title="Cerrar sesión"
          variant="outline"
          disabled={guardando}
          onPress={() => void salir()}
        />
      </View>
    </Screen>
  );
}
