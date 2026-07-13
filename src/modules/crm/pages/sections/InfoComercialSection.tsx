import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useMasterData } from '../../../masterdata/context/MasterDataContext';
import { EstadoComercial } from '../../types';
import { ESTADO_COMERCIAL_LABELS } from '../../lib/labels';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
import { Spinner } from '../../../../components/ui/Spinner';

interface Props {
  personaId: string;
}

type Draft = {
  origen: string; campana: string; referencia: string;
  estadoComercial: EstadoComercial;
  probabilidad: string; ultimoContacto: string;
  proximaAccion: string; proximaAccionFecha: string;
  responsableComercial: string; notas: string;
};

const EMPTY_DRAFT: Draft = {
  origen: '', campana: '', referencia: '', estadoComercial: 'lead',
  probabilidad: '', ultimoContacto: '', proximaAccion: '', proximaAccionFecha: '',
  responsableComercial: '', notas: '',
};

/** Info comercial — el CRM en el sentido clásico de embudo/seguimiento. Entidad 1:1 opcional. */
export const InfoComercialSection: React.FC<Props> = ({ personaId }) => {
  const { infoComercial } = useCRM();
  const { personas } = useMasterData();
  const existing = infoComercial.items.find(i => i.personaId === personaId);

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    setDraft(existing ? {
      origen: existing.origen, campana: existing.campana, referencia: existing.referencia,
      estadoComercial: existing.estadoComercial,
      probabilidad: existing.probabilidad?.toString() ?? '',
      ultimoContacto: existing.ultimoContacto?.slice(0, 10) ?? '',
      proximaAccion: existing.proximaAccion,
      proximaAccionFecha: existing.proximaAccionFecha?.slice(0, 10) ?? '',
      responsableComercial: existing.responsableComercial ?? '',
      notas: existing.notas,
    } : EMPTY_DRAFT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const patch = {
      origen: draft.origen,
      campana: draft.campana,
      referencia: draft.referencia,
      estadoComercial: draft.estadoComercial,
      probabilidad: draft.probabilidad ? Number(draft.probabilidad) : null,
      ultimoContacto: draft.ultimoContacto || null,
      proximaAccion: draft.proximaAccion,
      proximaAccionFecha: draft.proximaAccionFecha || null,
      responsableComercial: draft.responsableComercial || null,
      notas: draft.notas,
    };
    if (existing) {
      await infoComercial.update(existing.id, patch);
    } else {
      await infoComercial.create({ personaId, ...patch });
    }
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  if (infoComercial.loading || personas.loading) return <div className="p-12 flex justify-center"><Spinner /></div>;

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Origen" value={draft.origen} onChange={e => setDraft(d => ({ ...d, origen: e.target.value }))} placeholder="Instagram, referido, web..." />
          <Input label="Campaña" value={draft.campana} onChange={e => setDraft(d => ({ ...d, campana: e.target.value }))} />
          <Input label="Referencia" value={draft.referencia} onChange={e => setDraft(d => ({ ...d, referencia: e.target.value }))} />
          <Select label="Estado comercial" value={draft.estadoComercial} onChange={e => setDraft(d => ({ ...d, estadoComercial: e.target.value as EstadoComercial }))}>
            {(Object.keys(ESTADO_COMERCIAL_LABELS) as EstadoComercial[]).map(k => (
              <option key={k} value={k}>{ESTADO_COMERCIAL_LABELS[k]}</option>
            ))}
          </Select>
          <Input label="Probabilidad (%)" type="number" min="0" max="100" value={draft.probabilidad} onChange={e => setDraft(d => ({ ...d, probabilidad: e.target.value }))} />
          <Input label="Último contacto" type="date" value={draft.ultimoContacto} onChange={e => setDraft(d => ({ ...d, ultimoContacto: e.target.value }))} />
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Seguimiento</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Próxima acción" value={draft.proximaAccion} onChange={e => setDraft(d => ({ ...d, proximaAccion: e.target.value }))} />
          <Input label="Fecha de la próxima acción" type="date" value={draft.proximaAccionFecha} onChange={e => setDraft(d => ({ ...d, proximaAccionFecha: e.target.value }))} />
          <Select label="Responsable comercial" value={draft.responsableComercial} onChange={e => setDraft(d => ({ ...d, responsableComercial: e.target.value }))}>
            <option value="">Sin asignar</option>
            {personas.items.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </div>
        <Input label="Notas" value={draft.notas} onChange={e => setDraft(d => ({ ...d, notas: e.target.value }))} />
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit"><Save size={16} /> Guardar cambios</Button>
        {savedMsg && <span className="text-green-400 text-sm font-bold">Guardado ✓</span>}
      </div>
    </form>
  );
};
