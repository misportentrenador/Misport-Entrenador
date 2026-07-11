import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, Link2, Calendar, Receipt, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Sidebar, SidebarNavItem, SidebarComingSoonItem } from '../components/ui/Sidebar';
import { ADMIN_ROUTES } from '../app/routes';

const NAV_ITEMS: SidebarNavItem[] = ADMIN_ROUTES.filter(route => route.showInNav).map(route => ({
  to: `/admin/${route.path}`,
  label: route.label,
  icon: route.icon,
}));

const COMING_SOON: SidebarComingSoonItem[] = [
  { label: 'Asistente IA', icon: Sparkles },
  { label: 'Booksy', icon: Link2 },
  { label: 'Google Calendar', icon: Calendar },
  { label: 'Facturación avanzada', icon: Receipt },
];

export const AdminShell: React.FC = () => {
  const { user, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-misportBlack flex text-gray-200">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-gray-800 bg-misportDark">
        <Sidebar items={NAV_ITEMS} comingSoon={COMING_SOON} user={user} onLogout={logout} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-misportDark border-r border-gray-800">
            <Sidebar items={NAV_ITEMS} comingSoon={COMING_SOON} user={user} onLogout={logout} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-0 z-40 bg-misportBlack border-b border-gray-800 px-4 h-16 flex items-center justify-between">
          <Link to="/admin/inicio" className="flex items-center gap-2">
            <img src="/misport-logo.png" alt="MISPORT" className="h-8 w-auto object-contain" />
          </Link>
          <button onClick={() => setMobileOpen(true)} className="p-2 text-gray-300 hover:text-white" aria-label="Abrir menú">
            <Menu size={22} />
          </button>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
