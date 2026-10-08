import { router } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ItinerarioDia } from '@/components/ruta/itinerario-dia';
import { AppText } from '@/components/ui/app-text';
import { AppTextInput } from '@/components/ui/app-text-input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Stepper } from '@/components/ui/stepper';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { zonas } from '@/data/bodegas';
import type { Ruta } from '@/data/rutas';
import { useRuta } from '@/state/ruta-context';
import { generarRuta, type ConfiguracionViaje } from '@/utils/generar-ruta';

const MAX_DIAS = 7;
const MAX_BODEGAS_POR_DIA = 4;
const BODEGAS_POR_DIA_INICIAL = 2;

// Las zonas se resaltan en terracota y el resto de las preferencias en oliva, como en el mockup.
const preferencias = [
  ...zonas.map((zona) => ({ label: zona, tone: 'terracota' as const })),
  ...['Tintos intensos', 'Gastronomía', 'Boutique', 'Paisajes', 'Mejor puntuadas'].map(
    (label) => ({ label, tone: 'oliva' as const }),
  ),
];

const configInicial: ConfiguracionViaje = {
  dias: 3,
  personas: 2,
  presupuestoUsd: 150,
  bodegasPorDia: [2, 3, 2],
  preferencias: ['Valle de Uco', 'Tintos intensos', 'Boutique'],
};

export default function CrearRutaScreen() {
  const { reemplazarRuta } = useRuta();
  const scrollRef = useRef<ScrollView>(null);

  const [config, setConfig] = useState(configInicial);
  const [mismaCantidad, setMismaCantidad] = useState(false);
  const [propuesta, setPropuesta] = useState<Ruta | null>(null);

  // Al generar, la pantalla baja hasta la propuesta.
  useEffect(() => {
    if (!propuesta) return;
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    return () => clearTimeout(timer);
  }, [propuesta]);

  /** Cualquier cambio en la configuración invalida la propuesta anterior. */
  const actualizar = (cambio: (actual: ConfiguracionViaje) => Partial<ConfiguracionViaje>) => {
    setConfig((actual) => ({ ...actual, ...cambio(actual) }));
    setPropuesta(null);
  };

  const cambiarDias = (dias: number) =>
    actualizar((actual) => ({
      dias,
      bodegasPorDia: Array.from(
        { length: dias },
        (_, i) =>
          actual.bodegasPorDia[i] ??
          (mismaCantidad ? actual.bodegasPorDia[0] : BODEGAS_POR_DIA_INICIAL),
      ),
    }));

  const cambiarBodegasDelDia = (indice: number, cantidad: number) =>
    actualizar((actual) => ({
      bodegasPorDia: actual.bodegasPorDia.map((valor, i) =>
        mismaCantidad || i === indice ? cantidad : valor,
      ),
    }));

  const cambiarMismaCantidad = (valor: boolean) => {
    setMismaCantidad(valor);
    if (valor) {
      actualizar((actual) => ({
        bodegasPorDia: actual.bodegasPorDia.map(() => actual.bodegasPorDia[0]),
      }));
    }
  };

  const alternarPreferencia = (label: string) =>
    actualizar((actual) => ({
      preferencias: actual.preferencias.includes(label)
        ? actual.preferencias.filter((p) => p !== label)
        : [...actual.preferencias, label],
    }));

  const cantidadPropuesta = propuesta?.dias.reduce((total, dia) => total + dia.visitas.length, 0);

  const agregarAMiRuta = () => {
    if (!propuesta) return;
    Alert.alert('Agregar a Mi Ruta', 'Esta propuesta va a reemplazar tu ruta actual.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Reemplazar',
        onPress: () => {
          reemplazarRuta(propuesta);
          router.dismissTo('/mi-ruta');
        },
      },
    ]);
  };

  return (
    <Screen scroll edges={['top', 'bottom']} scrollRef={scrollRef}>
      <View style={styles.header}>
        <IconButton icon="back" accessibilityLabel="Volver" onPress={() => router.back()} />
        <AppText variant="title">Crear mi ruta</AppText>
      </View>

      <View style={styles.form}>
        <Field label="Cantidad de días">
          <Card style={styles.row}>
            <AppText variant="body">
              {config.dias} {config.dias === 1 ? 'día' : 'días'}
            </AppText>
            <Stepper
              value={config.dias}
              onChange={cambiarDias}
              min={1}
              max={MAX_DIAS}
              accessibilityLabel="días"
            />
          </Card>
        </Field>

        <View style={styles.twoColumns}>
          <View style={styles.column}>
            <Field label="Personas">
              <Card style={styles.row}>
                <Stepper
                  value={config.personas}
                  onChange={(personas) => actualizar(() => ({ personas }))}
                  min={1}
                  max={20}
                  accessibilityLabel="personas"
                />
              </Card>
            </Field>
          </View>
          <View style={styles.column}>
            <Field label="Presupuesto / persona">
              <Card style={styles.row}>
                <AppText variant="body" color="textMuted">
                  USD
                </AppText>
                <AppTextInput
                  style={styles.budgetInput}
                  value={config.presupuestoUsd > 0 ? String(config.presupuestoUsd) : ''}
                  onChangeText={(texto) =>
                    actualizar(() => ({ presupuestoUsd: Number(texto.replace(/\D/g, '')) || 0 }))
                  }
                  placeholder="150"
                  placeholderTextColor={Colors.textMuted}
                  selectionColor={Colors.malbec}
                  keyboardType="number-pad"
                  maxLength={5}
                  accessibilityLabel="Presupuesto por persona en dólares"
                />
              </Card>
            </Field>
          </View>
        </View>

        <Field label="Bodegas por día">
          {config.bodegasPorDia.map((cantidad, indice) => (
            <Card key={indice} style={styles.row}>
              <AppText variant="body">Día {indice + 1}</AppText>
              <Stepper
                value={cantidad}
                onChange={(valor) => cambiarBodegasDelDia(indice, valor)}
                min={1}
                max={MAX_BODEGAS_POR_DIA}
                accessibilityLabel={`bodegas del día ${indice + 1}`}
              />
            </Card>
          ))}
          <View style={styles.switchRow}>
            <AppText variant="caption" color="text">
              Misma cantidad todos los días
            </AppText>
            <Switch
              value={mismaCantidad}
              onValueChange={cambiarMismaCantidad}
              trackColor={{ true: Colors.malbec, false: Colors.border }}
              thumbColor={Colors.surface}
              ios_backgroundColor={Colors.border}
            />
          </View>
        </Field>

        <Field label="Preferencias">
          <View style={styles.chips}>
            {preferencias.map(({ label, tone }) => (
              <Chip
                key={label}
                label={label}
                tone={tone}
                selected={config.preferencias.includes(label)}
                onPress={() => alternarPreferencia(label)}
              />
            ))}
          </View>
        </Field>

        <Button
          title="Generar mi ruta"
          onPress={() => setPropuesta(generarRuta(config))}
          disabled={config.presupuestoUsd === 0}
        />
      </View>

      {propuesta && (
        <View style={styles.proposal}>
          <View style={styles.proposalHeader}>
            <AppText variant="title">Propuesta de Ruta</AppText>
            <AppText variant="caption">
              {config.dias} {config.dias === 1 ? 'día optimizado' : 'días optimizados'} para tu
              perfil
            </AppText>
          </View>

          {cantidadPropuesta === 0 ? (
            <EmptyState
              icon="search"
              title="No encontramos bodegas"
              description="Probá con otras zonas o un presupuesto mayor."
            />
          ) : (
            <>
              {propuesta.dias.map((dia) => (
                <ItinerarioDia
                  key={dia.id}
                  dia={dia}
                  badge="Recomendado"
                  onVisitaPress={(bodega) =>
                    router.push({ pathname: '/bodega/[id]', params: { id: bodega.id } })
                  }
                />
              ))}
              <Button title="Agregar a Mi Ruta" onPress={agregarAMiRuta} />
            </>
          )}
        </View>
      )}
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.lg,
  },
  form: {
    gap: Spacing.xl,
    marginTop: Spacing.xl,
  },
  field: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  column: {
    flex: 1,
  },
  budgetInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.text,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  proposal: {
    marginTop: Spacing.xxl,
    paddingTop: Spacing.xl,
    gap: Spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  proposalHeader: {
    gap: Spacing.xs,
  },
});
