import React from 'react';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { FINANCE_SERVICES, FINANCE_ONLINE_CENTER } from '../constants';
import { FinanceServiceName } from '../types';
import { Trainer, Center } from '../modules/catalog/types';

export interface PagoFormValue {
  date: string;
  trainerName: string;
  centerName: string;
  service: FinanceServiceName;
  groupDays: '1' | '2' | '3';
  quantity: string;
}

interface PagoFormFieldsProps {
  value: PagoFormValue;
  onChange: (value: PagoFormValue) => void;
  trainers: Trainer[];
  centers: Center[];
}

/**
 * Campos del formulario de "Registrar pago" — antes duplicados entre
 * InformacionEconomicaSection (Ficha CRM, Sprint 10) y RegistrarPagoModal
 * (Agenda, Sprint 16). Puramente presentacional: cada sitio conserva su
 * propio submit (`addEntry`), esto solo evita mantener dos copias de los
 * mismos campos.
 */
export const PagoFormFields: React.FC<PagoFormFieldsProps> = ({ value, onChange, trainers, centers }) => (
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
  </>
);
