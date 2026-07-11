import React from 'react';
import { LucideIcon, Home, Users, CalendarDays, ClipboardList, MapPin, UserCog, Euro, Sparkles } from 'lucide-react';
import { InicioPage } from '../pages/admin/InicioPage';
import { ClientesPage } from '../pages/admin/ClientesPage';
import { AgendaPage } from '../pages/admin/AgendaPage';
import { ReservasPage } from '../pages/admin/ReservasPage';
import { CentrosPage } from '../pages/admin/CentrosPage';
import { EntrenadoresPage } from '../pages/admin/EntrenadoresPage';
import { FinanzasPage } from '../pages/admin/FinanzasPage';
import { ProximamentePage } from '../pages/admin/ProximamentePage';

/**
 * Single source of truth for the admin section: both the router (App.tsx)
 * and the sidebar (AdminShell.tsx) read from this list, instead of each
 * keeping its own copy that can drift out of sync.
 */
export interface AdminRouteConfig {
  /** Path segment relative to /admin, e.g. "inicio" -> /admin/inicio */
  path: string;
  label: string;
  icon: LucideIcon;
  element: React.ReactNode;
  /** Whether this route gets an entry in the sidebar. */
  showInNav: boolean;
}

export const ADMIN_ROUTES: AdminRouteConfig[] = [
  { path: 'inicio', label: 'Inicio', icon: Home, element: <InicioPage />, showInNav: true },
  { path: 'clientes', label: 'Clientes', icon: Users, element: <ClientesPage />, showInNav: true },
  { path: 'agenda', label: 'Agenda', icon: CalendarDays, element: <AgendaPage />, showInNav: true },
  { path: 'reservas', label: 'Reservas', icon: ClipboardList, element: <ReservasPage />, showInNav: true },
  { path: 'centros', label: 'Centros', icon: MapPin, element: <CentrosPage />, showInNav: true },
  { path: 'entrenadores', label: 'Entrenadores', icon: UserCog, element: <EntrenadoresPage />, showInNav: true },
  { path: 'finanzas', label: 'Finanzas', icon: Euro, element: <FinanzasPage />, showInNav: true },
  { path: 'proximamente', label: 'Próximamente', icon: Sparkles, element: <ProximamentePage />, showInNav: false },
];
