import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Contact, ArrowRight } from 'lucide-react';
import { useMasterData } from '../../masterdata/context/MasterDataContext';
import { useApp } from '../../../context/AppContext';
import { useCRM } from '../context/CRMContext';
import { useFinance, personaTieneDeuda } from '../../../context/FinanceContext';
import { ROL_LABELS } from '../lib/labels';
import { Persona } from '../../masterdata/types';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Table, TableColumn } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { PersonaSearchBar } from './PersonaSearchBar';
import { PersonaFilters, PersonaFilterId, FILTER_ORDER } from './PersonaFilters';

/**
 * Entrada principal del CRM (Sprints 9 y 12) — entorno de trabajo diario
 * para personas, clientes, empresas y relaciones. Datos Maestros sigue
 * existiendo como módulo de administración técnica. Buscador y filtros
 * resuelven todo en memoria sobre datos ya cargados de los demás módulos
 * — ningún índice ni dato nuevo se persiste.
 */
export const CRMPage: React.FC = () => {
  const { personas, contactos, organizaciones } = useMasterData();
  const { reservations, trainers, centers, trainingTypes } = useApp();
  const { roles, bonosCliente, perfilesDeportivos } = useCRM();
  const { facturas, cobros } = useFinance();

  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<PersonaFilterId>>(() => {
    // Permite enlazar directamente a un filtro (p. ej. "Cobros pendientes"
    // del Dashboard, Sprint 20) vía /admin/crm?filtro=con_deuda.
    const requested = searchParams.get('filtro');
    return requested && (FILTER_ORDER as string[]).includes(requested)
      ? new Set([requested as PersonaFilterId])
      : new Set();
  });

  const toggleFilter = (id: PersonaFilterId) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const rolesDe = (personaId: string) => {
    const activos = roles.items.filter(r => r.personaId === personaId && r.isActive).map(r => ROL_LABELS[r.tipo]);
    return activos.length > 0 ? activos.join(', ') : '—';
  };

  const matchesSearch = (p: Persona): boolean => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    if (p.name.toLowerCase().includes(q)) return true;
    if (p.email?.toLowerCase().includes(q)) return true;
    if (p.phone?.toLowerCase().includes(q)) return true;
    if ((p.tags ?? []).some(t => t.toLowerCase().includes(q))) return true;
    if ((p.isActive ? 'activa' : 'inactiva').includes(q)) return true;

    const empresasDe = contactos.items
      .filter(c => c.personaId === p.id)
      .map(c => organizaciones.items.find(o => o.id === c.organizacionId)?.name ?? '');
    if (empresasDe.some(name => name.toLowerCase().includes(q))) return true;

    const misReservas = reservations.filter(r => r.personaId === p.id);
    if (misReservas.some(r => (trainers.find(t => t.id === r.trainerId)?.name ?? '').toLowerCase().includes(q))) return true;
    if (misReservas.some(r => (centers.find(c => c.id === r.centerId)?.name ?? '').toLowerCase().includes(q))) return true;

    const perfil = perfilesDeportivos.items.find(pd => pd.personaId === p.id);
    const serviceIds = [...misReservas.map(r => r.serviceId), ...(perfil?.modalidades ?? [])];
    if (serviceIds.some(sid => (trainingTypes.find(s => s.id === sid)?.name ?? '').toLowerCase().includes(q))) return true;

    return false;
  };

  const matchesFilters = (p: Persona): boolean => {
    for (const f of activeFilters) {
      switch (f) {
        case 'activos':
          if (!p.isActive) return false;
          break;
        case 'inactivos':
          if (p.isActive) return false;
          break;
        case 'sin_reservas':
          if (reservations.some(r => r.personaId === p.id)) return false;
          break;
        case 'con_bono':
          if (!bonosCliente.items.some(b => b.personaId === p.id && b.status === 'active')) return false;
          break;
        case 'sin_bono':
          if (bonosCliente.items.some(b => b.personaId === p.id && b.status === 'active')) return false;
          break;
        case 'ems':
          if (!roles.items.some(r => r.personaId === p.id && r.isActive && r.tipo === 'cliente_ems')) return false;
          break;
        case 'trail':
          if (!roles.items.some(r => r.personaId === p.id && r.isActive && r.tipo === 'cliente_trail')) return false;
          break;
        case 'empresas':
          if (!roles.items.some(r => r.personaId === p.id && r.isActive && r.tipo === 'cliente_empresa')) return false;
          break;
        case 'activa50':
          if (!roles.items.some(r => r.personaId === p.id && r.isActive && r.tipo === 'activa50')) return false;
          break;
        case 'con_deuda':
          if (!personaTieneDeuda(p.id, facturas, cobros)) return false;
          break;
      }
    }
    return true;
  };

  const filteredPersonas = useMemo(
    () => personas.items.filter(p => matchesSearch(p) && matchesFilters(p)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [personas.items, query, activeFilters, contactos.items, organizaciones.items, reservations, trainers, centers, trainingTypes, perfilesDeportivos.items, bonosCliente.items, roles.items, facturas, cobros]
  );

  const columns: TableColumn<Persona>[] = [
    { key: 'name', header: 'Nombre', render: p => <span className="text-white font-medium">{p.name}</span> },
    { key: 'email', header: 'Email', render: p => p.email || '—' },
    { key: 'phone', header: 'Teléfono', render: p => p.phone || '—' },
    { key: 'roles', header: 'Roles', render: p => rolesDe(p.id) },
    { key: 'status', header: 'Estado', render: p => <Badge tone={p.isActive ? 'success' : 'neutral'}>{p.isActive ? 'Activa' : 'Inactiva'}</Badge> },
    {
      key: 'actions', header: '', align: 'right', render: p => (
        <Link to={`/admin/crm/personas/${p.id}`}>
          <Button variant="ghost">Abrir ficha <ArrowRight size={14} /></Button>
        </Link>
      ),
    },
  ];

  const loading = personas.loading || roles.loading || bonosCliente.loading || perfilesDeportivos.loading || contactos.loading || organizaciones.loading;

  return (
    <div className="space-y-6">
      <PageHeader title="CRM" subtitle="Gestión diaria de personas, clientes, empresas y relaciones" />

      {loading ? (
        <div className="p-12 flex justify-center"><Spinner /></div>
      ) : personas.items.length === 0 ? (
        <EmptyState icon={Contact} message="Todavía no hay personas registradas. Dalas de alta desde Datos Maestros." />
      ) : (
        <>
          <div className="space-y-3">
            <PersonaSearchBar value={query} onChange={setQuery} />
            <PersonaFilters active={activeFilters} onToggle={toggleFilter} />
          </div>

          {filteredPersonas.length === 0 ? (
            <EmptyState icon={Contact} message="Ninguna persona coincide con la búsqueda o los filtros aplicados." />
          ) : (
            <Card className="overflow-hidden">
              <Table columns={columns} rows={filteredPersonas} rowKey={p => p.id} />
            </Card>
          )}
        </>
      )}
    </div>
  );
};
