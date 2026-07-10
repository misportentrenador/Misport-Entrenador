import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon, LogOut } from 'lucide-react';
import { Badge } from './Badge';
import { User } from '../../types';

export interface SidebarNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export interface SidebarComingSoonItem {
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarNavItem[];
  comingSoon?: SidebarComingSoonItem[];
  user: User | null;
  onLogout: () => void;
  /** Called after a nav link is clicked — used to close the mobile drawer. */
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, comingSoon = [], user, onLogout, onNavigate }) => (
  <div className="flex flex-col h-full">
    <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-800 shrink-0">
      <img src="/misport-logo.png" alt="MISPORT" className="h-9 w-auto object-contain" />
      <div className="leading-tight">
        <p className="font-bold text-white text-sm">MISPORT</p>
        <p className="text-gray-500 text-xs">OS</p>
      </div>
    </div>

    <nav className="flex-1 overflow-y-auto py-4 px-3">
      <div className="space-y-1">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-900/20 text-misportBlue' : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </div>

      {comingSoon.length > 0 && (
        <div className="pt-4 mt-4 border-t border-gray-800">
          <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-600">Próximamente</p>
          <div className="space-y-1">
            {comingSoon.map(item => (
              <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 cursor-not-allowed select-none">
                <item.icon size={18} />
                <span className="flex-1">{item.label}</span>
                <Badge tone="neutral">Pronto</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>

    <div className="border-t border-gray-800 p-4 flex items-center gap-3 shrink-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{user?.name}</p>
        <p className="text-xs text-gray-500">Administrador</p>
      </div>
      <button onClick={onLogout} title="Salir" className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-900 shrink-0">
        <LogOut size={16} />
      </button>
    </div>
  </div>
);
