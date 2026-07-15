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

## Visión a largo plazo: MISPORT OS como ERP completo

No estamos construyendo funcionalidades sueltas: MISPORT OS es el **ERP completo de la empresa**. Todos sus módulos comparten la misma base de datos y la misma arquitectura (Party-Role para personas/organizaciones, Repository/Context por dominio, registros de acciones Open/Closed), para que ninguno quede aislado ni duplique lo que otro ya resuelve.

Módulos del ERP, con su estado actual:

| Módulo | Estado |
|---|---|
| CRM | Construido (Sprints 8-12) |
| Agenda | Construido (Sprints 15-18) |
| Reservas | Construido (Sprints 5, 7, 11) |
| Bonos | Construido (Sprint 11, CRM) |
| Finanzas | Construido, parcial (Sprints 6-7) |
| Facturación | Construido, fase 1 (Sprint 19) |
| Tesorería (cobros, cobros parciales, formas de pago, conciliación bancaria) | Fase 1 — Cobros — construida (Sprint 20); el resto es dominio futuro |
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

### Madurez estimada del sistema (2026-07-15): ~37%

Estimación cualitativa, no una métrica exacta: media ponderada del grado de completitud de cada uno de los 17 módulos del ERP (CRM/Agenda/Reservas ~90%, Catálogo ~90%, Bonos ~80%, Finanzas ~60%, Cuadros de mando ~50%, Facturación ~40%, Tesorería ~25%, Integraciones externas ~20%, IA ~5%, y Proyectos institucionales/Corporate Wellness/Trail Running/RRHH/Documentación/Automatizaciones en 0%). Se recalculará al cierre de cada Sprint futuro con el mismo criterio, para que la cifra sea comparable entre informes.

---

## Estado actual del sistema (2026-07-15)

| Módulo | Estado | Última actualización |
|---|---|---|
| Fundamentos (layouts, routing, design system) | Estable | FASE 1 |
| Catálogo Maestro (Centros, Entrenadores, Servicios, Tarifas, Bonos) | Estable | Sprint 2 |
| Datos Maestros (Persona, Organización, Contacto, Recurso) | Estable | Sprint 3-4 |
| Reservas | Estable, conectado al Catálogo | Sprint 5, 7, 11 |
| Finanzas | Estable, conectado al Catálogo | Sprint 6, 7 |
| CRM (ficha única, buscador, filtros) | Estable — Release 0.3 cerrada | Sprint 8-12 |
| Dashboard (Inicio) | Estable, con alertas operativas/comerciales | Sprint 13-14 |
| Agenda Ejecutiva | Estable — centro operativo diario, 7 acciones rápidas, integración de calendarios | Sprint 15-18 |
| Rendimiento/infraestructura técnica | Reforzada (bundle -92%, fix login, a11y) | Sesión de hardening 2026-07-15 |
| Integraciones externas reales | Arquitectura lista; Google Calendar en modo lectura (credenciales de prueba) | Sprint 18 |
| Facturación | Fase 1 — factura en PDF, numeración correlativa única | Sprint 19 |
| Tesorería / Cobros | Fase 1 — marcar como cobrada, filtro "Con deuda", panel Dashboard | Sprint 20 |
| Framework de pruebas automatizado versionado | No iniciado | — |

---

## Sprint actual

Ninguno abierto. El **Sprint 20** (Cobros/Cuentas por cobrar — estados de Factura Borrador/Emitida/Cobrada/Anulada, "Marcar como cobrada", filtro "Con deuda" del CRM, panel "Cobros pendientes" del Dashboard) está implementado y probado, con la arquitectura de `CobroFactura` ya preparada para cobros parciales, formas de pago, facturas rectificativas, facturación electrónica e integración bancaria futuras.

---

## Backlog general (no priorizado por Sprint todavía)

- Acciones rápidas de Agenda pendientes: `consumir_bono` (manual), `reprogramar`, `confirmar_asistencia`. (`crear_incidencia` completada en el Sprint 17; `nueva_reserva` completada en el Sprint 18.)
- Conexión real de Google Calendar (arquitectura, adaptador y modo lectura ya implementados y probados con credenciales de prueba en el Sprint 18) — **bloqueada solo por la creación de credenciales reales en Google Cloud por parte del Director General**, ver `Docs definitivos/2026-07-15-integracion-google-calendar.md`.
- Sincronización bidireccional de Google Calendar (crear/editar eventos desde MISPORT) — decisión de negocio explícitamente pendiente, no técnica.
- Integración WhatsApp (comunicación) — bloqueada hasta decisión de negocio (proveedor, coste).
- Integración Booksy — bloqueada hasta confirmar si existe API pública y decisión de negocio.
- Integración TrainingPeaks — bloqueada hasta confirmar API y decisión de negocio.
- Integración Gmail (resumen de correo relevante en el Dashboard) — bloqueada hasta decisión de negocio.
- Facturación fase 1 (Sprint 19) y Cobros/Cuentas por cobrar fase 1 (Sprint 20) completadas: estados Borrador/Emitida/Cobrada/Anulada, "Marcar como cobrada", filtro "Con deuda" y panel "Cobros pendientes". Pendiente como fases futuras de Tesorería: cobros parciales, varias formas de pago, facturas rectificativas, facturación electrónica, integración bancaria — arquitectura (`CobroFactura`) ya preparada para ellas.
- Framework de pruebas automatizado versionado (hoy la regresión se verifica con scripts ad-hoc no persistidos) — decisión de arquitectura pendiente.
- Auditoría de accesibilidad ampliada (Catálogo, Datos Maestros).
- Eliminación de `Persona.notes` (deprecado desde Sprint 8, pendiente de que el CRM quede consolidado — deuda de migración documentada).
- Asistente IA (hoy "Próximamente" en el nav; ya existe una integración mínima con Gemini para consejos motivacionales en el Booking Wizard) — candidato futuro de mayor alcance.

## Riesgos identificados

- **Integraciones externas reales** son el mayor riesgo/incertidumbre del roadmap: dependen de disponibilidad de API de terceros (Booksy, TrainingPeaks) que no está confirmada, y de decisiones de coste/autorización que solo puede tomar el Director General.
- El bundle vendor (React + Router + iconos) seguirá creciendo con cada nueva librería; ya está separado en chunks cacheables (Sprint de hardening), pero requiere vigilancia.
- Sin framework de pruebas versionado, la regresión depende de que cada sesión recree sus propias pruebas — riesgo de cobertura inconsistente entre sesiones.

## Dependencias clave

- Cualquier integración externa depende de: (a) decisión estratégica explícita (crear proyecto/credenciales en la plataforma externa), (b) alta de credenciales/API keys (nunca en código, vía variables de entorno), (c) posible coste recurrente a aprobar.
- Facturación (fase 1, Sprint 19) y Cobros (fase 1, Sprint 20): completadas.
- Futuras fases de Tesorería (cobros parciales, formas de pago, rectificativas, facturación electrónica, integración bancaria): decisión de negocio pendiente para cada una cuando corresponda, sobre una arquitectura ya preparada.
- `confirmar_asistencia` depende de decidir si se amplía el ciclo de vida de `ReservationStatus`.
- `reprogramar` depende de decidir si valida disponibilidad/capacidad en el nuevo horario.

---

## Próximos 10 Sprints previstos

Reordenados el 2026-07-15 tras el cierre del Sprint 20, según el nuevo orden de prioridad (1. completar flujos internos, 2. consolidar Agenda/CRM/Finanzas/Facturación, 3. finalizar acciones rápidas pendientes, 4. optimizar la experiencia diaria, 5. integraciones reales — deliberadamente en espera hasta consolidar el núcleo).

| # | Sprint | Prioridad que satisface | Bloqueo |
|---|---|---|---|
| 21 | Finalizar las acciones rápidas pendientes de la Agenda: `reprogramar`, `confirmar_asistencia`, `consumir_bono` manual | 3 | Cada una requiere una decisión de negocio puntual (ver Backlog) — se presentarán las 3 opciones para que decidas cuál abordar primero |
| 22 | Tesorería fase 2: cobros parciales + formas de pago (efectivo/transferencia/tarjeta) | 1 y 2 (consolidar Facturación) | Requiere confirmar si el importe pendiente puede quedar parcialmente cobrado sin cambiar el estado de la factura |
| 23 | Consolidación de Finanzas: unificar el "Registro" general (`FinancePanel`) con la vista por cliente, evitar duplicidad de flujos de alta de pagos | 2 | Ninguno — revisión técnica de un flujo ya construido |
| 24 | Framework de pruebas automatizado versionado + auditoría de accesibilidad ampliada | Ciclo de mantenimiento del 20% técnico, refuerza la consolidación del núcleo | Requiere tu decisión sobre herramienta de pruebas |
| 25 | Eliminación de `Persona.notes` deprecado + consolidación final de notas en CRM | Deuda de migración documentada desde el Sprint 8 | Ninguno |
| 26 | **(en espera, arquitectura ya lista)** Conexión real de Google Calendar (activar credenciales) | 5 | Pospuesto por decisión estratégica hasta consolidar el núcleo — sin bloqueo técnico cuando se retome |
| 27 | **(en espera)** Segunda integración de calendario (Outlook o Apple Calendar) | 5 | Pospuesto — arquitectura (`CalendarSourceAdapter`) lista |
| 28 | **(en espera)** Integración WhatsApp | 5 | Pospuesto — además bloqueado por decisión de proveedor y coste |
| 29 | **(en espera)** Módulo de Proyectos institucionales (Ayuntamientos y similares) | 5 | Pospuesto — además bloqueado por definir el modelo de negocio |

**Recomendación de secuencia**: Sprint 21 (finalizar las acciones rápidas pendientes) — es el primer paso de "consolidar el núcleo" y no tiene bloqueo técnico, solo 3 decisiones de negocio puntuales a confirmar contigo.

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
