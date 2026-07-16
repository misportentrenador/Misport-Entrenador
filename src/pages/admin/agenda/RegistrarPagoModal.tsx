import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { PagoFormFields, PagoFormValue } from '../../../components/PagoFormFields';
import { useApp } from '../../../context/AppContext';
import { useFinance, financeServiceNameForCatalogServiceId } from '../../../context/FinanceContext';
import { FINANCE_SERVICES } from '../../../constants';
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
  // SessionCard solo monta este modal para sesiones origin === 'misport', que siempre tienen reservation.
  const r = session.reservation!;
  const center = centers.find(c => c.id === r.centerId);
  const trainer = trainers.find(t => t.id === r.trainerId);
  const defaultService = financeServiceNameForCatalogServiceId(r.serviceId) ?? FINANCE_SERVICES[0];

  const [form, setForm] = useState<PagoFormValue>({
    date: r.date,
    trainerName: trainer?.name ?? trainers[0]?.name ?? '',
    centerName: center?.name ?? centers[0]?.name ?? '',
    service: defaultService,
    groupDays: '1',
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
      manualPrice: form.manualPrice ? Number(form.manualPrice) : undefined,
      manualTrainerPay: form.manualTrainerPay ? Number(form.manualTrainerPay) : undefined,
      manualCenterPay: form.manualCenterPay ? Number(form.manualCenterPay) : undefined,
      notes: form.notes || undefined,
      personaId: r.personaId ?? undefined,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Registrar pago · ${r.userName}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <PagoFormFields value={form} onChange={setForm} trainers={trainers} centers={centers} showAdvanced />
        <div className="flex items-center gap-4 pt-2">
          <Button type="submit"><Save size={16} /> Registrar pago</Button>
          {saved && <span className="text-green-400 text-sm font-bold">Pago registrado ✓</span>}
        </div>
      </form>
    </Modal>
  );
};
