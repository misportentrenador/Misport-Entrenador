
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FinanceParams, FinanceEntry, FinanceEntryTotals, FinanceServiceName } from '../types';
import { Rate } from '../modules/catalog/types';
import { useCatalog } from '../modules/catalog/context/CatalogContext';
import { DEFAULT_FINANCE_PARAMS } from '../constants';
import { STORAGE_KEYS } from '../config/storageKeys';

const PARAMS_KEY = STORAGE_KEYS.financeParams;
const ENTRIES_KEY = STORAGE_KEYS.financeEntries;

/**
 * Puente Finanzas <-> Catálogo Maestro (Sprint 6): cada servicio de
 * Finanzas de precio fijo es un servicio independiente del Catálogo —
 * Entrenamiento Personal y Entrenamiento Online no se unifican, cada uno
 * mantiene su propia identidad y tarifa (decisión de negocio). Único punto
 * de esta correspondencia: si cambia, solo se toca aquí.
 */
export const SERVICE_TO_CATALOG_ID: Record<Exclude<FinanceServiceName, 'Entrenamiento grupal'>, string> = {
  'Electroestimulación': 'svc_electro',
  'Entrenamiento personal': 'svc_personal',
  'Entrenamiento online': 'svc_online',
};
export const GROUP_DAYS_TO_VARIANT: Record<1 | 2 | 3, string> = {
  1: '1 día/semana',
  2: '2 días/semana',
  3: '3 días/semana',
};

/** Busca la tarifa vigente del Catálogo para un servicio de Finanzas. */
export function findFinanceRate(rates: Rate[], service: FinanceServiceName, groupDays?: number): Rate | undefined {
  const serviceId = service === 'Entrenamiento grupal' ? 'svc_grupal' : SERVICE_TO_CATALOG_ID[service];
  const variant = service === 'Entrenamiento grupal' ? GROUP_DAYS_TO_VARIANT[(groupDays ?? 1) as 1 | 2 | 3] : null;
  return rates
    .filter(r => r.serviceId === serviceId && r.variant === variant)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
}

/**
 * Dirección inversa del puente (Sprint 7): dado el serviceId real de una
 * Reserva del Catálogo, qué FinanceServiceName le corresponde al generar
 * automáticamente su entrada económica al completarla.
 */
const CATALOG_ID_TO_SERVICE: Record<string, FinanceServiceName> = {
  svc_electro: 'Electroestimulación',
  svc_personal: 'Entrenamiento personal',
  svc_online: 'Entrenamiento online',
  svc_grupal: 'Entrenamiento grupal',
};

export function financeServiceNameForCatalogServiceId(serviceId: string): FinanceServiceName | undefined {
  return CATALOG_ID_TO_SERVICE[serviceId];
}

export function computeEntryTotals(entry: FinanceEntry, params: FinanceParams, rates: Rate[]): FinanceEntryTotals {
  const base = findFinanceRate(rates, entry.service, entry.groupDays);

  const unitPrice = entry.manualPrice ?? base?.price ?? 0;
  const unitTrainerPay = entry.manualTrainerPay ?? base?.trainerPay ?? 0;
  const unitCenterPay = entry.manualCenterPay ?? base?.centerPay ?? 0;

  const billingBase = entry.quantity * unitPrice;
  const trainerTotal = entry.quantity * unitTrainerPay;
  const centerTotal = entry.quantity * unitCenterPay;
  const margin = billingBase - trainerTotal - centerTotal;
  const igicAmount = billingBase * params.igic;
  const profitTaxAmount = margin > 0 ? margin * params.profitTax : 0;
  const netProfit = margin - profitTaxAmount;
  const totalCharged = billingBase + igicAmount;

  return {
    unitPrice, unitTrainerPay, unitCenterPay,
    billingBase, trainerTotal, centerTotal,
    margin, igicAmount, profitTaxAmount, netProfit, totalCharged,
  };
}

interface FinanceContextType {
  params: FinanceParams;
  updateParams: (params: FinanceParams) => void;
  entries: FinanceEntry[];
  addEntry: (data: Omit<FinanceEntry, 'id' | 'createdAt'>) => void;
  deleteEntry: (id: string) => void;
  computeTotals: (entry: FinanceEntry) => FinanceEntryTotals;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { rates } = useCatalog();
  const [params, setParams] = useState<FinanceParams>(DEFAULT_FINANCE_PARAMS);
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedParams = localStorage.getItem(PARAMS_KEY);
      if (storedParams) setParams(JSON.parse(storedParams));
    } catch (e) {
      console.error('Failed to load finance params', e);
    }

    try {
      const storedEntries = localStorage.getItem(ENTRIES_KEY);
      if (storedEntries) setEntries(JSON.parse(storedEntries));
    } catch (e) {
      console.error('Failed to load finance entries', e);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(PARAMS_KEY, JSON.stringify(params));
  }, [params, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }, [entries, loaded]);

  const updateParams = (next: FinanceParams) => setParams(next);

  const addEntry = (data: Omit<FinanceEntry, 'id' | 'createdAt'>) => {
    const newEntry: FinanceEntry = {
      ...data,
      id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
    };
    setEntries(prev => [...prev, newEntry]);
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const computeTotals = (entry: FinanceEntry) => computeEntryTotals(entry, params, rates.items);

  return (
    <FinanceContext.Provider value={{ params, updateParams, entries, addEntry, deleteEntry, computeTotals }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
