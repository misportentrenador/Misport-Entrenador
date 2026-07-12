import React, { useState } from 'react';
import { Plus, Pencil, Dumbbell } from 'lucide-react';
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
import { Service } from '../types';

const emptyForm = { name: '', description: '', durationMinutes: '60', capacity: '1', requiresTrainer: 'true' };

export const ServiciosTab: React.FC = () => {
  const { services } = useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description,
      durationMinutes: String(service.durationMinutes),
      capacity: String(service.capacity),
      requiresTrainer: String(service.requiresTrainer),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      name: form.name,
      description: form.description,
      durationMinutes: Number(form.durationMinutes) || 0,
      capacity: Number(form.capacity) || 1,
      requiresTrainer: form.requiresTrainer === 'true',
    };
    if (editingId) {
      await services.update(editingId, payload);
    } else {
      await services.create({ ...payload, isActive: true });
    }
    setModalOpen(false);
  };

  const toggleActive = (service: Service) => services.update(service.id, { isActive: !service.isActive });

  const columns: TableColumn<Service>[] = [
    { key: 'name', header: 'Nombre', render: s => <span className="text-white font-medium">{s.name}</span> },
    { key: 'duration', header: 'Duración', render: s => `${s.durationMinutes} min` },
    { key: 'capacity', header: 'Capacidad', render: s => String(s.capacity) },
    { key: 'requiresTrainer', header: 'Entrenador', render: s => (s.requiresTrainer ? 'Sí' : 'No') },
    { key: 'status', header: 'Estado', render: s => <Badge tone={s.isActive ? 'success' : 'neutral'}>{s.isActive ? 'Activo' : 'Inactivo'}</Badge> },
    {
      key: 'actions', header: '', align: 'right', render: s => (
        <div className="flex justify-end items-center gap-3">
          <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-white" title="Editar"><Pencil size={16} /></button>
          <button onClick={() => toggleActive(s)} className="text-xs text-gray-400 hover:text-white underline whitespace-nowrap">
            {s.isActive ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus size={16} /> Nuevo servicio</Button>
      </div>

      {services.loading ? (
        <div className="p-12 flex justify-center"><Spinner /></div>
      ) : services.items.length === 0 ? (
        <EmptyState icon={Dumbbell} message="Todavía no hay servicios en el catálogo." />
      ) : (
        <Card className="overflow-hidden">
          <Table columns={columns} rows={services.items} rowKey={s => s.id} />
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar servicio' : 'Nuevo servicio'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Descripción" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duración (min)" type="number" min="0" value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))} />
            <Input label="Capacidad" type="number" min="1" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
          </div>
          <Select label="¿Requiere entrenador?" value={form.requiresTrainer} onChange={e => setForm(f => ({ ...f, requiresTrainer: e.target.value }))}>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Guardar cambios' : 'Crear servicio'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
