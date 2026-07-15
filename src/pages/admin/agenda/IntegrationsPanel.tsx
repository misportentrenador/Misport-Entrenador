import React, { useState } from 'react';
import { CalendarSync, Loader2 } from 'lucide-react';
import { CalendarSourceAdapter } from '../../../integrations/calendar/types';

interface IntegrationsPanelProps {
  adapters: CalendarSourceAdapter[];
  connect: (source: string) => Promise<void>;
  disconnect: (source: string) => void;
  loading: boolean;
  error: string | null;
}

/**
 * Panel de integraciones de calendario (Sprint 18) — genérico: itera
 * sobre `adapters` sin nombrar ningún proveedor concreto en el JSX.
 * Añadir un origen nuevo (Outlook, Apple Calendar, Booksy...) no requiere
 * tocar este componente, solo registrar el adaptador en
 * useExternalCalendarEvents.
 */
export const IntegrationsPanel: React.FC<IntegrationsPanelProps> = ({ adapters, connect, disconnect, loading, error }) => {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (source: string) => {
    setConnecting(source);
    await connect(source);
    setConnecting(null);
  };

  return (
    <div className="text-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs font-bold transition-colors"
      >
        <CalendarSync size={14} /> Integraciones {loading && <Loader2 size={12} className="animate-spin" />}
      </button>
      {open && (
        <div className="mt-3 p-4 bg-gray-900/50 border border-gray-800 rounded-lg flex flex-col gap-3">
          {adapters.map(adapter => {
            const configured = adapter.isConfigured();
            const connected = adapter.isConnected();
            return (
              <div key={adapter.source} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-white text-xs font-bold">{adapter.label}</p>
                  <p className="text-xs text-gray-500">
                    {!configured ? 'No configurado' : connected ? 'Conectado, solo lectura' : 'Sin conectar'}
                  </p>
                </div>
                {configured && (
                  connected ? (
                    <button onClick={() => disconnect(adapter.source)} className="text-xs font-bold text-red-400 hover:text-red-300">
                      Desconectar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(adapter.source)}
                      disabled={connecting === adapter.source}
                      className="text-xs font-bold text-misportBlue hover:text-blue-400 disabled:opacity-40"
                    >
                      {connecting === adapter.source ? 'Conectando…' : 'Conectar'}
                    </button>
                  )
                )}
              </div>
            );
          })}
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
};
