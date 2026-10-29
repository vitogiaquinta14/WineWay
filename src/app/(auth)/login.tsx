import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthHeader } from '@/components/auth/auth-header';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Fonts, Spacing } from '@/constants/theme';
import { useSesion } from '@/state/sesion-context';
import { volver } from '@/utils/navegacion';

export default function LoginScreen() {
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');

  const { iniciarSesion } = useSesion();
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const enviar = async () => {
    if (!identificador.trim() || !password) {
      setError('Ingresá tu email o usuario y contraseña.');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await iniciarSesion(identificador, password);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <View style={styles.content}>
        <IconButton icon="back" accessibilityLabel="Volver" onPress={() => volver('/')} />
        <AuthHeader
          title="Bienvenido de nuevo"
          subtitle="Explorá bodegas exclusivas y creá tu propia ruta del vino."
        />

        <View style={styles.form}>
          <TextField
            label="Email o Usuario"
            placeholder="tu@email.com o username"
            value={identificador}
            onChangeText={setIdentificador}
            autoCapitalize="none"
          />
          <TextField
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            password
            autoComplete="current-password"
            textContentType="password"
          />
        </View>

        <View style={styles.actions}>
          {error && <AppText color="malbec">{error}</AppText>}
          <Button
            title={enviando ? 'Ingresando…' : 'Iniciar sesión'}
            disabled={enviando}
            onPress={() => void enviar()}
          />
        </View>
      </View>

      <AppText variant="caption" color="text" align="center" style={styles.footer}>
        ¿No tenés cuenta?{' '}
        <AppText
          variant="caption"
          color="malbec"
          style={styles.link}
          onPress={() => router.push('/registro')}
        >
          Registrate
        </AppText>
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: Spacing.xxl,
    gap: Spacing.xxl,
  },
  form: {
    gap: Spacing.lg,
  },
  forgot: {
    alignSelf: 'flex-end',
  },
  actions: {
    gap: Spacing.lg,
  },
  footer: {
    marginTop: Spacing.xxl,
  },
  link: {
    fontFamily: Fonts.bold,
  },
});
