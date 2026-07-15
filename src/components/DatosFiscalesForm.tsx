import React, { useState } from 'react';
import { Building2, Save } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

/**
 * Datos fiscales de MISPORT como emisor de sus propias facturas (Sprint
 * 19). Sin estos datos, "Generar factura" queda bloqueado — son un dato
 * real obligatorio, no un valor de relleno.
 */
export const DatosFiscalesForm: React.FC = () => {
  const { datosFiscales, updateDatosFiscales } = useFinance();
  const [draft, setDraft] = useState(datosFiscales);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDatosFiscales(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="p-5">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Building2 size={16} /> Datos fiscales de la empresa
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <Input name="razonSocial" label="Razón social" value={draft.razonSocial} onChange={e => setDraft(d => ({ ...d, razonSocial: e.target.value }))} required />
        <Input name="nif" label="NIF" value={draft.nif} onChange={e => setDraft(d => ({ ...d, nif: e.target.value }))} required />
        <Input name="direccion" label="Dirección" value={draft.direccion} onChange={e => setDraft(d => ({ ...d, direccion: e.target.value }))} required />
        <div className="sm:col-span-3 flex items-center gap-4">
          <Button type="submit"><Save size={16} /> Guardar datos fiscales</Button>
          {saved && <span className="text-green-400 text-sm font-bold">Guardado ✓</span>}
        </div>
      </form>
    </Card>
  );
};
