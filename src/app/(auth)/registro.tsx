import { router } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, View, type ScrollViewInstance } from "react-native";

import { AuthHeader } from "@/components/auth/auth-header";
import { CamposCuenta } from "@/components/auth/campos-cuenta";
import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Screen } from "@/components/ui/screen";
import { Fonts, Spacing } from "@/constants/theme";
import { useFormularioCuenta } from "@/state/use-formulario-cuenta";
import { useSesion } from "@/state/sesion-context";
import { cuentaVacia } from "@/utils/validar-cuenta";

export default function RegistroScreen() {
  const formulario = useFormularioCuenta(cuentaVacia, "registro");
  const scroll = useRef<ScrollViewInstance>(null);
  const [enviando, setEnviando] = useState(false);
  const { registrarse } = useSesion();
  const enviar = async () => {
    if (!formulario.validar()) {
      scroll.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setEnviando(true);
    const v = formulario.valores;
    try {
      await registrarse({
        nombre: v.nombre.trim(),
        apellido: v.apellido.trim(),
        email: v.email.trim().toLowerCase(),
        username: v.username.trim().toLowerCase(),
        password: v.password,
        fechaNacimiento: v.fechaNacimiento,
        ...(v.apodo.trim() ? { apodo: v.apodo.trim() } : {}),
      });
    } catch (error) {
      formulario.reportar(error);
      scroll.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setEnviando(false);
    }
  };
  const goToLogin = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/login");
  };

  return (
    <Screen scroll scrollRef={scroll} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <IconButton
          icon="back"
          accessibilityLabel="Volver"
          onPress={goToLogin}
        />
        <AuthHeader eyebrow="Registro" showTagline={false} />
        <AppText variant="caption">* Campos obligatorios</AppText>
        {formulario.errorGeneral && (
          <AppText color="error">{formulario.errorGeneral}</AppText>
        )}
        <CamposCuenta
          formulario={formulario}
          modo="registro"
          disabled={enviando}
        />
        <Button
          title={enviando ? "Creando cuenta…" : "Crear cuenta"}
          disabled={enviando}
          onPress={() => void enviar()}
        />
      </View>
      <AppText
        variant="caption"
        color="text"
        align="center"
        style={styles.footer}
      >
        ¿Ya tenés cuenta?{" "}
        <AppText
          variant="caption"
          color="malbec"
          style={styles.link}
          onPress={goToLogin}
        >
          Iniciá sesión
        </AppText>
      </AppText>
    </Screen>
  );
}
const styles = StyleSheet.create({
  content: { flex: 1, paddingTop: Spacing.lg, gap: Spacing.xl },
  footer: { marginTop: Spacing.xxl },
  link: { fontFamily: Fonts.bold },
});
