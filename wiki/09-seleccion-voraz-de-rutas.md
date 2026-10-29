# Especificación SDD — selección por prioridad, puntuación y presupuesto

Reemplaza el backtracking de [la especificación anterior](08-generacion-de-rutas.md), según la decisión de usar una construcción voraz y evitar agotar límites de exploración.

## Entradas

Se conservan fechas/días, personas, presupuesto por persona para todas las experiencias, cantidad deseada de visitas, imprescindibles y franja diaria. Las favoritas se obtienen de la sesión. Las imprescindibles también pueden elegirse entre bodegas activas del catálogo, sin agregarlas a favoritos.

Se agrega `cantidadAlmuerzos`: entero entre cero y la cantidad de días, y no mayor que las visitas deseadas. Es una cantidad deseada y un máximo: se avisa si no se alcanza. Cada almuerzo ocupa una visita a una bodega y como máximo uno por día. «Visita y almuerzo» cubre ambas actividades dentro de una única experiencia. Se consideran almuerzos los tipos que explícitamente incluyen «almuerzo»; gastronomía/tapeo por sí solos no cuentan. No hace falta cambiar el schema: se usan los tipos actuales del catálogo y `Ruta.parametros`.

## Construcción

1. Filtrar experiencias y bodegas inactivas y experiencias que no tengan un turno o una ventana completa dentro de alguno de los días/franjas elegidos.
2. Mantener los grupos de prioridad: imprescindibles, favoritas y demás. Las imprescindibles entran todas, así que se ubican primero las más restringidas: las que tienen menos minutos de inicio posibles en el viaje (un turno fijo suma uno; una franja flexible, muchos). Para completar un grupo diario, considerar las **cinco bodegas más cercanas viables a menos de 20 km** y elegir la mejor puntuada entre ellas. Si ninguna candidata está a menos de 20 km, **gana la distancia**: se elige la más cercana. Repetir tras cada incorporación. La distancia se mide contra visitas del día donde la candidata puede insertarse, no contra bodegas de otros días. La primera visita de un día se elige por puntuación porque no se definió un punto de partida.
3. Para cada bodega, probar experiencias de menor a mayor precio. Sólo considerar una inserción si entra en el presupuesto restante y en los horarios. Una candidata sin inserción viable no ocupa un lugar entre las cinco. La puntuación es un promedio bayesiano: `(5 · demostración + suma de reseñas) / (5 + cantidad de reseñas)`. El rating de demostración pesa como cinco reseñas, así una sola reseña no desplaza a bodegas bien calificadas y muchas reseñas WineWay terminan predominando. Sin rating de demostración se usa el promedio de reseñas. Sin puntuación queda al final; los empates se resuelven por cercanía, incremento de recorrido, costo y orden estable.
4. Al incluir imprescindibles y favoritas, elegir inicialmente la experiencia accesible. Para cumplir almuerzos se puede cambiar la experiencia de una bodega ya elegida a un almuerzo, conservando esa bodega y validando nuevamente horarios, presupuesto y cuota diaria. Los nuevos almuerzos y las visitas restantes usan también el grupo de cinco cercanas y luego puntuación.
5. Reintentar las prioridades que hayan quedado sin lugar después de colocar almuerzos, pues una pausa de almuerzo puede quedar cubierta por la experiencia elegida. Son pasadas directas, sin explorar combinaciones ni deshacer selecciones de bodegas.
6. Con el presupuesto que sobra, cada bodega elegida sube un escalón a la siguiente experiencia más cara de la misma bodega, sin cambiar si es almuerzo, por orden de prioridad y puntuación, mientras quepa en horario y presupuesto. Se repite hasta que ninguna mejora. Los motivos de exclusión se explican con el costo anterior a estas mejoras.

Cada incorporación prueba los días y las posiciones de inserción del itinerario existente; no permuta todas las visitas. Se favorecen días con bodegas cercanas y espacio: se considera cercano hasta 20 km: dentro de ese radio decide la puntuación; fuera de él, la distancia. No es una restricción: una bodega lejana puede entrar si no hay otra opción. Orden de los días: primero se completa la carga `ceil(visitas/días)` de los días con lugar que tengan candidatas a menos de 20 km; después se abre un día vacío; recién entonces se suma una visita a un día que ya tiene su carga. Si eso no cabe, se prueba otra posición/día factible. Se minimiza el incremento de distancia entre las inserciones equivalentes.

## Restricciones y comodidad

Todas las visitas deben empezar y terminar dentro del viaje, la franja diaria y los horarios de la experiencia. Se contemplan duración, traslado estimado y 30 minutos de margen. Cada día es independiente y no se conecta con el siguiente. Se mantiene una única experiencia por bodega en todo el viaje.

Los almuerzos contratados empiezan antes de las 15:00, también después de distribuir el tiempo libre. Si el día no incluye un almuerzo contratado, se reserva la pausa 13:00–14:00 para comer por cuenta propia, sin presupuestarla. Una experiencia de tapeo no elimina esa pausa. Una vez elegidas las visitas del día, se distribuye el tiempo libre entre ellas dentro de los horarios y sin desplazar turnos fijos.

## Resultado

La selección recorre las candidatas y termina sin un límite de exploración combinatoria. `metodo: VORAZ` identifica el criterio utilizado; no se afirma óptimo global. El resultado incluye visitas, costos, cantidad de almuerzos, imprescindibles faltantes y explicaciones. No se generan nuevos mensajes de «límite de exploración». Los resúmenes de rutas anteriores conservan su significado histórico.

Los motivos describen por qué no se pudo incorporar una candidata a esta propuesta: inactividad, fechas, franja, presupuesto restante, cantidad deseada, cuota de almuerzos o agenda. Una selección voraz puede dejar fuera una bodega que cabría en otra combinación; no se afirma imposibilidad global.

## Casos de aceptación / TDD

- V1: una bodega mejor puntuada pero cerrada no desplaza candidatas disponibles.
- V2: imprescindibles y favoritas preceden a otras mejor puntuadas.
- V3: entre comunes, elegir la mejor puntuada de las cinco cercanas viables; si una candidata no puede pagarse o agendarse, considerar otras.
- V4: probar una experiencia más económica de la misma bodega antes de descartarla.
- V5: insertar un turno temprano antes de una visita ya elegida con turno fijo tarde, respetando todos los márgenes.
- V6: cero almuerzos evita contratar almuerzos; una cantidad positiva tiene máximo uno por día y cuenta «Visita y almuerzo».
- V7: permitir cambiar a almuerzo la experiencia de una favorita sin perder esa bodega; informar almuerzos faltantes si no caben.
- V8: validar cantidad de almuerzos en Express y en el formulario, y conservarla en el resumen guardado.
- V9: el caso de cuatro días/seis visitas se resuelve mediante construcción directa, sin avisos de límites ni pruebas de óptimo global.
- V10: la sexta candidata por distancia no desplaza a las cinco cercanas aunque tenga más puntuación; lo mismo se cumple para almuerzos.
- V11: favoritas lejanas pueden estar en días distintos; no se agrega distancia de conexión entre días.
- V12: si hay candidatas a menos de 20 km, una más lejana no entra aunque tenga mejor puntuación; si no hay ninguna, gana la más cercana.
- V13: un día con lugar completa su carga antes de que otro día ya completo reciba una visita más.
- V14: un almuerzo nunca empieza a las 15:00 o después.
- V15: el presupuesto sobrante mejora experiencias sin superarlo.
- V16: una imprescindible con un único turno se ubica antes que otra con más horarios.
- V17: una reseña aislada mueve poco el rating de demostración; muchas reseñas lo reemplazan.

Expo envía parámetros → Express valida y obtiene catálogo/favoritas → Prisma consulta SQLite → el planificador puro construye y agenda → Express revalida y guarda en transacción → Expo presenta visitas y motivos. TDD y mediciones quedan en el seguimiento local.
