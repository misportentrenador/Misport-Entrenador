import { CalendarSourceAdapter, CalendarDateRange, ExternalCalendarEvent } from './types';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID as string | undefined;
const SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
const TOKEN_STORAGE_KEY = 'misport_google_calendar_token';
const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

interface StoredToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

interface GoogleTokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; expires_in?: number; error?: string }) => void;
          }) => GoogleTokenClient;
          revoke: (token: string, done: () => void) => void;
        };
      };
    };
  }
}

let gisLoadPromise: Promise<void> | null = null;

/** Carga el script de Google Identity Services bajo demanda, solo cuando se intenta conectar. */
function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisLoadPromise) return gisLoadPromise;

  gisLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    const timeout = setTimeout(() => reject(new Error('Tiempo de espera agotado cargando Google Identity Services.')), 10000);
    script.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('No se pudo cargar Google Identity Services.'));
    };
    document.head.appendChild(script);
  });

  return gisLoadPromise;
}

function readStoredToken(): StoredToken | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredToken;
    if (!parsed.accessToken || parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function storeToken(token: StoredToken) {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
}

function clearStoredToken() {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

interface GoogleCalendarApiEvent {
  id: string;
  summary?: string;
  location?: string;
  htmlLink?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
}

/** Puramente funcional — testeable sin red ni autenticación. */
export function mapGoogleEventToExternalEvent(event: GoogleCalendarApiEvent): ExternalCalendarEvent {
  const isAllDay = !!event.start?.date && !event.start?.dateTime;
  const date = (event.start?.dateTime ?? event.start?.date ?? '').slice(0, 10);
  const startTime = isAllDay ? '00:00' : (event.start?.dateTime ?? '').slice(11, 16);
  const endTime = isAllDay ? '23:59' : (event.end?.dateTime ?? '').slice(11, 16);

  return {
    id: event.id,
    source: 'google_calendar',
    title: event.summary || '(Sin título)',
    date,
    startTime,
    endTime,
    location: event.location,
    sourceUrl: event.htmlLink,
  };
}

export const googleCalendarAdapter: CalendarSourceAdapter = {
  source: 'google_calendar',
  label: 'Google Calendar',

  isConfigured() {
    return !!CLIENT_ID;
  },

  isConnected() {
    return readStoredToken() !== null;
  },

  async connect() {
    if (!CLIENT_ID) {
      throw new Error('Google Calendar no está configurado: falta VITE_GOOGLE_CALENDAR_CLIENT_ID.');
    }
    await loadGoogleIdentityScript();

    await new Promise<void>((resolve, reject) => {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: (response) => {
          if (response.error || !response.access_token) {
            reject(new Error(response.error || 'No se pudo obtener autorización de Google Calendar.'));
            return;
          }
          storeToken({
            accessToken: response.access_token,
            expiresAt: Date.now() + (response.expires_in ?? 3600) * 1000,
          });
          resolve();
        },
      });
      client.requestAccessToken();
    });
  },

  disconnect() {
    const token = readStoredToken();
    clearStoredToken();
    if (token && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(token.accessToken, () => {});
    }
  },

  async fetchEvents(range: CalendarDateRange): Promise<ExternalCalendarEvent[]> {
    const token = readStoredToken();
    if (!token) return [];

    const params = new URLSearchParams({
      timeMin: new Date(`${range.start}T00:00:00`).toISOString(),
      timeMax: new Date(`${range.end}T23:59:59`).toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token.accessToken}` },
    });

    if (!response.ok) {
      if (response.status === 401) clearStoredToken();
      throw new Error(`Google Calendar respondió ${response.status}`);
    }

    const data = await response.json() as { items?: GoogleCalendarApiEvent[] };
    return (data.items ?? []).map(mapGoogleEventToExternalEvent);
  },
};
