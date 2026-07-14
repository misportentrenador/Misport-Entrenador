import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STORAGE_KEYS } from '../config/storageKeys';

/**
 * Parámetros configurables de los avisos de la Agenda (Sprint 15) — mismo
 * patrón que FinanceParams: nada hardcodeado, todo editable desde la
 * interfaz sin tocar código. Persistido en localStorage igual que
 * financeParams.
 */
export interface AgendaConfig {
  diasAvisoBonoPorCaducar: number;
  avisarSesionesSinEntrenador: boolean;
  /** Reservado para cuando la Agenda muestre recordatorios comerciales (proximaAccionFecha). */
  diasAvisoSeguimientoComercial: number;
}

export const DEFAULT_AGENDA_CONFIG: AgendaConfig = {
  diasAvisoBonoPorCaducar: 2,
  avisarSesionesSinEntrenador: true,
  diasAvisoSeguimientoComercial: 2,
};

const CONFIG_KEY = STORAGE_KEYS.agendaConfig;

interface AgendaConfigContextType {
  config: AgendaConfig;
  updateConfig: (config: AgendaConfig) => void;
}

const AgendaConfigContext = createContext<AgendaConfigContextType | undefined>(undefined);

export const AgendaConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AgendaConfig>(DEFAULT_AGENDA_CONFIG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) setConfig({ ...DEFAULT_AGENDA_CONFIG, ...JSON.parse(stored) });
    } catch (e) {
      console.error('Failed to load agenda config', e);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }, [config, loaded]);

  const updateConfig = (next: AgendaConfig) => setConfig(next);

  return (
    <AgendaConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </AgendaConfigContext.Provider>
  );
};

export const useAgendaConfig = () => {
  const context = useContext(AgendaConfigContext);
  if (!context) {
    throw new Error('useAgendaConfig must be used within an AgendaConfigProvider');
  }
  return context;
};
