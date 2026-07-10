import React from 'react';

export type BadgeTone = 'success' | 'danger' | 'neutral' | 'info';

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-green-900/20 text-green-400 border-green-900/50',
  danger: 'bg-red-900/20 text-red-400 border-red-900/50',
  neutral: 'bg-gray-800 text-gray-400 border-gray-700',
  info: 'bg-blue-900/20 text-misportBlue border-blue-900/50',
};

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', children }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border whitespace-nowrap ${TONE_CLASSES[tone]}`}>
    {children}
  </span>
);
