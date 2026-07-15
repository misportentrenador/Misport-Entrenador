import React, { Suspense } from 'react';
import { LucideIcon, Home, Users, CalendarDays, ClipboardList, MapPin, UserCog, Euro, Sparkles, Layers, Database, IdCard } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';

/**
 * Cada página admin se carga bajo demanda (Sprint técnico de rendimiento)
 * en lugar de empaquetarse toda en el bundle inicial — reduce el peso de
 * carga sin cambiar ningún comportamiento: mismas rutas, mismos
 * componentes, solo su momento de descarga cambia.
 */
const InicioPage = React.lazy(() => import('../pages/admin/InicioPage').then(m => ({ default: m.InicioPage })));
const ClientesPage = React.lazy(() => import('../pages/admin/ClientesPage').then(m => ({ default: m.ClientesPage })));
const AgendaPage = React.lazy(() => import('../pages/admin/AgendaPage').then(m => ({ default: m.AgendaPage })));
const ReservasPage = React.lazy(() => import('../pages/admin/ReservasPage').then(m => ({ default: m.ReservasPage })));
const CentrosPage = React.lazy(() => import('../pages/admin/CentrosPage').then(m => ({ default: m.CentrosPage })));
const EntrenadoresPage = React.lazy(() => import('../pages/admin/EntrenadoresPage').then(m => ({ default: m.EntrenadoresPage })));
const FinanzasPage = React.lazy(() => import('../pages/admin/FinanzasPage').then(m => ({ default: m.FinanzasPage })));
const ProximamentePage = React.lazy(() => import('../pages/admin/ProximamentePage').then(m => ({ default: m.ProximamentePage })));
const CatalogoPage = React.lazy(() => import('../modules/catalog/pages/CatalogoPage').then(m => ({ default: m.CatalogoPage })));
const DatosMaestrosPage = React.lazy(() => import('../modules/masterdata/pages/DatosMaestrosPage').then(m => ({ default: m.DatosMaestrosPage })));
const CRMPage = React.lazy(() => import('../modules/crm/pages/CRMPage').then(m => ({ default: m.CRMPage })));
const FichaPersonaPage = React.lazy(() => import('../modules/crm/pages/FichaPersonaPage').then(m => ({ default: m.FichaPersonaPage })));

const PageFallback: React.FC = () => (
  <div className="flex items-center justify-center py-24">
    <Spinner size={28} />
  </div>
);

const lazyPage = (Component: React.LazyExoticComponent<React.FC>): React.ReactNode => (
  <Suspense fallback={<PageFallback />}>
    <Component />
  </Suspense>
);

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
  { path: 'inicio', label: 'Inicio', icon: Home, element: lazyPage(InicioPage), showInNav: true },
  { path: 'crm', label: 'CRM', icon: IdCard, element: lazyPage(CRMPage), showInNav: true },
  { path: 'crm/personas/:personaId', label: 'Ficha CRM', icon: IdCard, element: lazyPage(FichaPersonaPage), showInNav: false },
  { path: 'clientes', label: 'Clientes', icon: Users, element: lazyPage(ClientesPage), showInNav: true },
  { path: 'agenda', label: 'Agenda', icon: CalendarDays, element: lazyPage(AgendaPage), showInNav: true },
  { path: 'reservas', label: 'Reservas', icon: ClipboardList, element: lazyPage(ReservasPage), showInNav: true },
  { path: 'catalogo', label: 'Catálogo', icon: Layers, element: lazyPage(CatalogoPage), showInNav: true },
  { path: 'datos-maestros', label: 'Datos Maestros', icon: Database, element: lazyPage(DatosMaestrosPage), showInNav: true },
  { path: 'centros', label: 'Centros', icon: MapPin, element: lazyPage(CentrosPage), showInNav: true },
  { path: 'entrenadores', label: 'Entrenadores', icon: UserCog, element: lazyPage(EntrenadoresPage), showInNav: true },
  { path: 'finanzas', label: 'Finanzas', icon: Euro, element: lazyPage(FinanzasPage), showInNav: true },
  { path: 'proximamente', label: 'Próximamente', icon: Sparkles, element: lazyPage(ProximamentePage), showInNav: false },
];
