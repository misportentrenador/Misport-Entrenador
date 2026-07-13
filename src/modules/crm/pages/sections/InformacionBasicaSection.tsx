import React, { useState } from 'react';
import { Save, Power } from 'lucide-react';
import { useMasterData } from '../../../masterdata/context/MasterDataContext';
import { Persona } from '../../../masterdata/types';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { calculateAge } from '../../../../shared/lib/date';

interface Props {
  persona: Persona;
}

type Draft = {
  name: string; email: string; phone: string; docId: string;
  photoUrl: string; sex: '' | 'M' | 'F' | 'other'; birthDate: string;
  address: string; postalCode: string; municipality: string; province: string; country: string; language: string;
  tags: string;
};

const toDraft = (p: Persona): Draft => ({
  name: p.name, email: p.email, phone: p.phone, docId: p.docId,
  photoUrl: p.photoUrl ?? '', sex: p.sex ?? '', birthDate: p.birthDate ?? '',
  address: p.address ?? '', postalCode: p.postalCode ?? '', municipality: p.municipality ?? '',
  province: p.province ?? '', country: p.country ?? '', language: p.language ?? '',
  tags: (p.tags ?? []).join(', '),
});

/**
 * Única pantalla que edita los campos de información básica ampliada
 * (decisión 1, Sprint 8) — el formulario de Datos Maestros se deja tal
 * cual, sin tocar. Escribe siempre sobre la misma Persona, nunca duplica.
 */
export const InformacionBasicaSection: React.FC<Props> = ({ persona }) => {
  const { personas } = useMasterData();
  const [draft, setDraft] = useState<Draft>(() => toDraft(persona));
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await personas.update(persona.id, {
      name: draft.name, email: draft.email, phone: draft.phone, docId: draft.docId,
      photoUrl: draft.photoUrl || undefined,
      sex: draft.sex || undefined,
      birthDate: draft.birthDate || undefined,
      address: draft.address || undefined,
      postalCode: draft.postalCode || undefined,
      municipality: draft.municipality || undefined,
      province: draft.province || undefined,
      country: draft.country || undefined,
      language: draft.language || undefined,
      tags: draft.tags.trim() ? draft.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const toggleActive = async () => {
    const now = new Date().toISOString();
    await personas.update(persona.id, {
      isActive: !persona.isActive,
      deactivatedAt: persona.isActive ? now : undefined,
    });
  };

  const age = draft.birthDate ? calculateAge(draft.birthDate) : null;

  return (
    <div className="space-y-6">
      <Card className="p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge tone={persona.isActive ? 'success' : 'neutral'}>{persona.isActive ? 'Activa' : 'Inactiva'}</Badge>
          {persona.deactivatedAt && !persona.isActive && (
            <span className="text-xs text-gray-500">Baja: {persona.deactivatedAt.slice(0, 10)}</span>
          )}
          <span className="text-xs text-gray-500">Alta: {persona.createdAt.slice(0, 10)}</span>
        </div>
        <Button type="button" variant="ghost" onClick={toggleActive}>
          <Power size={16} /> {persona.isActive ? 'Desactivar' : 'Activar'}
        </Button>
      </Card>

      <form onSubmit={handleSave} className="space-y-4">
        <Card className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre" value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} required />
            <Input label="Foto (URL)" value={draft.photoUrl} onChange={e => setDraft(d => ({ ...d, photoUrl: e.target.value }))} placeholder="https://..." />
            <Input label="Email" type="email" value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} />
            <Input label="Teléfono" value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} />
            <Input label="DNI / NIF" value={draft.docId} onChange={e => setDraft(d => ({ ...d, docId: e.target.value }))} />
            <Select label="Sexo" value={draft.sex} onChange={e => setDraft(d => ({ ...d, sex: e.target.value as Draft['sex'] }))}>
              <option value="">Sin especificar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="other">Otro</option>
            </Select>
            <div>
              <Input label="Fecha de nacimiento" type="date" value={draft.birthDate} onChange={e => setDraft(d => ({ ...d, birthDate: e.target.value }))} />
              {age !== null && <p className="text-xs text-gray-500 mt-1.5">Edad calculada: {age} años</p>}
            </div>
            <Input label="Idioma" value={draft.language} onChange={e => setDraft(d => ({ ...d, language: e.target.value }))} placeholder="Español" />
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Dirección</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Dirección" value={draft.address} onChange={e => setDraft(d => ({ ...d, address: e.target.value }))} />
            </div>
            <Input label="Código postal" value={draft.postalCode} onChange={e => setDraft(d => ({ ...d, postalCode: e.target.value }))} />
            <Input label="Municipio" value={draft.municipality} onChange={e => setDraft(d => ({ ...d, municipality: e.target.value }))} />
            <Input label="Provincia" value={draft.province} onChange={e => setDraft(d => ({ ...d, province: e.target.value }))} />
            <Input label="País" value={draft.country} onChange={e => setDraft(d => ({ ...d, country: e.target.value }))} />
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <Input label="Etiquetas (separadas por comas)" value={draft.tags} onChange={e => setDraft(d => ({ ...d, tags: e.target.value }))} placeholder="vip, mañanas, ems" />
        </Card>

        {persona.notes && (
          <Card className="p-5">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Nota heredada (obsoleta)</h3>
            <p className="text-sm text-gray-400 italic">{persona.notes}</p>
            <p className="text-xs text-gray-600 mt-2">Este campo ya no se usa para información nueva — ver la pestaña Historial para las notas cronológicas.</p>
          </Card>
        )}

        <div className="flex items-center gap-4">
          <Button type="submit"><Save size={16} /> Guardar cambios</Button>
          {savedMsg && <span className="text-green-400 text-sm font-bold">Guardado ✓</span>}
        </div>
      </form>
    </div>
  );
};
