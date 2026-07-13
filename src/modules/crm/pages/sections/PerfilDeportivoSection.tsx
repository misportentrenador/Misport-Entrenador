import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useCatalog } from '../../../catalog/context/CatalogContext';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Spinner } from '../../../../components/ui/Spinner';

interface Props {
  personaId: string;
}

type Draft = {
  objetivos: string; nivel: string; experienciaAnios: string;
  modalidades: string[];
  lesiones: string; patologias: string; limitaciones: string;
  pesoKg: string; alturaCm: string; composicionCorporal: string;
  frecuenciaSemanal: string; disponibilidad: string; preferenciasHorarias: string;
};

const EMPTY_DRAFT: Draft = {
  objetivos: '', nivel: '', experienciaAnios: '', modalidades: [],
  lesiones: '', patologias: '', limitaciones: '',
  pesoKg: '', alturaCm: '', composicionCorporal: '',
  frecuenciaSemanal: '', disponibilidad: '', preferenciasHorarias: '',
};

/** Perfil deportivo — entidad 1:1 opcional del CRM (Sprint 8/9). `modalidades` referencia Service (Catálogo), nunca texto libre. */
export const PerfilDeportivoSection: React.FC<Props> = ({ personaId }) => {
  const { perfilesDeportivos } = useCRM();
  const { services } = useCatalog();
  const existing = perfilesDeportivos.items.find(p => p.personaId === personaId);

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    setDraft(existing ? {
      objetivos: existing.objetivos, nivel: existing.nivel,
      experienciaAnios: existing.experienciaAnios?.toString() ?? '',
      modalidades: existing.modalidades,
      lesiones: existing.lesiones, patologias: existing.patologias, limitaciones: existing.limitaciones,
      pesoKg: existing.pesoKg?.toString() ?? '', alturaCm: existing.alturaCm?.toString() ?? '',
      composicionCorporal: existing.composicionCorporal,
      frecuenciaSemanal: existing.frecuenciaSemanal?.toString() ?? '',
      disponibilidad: existing.disponibilidad, preferenciasHorarias: existing.preferenciasHorarias,
    } : EMPTY_DRAFT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  const toggleModalidad = (serviceId: string) => {
    setDraft(d => ({
      ...d,
      modalidades: d.modalidades.includes(serviceId)
        ? d.modalidades.filter(id => id !== serviceId)
        : [...d.modalidades, serviceId],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const patch = {
      objetivos: draft.objetivos,
      nivel: draft.nivel,
      experienciaAnios: draft.experienciaAnios ? Number(draft.experienciaAnios) : null,
      modalidades: draft.modalidades,
      lesiones: draft.lesiones,
      patologias: draft.patologias,
      limitaciones: draft.limitaciones,
      pesoKg: draft.pesoKg ? Number(draft.pesoKg) : null,
      alturaCm: draft.alturaCm ? Number(draft.alturaCm) : null,
      composicionCorporal: draft.composicionCorporal,
      frecuenciaSemanal: draft.frecuenciaSemanal ? Number(draft.frecuenciaSemanal) : null,
      disponibilidad: draft.disponibilidad,
      preferenciasHorarias: draft.preferenciasHorarias,
    };
    if (existing) {
      await perfilesDeportivos.update(existing.id, patch);
    } else {
      await perfilesDeportivos.create({ personaId, ...patch });
    }
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  if (perfilesDeportivos.loading || services.loading) return <div className="p-12 flex justify-center"><Spinner /></div>;

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Objetivos" value={draft.objetivos} onChange={e => setDraft(d => ({ ...d, objetivos: e.target.value }))} className="sm:col-span-3" />
          <Input label="Nivel" value={draft.nivel} onChange={e => setDraft(d => ({ ...d, nivel: e.target.value }))} placeholder="Principiante / intermedio / avanzado" />
          <Input label="Experiencia (años)" type="number" min="0" value={draft.experienciaAnios} onChange={e => setDraft(d => ({ ...d, experienciaAnios: e.target.value }))} />
          <Input label="Frecuencia semanal (sesiones)" type="number" min="0" value={draft.frecuenciaSemanal} onChange={e => setDraft(d => ({ ...d, frecuenciaSemanal: e.target.value }))} />
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Modalidades (servicios del Catálogo)</h3>
        <div className="flex flex-wrap gap-3">
          {services.items.map(s => (
            <label key={s.id} className="flex items-center gap-2 text-sm text-gray-300 bg-gray-900/40 border border-gray-800 rounded-lg px-3 py-2 cursor-pointer">
              <input type="checkbox" checked={draft.modalidades.includes(s.id)} onChange={() => toggleModalidad(s.id)} />
              {s.name}
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Salud deportiva</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Lesiones" value={draft.lesiones} onChange={e => setDraft(d => ({ ...d, lesiones: e.target.value }))} />
          <Input label="Patologías" value={draft.patologias} onChange={e => setDraft(d => ({ ...d, patologias: e.target.value }))} />
          <Input label="Limitaciones" value={draft.limitaciones} onChange={e => setDraft(d => ({ ...d, limitaciones: e.target.value }))} />
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Composición y disponibilidad</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Peso (kg)" type="number" min="0" value={draft.pesoKg} onChange={e => setDraft(d => ({ ...d, pesoKg: e.target.value }))} />
          <Input label="Altura (cm)" type="number" min="0" value={draft.alturaCm} onChange={e => setDraft(d => ({ ...d, alturaCm: e.target.value }))} />
          <Input label="Composición corporal" value={draft.composicionCorporal} onChange={e => setDraft(d => ({ ...d, composicionCorporal: e.target.value }))} />
          <Input label="Disponibilidad" value={draft.disponibilidad} onChange={e => setDraft(d => ({ ...d, disponibilidad: e.target.value }))} className="sm:col-span-2" />
          <Input label="Preferencias horarias" value={draft.preferenciasHorarias} onChange={e => setDraft(d => ({ ...d, preferenciasHorarias: e.target.value }))} />
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit"><Save size={16} /> Guardar cambios</Button>
        {savedMsg && <span className="text-green-400 text-sm font-bold">Guardado ✓</span>}
      </div>
    </form>
  );
};
