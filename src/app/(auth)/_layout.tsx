import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

// Al entrar a (auth), la primera pantalla es el login (no registro).
export const unstable_settings = {
  initialRouteName: 'login',
};

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
