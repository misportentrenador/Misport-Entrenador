import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { useAgendaConfig } from '../../../context/AgendaConfigContext';

const inputCls = 'bg-misportDark border border-gray-700 text-white p-2 rounded-lg w-24 text-sm focus:border-misportBlue focus:ring-1 focus:ring-misportBlue outline-none';
const labelCls = 'text-xs text-gray-400';

export const AgendaConfigForm: React.FC = () => {
  const { config, updateConfig } = useAgendaConfig();
  const [open, setOpen] = useState(false);

  return (
    <div className="text-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs font-bold transition-colors"
      >
        <Settings size={14} /> Configurar avisos
      </button>
      {open && (
        <div className="mt-3 p-4 bg-gray-900/50 border border-gray-800 rounded-lg flex flex-col gap-3">
          <label className="flex items-center justify-between gap-3">
            <span className={labelCls}>Avisar de bonos que caducan en los próximos (días)</span>
            <input
              type="number" min="0" step="1" className={inputCls}
              value={config.diasAvisoBonoPorCaducar}
              onChange={(e) => updateConfig({ ...config, diasAvisoBonoPorCaducar: Number(e.target.value) })}
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className={labelCls}>Avisar de sesiones sin entrenador asignado</span>
            <input
              type="checkbox" className="w-4 h-4"
              checked={config.avisarSesionesSinEntrenador}
              onChange={(e) => updateConfig({ ...config, avisarSesionesSinEntrenador: e.target.checked })}
            />
          </label>
        </div>
      )}
    </div>
  );
};
