# Integración con Google Calendar — Sprint 18 (solo lectura)

## Qué hace hoy

La Agenda de MISPORT OS puede mostrar, junto a las reservas propias, los eventos del Google Calendar del Director General — solo lectura. Nunca crea, edita ni elimina ningún evento externo. No existe (a propósito) ningún método de escritura en el código de esta integración.

## Qué necesitas hacer tú (yo no puedo hacerlo por ti)

Esta integración usa OAuth de Google, que requiere un proyecto y unas credenciales ligadas a tu cuenta — algo que solo tú puedes crear.

1. Entra en [Google Cloud Console](https://console.cloud.google.com/) y crea un proyecto (o usa uno existente).
2. Habilita la **Google Calendar API** para ese proyecto.
3. Configura la **pantalla de consentimiento OAuth** (tipo "Externo" si vas a usar tu cuenta personal de Gmail, o "Interno" si usas Google Workspace).
4. Crea unas credenciales de tipo **"ID de cliente de OAuth"**, tipo de aplicación **"Aplicación web"**.
5. En "Orígenes de JavaScript autorizados", añade la URL exacta desde la que se sirve MISPORT OS (por ejemplo `http://localhost:5173` en desarrollo, o el dominio real cuando esté publicado).
6. Copia el **Client ID** generado (no hay "secreto" que gestionar: los Client ID de aplicaciones web/SPA de Google no son confidenciales).
7. Crea un archivo `.env.local` en la raíz del proyecto (ya está en `.gitignore`, nunca se sube al repositorio) con:
   ```
   VITE_GOOGLE_CALENDAR_CLIENT_ID=tu_client_id_aqui
   ```
8. Reinicia el servidor de desarrollo (o vuelve a desplegar).

## Cómo se conecta

En la Agenda, junto a los filtros, hay un desplegable "Integraciones". Con la variable configurada, aparece un botón "Conectar" para Google Calendar — al pulsarlo se abre el flujo de autorización estándar de Google (una ventana emergente pidiendo permiso). Una vez concedido, los eventos aparecen mezclados con las reservas de MISPORT en la vista de día y semana, con una insignia identificando su origen.

## Limitaciones de esta primera fase (documentadas, no son bugs)

- El acceso concedido dura aproximadamente 1 hora (Google no entrega un token de larga duración a una aplicación sin servidor propio); pasado ese tiempo, hay que pulsar "Conectar" de nuevo. Una sincronización automática sin intervención requeriría un backend propio que gestione tokens de refresco — no existe todavía, y es una decisión de arquitectura a valorar si se necesita.
- Alcance de la pantalla de consentimiento: si eliges "Externo" en el paso 3, con una app no verificada por Google solo tu propia cuenta (añadida como "usuario de prueba") podrá autorizar el acceso — suficiente para un solo Director General, no para publicarlo a terceros.
- Sincronización bidireccional (crear/editar eventos desde MISPORT hacia Google Calendar) no está implementada — es una decisión de negocio explícitamente pendiente, no técnica. La arquitectura (`CalendarSourceAdapter`) ya está preparada para añadirla sin rediseño cuando se apruebe.

## Arquitectura (para añadir más orígenes en el futuro)

Todo origen de calendario externo implementa la misma interfaz `CalendarSourceAdapter` (`src/integrations/calendar/types.ts`). Añadir Outlook, Apple Calendar o Booksy es implementar esa interfaz y registrarla en `src/integrations/calendar/useExternalCalendarEvents.ts` — ni la Agenda, ni `SessionCard`, ni las vistas de día/semana necesitan cambiar.
