# Especificación — generación de rutas (SDD + TDD)

Especificación histórica. La selección vigente se define en [Selección voraz de rutas](09-seleccion-voraz-de-rutas.md).

## Reglas acordadas

1. Todas las visitas empiezan y terminan dentro de los días del viaje, de la franja diaria y de los horarios de su experiencia. No hay superposiciones: entre visitas se respeta traslado más margen de descanso. Estas condiciones nunca se relajan para incluir favoritas.
2. Se intenta incluir primero las imprescindibles marcadas para el viaje, después las demás favoritas del usuario. Si una imprescindible falta, la propuesta es parcial y lo informa individualmente.
3. Se elige una experiencia por bodega: el costo por persona, duración y turnos salen de esa experiencia. El presupuesto por persona es para todas las experiencias del viaje, incluida gastronomía contratada; no incluye transporte, alojamiento ni comidas fuera de las experiencias. Nunca se supera.
4. La cantidad de bodegas es un objetivo flexible y un máximo. Debe ser al menos la cantidad de imprescindibles elegidas. Se completa con otras bodegas si hay tiempo y presupuesto.
5. Dentro de cada día se minimiza la suma de distancias entre bodegas. Cada día es un recorrido abierto independiente, sin origen, regreso ni costo de conexión entre días. Las zonas no son restricciones: se usan coordenadas.
6. Entre opciones equivalentes se reparte la carga entre días y se separan las visitas dentro de la franja disponible. Se reserva almuerzo cuando el día no tiene experiencia gastronómica.

Orden de comparación entre propuestas factibles: cantidad de imprescindibles, cantidad de favoritas, cantidad total hasta el objetivo, distancia diaria acumulada, equilibrio de carga diaria, separación entre visitas, costo. No se sacrifica una favorita para incluir más bodegas comunes.

## Entradas y valores iniciales

Fecha de inicio, días (1–14), personas, presupuesto por persona en centavos ARS, cantidad deseada (1–12), IDs imprescindibles tomados de las favoritas del usuario y franja diaria ajustable. Las favoritas se consultan en SQLite para el usuario autenticado; el cliente no puede suplantarlas.

Valores iniciales de comodidad: 10:00–18:00 (editable), margen de 30 minutos además del traslado y pausa de almuerzo 13:00–14:00 si no hay gastronomía. La pausa bloquea visitas y traslados; no es un gasto presupuestado. La franja puede ser más corta que la pausa. Los turnos fijos no se desplazan; las experiencias flexibles sólo se colocan si su duración completa cabe.

## Algoritmo

Backtracking con poda, adaptado de `Tp_algoritmia/trabajo-final---algoritmia/viajante.pl`. Los vértices son bodegas; se exploran selección de experiencia, orden y asignación a días. Haversine calcula kilómetros geodésicos. El traslado se estima a 40 km/h con factor 1,3 y 10 minutos de acceso; es orientativo, no una ruta vial.

Se descartan inmediatamente bodegas repetidas, sobrepresupuesto y secuencias sin horario factible. Una propuesta inicial factible da una cota superior de distancia antes de comenzar la exploración desde el estado vacío. Se buscan primero las continuaciones de menor distancia. Una cota optimista de imprescindibles/favoritas/cantidad alcanzable permite podar ramas que no pueden mejorar la mejor solución. Se mantienen las alternativas de experiencias y todas las bodegas elegibles.

La cota de distancia cuenta cuántos enlaces todavía son inevitables para alcanzar la cantidad de la mejor propuesta: cada día futuro admite una primera visita sin enlace de origen. Suma los enlaces disponibles más económicos, relajando las restricciones de recorrido. Para uno o dos enlaces también reserva plazas para imprescindibles y favoritas pendientes. Si incluso esa cota supera la mejor distancia, se poda la rama. La propuesta inicial y estas cotas aceleran la prueba de optimalidad conservando las reglas de comparación.

Para cada orden diario se calcula la agenda más temprana factible; sólo después se distribuye el tiempo libre aumentando el margen entre visitas sin mover turnos fijos. La poda temporal inicial puede ignorar almuerzo (relajación optimista), porque una experiencia gastronómica posterior puede cubrirlo. El día se acepta únicamente con todas las reglas satisfechas.

La búsqueda dispone de aproximadamente un minuto y no tiene corte por cantidad de estados en su configuración habitual. Cede el event loop cada 256 estados para que el servidor siga atendiendo solicitudes. Los prefijos equivalentes se comparan por recursos: con las mismas bodegas visitadas, día actual, orden de experiencias del día y balance de días cerrados, se descarta un prefijo si otro consume menos presupuesto y distancia sin perder separación relevante. Se cachea la distribución horaria y las cotas de presupuesto sólo consideran experiencias disponibles desde el día actual en adelante. La memoria de las cachés está acotada; descartar una entrada de caché sólo pierde una optimización, no una alternativa.

Si se agota el tiempo, devuelve la mejor propuesta factible encontrada, marcada como búsqueda incompleta; nunca afirma optimalidad ni imposibilidad por horario cuando sólo dejó de explorar. El mínimo se garantiza solamente cuando se completa la búsqueda y respecto de las prioridades anteriores y del modelo geográfico. La app informa durante la espera que el análisis puede tardar hasta un minuto.

## Resultado y explicaciones

La acción visible «Generar y guardar ruta» guarda una ruta con al menos una visita y presenta costo por persona/grupo, cantidad conseguida, imprescindibles omitidas y advertencias. Si no hay ninguna visita factible, no se guarda una ruta vacía y se informa la causa. La configuración y el resultado de generación quedan en `Ruta.parametros`, sin migraciones.

Las explicaciones distinguen: ausencia de horarios en las fechas, franja diaria incompatible, presupuesto insuficiente, límite de cantidad, incompatibilidad combinada de agenda y exploración incompleta. «No alcanza el presupuesto restante para agregarla a esta propuesta» no significa que la bodega sea imposible en cualquier otra combinación. Sólo se afirma insuficiencia general de presupuesto si una cota de precios mínimos lo demuestra.

Los avisos describen la generación original; luego de editar la ruta se identifican como tales. Horarios semanales no representan cupos, feriados ni reservas confirmadas.

## Capas

Expo recoge parámetros, presenta favoritas y permite marcar imprescindibles. Express valida el request y la sesión. Prisma consulta catálogo y favoritas de SQLite. El planificador puro devuelve visitas y diagnósticos. Express revalida y persiste la ruta y visitas en una transacción; Expo presenta la respuesta. No hay catálogo alternativo en el cliente.

## Casos de aceptación / TDD

- A1: nunca proponer visitas fuera de fecha, franja, turno o superpuestas; contemplar duración, traslado y margen.
- A2: una favorita gana a una bodega común, y una imprescindible gana a una favorita común.
- A3: agrupar parejas cercanas el mismo día; cero traslado entre días aunque estén lejos.
- A4: elegir otra experiencia de la misma bodega si permite cumplir presupuesto u horarios; no repetir bodega.
- A5: repartir horarios flexibles, conservar turnos fijos y reservar almuerzo salvo experiencia gastronómica.
- A6: presupuesto bajo devuelve cantidad parcial y motivos comprobables, o ningún resultado sin persistencia.
- A7: imprescindibles incompatibles se enumeran con motivos; la ruta no se presenta como completa.
- A8: el usuario sólo puede marcar imprescindibles entre sus propias favoritas. La API valida intervalos y cantidades.
- A9: límites de exploración se informan; no se promete mínimo global cuando se alcanzan.

Cada ciclo escribe y ejecuta primero una prueba que falla, implementa la regla y refactoriza en verde. Se registra en el seguimiento local. Este documento reemplaza la búsqueda por frontera acotada de la implementación preliminar.
