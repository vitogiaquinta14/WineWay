import { StyleSheet, View } from 'react-native';

import { TrasladoInfo } from '@/components/ruta/traslado-info';
import { VisitaCard } from '@/components/ruta/visita-card';
import { AppText } from '@/components/ui/app-text';
import { Spacing } from '@/constants/theme';
import { getBodega, type Bodega } from '@/data/bodegas';
import type { DiaRuta, Visita } from '@/data/rutas';

type ItinerarioDiaProps = {
  dia: DiaRuta;
  onVisitaPress: (bodega: Bodega) => void;
  /** Badge de cada visita (por defecto "Planificado"). */
  badge?: string;
  onEditarVisita?: (visita: Visita, bodega: Bodega) => void;
  onQuitarVisita?: (visita: Visita, bodega: Bodega) => void;
};

/** Un día del itinerario: título, visitas en orden y traslados entre ellas. */
export function ItinerarioDia({
  dia,
  onVisitaPress,
  badge,
  onEditarVisita,
  onQuitarVisita,
}: ItinerarioDiaProps) {
  return (
    <View style={styles.day}>
      <AppText variant="heading">{dia.titulo}</AppText>

      {dia.visitas.length === 0 && <AppText variant="caption">Sin visitas para este día.</AppText>}

      {dia.visitas.map((visita, index) => {
        const bodega = getBodega(visita.bodegaId);
        if (!bodega) return null;

        return (
          <View key={visita.id} style={styles.visit}>
            {index > 0 && visita.trasladoMin !== undefined && (
              <TrasladoInfo minutos={visita.trasladoMin} destino={bodega.nombre} />
            )}
            <VisitaCard
              visita={visita}
              bodega={bodega}
              badge={badge}
              onPress={() => onVisitaPress(bodega)}
              onEdit={onEditarVisita && (() => onEditarVisita(visita, bodega))}
              onDelete={onQuitarVisita && (() => onQuitarVisita(visita, bodega))}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  day: {
    gap: Spacing.md,
  },
  visit: {
    gap: Spacing.md,
  },
});
