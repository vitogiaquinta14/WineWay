import { View } from 'react-native';
import { TextField } from '@/components/ui/text-field';
import { DateField } from '@/components/ui/date-field';
import { Spacing } from '@/constants/theme';
import type { FormularioCuenta } from '@/state/use-formulario-cuenta';
import { fechaVisible, type CampoCuenta, type ModoCuenta } from '@/utils/validar-cuenta';

export function CamposCuenta({
  formulario,
  modo,
  disabled,
}: {
  formulario: FormularioCuenta;
  modo: ModoCuenta;
  disabled: boolean;
}) {
  const { valores, errores, cambiar, tocar } = formulario;
  const entrada = (campo: CampoCuenta) => ({
    value: valores[campo],
    onChangeText: (valor: string) => cambiar(campo, valor),
    onBlur: () => {
      void tocar(campo);
    },
    error: errores[campo],
    editable: !disabled,
  });
  return (
    <View style={{ gap: Spacing.lg }}>
      <TextField
        label="Nombre"
        required
        autoCapitalize="words"
        autoComplete="given-name"
        maxLength={200}
        {...entrada('nombre')}
      />
      <TextField
        label="Apellido"
        required
        autoCapitalize="words"
        autoComplete="family-name"
        maxLength={200}
        {...entrada('apellido')}
      />
      <TextField
        label="Email"
        required
        placeholder="nombre@correo.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        maxLength={254}
        {...entrada('email')}
      />
      <TextField
        label="Usuario"
        required
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        maxLength={200}
        hint="Único en WineWay. Letras sin acentos, números, punto, guion o guion bajo. Se guarda en minúsculas."
        {...entrada('username')}
      />
      {modo === 'registro' ? (
        <DateField
          label="Fecha de nacimiento"
          required
          value={valores.fechaNacimiento}
          onChange={(valor) => cambiar('fechaNacimiento', valor)}
          onBlur={() => {
            void tocar('fechaNacimiento');
          }}
          error={errores.fechaNacimiento}
          disabled={disabled}
        />
      ) : (
        <TextField
          label="Fecha de nacimiento"
          required
          value={fechaVisible(valores.fechaNacimiento)}
          editable={false}
          hint="La fecha validada al crear la cuenta no se puede modificar."
        />
      )}
      <TextField label="Apodo (opcional)" maxLength={200} {...entrada('apodo')} />
      {modo === 'perfil' && (
        <TextField
          label="URL de foto de perfil (opcional)"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          {...entrada('fotoUrl')}
        />
      )}
      {modo === 'registro' && (
        <>
          <TextField
            label="Contraseña"
            required
            password
            autoComplete="new-password"
            maxLength={128}
            hint="Al menos 8 caracteres, una mayúscula, un número y un símbolo (!, @, etc.)."
            {...entrada('password')}
          />
          <TextField
            label="Confirmar contraseña"
            required
            password
            autoComplete="new-password"
            maxLength={128}
            {...entrada('confirmPassword')}
          />
        </>
      )}
    </View>
  );
}
