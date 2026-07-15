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

**Orden de prioridad para decidir el siguiente Sprint** (de mayor a menor):
1. Eliminar trabajo manual.
2. Eliminar cambios entre aplicaciones.
3. Centralizar información.
4. Automatizar procesos.
5. Crear nuevas funcionalidades.

**Regla de integración (permanente)**: mientras se sigan usando herramientas externas (Booksy, Google Calendar, Gmail, WhatsApp, TrainingPeaks, Stripe y otras), MISPORT OS debe convivir con ellas — no sustituirlas todavía. El objetivo es integrarlas progresivamente hasta trabajar desde una única interfaz. Cuando se detecte una integración de alto valor práctico, se propone su diseño de forma proactiva (no se espera a que se pida).

**Reparto de esfuerzo por sesión**: ~80% funcionalidad nueva de alto valor, ~20% optimización/rendimiento/limpieza/accesibilidad/pruebas/deuda técnica — de forma continua, no al final del proyecto.

## Visión a largo plazo (horizonte 5 años)

MISPORT OS terminará gestionando, dentro de una única arquitectura escalable:

CRM · Agenda · Reservas · Bonos · Finanzas · Facturación · Cobros · Clientes · Entrenadores · Centros · Proyectos con Ayuntamientos · Corporate Wellness · Trail Running · Recursos Humanos · Documentación · IA · Automatizaciones · Cuadros de mando · Integraciones externas.

Hoy están construidos, con distintos grados de madurez: CRM, Agenda, Reservas, Bonos, Finanzas (parcial), Clientes, Entrenadores, Centros. El resto (Facturación, Cobros, Proyectos con Ayuntamientos, Corporate Wellness, Trail Running, RRHH, Documentación, IA más allá del consejo motivacional, Automatizaciones, Cuadros de mando más allá del Dashboard actual, e Integraciones externas reales) son dominios futuros — cada uno se diseñará cuando le corresponda por prioridad, siempre verificando que encaja en la arquitectura existente (Party-Role, Repository/Context por dominio, Open/Closed en registros de acciones) sin necesitar romperla.

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
| Agenda Ejecutiva | Estable — centro operativo diario funcional, 6 acciones rápidas | Sprint 15-17 |
| Rendimiento/infraestructura técnica | Reforzada (bundle -92%, fix login, a11y) | Sesión de hardening 2026-07-15 |
| Integraciones externas reales | No iniciadas | — |
| Facturación / Cuentas por cobrar | No iniciado | — |
| Framework de pruebas automatizado versionado | No iniciado | — |

---

## Sprint actual

Ninguno abierto. Cerrados e implementados (pendientes de autorización de commit/push):
- **Sprint 17** (`crear_incidencia` en la Agenda).
- **Sprint 18** (`nueva_reserva` desde la Agenda + arquitectura completa de integraciones de calendario y la integración con Google Calendar en modo lectura, con credenciales de prueba — sin conectar todavía la cuenta real).

El Roadmap queda a la espera de que se autoricen para proponer el **Sprint 19**.

---

## Backlog general (no priorizado por Sprint todavía)

- Acciones rápidas de Agenda pendientes: `consumir_bono` (manual), `reprogramar`, `confirmar_asistencia`. (`crear_incidencia` completada en el Sprint 17; `nueva_reserva` completada en el Sprint 18.)
- Conexión real de Google Calendar (arquitectura, adaptador y modo lectura ya implementados y probados con credenciales de prueba en el Sprint 18) — **bloqueada solo por la creación de credenciales reales en Google Cloud por parte del Director General**, ver `Docs definitivos/2026-07-15-integracion-google-calendar.md`.
- Sincronización bidireccional de Google Calendar (crear/editar eventos desde MISPORT) — decisión de negocio explícitamente pendiente, no técnica.
- Integración WhatsApp (comunicación) — bloqueada hasta decisión de negocio (proveedor, coste).
- Integración Booksy — bloqueada hasta confirmar si existe API pública y decisión de negocio.
- Integración TrainingPeaks — bloqueada hasta confirmar API y decisión de negocio.
- Integración Gmail (resumen de correo relevante en el Dashboard) — bloqueada hasta decisión de negocio.
- Módulo de Facturación / Cuentas por cobrar — desbloquea el filtro "Con deuda" del CRM (Sprint 12, documentado como pendiente).
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
- El módulo de Facturación depende de una decisión de negocio/fiscal (requisitos legales de factura, numeración, series) antes de poder diseñarse — no es solo una decisión técnica.
- El módulo de Cobros/Cuentas por cobrar depende de una decisión de modelo de datos (qué es "deuda", cómo se calcula) antes de poder diseñarse.
- `confirmar_asistencia` depende de decidir si se amplía el ciclo de vida de `ReservationStatus`.
- `reprogramar` depende de decidir si valida disponibilidad/capacidad en el nuevo horario.

---

## Próximos 10 Sprints previstos

Reordenados el 2026-07-15 según el nuevo orden de prioridad (1. eliminar trabajo manual, 2. eliminar cambios entre aplicaciones, 3. centralizar información, 4. automatizar procesos, 5. nuevas funcionalidades). Bajo este criterio, casi todos los desarrollos de mayor impacto están bloqueados por una decisión estratégica o de negocio — se presentan igualmente, con su diseño listo para proponerse en cuanto se desbloqueen, en vez de saltárselos silenciosamente.

| # | Sprint | Prioridad que satisface | Bloqueo |
|---|---|---|---|
| 19 | Facturación — fase 1: generar factura/PDF desde una `FinanceEntry` ya registrada | 1 — elimina el trabajo manual de facturar fuera del sistema | **Bloqueado — decisión de negocio/fiscal**: requisitos legales de la factura (numeración, series, datos fiscales) |
| 20 | Cobros / Cuentas por cobrar (desbloquea el filtro "Con deuda" del CRM) | 1 y 3 | **Bloqueado**: requiere definir qué es "deuda" y cómo se calcula |
| 21 | Segunda integración de calendario (Outlook o Apple Calendar, mismo adaptador que Google Calendar) o conexión real de Google Calendar (activar credenciales) | 2 y 3 | Conexión real de Google Calendar: solo pendiente de que crees las credenciales (sin bloqueo técnico). Segunda integración: nueva implementación de `CalendarSourceAdapter`, sin bloqueo de arquitectura |
| 22 | Segunda integración real (WhatsApp, para centralizar comunicación) | 2 y 3 | **Bloqueado**: decisión de proveedor y coste |
| 23 | `reprogramar` reserva desde Agenda | 1 — elimina el trabajo manual de cancelar + crear de nuevo | Requiere tu decisión de negocio (reglas de disponibilidad) |
| 24 | `confirmar_asistencia` (nuevo estado del ciclo de vida) | 4 — automatiza el control de asistencia | Requiere tu decisión de negocio (nuevo estado) |
| 25 | `consumir_bono` manual (fuera de completar sesión) | 1 | Requiere tu decisión de negocio (justificación del descuento manual) |
| 26 | Framework de pruebas automatizado versionado + auditoría de accesibilidad ampliada | Ninguna de las 4 preguntas directamente — ciclo de mantenimiento del 20% técnico | Requiere tu decisión sobre herramienta de pruebas |
| 27 | Eliminación de `Persona.notes` deprecado + consolidación final de notas en CRM | Deuda de migración documentada desde el Sprint 8 | Ninguno |

**Recomendación de secuencia**: el Sprint 19 (Facturación fase 1) es el que más preguntas de filtro satisface de lo que queda sin empezar, pero requiere que definas primero los requisitos fiscales de la factura — ver la pregunta que te planteo en el informe de cierre del Sprint 18.

Este orden se revisará automáticamente al cierre de cada Sprint, por si el estado del proyecto cambia la prioridad.

---

## Historial de revisiones de este Roadmap

- **2026-07-15**: creación inicial, tras el cierre del Sprint 16 y la sesión de hardening técnico (fix de login, code-splitting, manualChunks, package.json, a11y, extracción de `PagoFormFields`).
- **2026-07-15**: actualizado tras la implementación del Sprint 17 (`crear_incidencia`); se propone el Sprint 18 (`nueva_reserva` desde la Agenda) como siguiente.
- **2026-07-15**: incorporada la nueva misión ("gestionar el 100% de la jornada desde MISPORT OS"), las 4 preguntas de filtro, el nuevo orden de prioridad de 5 niveles y la visión a largo plazo de 18 dominios. Reordenados los próximos Sprints; se propone desbloquear el diseño de la integración con Google Calendar como Sprint 18 principal, con `nueva_reserva` como alternativa sin bloqueo.
- **2026-07-15**: cerrado el Sprint 18 — arquitectura de integraciones de calendario (`CalendarSourceAdapter`), integración con Google Calendar en modo lectura (probada con credenciales de prueba, sin conectar la cuenta real) y `nueva_reserva` desde la Agenda. Se propone el Sprint 19 (Facturación fase 1) como siguiente, bloqueado por una decisión fiscal.
