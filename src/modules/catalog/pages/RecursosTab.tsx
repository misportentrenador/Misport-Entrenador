import React, { useState } from 'react';
import { Plus, Pencil, Box } from 'lucide-react';
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
import { Recurso } from '../types';

const emptyForm = { name: '', category: '', centerId: '' };

export const RecursosTab: React.FC = () => {
  const { recursos, centers } = useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, centerId: centers.items[0]?.id ?? '' });
    setModalOpen(true);
  };

  const openEdit = (recurso: Recurso) => {
    setEditingId(recurso.id);
    setForm({ name: recurso.name, category: recurso.category, centerId: recurso.centerId });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.centerId) return;
    if (editingId) {
      await recursos.update(editingId, form);
    } else {
      await recursos.create({ ...form, isActive: true });
    }
    setModalOpen(false);
  };

  const toggleActive = (recurso: Recurso) => recursos.update(recurso.id, { isActive: !recurso.isActive });
  const centerName = (id: string) => centers.items.find(c => c.id === id)?.name ?? '—';

  const columns: TableColumn<Recurso>[] = [
    { key: 'name', header: 'Nombre', render: r => <span className="text-white font-medium">{r.name}</span> },
    { key: 'category', header: 'Categoría', render: r => r.category || '—' },
    { key: 'center', header: 'Centro', render: r => centerName(r.centerId) },
    { key: 'status', header: 'Estado', render: r => <Badge tone={r.isActive ? 'success' : 'neutral'}>{r.isActive ? 'Activo' : 'Inactivo'}</Badge> },
    {
      key: 'actions', header: '', align: 'right', render: r => (
        <div className="flex justify-end items-center gap-3">
          <button onClick={() => openEdit(r)} className="text-gray-400 hover:text-white" title="Editar"><Pencil size={16} /></button>
          <button onClick={() => toggleActive(r)} className="text-xs text-gray-400 hover:text-white underline whitespace-nowrap">
            {r.isActive ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} disabled={centers.items.length === 0}><Plus size={16} /> Nuevo recurso</Button>
      </div>

      {recursos.loading ? (
        <div className="p-12 flex justify-center"><Spinner /></div>
      ) : recursos.items.length === 0 ? (
        <EmptyState icon={Box} message="Todavía no hay recursos en el catálogo." />
      ) : (
        <Card className="overflow-hidden">
          <Table columns={columns} rows={recursos.items} rowKey={r => r.id} />
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar recurso' : 'Nuevo recurso'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Categoría" placeholder="ej. equipo, sala..." value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          <Select label="Centro" value={form.centerId} onChange={e => setForm(f => ({ ...f, centerId: e.target.value }))} required>
            {centers.items.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Guardar cambios' : 'Crear recurso'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
