import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { useApp } from '../../../context/AppContext';
import { useFinance, financeServiceNameForCatalogServiceId } from '../../../context/FinanceContext';
import { FINANCE_SERVICES, FINANCE_ONLINE_CENTER } from '../../../constants';
import { FinanceServiceName } from '../../../types';
import { AgendaSession } from './AgendaSession';

interface RegistrarPagoModalProps {
  session: AgendaSession;
  open: boolean;
  onClose: () => void;
}

/**
 * Modal de "Registrar pago" desde la Agenda (Sprint 16) — llama a
 * useFinance().addEntry, la misma función que ya usa la Ficha CRM
 * (InformacionEconomicaSection, Sprint 10). Sin sourceReservationId: es un
 * pago manual independiente del registro automático de handleComplete
 * (Sprint 7/11), igual que ya ocurre hoy desde la Ficha.
 */
export const RegistrarPagoModal: React.FC<RegistrarPagoModalProps> = ({ session, open, onClose }) => {
  const { centers, trainers } = useApp();
  const { addEntry } = useFinance();
  const r = session.reservation;
  const center = centers.find(c => c.id === r.centerId);
  const trainer = trainers.find(t => t.id === r.trainerId);
  const defaultService = financeServiceNameForCatalogServiceId(r.serviceId) ?? FINANCE_SERVICES[0];

  const [form, setForm] = useState({
    date: r.date,
    trainerName: trainer?.name ?? trainers[0]?.name ?? '',
    centerName: center?.name ?? centers[0]?.name ?? '',
    service: defaultService as FinanceServiceName,
    groupDays: '1' as '1' | '2' | '3',
    quantity: '1',
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = Number(form.quantity);
    if (!form.date || !quantity || quantity <= 0) return;
    addEntry({
      date: form.date,
      trainerName: form.trainerName,
      centerName: form.centerName,
      service: form.service,
      groupDays: form.service === 'Entrenamiento grupal' ? Number(form.groupDays) as 1 | 2 | 3 : undefined,
      quantity,
      personaId: r.personaId ?? undefined,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Registrar pago · ${r.userName}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input label="Fecha" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
        <Select label="Entrenador" value={form.trainerName} onChange={e => setForm(f => ({ ...f, trainerName: e.target.value }))}>
          {trainers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </Select>
        <Select label="Centro" value={form.centerName} onChange={e => setForm(f => ({ ...f, centerName: e.target.value }))}>
          {[...centers.map(c => c.name), FINANCE_ONLINE_CENTER].map(n => <option key={n} value={n}>{n}</option>)}
        </Select>
        <Select label="Servicio" value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value as FinanceServiceName }))}>
          {FINANCE_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        {form.service === 'Entrenamiento grupal' && (
          <Select label="Días/semana" value={form.groupDays} onChange={e => setForm(f => ({ ...f, groupDays: e.target.value as '1' | '2' | '3' }))}>
            <option value="1">1</option><option value="2">2</option><option value="3">3</option>
          </Select>
        )}
        <Input label="Cantidad" type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
        <div className="flex items-center gap-4 pt-2">
          <Button type="submit"><Save size={16} /> Registrar pago</Button>
          {saved && <span className="text-green-400 text-sm font-bold">Pago registrado ✓</span>}
        </div>
      </form>
    </Modal>
  );
};
