import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthHeader } from '@/components/auth/auth-header';
import { GoogleButton } from '@/components/auth/google-button';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextDivider } from '@/components/ui/text-divider';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sin backend todavía: cualquier acceso lleva a la Home.
  const goHome = () => router.replace('/');

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <View style={styles.content}>
        <AuthHeader
          title="Bienvenido de nuevo"
          subtitle="Explorá bodegas exclusivas y creá tu propia ruta del vino."
        />

        <View style={styles.form}>
          <TextField
            label="Email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
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
          <Pressable accessibilityRole="link" hitSlop={8} style={styles.forgot}>
            <AppText variant="caption" color="malbec">
              Olvidé mi contraseña
            </AppText>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Button title="Iniciar sesión" onPress={goHome} />
          <TextDivider text="o continuar con" />
          <GoogleButton title="Continuar con Google" onPress={goHome} />
        </View>
      </View>

      <AppText variant="caption" color="text" align="center" style={styles.footer}>
        ¿No tenés cuenta?{' '}
        <AppText
          variant="caption"
          color="malbec"
          style={styles.link}
          onPress={() => router.push('/registro')}>
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
    fontWeight: '700',
  },
});
