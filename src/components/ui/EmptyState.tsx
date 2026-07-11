import React from 'react';
import { Inbox, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon = Inbox, message, action }) => (
  <div className="text-center p-12 text-gray-600">
    <Icon className="mx-auto mb-3 opacity-20" size={40} />
    <p>{message}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);
