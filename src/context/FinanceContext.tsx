
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FinanceParams, FinanceEntry, FinanceEntryTotals, FinanceServiceName, DatosFiscalesEmpresa, Factura, CobroFactura, FormaPago } from '../types';
import { Rate } from '../modules/catalog/types';
import { useCatalog } from '../modules/catalog/context/CatalogContext';
import { useApp } from './AppContext';
import { DEFAULT_FINANCE_PARAMS, DEFAULT_DATOS_FISCALES } from '../constants';
import { STORAGE_KEYS } from '../config/storageKeys';
import { createEntityId } from '../core/data/entityId';
import { domainEventBus } from '../core/events/domainEvents';

const PARAMS_KEY = STORAGE_KEYS.financeParams;
const ENTRIES_KEY = STORAGE_KEYS.financeEntries;
const FACTURAS_KEY = STORAGE_KEYS.financeFacturas;
const FISCAL_CONFIG_KEY = STORAGE_KEYS.fiscalConfig;
const COBROS_KEY = STORAGE_KEYS.financeCobros;

/** Serie única correlativa, se reinicia cada año natural (decisión aprobada, Sprint 19). */
export function nextInvoiceNumber(facturas: Factura[], year: number): string {
  const countThisYear = facturas.filter(f => f.anio === year).length;
  return `${year}-${String(countThisYear + 1).padStart(4, '0')}`;
}

/**
 * Importe pendiente de una factura (Sprint 20, cobros parciales reales
 * desde el Sprint 24) — total menos la suma de sus cobros. Ya soportaba
 * cobros parciales desde el Sprint 20 sin cambiar esta función; el Sprint
 * 24 es el que por fin permite crear más de un CobroFactura por factura.
 */
export function getImportePendiente(factura: Factura, cobros: CobroFactura[]): number {
  const cobrado = cobros.filter(c => c.facturaId === factura.id).reduce((sum, c) => sum + c.importe, 0);
  return Math.max(0, factura.total - cobrado);
}

/**
 * "Con deuda" (Sprint 20, decisión de negocio aprobada): al menos una
 * factura en estado 'emitida' con importe pendiente > 0. Borrador y
 * Anulada nunca generan deuda.
 */
export function personaTieneDeuda(personaId: string, facturas: Factura[], cobros: CobroFactura[]): boolean {
  return facturas.some(f => f.personaId === personaId && f.estado === 'emitida' && getImportePendiente(f, cobros) > 0);
}

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
  datosFiscales: DatosFiscalesEmpresa;
  updateDatosFiscales: (datos: DatosFiscalesEmpresa) => void;
  facturas: Factura[];
  /** Emite la factura de una FinanceEntry ya registrada — numeración correlativa única. */
  generarFactura: (entry: FinanceEntry) => Factura;
  cobros: CobroFactura[];
  /**
   * Registra un cobro sobre una factura (Sprint 24) — parcial o por el
   * importe pendiente completo. Nunca permite cobrar más del pendiente.
   * Cuando el pendiente llega a 0, la factura pasa a 'cobrada'; si queda
   * pendiente, sigue en 'emitida' (un cobro parcial no cambia el estado).
   * El CobroFactura creado es inmutable: no existe ninguna función para
   * editarlo o borrarlo.
   */
  registrarCobro: (facturaId: string, importe: number, formaPago: FormaPago, referencia?: string) => { success: boolean; message?: string };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { rates } = useCatalog();
  const { user } = useApp();
  const [params, setParams] = useState<FinanceParams>(DEFAULT_FINANCE_PARAMS);
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [datosFiscales, setDatosFiscales] = useState<DatosFiscalesEmpresa>(DEFAULT_DATOS_FISCALES);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [cobros, setCobros] = useState<CobroFactura[]>([]);
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

    try {
      const storedFiscal = localStorage.getItem(FISCAL_CONFIG_KEY);
      if (storedFiscal) setDatosFiscales(JSON.parse(storedFiscal));
    } catch (e) {
      console.error('Failed to load fiscal config', e);
    }

    try {
      const storedFacturas = localStorage.getItem(FACTURAS_KEY);
      if (storedFacturas) setFacturas(JSON.parse(storedFacturas));
    } catch (e) {
      console.error('Failed to load facturas', e);
    }

    try {
      const storedCobros = localStorage.getItem(COBROS_KEY);
      if (storedCobros) setCobros(JSON.parse(storedCobros));
    } catch (e) {
      console.error('Failed to load cobros', e);
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

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(FISCAL_CONFIG_KEY, JSON.stringify(datosFiscales));
  }, [datosFiscales, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(FACTURAS_KEY, JSON.stringify(facturas));
  }, [facturas, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(COBROS_KEY, JSON.stringify(cobros));
  }, [cobros, loaded]);

  const updateParams = (next: FinanceParams) => setParams(next);
  const updateDatosFiscales = (next: DatosFiscalesEmpresa) => setDatosFiscales(next);

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

  const generarFactura = (entry: FinanceEntry): Factura => {
    if (!entry.personaId) {
      throw new Error('No se puede facturar una entrada sin cliente vinculado.');
    }
    const totals = computeTotals(entry);
    const year = new Date().getFullYear();
    const factura: Factura = {
      id: `fac_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      numero: nextInvoiceNumber(facturas, year),
      anio: year,
      fecha: new Date().toISOString().slice(0, 10),
      personaId: entry.personaId,
      financeEntryId: entry.id,
      baseImponible: totals.billingBase,
      igicAmount: totals.igicAmount,
      total: totals.totalCharged,
      estado: 'emitida',
      createdAt: Date.now(),
      usuarioId: user?.id,
      usuarioNombre: user?.name,
    };
    setFacturas(prev => [...prev, factura]);
    return factura;
  };

  // Registra un cobro (Sprint 24) — parcial o por el pendiente completo.
  // El CobroFactura creado nunca se edita ni se borra (inmutable, decisión
  // de negocio): un error se corrige más adelante con una operación de
  // reversión explícita, nunca modificando este registro.
  const registrarCobro = (
    facturaId: string,
    importe: number,
    formaPago: FormaPago,
    referencia?: string
  ): { success: boolean; message?: string } => {
    const factura = facturas.find(f => f.id === facturaId);
    if (!factura) {
        return { success: false, message: 'La factura no existe.' };
    }
    const pendiente = getImportePendiente(factura, cobros);
    if (pendiente <= 0) {
        return { success: false, message: 'Esta factura no tiene importe pendiente.' };
    }
    if (importe <= 0 || importe > pendiente) {
        return { success: false, message: `El importe debe ser mayor que 0 y no puede superar el pendiente (${pendiente.toFixed(2)} €).` };
    }

    const cobro: CobroFactura = {
        id: createEntityId('cob'),
        facturaId,
        fecha: new Date().toISOString(),
        importe,
        formaPago,
        referencia,
        usuarioId: user?.id,
        usuarioNombre: user?.name,
        createdAt: Date.now(),
    };
    setCobros(prev => [...prev, cobro]);

    const pendienteRestante = pendiente - importe;
    if (pendienteRestante <= 0) {
        setFacturas(prev => prev.map(f => f.id === facturaId ? { ...f, estado: 'cobrada' } : f));
    }

    // El Historial de la Ficha se alimenta escuchando este evento (ver
    // CRMContext) — FinanceProvider está por encima de CRMProvider en el
    // árbol y no puede llamar a useCRM() directamente.
    domainEventBus.emit({
        type: 'CobroRegistered',
        cobroId: cobro.id,
        facturaId,
        personaId: factura.personaId,
        importe,
        formaPago,
        referencia,
        pendienteRestante,
        changedBy: { userId: user?.id ?? '', userName: user?.name ?? '' },
        occurredAt: new Date().toISOString(),
    });

    return { success: true };
  };

  return (
    <FinanceContext.Provider value={{
      params, updateParams, entries, addEntry, deleteEntry, computeTotals,
      datosFiscales, updateDatosFiscales, facturas, generarFactura,
      cobros, registrarCobro,
    }}>
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
