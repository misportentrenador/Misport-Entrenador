import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CalendarClock } from 'lucide-react';
import { useCRM } from '../../../modules/crm/context/CRMContext';
import { useMasterData } from '../../../modules/masterdata/context/MasterDataContext';
import { toISODate } from '../../../shared/lib/date';

/**
 * Seguimientos comerciales de hoy (Sprint 16) — dentro de "Mi jornada de
 * hoy". Reutiliza InfoComercial.update (Sprint 9), la misma función que ya
 * usa InfoComercialSection en la Ficha CRM: "Marcar contactado" vacía
 * proximaAccion/proximaAccionFecha y registra ultimoContacto; "Reprogramar"
 * solo cambia proximaAccionFecha. Ninguna regla nueva.
 */
export const SeguimientosDeHoyList: React.FC = () => {
  const { infoComercial } = useCRM();
  const { personas } = useMasterData();
  const [reprogramando, setReprogramando] = useState<string | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const todayISO = toISODate(new Date());

  const seguimientos = useMemo(
    () => infoComercial.items
      .filter(i => i.proximaAccionFecha && i.proximaAccion.trim() && i.proximaAccionFecha.slice(0, 10) <= todayISO)
      .sort((a, b) => (a.proximaAccionFecha ?? '').localeCompare(b.proximaAccionFecha ?? '')),
    [infoComercial.items, todayISO]
  );

  if (seguimientos.length === 0) return null;

  const marcarContactado = (id: string) => {
    infoComercial.update(id, { proximaAccion: '', proximaAccionFecha: null, ultimoContacto: new Date().toISOString() });
  };

  const confirmarReprogramar = (id: string) => {
    if (!nuevaFecha) return;
    infoComercial.update(id, { proximaAccionFecha: new Date(nuevaFecha).toISOString() });
    setReprogramando(null);
    setNuevaFecha('');
  };

  return (
    <div className="pt-3 border-t border-gray-800/70">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Seguimientos de hoy</h3>
      <div className="space-y-2">
        {seguimientos.map(s => {
          const persona = personas.items.find(p => p.id === s.personaId);
          return (
            <div key={s.id} className="bg-misportDark rounded-lg border border-gray-800 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <Link to={`/admin/crm/personas/${s.personaId}`} className="text-white font-medium hover:text-misportBlue truncate">{persona?.name ?? 'Persona desconocida'}</Link>
                <p className="text-xs text-gray-500 truncate">{s.proximaAccion}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {reprogramando === s.id ? (
                  <>
                    <input type="date" value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)}
                      className="bg-gray-900 border border-gray-700 text-white text-xs p-1.5 rounded-lg outline-none" />
                    <button onClick={() => confirmarReprogramar(s.id)} className="text-xs font-bold text-misportBlue hover:text-blue-400">Confirmar</button>
                    <button onClick={() => setReprogramando(null)} className="text-xs text-gray-500 hover:text-white">Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => marcarContactado(s.id)} className="flex items-center gap-1 text-xs font-bold text-green-400 hover:text-green-300">
                      <CheckCircle2 size={12} /> Marcar contactado
                    </button>
                    <button onClick={() => { setReprogramando(s.id); setNuevaFecha(s.proximaAccionFecha?.slice(0, 10) ?? todayISO); }} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white">
                      <CalendarClock size={12} /> Reprogramar
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
