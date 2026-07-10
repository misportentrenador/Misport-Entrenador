import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-gray-800 pb-6 mb-8">
    <div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">{actions}</div>}
  </header>
);
