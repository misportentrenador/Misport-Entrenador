# Roadmap Maestro — MISPORT OS

> Documento vivo. Se actualiza en el mismo archivo al cierre de cada Sprint (no se crean copias "v2"). Mantenido por el Arquitecto Principal (Claude) según la metodología de planificación autónoma vigente desde el 2026-07-15.

## Misión

MISPORT OS es el **Sistema Operativo de la empresa**, no un CRM ni un Dashboard aislado. La misión permanente es llegar al día en que el Director General pueda desarrollar el 100% de su jornada laboral desde MISPORT OS, sin cambiar continuamente entre aplicaciones. Cada Sprint debe acercar el sistema a ese objetivo.

**Filosofía**: no se diseñan pantallas aisladas. Cada desarrollo es parte de un flujo de trabajo completo. No se diseña para la versión actual del negocio, sino para la empresa que MISPORT será dentro de cinco años — la arquitectura debe poder alojar todos los dominios de la visión a largo plazo (ver más abajo) sin necesitar un rediseño.

**Las 4 preguntas de filtro** — toda propuesta de desarrollo debe responderlas antes de considerarse:
1. ¿Reduce el número de aplicaciones que se usan a diario?
2. ¿Reduce clics o tiempo de trabajo?
3. ¿Ayuda a vender más, facturar más o evitar pérdidas?
4. ¿Ayuda a tomar mejores decisiones como Director General?

Si una propuesta no supera claramente estas 4 preguntas, no es prioritaria.

**Orden de prioridad para decidir el siguiente Sprint** (vigente desde el cierre del Sprint 20 — sustituye al orden anterior de 5 niveles centrado en integraciones):
1. Completar los flujos internos de trabajo de MISPORT OS.
2. Consolidar Agenda, CRM, Finanzas y Facturación.
3. Finalizar las acciones rápidas pendientes.
4. Optimizar la experiencia diaria del Director General.
5. Una vez el núcleo esté estable: integraciones reales (Google Calendar, Booksy, Gmail y el resto).

Mientras el núcleo no esté consolidado, las integraciones externas reales quedan deliberadamente en espera — pero su arquitectura y documentación técnica se mantienen completamente preparadas para que la activación sea inmediata cuando llegue el momento (no se pierde el trabajo ya hecho en el Sprint 18, solo se pospone conectar credenciales reales).

**Regla de integración (permanente, sigue vigente)**: mientras se sigan usando herramientas externas (Booksy, Google Calendar, Gmail, WhatsApp, TrainingPeaks, Stripe y otras), MISPORT OS debe convivir con ellas — no sustituirlas todavía. El objetivo es integrarlas progresivamente hasta trabajar desde una única interfaz, una vez el núcleo esté consolidado (ver orden de prioridad de arriba).

**Reparto de esfuerzo por sesión**: ~80% funcionalidad nueva de alto valor, ~20% optimización/rendimiento/limpieza/accesibilidad/pruebas/deuda técnica — de forma continua, no al final del proyecto.

**Informe de madurez (obligatorio desde el cierre del Sprint 20)**: cada informe de cierre de Sprint debe incluir una estimación razonada del porcentaje de madurez de MISPORT OS respecto al objetivo final de ser el sistema operativo completo de la empresa (ver metodología de cálculo en "Estado actual del sistema").

**Informe de valor operativo (obligatorio desde el cierre del Sprint 23)**: además de la madurez, cada informe de cierre debe indicar qué porcentaje de valor operativo aporta ese Sprint respecto a la versión anterior — tiempo ahorrado, clics eliminados, tareas que ya no requieren salir de MISPORT OS. Es una métrica complementaria a la madurez: la madurez mide cuánto se ha construido del sistema completo; el valor operativo mide cuánta utilidad real gana el Director General en su día a día con lo construido hasta ahora, para no confundir "más funcionalidades" con "más utilidad".

**Reglas permanentes de Tesorería y movimientos económicos (fijadas al cierre del Sprint 24, vigentes para todo Sprint futuro que toque dinero)**:
1. **Un único flujo oficial para registrar cobros.** No pueden coexistir dos caminos distintos que produzcan el mismo resultado — hoy ese flujo es `registrarCobro` (`FinanceContext.tsx`); cualquier acción económica futura (reversión, cobro parcial, lo que sea) se añade a ese mismo flujo o lo sustituye por completo, nunca crea un segundo camino en paralelo. Precedente ya aplicado en el propio Sprint 24: `marcarComoCobrada` no se dejó conviviendo con `registrarCobro`, se eliminó.
2. **Tesorería es la única fuente de verdad de cualquier movimiento económico.** CRM, Dashboard, Facturación y cualquier módulo futuro **consumen** `Factura`/`CobroFactura` (vía `useFinance()`, cálculos derivados como `getImportePendiente`/`personaTieneDeuda`, o el evento `CobroRegistered`) — ninguno mantiene su propia copia del estado económico. Ya es así hoy: el panel "Cobros pendientes" y el filtro "Con deuda" del CRM no guardan nada propio, recalculan sobre los datos de Finanzas cada vez.
3. **Todo movimiento económico queda completamente auditado**: usuario, fecha y hora, importe, método de pago, referencia y origen del movimiento. Ya cumplido por `CobroFactura` (Sprint 24) y por `Factura` (quién la generó); cualquier entidad económica nueva reproduce estos mismos campos desde su primer commit, no como una mejora posterior.
4. **Ningún registro económico se elimina físicamente.** `CobroFactura` ya es inmutable (sin función de edición ni borrado, Sprint 24); esta regla se extiende a toda entidad económica futura — una corrección se modela siempre como una operación compensatoria o una anulación explícita que preserva el registro original, nunca como un `DELETE` ni una edición in-place.
5. **La arquitectura sigue preparada, sin construirlas todavía, para**: Stripe, TPV, Bizum, transferencias, Contabilidad, un ERP externo e IA. El punto de enganche ya existe (`CobroFactura.id` como identificador permanente + el evento de dominio `CobroRegistered`) — activar cualquiera de estas integraciones es añadir un adaptador que las consume, nunca modificar `registrarCobro` ni el modelo de datos.

**Reglas permanentes de pruebas automatizadas (fijadas al cierre del Sprint 26, vigentes para todo Sprint futuro)**:
1. **Toda funcionalidad nueva debe ir acompañada de sus pruebas automáticas.** Ningún Sprint se da por cerrado con una funcionalidad sin cobertura de test — la prueba forma parte de la definición de "hecho", no de una fase posterior opcional.
2. **Cada Sprint debe ejecutarse contra toda la batería de regresión antes de darse por finalizado.** `npx playwright test` (los 14 tests existentes al cierre del Sprint 26, y todos los que se añadan después) debe pasar en verde antes de presentar el informe de cierre.
3. **Las pruebas se organizan por módulo** (`tests/agenda/`, `tests/crm/`, `tests/reservas/`, `tests/bonos/`, `tests/finanzas/`, `tests/facturacion/`, `tests/dashboard/`, `tests/smoke/`...) para que el mantenimiento de cada suite sea independiente del resto.
4. **El Roadmap Maestro indica siempre el porcentaje de cobertura de pruebas y el nivel de estabilidad de cada módulo** (ver tabla "Cobertura de pruebas por módulo" más abajo), actualizada en cada cierre de Sprint igual que la madurez y el valor operativo.

Framework elegido (decisión de arquitectura del Director General, Sprint 26): **Playwright Test** como framework principal de pruebas end-to-end, sustituyendo a los scripts ad-hoc de sesiones anteriores (`autonomous-full-sweep.mjs` y similares, no persistidos entre sesiones). Configuración en `playwright.config.ts` (Chromium preinstalado del entorno, `webServer` que levanta `npm run dev` automáticamente); comandos `npm run test:e2e`, `test:e2e:ui`, `test:e2e:report`.

## Visión a largo plazo: MISPORT OS como ERP completo

No estamos construyendo funcionalidades sueltas: MISPORT OS es el **ERP completo de la empresa**. Todos sus módulos comparten la misma base de datos y la misma arquitectura (Party-Role para personas/organizaciones, Repository/Context por dominio, registros de acciones Open/Closed), para que ninguno quede aislado ni duplique lo que otro ya resuelve.

Módulos del ERP, con su estado actual:

| Módulo | Estado |
|---|---|
| CRM | Construido (Sprints 8-12) |
| Agenda | Construido — registro `sessionActions` completo (Sprints 15-18, 21-23) |
| Reservas | Construido (Sprints 5, 7, 11, 23 — asistencia) |
| Bonos | Construido — consumo automático (Sprint 11) y regularización manual (Sprint 22) |
| Finanzas | Construido, parcial (Sprints 6-7, 25 — flujo único de alta de sesiones/pagos) |
| Facturación | Construido, fase 1 (Sprint 19) |
| Tesorería (cobros, cobros parciales, formas de pago, conciliación bancaria) | Fase 2 — cobros parciales/fraccionados, forma de pago obligatoria, auditoría completa, cobro inmutable con id permanente (Sprint 20, 24); conciliación bancaria, remesas y facturación electrónica quedan preparadas en el modelo pero no implementadas |
| Clientes / Entrenadores / Centros | Construidos (Catálogo Maestro, Sprint 2) |
| Proyectos institucionales (Ayuntamientos y similares) | No iniciado |
| Corporate Wellness | No iniciado |
| Trail Running | No iniciado |
| Recursos Humanos | No iniciado |
| Documentación | No iniciado |
| IA | Mínimo (consejo motivacional en Booking Wizard) |
| Automatizaciones | No iniciado |
| Cuadros de mando | Dashboard actual (Sprints 13-14, 20); ampliable |
| Integraciones externas | Arquitectura lista (`CalendarSourceAdapter`, Sprint 18); Google Calendar en modo lectura con credenciales de prueba |

Cada módulo futuro se diseña cuando le corresponda por prioridad, verificando siempre que encaja en la arquitectura ya existente sin necesitar romperla.

### Madurez estimada del sistema (2026-07-16, tras el Sprint 26): ~41%

Estimación cualitativa, no una métrica exacta: media ponderada del grado de completitud de cada uno de los 17 módulos del ERP (CRM ~90%, Agenda ~97%, Reservas ~92%, Catálogo ~90%, Bonos ~85%, Finanzas ~65%, Cuadros de mando ~50%, Facturación ~40%, Tesorería ~45%, Integraciones externas ~20%, IA ~5%, y Proyectos institucionales/Corporate Wellness/Trail Running/RRHH/Documentación/Automatizaciones en 0%), más un nuevo eje de calidad transversal — **framework de pruebas automatizadas versionado**, inexistente antes del Sprint 26 (0%) y hoy en ~35% de cobertura real sobre los módulos críticos (ver tabla de cobertura más abajo). Sube de ~40% a ~41% — movimiento pequeño porque el Sprint 26 es una inversión en calidad/red de seguridad, no una funcionalidad de negocio nueva, pero reduce de forma real el riesgo de regresión de todo lo construido en los Sprints 17-25. Se recalculará al cierre de cada Sprint futuro con el mismo criterio, para que la cifra sea comparable entre informes.

---

## Cobertura de pruebas por módulo

Tabla obligatoria desde el cierre del Sprint 26 (ver reglas permanentes de pruebas automatizadas más arriba). "Cobertura" es una estimación cualitativa de qué proporción de los flujos de negocio del módulo tiene al menos una prueba automática que lo verifica de extremo a extremo — no una cobertura de líneas de código. "Estabilidad" refleja cuántas veces ha fallado el módulo en las últimas ejecuciones completas de la batería y si esos fallos eran del producto o de la propia prueba (flakiness).

| Módulo | Pruebas (`tests/`) | Cobertura estimada | Nivel de estabilidad |
|---|---|---|---|
| Agenda | `agenda/nueva-reserva`, `agenda/reprogramar` (×2), `agenda/consumir-bono`, `agenda/confirmar-asistencia` (×2), `agenda/quick-actions-registry` — 7 tests | Alta (~70%): cubre 4 de las 5 acciones rápidas con lógica de negocio propia (`nueva_reserva`, `reprogramar`, `consumir_bono` manual, `confirmar_asistencia`) más el registro completo de acciones visibles; falta `crear_incidencia` (Sprint 17) | Estable — 0 fallos de producto en las 2 últimas ejecuciones completas; 2 fallos de flakiness ya corregidos (locators ambiguos, condición de carrera en el wizard) |
| Reservas | `reservas/booking-wizard` — 1 test | Básica (~40%): cubre el flujo feliz completo de autorreserva del cliente (con y sin paso "Selecciona Entrenador"), no cubre cancelación ni casos límite de disponibilidad | Estable tras corregir una condición de carrera compartida con `agenda/nueva-reserva` |
| Bonos | `agenda/consumir-bono` — 1 test (más verificado indirectamente en `agenda/confirmar-asistencia`) | Básica (~30%): cubre solo la regularización manual (Sprint 22); el consumo automático al completar una sesión (Sprint 11) no tiene prueba dedicada | Estable |
| Finanzas | `finanzas/consolidacion` — 3 tests | Media (~50%): cubre el flujo único de alta de pagos (`PagoFormFields`) en sus 3 puntos de uso (Registro general, Ficha, Agenda) | Estable |
| Facturación | `finanzas/facturacion-cobros` — 1 test | Media (~45%): cubre bloqueo sin datos fiscales, numeración correlativa y generación de PDF | Estable |
| Tesorería / Cobros | `finanzas/facturacion-cobros` — 1 test (comparte archivo con Facturación) | Media (~50%): cubre cobros parciales, forma de pago obligatoria, bloqueo de sobre-cobro, y que "Con deuda"/"Cobros pendientes" reaccionen sin estado propio | Estable |
| CRM | Sin suite dedicada; verificado indirectamente (todas las pruebas de Agenda/Finanzas comprueban que su evento de dominio llega al Historial de la Ficha) | Básica (~20%): la Ficha del cliente en sí (buscador, filtros, secciones) no tiene pruebas propias todavía | Sin incidencias observadas, pero sin cobertura directa |
| Dashboard | Verificado indirectamente en `finanzas/facturacion-cobros` (panel "Cobros pendientes") | Mínima (~10%) | Sin incidencias observadas, pero sin cobertura directa |
| Catálogo Maestro / Datos Maestros / Centros / Entrenadores | `smoke/app-sweep` (barrido de rutas, sin errores de consola) | Mínima (~10%): solo verifica que la pantalla carga, no la lógica de negocio de cada módulo | Sin incidencias observadas en el barrido |
| Integraciones externas | Sin pruebas — no hay integración real activa todavía (Sprint 18, modo lectura con credenciales de prueba) | Ninguna (0%) | N/A |

---

## Estado actual del sistema (2026-07-15)

| Módulo | Estado | Última actualización |
|---|---|---|
| Fundamentos (layouts, routing, design system) | Estable | FASE 1 |
| Catálogo Maestro (Centros, Entrenadores, Servicios, Tarifas, Bonos) | Estable | Sprint 2 |
| Datos Maestros (Persona, Organización, Contacto, Recurso) | Estable | Sprint 3-4 |
| Reservas | Estable, conectado al Catálogo | Sprint 5, 7, 11 |
| Finanzas | Estable, conectado al Catálogo; flujo único de alta de sesiones/pagos (`PagoFormFields` compartido, con selector de cliente opcional en el "Registro" general) | Sprint 6, 7, 25 |
| CRM (ficha única, buscador, filtros) | Estable — Release 0.3 cerrada | Sprint 8-12 |
| Dashboard (Inicio) | Estable, con alertas operativas/comerciales | Sprint 13-14 |
| Agenda Ejecutiva | Estable — centro operativo diario, 10 acciones rápidas (registro `sessionActions` completo: incluye reprogramar reserva, consumir bono manual y confirmar asistencia con 4 estados), integración de calendarios, eventos de dominio `ReservationRescheduled`/`BonoConsumedManually`/`AttendanceUpdated` listos para futuras sincronizaciones, KPIs, recordatorios, informes y automatizaciones | Sprint 15-18, 21-23 |
| Rendimiento/infraestructura técnica | Reforzada (bundle -92%, fix login, a11y) | Sesión de hardening 2026-07-15 |
| Integraciones externas reales | Arquitectura lista; Google Calendar en modo lectura (credenciales de prueba) | Sprint 18 |
| Facturación | Fase 1 — factura en PDF, numeración correlativa única | Sprint 19 |
| Tesorería / Cobros | Fase 2 — cobros parciales/fraccionados, forma de pago obligatoria, auditoría completa, cobro inmutable con id permanente, filtro "Con deuda", panel Dashboard | Sprint 20, 24 |
| Framework de pruebas automatizado versionado | Implantado — Playwright Test, 14 tests organizados por módulo, batería completa en verde (ver "Cobertura de pruebas por módulo") | Sprint 26 |

---

## Sprint actual

Ninguno abierto. El **Sprint 26** (Framework de pruebas automatizadas) está implementado y probado: Playwright Test como framework e2e oficial (`playwright.config.ts`, Chromium preinstalado del entorno, `webServer` que levanta `npm run dev` automáticamente), 14 tests organizados por módulo bajo `tests/` (`agenda/`, `finanzas/`, `reservas/`, `smoke/`, más `helpers/` compartidos de login/registro/sembrado de datos), cubriendo la regresión de los Sprints 18 y 21-25. Batería completa en verde (`npx playwright test` → 14 passed) tras corregir 5 bugs de los propios tests (nunca del producto): un `loginAsAdmin` que borraba localStorage y arrastraba consigo los datos sembrados por `registerClient`; un `registerClient` sin recarga tras cerrar sesión; dos locators ambiguos (botón "Reprogramar" que también matcheaba la reserva bloqueadora; mensaje de error de sobre-cobro que matcheaba 3 elementos); y una condición de carrera en el paso condicional "Selecciona Entrenador" del Booking Wizard, presente tanto en `agenda/nueva-reserva` como en `reservas/booking-wizard`. Añadidas 4 reglas permanentes de pruebas automatizadas y la tabla "Cobertura de pruebas por módulo" al Roadmap Maestro. Pendiente del Sprint 26: la auditoría de accesibilidad ampliada (Catálogo, Datos Maestros) que originalmente se planteó junto al framework de pruebas — queda como candidato explícito para un Sprint próximo, no se ha tocado en este cierre.

---

## Backlog general (no priorizado por Sprint todavía)

- Acciones rápidas de Agenda: **registro `sessionActions` completo** (`crear_incidencia` Sprint 17; `nueva_reserva` Sprint 18; `reprogramar` Sprint 21; `consumir_bono` manual Sprint 22; `confirmar_asistencia` Sprint 23). Solo queda `whatsapp`, reservada para cuando se apruebe esa integración externa (ver más abajo) — no es una acción de negocio pendiente.
- Estadísticas de asistencia/absentismo y automatizaciones (recordatorios, informes, KPIs) sobre `AsistenciaLog` y el evento `AttendanceUpdated` (Sprint 23) — arquitectura ya preparada, candidato futuro cuando corresponda por prioridad.
- Conexión real de Google Calendar (arquitectura, adaptador y modo lectura ya implementados y probados con credenciales de prueba en el Sprint 18) — **bloqueada solo por la creación de credenciales reales en Google Cloud por parte del Director General**, ver `Docs definitivos/2026-07-15-integracion-google-calendar.md`.
- Sincronización bidireccional de Google Calendar (crear/editar eventos desde MISPORT) — decisión de negocio explícitamente pendiente, no técnica.
- Integración WhatsApp (comunicación) — bloqueada hasta decisión de negocio (proveedor, coste).
- Integración Booksy — bloqueada hasta confirmar si existe API pública y decisión de negocio.
- Integración TrainingPeaks — bloqueada hasta confirmar API y decisión de negocio.
- Integración Gmail (resumen de correo relevante en el Dashboard) — bloqueada hasta decisión de negocio.
- Facturación fase 1 (Sprint 19) y Cobros/Cuentas por cobrar fase 1 y 2 (Sprint 20, 24) completadas: estados Borrador/Emitida/Cobrada/Anulada, cobros parciales/fraccionados con forma de pago y auditoría completa, filtro "Con deuda" y panel "Cobros pendientes". Pendiente como fases futuras de Tesorería: conciliación bancaria, remesas, facturas rectificativas, facturación electrónica, integración bancaria real — el modelo (`CobroFactura` inmutable con id permanente, evento `CobroRegistered`) ya está preparado para todas ellas sin rediseño.
- Auditoría de accesibilidad ampliada (Catálogo, Datos Maestros) — planteada junto al framework de pruebas automatizadas para el Sprint 26, pero no abordada en ese cierre; candidata para un Sprint próximo.
- Ampliar la cobertura de pruebas automatizadas (Playwright Test, Sprint 26) a los módulos con cobertura Básica o Mínima: CRM (Ficha, buscador, filtros), Dashboard, consumo automático de bonos, `crear_incidencia`, Catálogo/Datos Maestros — ver tabla "Cobertura de pruebas por módulo".
- Eliminación de `Persona.notes` (deprecado desde Sprint 8, pendiente de que el CRM quede consolidado — deuda de migración documentada).
- Asistente IA (hoy "Próximamente" en el nav; ya existe una integración mínima con Gemini para consejos motivacionales en el Booking Wizard) — candidato futuro de mayor alcance.

## Riesgos identificados

- **Integraciones externas reales** son el mayor riesgo/incertidumbre del roadmap: dependen de disponibilidad de API de terceros (Booksy, TrainingPeaks) que no está confirmada, y de decisiones de coste/autorización que solo puede tomar el Director General.
- El bundle vendor (React + Router + iconos) seguirá creciendo con cada nueva librería; ya está separado en chunks cacheables (Sprint de hardening), pero requiere vigilancia.
- Riesgo de cobertura inconsistente entre sesiones **mitigado** desde el Sprint 26: el framework de pruebas (Playwright Test) queda versionado en el repositorio, no en scripts ad-hoc de sesión. Riesgo residual: varios módulos (CRM, Dashboard, Catálogo/Datos Maestros) siguen con cobertura Básica o Mínima — ver tabla "Cobertura de pruebas por módulo".

## Dependencias clave

- Cualquier integración externa depende de: (a) decisión estratégica explícita (crear proyecto/credenciales en la plataforma externa), (b) alta de credenciales/API keys (nunca en código, vía variables de entorno), (c) posible coste recurrente a aprobar.
- Facturación (fase 1, Sprint 19) y Cobros (fase 1 y 2, Sprint 20 y 24): completadas.
- Futuras fases de Tesorería (conciliación bancaria, remesas, rectificativas, facturación electrónica, integración bancaria real): decisión de negocio pendiente para cada una cuando corresponda, sobre una arquitectura ya preparada (`CobroFactura` inmutable con id permanente, evento `CobroRegistered`).
- `confirmar_asistencia`: completada en el Sprint 23 (4 estados, auditoría con canal de origen, evento de dominio `AttendanceUpdated`, independencia absoluta y verificada respecto a bonos/cobros/facturación).
- `reprogramar`: completada en el Sprint 21 (valida disponibilidad/capacidad, conserva historial y trazabilidad, auditoría con horario anterior/nuevo, evento de dominio `ReservationRescheduled`).
- `consumir_bono` manual: completada en el Sprint 22 (solo bonos compatibles con el servicio, sin FinanceEntry adicional, auditoría con origen `consumo_manual` y motivo opcional preparado para el futuro, evento de dominio `BonoConsumedManually`).

---

## Próximos 10 Sprints previstos

Reordenados el 2026-07-16 tras el cierre del Sprint 26, según el orden de prioridad vigente (1. completar flujos internos, 2. consolidar Agenda/CRM/Finanzas/Facturación, 3. finalizar acciones rápidas pendientes, 4. optimizar la experiencia diaria, 5. integraciones reales — deliberadamente en espera hasta consolidar el núcleo).

| # | Sprint | Prioridad que satisface | Bloqueo |
|---|---|---|---|
| 27 | Eliminación de `Persona.notes` deprecado + consolidación final de notas en CRM | Deuda de migración documentada desde el Sprint 8 | Ninguno |
| 28 | Auditoría de accesibilidad ampliada (Catálogo, Datos Maestros) | Ciclo de mantenimiento del 20% técnico | Ninguno |
| 29 | Ampliar cobertura de pruebas automatizadas a CRM/Dashboard/Bonos automáticos (módulos con cobertura Básica/Mínima) | Ciclo de mantenimiento del 20% técnico, regla permanente de pruebas fijada en el Sprint 26 | Ninguno |
| 30 | **(en espera, arquitectura ya lista)** Conexión real de Google Calendar (activar credenciales) | 5 | Pospuesto por decisión estratégica hasta consolidar el núcleo — sin bloqueo técnico cuando se retome |
| 31 | **(en espera)** Segunda integración de calendario (Outlook o Apple Calendar) | 5 | Pospuesto — arquitectura (`CalendarSourceAdapter`) lista |
| 32 | **(en espera)** Integración WhatsApp | 5 | Pospuesto — además bloqueado por decisión de proveedor y coste |
| 33 | **(en espera)** Módulo de Proyectos institucionales (Ayuntamientos y similares) | 5 | Pospuesto — además bloqueado por definir el modelo de negocio |
| 34 | **(en espera, arquitectura ya lista)** Tesorería fase 3: conciliación bancaria y remesas | 1 y 2 | Pospuesto — requiere decidir un proveedor/formato bancario; el modelo (`CobroFactura` inmutable con id permanente) ya está preparado |
| 35 | **(en espera)** Facturación electrónica (Facturae/Veri*Factu) | 1 y 2 | Pospuesto — depende de la normativa aplicable y de un proveedor/certificado, no solo de MISPORT OS |

**Recomendación de secuencia**: Sprint 27 (Eliminación de `Persona.notes` deprecado) — es la deuda de migración documentada más antigua del roadmap (desde el Sprint 8), sin ningún bloqueo de decisión de negocio pendiente, y ahora que existe batería de regresión automatizada (Sprint 26) el riesgo de tocar un campo usado en varios módulos es más bajo que antes.

Este orden se revisará automáticamente al cierre de cada Sprint, por si el estado del proyecto cambia la prioridad.

---

## Historial de revisiones de este Roadmap

- **2026-07-15**: creación inicial, tras el cierre del Sprint 16 y la sesión de hardening técnico (fix de login, code-splitting, manualChunks, package.json, a11y, extracción de `PagoFormFields`).
- **2026-07-15**: actualizado tras la implementación del Sprint 17 (`crear_incidencia`); se propone el Sprint 18 (`nueva_reserva` desde la Agenda) como siguiente.
- **2026-07-15**: incorporada la nueva misión ("gestionar el 100% de la jornada desde MISPORT OS"), las 4 preguntas de filtro, el nuevo orden de prioridad de 5 niveles y la visión a largo plazo de 18 dominios. Reordenados los próximos Sprints; se propone desbloquear el diseño de la integración con Google Calendar como Sprint 18 principal, con `nueva_reserva` como alternativa sin bloqueo.
- **2026-07-15**: cerrado el Sprint 18 — arquitectura de integraciones de calendario (`CalendarSourceAdapter`), integración con Google Calendar en modo lectura (probada con credenciales de prueba, sin conectar la cuenta real) y `nueva_reserva` desde la Agenda. Se propone el Sprint 19 (Facturación fase 1) como siguiente, bloqueado por una decisión fiscal.
- **2026-07-15**: cerrado el Sprint 19 — Facturación fase 1 (entidad `Factura`, numeración correlativa única `AAAA-NNNN` con serie única elegida por el Director General, datos fiscales de la empresa, generación de PDF en el navegador con `jspdf` cargado bajo demanda). Se propone el Sprint 20 (Cobros/Cuentas por cobrar) como siguiente.
- **2026-07-15**: cerrado el Sprint 20 — Cobros/Cuentas por cobrar fase 1 (estados de Factura Borrador/Emitida/Cobrada/Anulada, "Marcar como cobrada" con fecha y hora automáticas, filtro "Con deuda" reactivado en el CRM, panel "Cobros pendientes" en el Dashboard con acceso directo). Arquitectura (`CobroFactura`) preparada para cobros parciales, formas de pago, facturas rectificativas, facturación electrónica e integración bancaria futuras, sin implementarlas todavía. Reformulada la visión a largo plazo explícitamente como un **ERP completo** (CRM, Agenda, Facturación, Tesorería, Proyectos institucionales, RRHH, Documentación, Automatizaciones, IA, todos sobre la misma base de datos y arquitectura), por instrucción directa del Director General.
- **2026-07-15**: nuevo orden de prioridad tras el Sprint 20 — consolidar el núcleo (flujos internos, Agenda/CRM/Finanzas/Facturación, acciones rápidas pendientes, experiencia diaria) antes de retomar integraciones externas reales, que quedan en espera con su arquitectura ya preparada. Añadida la estimación de madurez del sistema (~37%) y el requisito de incluirla en cada informe de cierre de Sprint futuro. Se propone el Sprint 21 (finalizar las acciones rápidas pendientes) como siguiente.
- **2026-07-15**: cerrado el Sprint 21 — Reprogramar reserva desde la Agenda: valida disponibilidad y capacidad del nuevo horario (reutilizando `computeTimeSlots`, extraído del Booking Wizard, y `getOccupancy`), modifica la misma reserva sin cancelarla ni crear una nueva (conserva bono/pagos/incidencias/notas), registra auditoría estructurada con horario anterior y nuevo (`ReservationRescheduleLog`) y emite un evento de dominio interno (`ReservationRescheduled`, `src/core/events/domainEvents.ts`) al que el propio CRM ya se suscribe (para alimentar el Historial de la Ficha) y al que las futuras integraciones de Booksy/Google Calendar podrán suscribirse sin tocar esta lógica. Una única implementación (`ReprogramarModal.tsx`) utilizable desde la vista diaria y semanal de la Agenda y desde la Ficha del cliente. Madurez del sistema: ~38%. Se propone el Sprint 22 (terminar `confirmar_asistencia` y `consumir_bono` manual) como siguiente.
- **2026-07-15**: presentado el diseño funcional completo de las dos acciones rápidas pendientes (`confirmar_asistencia` y `consumir_bono` manual) con flujo de usuario, reglas de negocio, casos excepcionales, impacto, riesgos, pruebas y criterios de aceptación; recomendado empezar por `consumir_bono` manual por resolver un aviso operativo ("Pendiente de regularizar") que hoy no tiene ninguna acción que lo cierre. Aprobadas las recomendaciones (no-show de `confirmar_asistencia` como registro informativo sin efectos económicos; independencia entre "Confirmar asistencia" y "Marcar completada"; compatibilidad estricta por servicio en `consumir_bono` manual, igual que el consumo automático) más un requisito añadido: auditar todo consumo manual con usuario, fecha, hora y origen "Consumo manual", dejando preparado (no exigido todavía) un campo de motivo futuro sin cambiar el modelo de datos.
- **2026-07-15**: cerrado el Sprint 22 — Consumir bono manual desde la Agenda: regulariza una reserva `COMPLETED` con `bonoStatus: 'pending_regularization'`, reutilizando el mismo criterio de compatibilidad y desempate que el consumo automático (Sprint 11); no genera ningún `FinanceEntry` adicional; auditoría estructurada con usuario, fecha/hora y `origen: 'consumo_manual'` (`BonoManualConsumptionLog`, con `motivo` ya presente pero opcional); evento de dominio `BonoConsumedManually` al que el CRM ya se suscribe para el Historial de la Ficha. Una única implementación (`ConsumirBonoManualModal.tsx`) utilizable desde la vista diaria y semanal de la Agenda y desde la Ficha del cliente. De paso, corregida documentación desactualizada que describía el consumo automático de bonos como pendiente de implementar. Madurez del sistema: ~38% (sin cambio significativo). Se propone el Sprint 23 (`confirmar_asistencia`, última acción rápida pendiente de la Agenda) como siguiente.
- **2026-07-16**: presentado y aprobado el diseño técnico completo del Sprint 23 (`confirmar_asistencia`, 4 estados: Pendiente/Asistió/No asistió/Justificada), con 3 requisitos añadidos: auditar también el canal de origen (Agenda Día/Semana/Ficha), preparar el evento de dominio para futuros módulos de KPIs/recordatorios/informes/automatizaciones/IA, y mantener independencia absoluta entre asistencia, cancelación, bonos, cobros y facturación. Cerrado el Sprint 23: nuevo tipo `AsistenciaEstado` (campo opcional en `Reservation`, sin migración de datos, con `getAsistencia()` como único punto de verdad del valor por defecto), auditoría estructurada `AsistenciaLog` con estado anterior/nuevo, canal, usuario y fecha/hora, evento de dominio `AttendanceUpdated` al que el CRM ya se suscribe para el Historial de la Ficha. Verificado por prueba dedicada que ningún cambio de asistencia afecta a bonos, cobros, facturación, reprogramaciones ni consumos manuales de bono. Una única implementación (`AsistenciaModal.tsx`) utilizable desde la vista diaria y semanal de la Agenda y desde la Ficha del cliente. Con este cierre, el registro `sessionActions` de la Agenda queda completo (10 acciones de negocio); solo `whatsapp` queda pendiente, bloqueada por una integración externa, no por lógica de negocio. Madurez del sistema: ~38% (sin cambio significativo — patrón esperado de esta metodología incremental). Añadido, a partir de este cierre, el requisito de incluir también un **porcentaje de valor operativo aportado** en cada informe de cierre de Sprint (tiempo ahorrado, clics eliminados, tareas que ya no requieren salir de MISPORT OS), complementario a la madurez. Se propone el Sprint 24 (Tesorería fase 2 — cobros parciales y formas de pago) como siguiente.
- **2026-07-16**: presentado y aprobado el diseño técnico completo del Sprint 24 (Tesorería fase 2), con el encargo explícito de contemplar desde el inicio un modelo de tesorería profesional aunque solo se implemente la parte mínima, más 3 requisitos añadidos: inmutabilidad de los cobros (nunca se editan, solo se corrigen con una reversión futura), identificador único y permanente por cobro (para enlazar en el futuro conciliación bancaria/TPV/Bizum/Stripe/transferencia) y que el evento `CobroRegistered` quede preparado para Tesorería/KPIs/Contabilidad/ERP/Automatizaciones/IA. Cerrado el Sprint 24: `CobroFactura` admite ahora varios cobros por Factura (parciales o completos) con forma de pago obligatoria, referencia opcional y auditoría (usuario/fecha/hora); `id` generado con `createEntityId('cob')` como identificador permanente; ninguna función para editar o borrar un cobro. Deliberadamente no se introdujo un nuevo `FacturaEstado`: `'emitida'` sigue cubriendo "queda algo pendiente" (parcial o total), evitando tocar `personaTieneDeuda`, el panel "Cobros pendientes" y el filtro "Con deuda" del CRM — "cobrado parcialmente" es una etiqueta derivada en la UI, no un estado persistido. Nuevo evento de dominio `CobroRegistered` al que el CRM ya se suscribe para el Historial de la Ficha. `Factura` gana auditoría de quién la generó. Todos los campos son aditivos, sin migración de datos. Madurez del sistema: ~40% (Tesorería sube de ~25% a ~45% — avance real, no solo incremental). Se propone el Sprint 25 (consolidación de Finanzas — unificar el "Registro" general con la vista por cliente) como siguiente.
- **2026-07-16**: cerrado el Sprint 25 — Consolidación de Finanzas: `PagoFormFields` (ya compartido entre la Ficha CRM y la Agenda) pasa a ser también el único formulario del "Registro" general de Finanzas (`FinancePanel`), que tenía su propia copia inline con overrides manuales y notas que los otros dos sitios no ofrecían. Resuelto en ambas direcciones: el "Registro" general gana un selector de cliente opcional (antes, una sesión de un cliente real registrada ahí quedaba con `personaId` vacío — invisible en su Ficha y nunca facturable); la Ficha y la Agenda ganan los overrides manuales de precio/pago y las notas. Sin cliente seleccionado, el "Registro" general se comporta exactamente igual que antes. Ningún cambio de modelo de datos: todos los campos ya existían en `FinanceEntry`. Madurez del sistema: ~40% (Finanzas sube de ~60% a ~65% — movimiento marginal, Sprint de consolidación técnica, no de funcionalidad nueva). Se propone el Sprint 26 (framework de pruebas automatizado versionado + auditoría de accesibilidad ampliada) como siguiente, pendiente de que el Director General elija herramienta de pruebas.
- **2026-07-16**: cerrado el Sprint 26 — Framework de pruebas automatizadas: Playwright Test (decisión de arquitectura del Director General) como framework e2e oficial, sustituyendo a los scripts ad-hoc de sesiones anteriores. 14 tests organizados por módulo (`tests/agenda/`, `tests/finanzas/`, `tests/reservas/`, `tests/smoke/`, `tests/helpers/` compartidos), cubriendo la regresión de los Sprints 18 y 21-25; batería completa en verde. Corregidos 5 bugs propios de los tests (no del producto): un `loginAsAdmin` que borraba localStorage arrastrando los datos sembrados por `registerClient`; un `registerClient` sin recarga tras cerrar sesión; dos locators ambiguos; y una condición de carrera en el paso condicional "Selecciona Entrenador" del Booking Wizard (presente en dos specs distintos). Fijadas 4 reglas permanentes de pruebas automatizadas (toda funcionalidad nueva con su test; regresión completa antes de cerrar cada Sprint; organización por módulo; cobertura y estabilidad siempre reflejadas en este Roadmap) y añadida la tabla "Cobertura de pruebas por módulo". La auditoría de accesibilidad ampliada, planteada originalmente junto a este Sprint, no se abordó en este cierre — queda como candidata explícita para un Sprint próximo. Madurez del sistema: ~41% (nuevo eje de calidad transversal, framework de pruebas, pasa de 0% a ~35% de cobertura real). Se propone el Sprint 27 (eliminación de `Persona.notes` deprecado) como siguiente.
