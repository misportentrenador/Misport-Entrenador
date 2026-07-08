
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FinanceParams, FinanceEntry, FinanceEntryTotals, FinanceServiceName, ServiceRate } from '../types';
import { DEFAULT_FINANCE_PARAMS } from '../constants';

const PARAMS_KEY = 'misport_finance_params';
const ENTRIES_KEY = 'misport_finance_entries';

function getBaseRate(params: FinanceParams, service: FinanceServiceName, groupDays?: number): ServiceRate | null {
  if (service === 'Electroestimulación') return params.electro;
  if (service === 'Entrenamiento online') return params.online;
  if (service === 'Entrenamiento grupal') {
    return params.group.find(g => g.days === groupDays) ?? null;
  }
  return null;
}

export function computeEntryTotals(entry: FinanceEntry, params: FinanceParams): FinanceEntryTotals {
  const base = getBaseRate(params, entry.service, entry.groupDays);

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

  const computeTotals = (entry: FinanceEntry) => computeEntryTotals(entry, params);

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
