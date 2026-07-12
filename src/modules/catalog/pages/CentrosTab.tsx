import React, { useState } from 'react';
import { Plus, Pencil, MapPin } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { Table, TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { Card } from '../../../components/ui/Card';
import { Center } from '../types';

const emptyForm = { name: '', address: '', description: '' };

export const CentrosTab: React.FC = () => {
  const { centers } = useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (center: Center) => {
    setEditingId(center.id);
    setForm({ name: center.name, address: center.address, description: center.description });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      await centers.update(editingId, form);
    } else {
      await centers.create({ ...form, isActive: true });
    }
    setModalOpen(false);
  };

  const toggleActive = (center: Center) => centers.update(center.id, { isActive: !center.isActive });

  const columns: TableColumn<Center>[] = [
    { key: 'name', header: 'Nombre', render: c => <span className="text-white font-medium">{c.name}</span> },
    { key: 'address', header: 'Dirección', render: c => c.address },
    { key: 'status', header: 'Estado', render: c => <Badge tone={c.isActive ? 'success' : 'neutral'}>{c.isActive ? 'Activo' : 'Inactivo'}</Badge> },
    {
      key: 'actions', header: '', align: 'right', render: c => (
        <div className="flex justify-end items-center gap-3">
          <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-white" title="Editar"><Pencil size={16} /></button>
          <button onClick={() => toggleActive(c)} className="text-xs text-gray-400 hover:text-white underline whitespace-nowrap">
            {c.isActive ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus size={16} /> Nuevo centro</Button>
      </div>

      {centers.loading ? (
        <div className="p-12 flex justify-center"><Spinner /></div>
      ) : centers.items.length === 0 ? (
        <EmptyState icon={MapPin} message="Todavía no hay centros en el catálogo." />
      ) : (
        <Card className="overflow-hidden">
          <Table columns={columns} rows={centers.items} rowKey={c => c.id} />
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar centro' : 'Nuevo centro'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Dirección" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          <Input label="Descripción" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Guardar cambios' : 'Crear centro'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
