import React, { useState } from 'react';
import { CircleDollarSign } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { useFinance, getImportePendiente } from '../context/FinanceContext';
import { formatEUR } from '../shared/lib/format';
import { FORMA_PAGO_LABEL } from '../shared/lib/financeLabels';
import { Factura, FormaPago } from '../types';

interface RegistrarCobroModalProps {
  factura: Factura;
  open: boolean;
  onClose: () => void;
}

const FORMAS_PAGO: FormaPago[] = ['efectivo', 'transferencia', 'tarjeta', 'otro'];

/**
 * Modal de "Registrar cobro" (Sprint 24) — admite un cobro parcial o el
 * pendiente completo, con método de pago obligatorio y referencia
 * opcional. Sustituye al antiguo "Marcar como cobrada" (Sprint 20), que
 * solo permitía cobrar el total de una vez sin pedir la forma de pago.
 */
export const RegistrarCobroModal: React.FC<RegistrarCobroModalProps> = ({ factura, open, onClose }) => {
  const { cobros, registrarCobro } = useFinance();
  const pendiente = getImportePendiente(factura, cobros);

  const [importe, setImporte] = useState(String(pendiente.toFixed(2)));
  const [formaPago, setFormaPago] = useState<FormaPago>('efectivo');
  const [referencia, setReferencia] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const handleConfirm = () => {
    const importeNum = Number(importe);
    if (!importeNum || importeNum <= 0) {
      setError('Introduce un importe mayor que 0.');
      return;
    }
    const result = registrarCobro(factura.id, importeNum, formaPago, referencia.trim() || undefined);
    if (!result.success) {
      setError(result.message ?? 'No se pudo registrar el cobro.');
      return;
    }
    setError(null);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Registrar cobro · Factura ${factura.numero}`} maxWidthClassName="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          Pendiente: <span className="text-white font-bold">{formatEUR(pendiente)}</span>
        </p>

        <div>
          <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Importe a cobrar</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            max={pendiente}
            value={importe}
            onChange={e => setImporte(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-misportBlue focus:border-transparent focus:outline-none text-white font-medium"
          />
          <p className="text-xs text-gray-600 mt-1">Puede ser menor que el pendiente (cobro parcial).</p>
        </div>

        <Select label="Forma de pago" value={formaPago} onChange={e => setFormaPago(e.target.value as FormaPago)}>
          {FORMAS_PAGO.map(fp => <option key={fp} value={fp}>{FORMA_PAGO_LABEL[fp]}</option>)}
        </Select>

        <div>
          <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Referencia (opcional)</label>
          <input
            type="text"
            value={referencia}
            onChange={e => setReferencia(e.target.value)}
            placeholder="Nº de operación, referencia bancaria..."
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-misportBlue focus:border-transparent focus:outline-none text-white"
          />
        </div>

        {error && <p className="text-sm text-red-400 font-medium">{error}</p>}

        <div className="flex items-center gap-4 pt-2 border-t border-gray-800">
          <Button onClick={handleConfirm}>
            <CircleDollarSign size={16} /> Registrar cobro
          </Button>
          {saved && <span className="text-green-400 text-sm font-bold">Cobro registrado ✓</span>}
        </div>
      </div>
    </Modal>
  );
};
