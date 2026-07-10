import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { FinancePanel } from '../../components/FinancePanel';

export const FinanzasPage: React.FC = () => (
  <div className="space-y-8 animate-fade-in">
    <PageHeader title="Finanzas" subtitle="Modelo económico, registro de sesiones y resumen" />
    <FinancePanel />
  </div>
);
