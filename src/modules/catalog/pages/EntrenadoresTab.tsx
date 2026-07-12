import React, { useState } from 'react';
import { Plus, Pencil, Users } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { Table, TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { Card } from '../../../components/ui/Card';
import { Trainer } from '../types';

const emptyForm = { name: '', centerIds: [] as string[], serviceIds: [] as string[] };

const toggleInArray = (arr: string[], value: string) =>
  arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];

export const EntrenadoresTab: React.FC = () => {
  const { trainers, centers, services } = useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (trainer: Trainer) => {
    setEditingId(trainer.id);
    setForm({ name: trainer.name, centerIds: trainer.centerIds, serviceIds: trainer.serviceIds });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      await trainers.update(editingId, form);
    } else {
      await trainers.create({ ...form, isActive: true });
    }
    setModalOpen(false);
  };

  const toggleActive = (trainer: Trainer) => trainers.update(trainer.id, { isActive: !trainer.isActive });

  const nameList = (ids: string[], source: { id: string; name: string }[]) =>
    ids.map(id => source.find(s => s.id === id)?.name).filter(Boolean).join(', ') || '—';

  const columns: TableColumn<Trainer>[] = [
    { key: 'name', header: 'Nombre', render: t => <span className="text-white font-medium">{t.name}</span> },
    { key: 'centers', header: 'Centros', render: t => nameList(t.centerIds, centers.items) },
    { key: 'services', header: 'Servicios', render: t => nameList(t.serviceIds, services.items) },
    { key: 'status', header: 'Estado', render: t => <Badge tone={t.isActive ? 'success' : 'neutral'}>{t.isActive ? 'Activo' : 'Inactivo'}</Badge> },
    {
      key: 'actions', header: '', align: 'right', render: t => (
        <div className="flex justify-end items-center gap-3">
          <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-white" title="Editar"><Pencil size={16} /></button>
          <button onClick={() => toggleActive(t)} className="text-xs text-gray-400 hover:text-white underline whitespace-nowrap">
            {t.isActive ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus size={16} /> Nuevo entrenador</Button>
      </div>

      {trainers.loading ? (
        <div className="p-12 flex justify-center"><Spinner /></div>
      ) : trainers.items.length === 0 ? (
        <EmptyState icon={Users} message="Todavía no hay entrenadores en el catálogo." />
      ) : (
        <Card className="overflow-hidden">
          <Table columns={columns} rows={trainers.items} rowKey={t => t.id} />
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar entrenador' : 'Nuevo entrenador'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />

          <div>
            <p className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Centros</p>
            <div className="flex flex-wrap gap-3">
              {centers.items.map(c => (
                <label key={c.id} className="flex items-center gap-1.5 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.centerIds.includes(c.id)}
                    onChange={() => setForm(f => ({ ...f, centerIds: toggleInArray(f.centerIds, c.id) }))}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Servicios</p>
            <div className="flex flex-wrap gap-3">
              {services.items.map(s => (
                <label key={s.id} className="flex items-center gap-1.5 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.serviceIds.includes(s.id)}
                    onChange={() => setForm(f => ({ ...f, serviceIds: toggleInArray(f.serviceIds, s.id) }))}
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Guardar cambios' : 'Crear entrenador'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
