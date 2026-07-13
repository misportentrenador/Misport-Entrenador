import React from 'react';
import { Link } from 'react-router-dom';
import { Contact, ArrowRight } from 'lucide-react';
import { useMasterData } from '../../masterdata/context/MasterDataContext';
import { useCRM } from '../context/CRMContext';
import { ROL_LABELS } from '../lib/labels';
import { Persona } from '../../masterdata/types';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Table, TableColumn } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';

/**
 * Entrada principal del CRM (Sprint 9) — entorno de trabajo diario para
 * personas, clientes, empresas y relaciones. Datos Maestros sigue
 * existiendo como módulo de administración técnica; el buscador y los
 * filtros reales de esta pantalla llegan en el Sprint 11.
 */
export const CRMPage: React.FC = () => {
  const { personas } = useMasterData();
  const { roles } = useCRM();

  const rolesDe = (personaId: string) => {
    const activos = roles.items.filter(r => r.personaId === personaId && r.isActive).map(r => ROL_LABELS[r.tipo]);
    return activos.length > 0 ? activos.join(', ') : '—';
  };

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

  return (
    <div className="space-y-6">
      <PageHeader title="CRM" subtitle="Gestión diaria de personas, clientes, empresas y relaciones" />

      {personas.loading || roles.loading ? (
        <div className="p-12 flex justify-center"><Spinner /></div>
      ) : personas.items.length === 0 ? (
        <EmptyState icon={Contact} message="Todavía no hay personas registradas. Dalas de alta desde Datos Maestros." />
      ) : (
        <Card className="overflow-hidden">
          <Table columns={columns} rows={personas.items} rowKey={p => p.id} />
        </Card>
      )}
    </div>
  );
};
