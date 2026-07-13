import React, { useState, useEffect } from 'react';
import { Save, ShieldAlert } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Spinner } from '../../../../components/ui/Spinner';

interface Props {
  personaId: string;
}

type Draft = {
  contraindicacionesEMS: string; consentimientos: string;
  documentacionFirmada: string; informes: string;
  alergias: string; medicacion: string; observacionesMedicas: string;
};

const EMPTY_DRAFT: Draft = {
  contraindicacionesEMS: '', consentimientos: '', documentacionFirmada: '', informes: '',
  alergias: '', medicacion: '', observacionesMedicas: '',
};

const toLines = (text: string): string[] => text.split('\n').map(l => l.trim()).filter(Boolean);

/**
 * Perfil sanitario — entidad 1:1 opcional del CRM (Sprint 8/9), aislada de
 * PerfilDeportivo por su sensibilidad. Estructura preparada; sin control de
 * acceso real todavía (can() es una puerta de UI, no seguridad — mismo
 * aviso vigente desde Identity).
 */
export const PerfilSanitarioSection: React.FC<Props> = ({ personaId }) => {
  const { perfilesSanitarios } = useCRM();
  const existing = perfilesSanitarios.items.find(p => p.personaId === personaId);

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    setDraft(existing ? {
      contraindicacionesEMS: existing.contraindicacionesEMS,
      consentimientos: existing.consentimientos,
      documentacionFirmada: existing.documentacionFirmada.join('\n'),
      informes: existing.informes.join('\n'),
      alergias: existing.alergias,
      medicacion: existing.medicacion,
      observacionesMedicas: existing.observacionesMedicas,
    } : EMPTY_DRAFT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const patch = {
      contraindicacionesEMS: draft.contraindicacionesEMS,
      consentimientos: draft.consentimientos,
      documentacionFirmada: toLines(draft.documentacionFirmada),
      informes: toLines(draft.informes),
      alergias: draft.alergias,
      medicacion: draft.medicacion,
      observacionesMedicas: draft.observacionesMedicas,
    };
    if (existing) {
      await perfilesSanitarios.update(existing.id, patch);
    } else {
      await perfilesSanitarios.create({ personaId, ...patch });
    }
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  if (perfilesSanitarios.loading) return <div className="p-12 flex justify-center"><Spinner /></div>;

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-amber-950/20 border border-amber-900/40 rounded-lg text-amber-200 text-sm">
        <ShieldAlert size={18} className="shrink-0 mt-0.5" />
        <p>Información sanitaria sensible. Recuerda: <code className="bg-black/20 px-1 rounded">can()</code> solo controla qué se muestra en pantalla, no es seguridad real todavía — no introduzcas datos que no debas guardar sin un backend con control de acceso.</p>
      </div>

      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Contraindicaciones EMS" value={draft.contraindicacionesEMS} onChange={e => setDraft(d => ({ ...d, contraindicacionesEMS: e.target.value }))} />
          <Input label="Consentimientos" value={draft.consentimientos} onChange={e => setDraft(d => ({ ...d, consentimientos: e.target.value }))} />
          <Input label="Alergias" value={draft.alergias} onChange={e => setDraft(d => ({ ...d, alergias: e.target.value }))} />
          <Input label="Medicación" value={draft.medicacion} onChange={e => setDraft(d => ({ ...d, medicacion: e.target.value }))} />
        </div>
        <Input label="Observaciones médicas" value={draft.observacionesMedicas} onChange={e => setDraft(d => ({ ...d, observacionesMedicas: e.target.value }))} />
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Documentación (una referencia por línea)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Documentación firmada</label>
            <textarea
              value={draft.documentacionFirmada}
              onChange={e => setDraft(d => ({ ...d, documentacionFirmada: e.target.value }))}
              rows={4}
              className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-misportBlue focus:border-transparent outline-none transition-all text-sm"
              placeholder="consentimiento_ems_2026.pdf"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Informes</label>
            <textarea
              value={draft.informes}
              onChange={e => setDraft(d => ({ ...d, informes: e.target.value }))}
              rows={4}
              className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-misportBlue focus:border-transparent outline-none transition-all text-sm"
              placeholder="informe_cardiologico_2026.pdf"
            />
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit"><Save size={16} /> Guardar cambios</Button>
        {savedMsg && <span className="text-green-400 text-sm font-bold">Guardado ✓</span>}
      </div>
    </form>
  );
};
