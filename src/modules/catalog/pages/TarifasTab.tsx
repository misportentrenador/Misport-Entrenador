import React, { useState } from 'react';
import { Plus, Pencil, Euro } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { Table, TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { Card } from '../../../components/ui/Card';
import { formatEUR } from '../../../shared/lib/format';
import { Rate } from '../types';

const emptyForm = { serviceId: '', variant: '', price: '0', trainerPay: '0', centerPay: '0', effectiveFrom: new Date().toISOString().slice(0, 10) };

export const TarifasTab: React.FC = () => {
  const { rates, services } = useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, serviceId: services.items[0]?.id ?? '' });
    setModalOpen(true);
  };

  const openEdit = (rate: Rate) => {
    setEditingId(rate.id);
    setForm({
      serviceId: rate.serviceId,
      variant: rate.variant ?? '',
      price: String(rate.price),
      trainerPay: String(rate.trainerPay),
      centerPay: String(rate.centerPay),
      effectiveFrom: rate.effectiveFrom.slice(0, 10),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serviceId) return;
    const payload = {
      serviceId: form.serviceId,
      variant: form.variant.trim() === '' ? null : form.variant.trim(),
      price: Number(form.price) || 0,
      trainerPay: Number(form.trainerPay) || 0,
      centerPay: Number(form.centerPay) || 0,
      effectiveFrom: new Date(form.effectiveFrom).toISOString(),
    };
    if (editingId) {
      await rates.update(editingId, payload);
    } else {
      await rates.create(payload);
    }
    setModalOpen(false);
  };

  const serviceName = (id: string) => services.items.find(s => s.id === id)?.name ?? '—';

  const columns: TableColumn<Rate>[] = [
    { key: 'service', header: 'Servicio', render: r => <span className="text-white font-medium">{serviceName(r.serviceId)}</span> },
    { key: 'variant', header: 'Variante', render: r => r.variant ?? '—' },
    { key: 'price', header: 'Precio', align: 'right', render: r => formatEUR(r.price) },
    { key: 'trainerPay', header: 'Pago entrenador', align: 'right', render: r => formatEUR(r.trainerPay) },
    { key: 'centerPay', header: 'Pago centro', align: 'right', render: r => formatEUR(r.centerPay) },
    { key: 'effectiveFrom', header: 'Vigente desde', render: r => r.effectiveFrom.slice(0, 10) },
    {
      key: 'actions', header: '', align: 'right', render: r => (
        <button onClick={() => openEdit(r)} className="text-gray-400 hover:text-white" title="Editar"><Pencil size={16} /></button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} disabled={services.items.length === 0}><Plus size={16} /> Nueva tarifa</Button>
      </div>

      {rates.loading ? (
        <div className="p-12 flex justify-center"><Spinner /></div>
      ) : rates.items.length === 0 ? (
        <EmptyState icon={Euro} message="Todavía no hay tarifas en el catálogo." />
      ) : (
        <Card className="overflow-hidden">
          <Table columns={columns} rows={rates.items} rowKey={r => r.id} />
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar tarifa' : 'Nueva tarifa'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Servicio" value={form.serviceId} onChange={e => setForm(f => ({ ...f, serviceId: e.target.value }))} required>
            {services.items.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Input label="Variante (opcional)" placeholder="ej. 1 día/semana" value={form.variant} onChange={e => setForm(f => ({ ...f, variant: e.target.value }))} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Precio (€)" type="number" step="0.5" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            <Input label="Pago entrenador (€)" type="number" step="0.5" value={form.trainerPay} onChange={e => setForm(f => ({ ...f, trainerPay: e.target.value }))} />
            <Input label="Pago centro (€)" type="number" step="0.5" value={form.centerPay} onChange={e => setForm(f => ({ ...f, centerPay: e.target.value }))} />
          </div>
          <Input label="Vigente desde" type="date" value={form.effectiveFrom} onChange={e => setForm(f => ({ ...f, effectiveFrom: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Guardar cambios' : 'Crear tarifa'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
