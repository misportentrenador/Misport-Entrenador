import React from 'react';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { FINANCE_SERVICES, FINANCE_ONLINE_CENTER } from '../constants';
import { FinanceServiceName } from '../types';
import { Trainer, Center } from '../modules/catalog/types';
import { Persona } from '../modules/masterdata/types';

export interface PagoFormValue {
  date: string;
  trainerName: string;
  centerName: string;
  service: FinanceServiceName;
  groupDays: '1' | '2' | '3';
  quantity: string;
  /** Solo relevante cuando se pasa `personas` (Sprint 25) — el llamador ya fija su propio personaId cuando viene de un contexto con cliente conocido (Ficha, Agenda). */
  personaId?: string;
  manualPrice?: string;
  manualTrainerPay?: string;
  manualCenterPay?: string;
  notes?: string;
}

interface PagoFormFieldsProps {
  value: PagoFormValue;
  onChange: (value: PagoFormValue) => void;
  trainers: Trainer[];
  centers: Center[];
  /**
   * Lista de Personas para el selector opcional de cliente (Sprint 25).
   * Solo lo necesita el "Registro" general de Finanzas (FinancePanel): la
   * Ficha CRM y la Agenda ya conocen su propio cliente por contexto y no
   * pasan esta prop, así que el selector no aparece ahí.
   */
  personas?: Persona[];
  /**
   * Overrides manuales de precio/pago + notas (Sprint 25) — antes solo
   * existían en el "Registro" general de Finanzas (FinancePanel);
   * cualquier llamador puede activarlos para tener la misma capacidad.
   */
  showAdvanced?: boolean;
}

/**
 * Campos del formulario de "Registrar pago/sesión" — único punto de
 * definición usado por InformacionEconomicaSection (Ficha CRM, Sprint 10),
 * RegistrarPagoModal (Agenda, Sprint 16) y el "Registro" general de
 * Finanzas (FinancePanel, Sprint 25 — antes tenía su propia copia inline
 * de estos mismos campos, con overrides que los otros dos sitios no
 * tenían). Puramente presentacional: cada sitio conserva su propio submit
 * (`addEntry`), esto solo evita mantener varias copias de los mismos
 * campos.
 */
export const PagoFormFields: React.FC<PagoFormFieldsProps> = ({ value, onChange, trainers, centers, personas, showAdvanced }) => (
  <>
    <Input label="Fecha" type="date" value={value.date} onChange={e => onChange({ ...value, date: e.target.value })} required />
    <Select label="Entrenador" value={value.trainerName} onChange={e => onChange({ ...value, trainerName: e.target.value })}>
      {trainers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
    </Select>
    <Select label="Centro" value={value.centerName} onChange={e => onChange({ ...value, centerName: e.target.value })}>
      {[...centers.map(c => c.name), FINANCE_ONLINE_CENTER].map(n => <option key={n} value={n}>{n}</option>)}
    </Select>
    <Select label="Servicio" value={value.service} onChange={e => onChange({ ...value, service: e.target.value as FinanceServiceName })}>
      {FINANCE_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
    </Select>
    {value.service === 'Entrenamiento grupal' && (
      <Select label="Días/semana" value={value.groupDays} onChange={e => onChange({ ...value, groupDays: e.target.value as '1' | '2' | '3' })}>
        <option value="1">1</option><option value="2">2</option><option value="3">3</option>
      </Select>
    )}
    <Input label="Cantidad" type="number" min="1" value={value.quantity} onChange={e => onChange({ ...value, quantity: e.target.value })} required />

    {personas && (
      <Select label="Cliente (opcional)" value={value.personaId ?? ''} onChange={e => onChange({ ...value, personaId: e.target.value || undefined })}>
        <option value="">Sin cliente asociado</option>
        {personas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </Select>
    )}

    {showAdvanced && (
      <details className="sm:col-span-2 lg:col-span-4 text-sm">
        <summary className="cursor-pointer text-gray-400 hover:text-white font-medium select-none">Overrides manuales (opcional, para saltarse los parámetros fijos ese día)</summary>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
          <Input label="Precio manual unit. (€)" type="number" step="0.5" placeholder="Usar precio fijo" value={value.manualPrice ?? ''} onChange={e => onChange({ ...value, manualPrice: e.target.value })} />
          <Input label="Pago entrenador manual (€)" type="number" step="0.5" placeholder="Usar pago fijo" value={value.manualTrainerPay ?? ''} onChange={e => onChange({ ...value, manualTrainerPay: e.target.value })} />
          <Input label="Pago centro manual (€)" type="number" step="0.5" placeholder="Usar pago fijo" value={value.manualCenterPay ?? ''} onChange={e => onChange({ ...value, manualCenterPay: e.target.value })} />
        </div>
        <div className="mt-3">
          <Input label="Notas" type="text" placeholder="Opcional" value={value.notes ?? ''} onChange={e => onChange({ ...value, notes: e.target.value })} />
        </div>
      </details>
    )}
  </>
);
