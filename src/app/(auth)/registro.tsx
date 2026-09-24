import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthHeader } from '@/components/auth/auth-header';
import { GoogleButton } from '@/components/auth/google-button';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextDivider } from '@/components/ui/text-divider';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useSesion } from '@/state/sesion-context';

export default function RegistroScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sin backend todavía: cualquier acceso inicia la sesión simulada y el layout redirige a la Home.
  const { iniciarSesion } = useSesion();

  const goToLogin = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
  };

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <View style={styles.content}>
        <AuthHeader
          title="Creá tu cuenta"
          subtitle="Comenzá tu viaje por la cuna del Malbec en Mendoza."
        />

        <View style={styles.form}>
          <TextField
            label="Nombre"
            placeholder="Tu nombre y apellido"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
          />
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
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChangeText={setPassword}
            password
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <TextField
            label="Confirmar contraseña"
            placeholder="Repetí tu contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            password
            autoComplete="new-password"
            textContentType="newPassword"
          />
        </View>

        <View style={styles.actions}>
          <Button title="Crear cuenta" onPress={iniciarSesion} />
          <TextDivider text="o registrarte con" />
          <GoogleButton title="Registrarme con Google" onPress={iniciarSesion} />
        </View>
      </View>

      <AppText variant="caption" color="text" align="center" style={styles.footer}>
        ¿Ya tenés cuenta?{' '}
        <AppText variant="caption" color="malbec" style={styles.link} onPress={goToLogin}>
          Iniciá sesión
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
