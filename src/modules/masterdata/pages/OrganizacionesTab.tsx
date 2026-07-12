import React, { useState } from 'react';
import { Plus, Pencil, Building2 } from 'lucide-react';
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
import { Organizacion, OrganizacionTipo } from '../types';

const TIPO_LABELS: Record<OrganizacionTipo, string> = {
  empresa: 'Empresa',
  institucion: 'Institución',
  ong: 'ONG',
  administracion_publica: 'Administración pública',
  otro: 'Otro',
};

const emptyForm = { name: '', tipo: 'empresa' as OrganizacionTipo, taxId: '', contactName: '', contactEmail: '', contactPhone: '', address: '' };

export const OrganizacionesTab: React.FC = () => {
  const { organizaciones } = useMasterData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (organizacion: Organizacion) => {
    setEditingId(organizacion.id);
    setForm({
      name: organizacion.name,
      tipo: organizacion.tipo,
      taxId: organizacion.taxId,
      contactName: organizacion.contactName,
      contactEmail: organizacion.contactEmail,
      contactPhone: organizacion.contactPhone,
      address: organizacion.address,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      await organizaciones.update(editingId, form);
    } else {
      await organizaciones.create({ ...form, isActive: true });
    }
    setModalOpen(false);
  };

  const toggleActive = (organizacion: Organizacion) => organizaciones.update(organizacion.id, { isActive: !organizacion.isActive });

  const columns: TableColumn<Organizacion>[] = [
    { key: 'name', header: 'Nombre', render: o => <span className="text-white font-medium">{o.name}</span> },
    { key: 'tipo', header: 'Tipo', render: o => TIPO_LABELS[o.tipo] },
    { key: 'taxId', header: 'CIF/NIF', render: o => o.taxId || '—' },
    { key: 'contact', header: 'Contacto', render: o => o.contactName || '—' },
    { key: 'status', header: 'Estado', render: o => <Badge tone={o.isActive ? 'success' : 'neutral'}>{o.isActive ? 'Activa' : 'Inactiva'}</Badge> },
    {
      key: 'actions', header: '', align: 'right', render: o => (
        <div className="flex justify-end items-center gap-3">
          <button onClick={() => openEdit(o)} className="text-gray-400 hover:text-white" title="Editar"><Pencil size={16} /></button>
          <button onClick={() => toggleActive(o)} className="text-xs text-gray-400 hover:text-white underline whitespace-nowrap">
            {o.isActive ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus size={16} /> Nueva organización</Button>
      </div>

      {organizaciones.loading ? (
        <div className="p-12 flex justify-center"><Spinner /></div>
      ) : organizaciones.items.length === 0 ? (
        <EmptyState icon={Building2} message="Todavía no hay organizaciones registradas." />
      ) : (
        <Card className="overflow-hidden">
          <Table columns={columns} rows={organizaciones.items} rowKey={o => o.id} />
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar organización' : 'Nueva organización'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Select label="Tipo" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as OrganizacionTipo }))}>
            {Object.entries(TIPO_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <Input label="CIF/NIF" value={form.taxId} onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Persona de contacto" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} />
            <Input label="Teléfono de contacto" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} />
          </div>
          <Input label="Email de contacto" type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
          <Input label="Dirección" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Guardar cambios' : 'Crear organización'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
