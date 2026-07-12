import React, { useState } from 'react';
import { Plus, Pencil, Ticket } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { Table, TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { Card } from '../../../components/ui/Card';
import { formatEUR } from '../../../shared/lib/format';
import { Bono } from '../types';

const emptyForm = { name: '', serviceId: '', sessionsIncluded: '10', price: '0', validityDays: '' };

export const BonosTab: React.FC = () => {
  const { bonos, services } = useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, serviceId: services.items[0]?.id ?? '' });
    setModalOpen(true);
  };

  const openEdit = (bono: Bono) => {
    setEditingId(bono.id);
    setForm({
      name: bono.name,
      serviceId: bono.serviceId,
      sessionsIncluded: String(bono.sessionsIncluded),
      price: String(bono.price),
      validityDays: bono.validityDays === null ? '' : String(bono.validityDays),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.serviceId) return;
    const payload = {
      name: form.name,
      serviceId: form.serviceId,
      sessionsIncluded: Number(form.sessionsIncluded) || 0,
      price: Number(form.price) || 0,
      validityDays: form.validityDays.trim() === '' ? null : Number(form.validityDays),
    };
    if (editingId) {
      await bonos.update(editingId, payload);
    } else {
      await bonos.create({ ...payload, isActive: true });
    }
    setModalOpen(false);
  };

  const toggleActive = (bono: Bono) => bonos.update(bono.id, { isActive: !bono.isActive });
  const serviceName = (id: string) => services.items.find(s => s.id === id)?.name ?? '—';

  const columns: TableColumn<Bono>[] = [
    { key: 'name', header: 'Nombre', render: b => <span className="text-white font-medium">{b.name}</span> },
    { key: 'service', header: 'Servicio', render: b => serviceName(b.serviceId) },
    { key: 'sessions', header: 'Sesiones', align: 'right', render: b => String(b.sessionsIncluded) },
    { key: 'price', header: 'Precio', align: 'right', render: b => formatEUR(b.price) },
    { key: 'validity', header: 'Validez', render: b => (b.validityDays === null ? 'Sin caducidad' : `${b.validityDays} días`) },
    { key: 'status', header: 'Estado', render: b => <Badge tone={b.isActive ? 'success' : 'neutral'}>{b.isActive ? 'Activo' : 'Inactivo'}</Badge> },
    {
      key: 'actions', header: '', align: 'right', render: b => (
        <div className="flex justify-end items-center gap-3">
          <button onClick={() => openEdit(b)} className="text-gray-400 hover:text-white" title="Editar"><Pencil size={16} /></button>
          <button onClick={() => toggleActive(b)} className="text-xs text-gray-400 hover:text-white underline whitespace-nowrap">
            {b.isActive ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} disabled={services.items.length === 0}><Plus size={16} /> Nuevo bono</Button>
      </div>

      {bonos.loading ? (
        <div className="p-12 flex justify-center"><Spinner /></div>
      ) : bonos.items.length === 0 ? (
        <EmptyState icon={Ticket} message="Todavía no hay bonos en el catálogo." />
      ) : (
        <Card className="overflow-hidden">
          <Table columns={columns} rows={bonos.items} rowKey={b => b.id} />
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar bono' : 'Nuevo bono'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Select label="Servicio" value={form.serviceId} onChange={e => setForm(f => ({ ...f, serviceId: e.target.value }))} required>
            {services.items.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sesiones incluidas" type="number" min="1" value={form.sessionsIncluded} onChange={e => setForm(f => ({ ...f, sessionsIncluded: e.target.value }))} />
            <Input label="Precio (€)" type="number" step="0.5" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
          </div>
          <Input label="Validez (días, vacío = sin caducidad)" type="number" min="1" value={form.validityDays} onChange={e => setForm(f => ({ ...f, validityDays: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Guardar cambios' : 'Crear bono'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
