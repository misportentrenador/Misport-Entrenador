import React, { useState } from 'react';
import { Plus, Pencil, Contact } from 'lucide-react';
import { useMasterData } from '../context/MasterDataContext';
import { Table, TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { Card } from '../../../components/ui/Card';
import { Persona } from '../types';

const emptyForm = { name: '', email: '', phone: '', docId: '', notes: '' };

/**
 * Persona is intentionally neutral: no "cliente"/"entrenador"/"empleado"
 * field here. Its relationships to Organizaciones are managed in the
 * Contactos tab, not here — this form never grows a role field.
 */
export const PersonasTab: React.FC = () => {
  const { personas, organizaciones, contactos } = useMasterData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (persona: Persona) => {
    setEditingId(persona.id);
    setForm({ name: persona.name, email: persona.email, phone: persona.phone, docId: persona.docId, notes: persona.notes });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      await personas.update(editingId, form);
    } else {
      // userId stays null: this Persona isn't linked to a login account
      // unless/until something explicitly connects the two.
      await personas.create({ ...form, userId: null, isActive: true });
    }
    setModalOpen(false);
  };

  const toggleActive = (persona: Persona) => personas.update(persona.id, { isActive: !persona.isActive });

  const organizacionesDe = (personaId: string) =>
    contactos.items
      .filter(c => c.personaId === personaId)
      .map(c => organizaciones.items.find(o => o.id === c.organizacionId)?.name)
      .filter(Boolean)
      .join(', ') || '—';

  const columns: TableColumn<Persona>[] = [
    { key: 'name', header: 'Nombre', render: p => <span className="text-white font-medium">{p.name}</span> },
    { key: 'email', header: 'Email', render: p => p.email || '—' },
    { key: 'phone', header: 'Teléfono', render: p => p.phone || '—' },
    { key: 'orgs', header: 'Organizaciones', render: p => organizacionesDe(p.id) },
    { key: 'status', header: 'Estado', render: p => <Badge tone={p.isActive ? 'success' : 'neutral'}>{p.isActive ? 'Activa' : 'Inactiva'}</Badge> },
    {
      key: 'actions', header: '', align: 'right', render: p => (
        <div className="flex justify-end items-center gap-3">
          <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-white" title="Editar"><Pencil size={16} /></button>
          <button onClick={() => toggleActive(p)} className="text-xs text-gray-400 hover:text-white underline whitespace-nowrap">
            {p.isActive ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus size={16} /> Nueva persona</Button>
      </div>

      {personas.loading ? (
        <div className="p-12 flex justify-center"><Spinner /></div>
      ) : personas.items.length === 0 ? (
        <EmptyState icon={Contact} message="Todavía no hay personas registradas." />
      ) : (
        <Card className="overflow-hidden">
          <Table columns={columns} rows={personas.items} rowKey={p => p.id} />
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar persona' : 'Nueva persona'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <Input label="Teléfono" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <Input label="Documento (DNI/NIF, opcional)" value={form.docId} onChange={e => setForm(f => ({ ...f, docId: e.target.value }))} />
          <Input label="Notas" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Guardar cambios' : 'Crear persona'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
