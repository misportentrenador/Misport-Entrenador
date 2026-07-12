import React, { useState } from 'react';
import { Plus, Pencil, Link2 } from 'lucide-react';
import { useMasterData } from '../context/MasterDataContext';
import { Table, TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { Card } from '../../../components/ui/Card';
import { Contacto } from '../types';

const emptyForm = { personaId: '', organizacionId: '', notes: '' };

/**
 * Contacto is only the relationship: which Persona is linked to which
 * Organización, and since when. It carries no role — "cliente", "empleado"
 * etc. are for whichever future module cares about that distinction.
 */
export const ContactosTab: React.FC = () => {
  const { contactos, personas, organizaciones } = useMasterData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm({ personaId: personas.items[0]?.id ?? '', organizacionId: organizaciones.items[0]?.id ?? '', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (contacto: Contacto) => {
    setEditingId(contacto.id);
    setForm({ personaId: contacto.personaId, organizacionId: contacto.organizacionId, notes: contacto.notes });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.personaId || !form.organizacionId) return;
    if (editingId) {
      await contactos.update(editingId, form);
    } else {
      await contactos.create({ ...form, isActive: true });
    }
    setModalOpen(false);
  };

  const toggleActive = (contacto: Contacto) => contactos.update(contacto.id, { isActive: !contacto.isActive });
  const personaName = (id: string) => personas.items.find(p => p.id === id)?.name ?? '—';
  const organizacionName = (id: string) => organizaciones.items.find(o => o.id === id)?.name ?? '—';

  const columns: TableColumn<Contacto>[] = [
    { key: 'persona', header: 'Persona', render: c => <span className="text-white font-medium">{personaName(c.personaId)}</span> },
    { key: 'organizacion', header: 'Organización', render: c => organizacionName(c.organizacionId) },
    { key: 'notes', header: 'Notas', render: c => c.notes || '—' },
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

  const canCreate = personas.items.length > 0 && organizaciones.items.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} disabled={!canCreate}><Plus size={16} /> Nuevo contacto</Button>
      </div>
      {!canCreate && (
        <p className="text-xs text-gray-500">Hace falta al menos una Persona y una Organización antes de poder crear un contacto.</p>
      )}

      {contactos.loading ? (
        <div className="p-12 flex justify-center"><Spinner /></div>
      ) : contactos.items.length === 0 ? (
        <EmptyState icon={Link2} message="Todavía no hay contactos (relaciones Persona–Organización) registrados." />
      ) : (
        <Card className="overflow-hidden">
          <Table columns={columns} rows={contactos.items} rowKey={c => c.id} />
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar contacto' : 'Nuevo contacto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Persona" value={form.personaId} onChange={e => setForm(f => ({ ...f, personaId: e.target.value }))} required>
            {personas.items.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Select label="Organización" value={form.organizacionId} onChange={e => setForm(f => ({ ...f, organizacionId: e.target.value }))} required>
            {organizaciones.items.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </Select>
          <Input label="Notas" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Guardar cambios' : 'Crear contacto'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
