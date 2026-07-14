import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Búsqueda instantánea (Sprint 12): nombre, correo, teléfono, empresa,
 * etiquetas, entrenador, servicio, centro y estado — todo resuelto en
 * memoria por CRMPage, sin un índice nuevo.
 */
export const PersonaSearchBar: React.FC<Props> = ({ value, onChange }) => (
  <div className="relative">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Buscar por nombre, correo, teléfono, empresa, etiqueta, entrenador, servicio, centro o estado..."
      className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-misportBlue focus:border-transparent outline-none transition-all text-sm"
    />
  </div>
);
