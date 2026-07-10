import React from 'react';
import { LucideIcon } from 'lucide-react';

export type StatCardTone = 'blue' | 'orange' | 'green' | 'purple' | 'neutral';

const TONE_CLASSES: Record<StatCardTone, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-900/20', text: 'text-misportBlue' },
  orange: { bg: 'bg-orange-900/20', text: 'text-misportOrange' },
  green: { bg: 'bg-green-900/20', text: 'text-green-400' },
  purple: { bg: 'bg-purple-900/20', text: 'text-purple-400' },
  neutral: { bg: 'bg-gray-800', text: 'text-gray-300' },
};

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone?: StatCardTone;
  /** When provided, colors the value green/red by sign instead of using `tone` for the text color. */
  signed?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, tone = 'neutral', signed }) => {
  const t = TONE_CLASSES[tone];
  const valueColor = signed === undefined ? 'text-white' : signed < 0 ? 'text-red-400' : 'text-green-400';

  return (
    <div className="bg-misportDark p-6 rounded-xl shadow-lg border border-gray-800 flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">{label}</p>
        <p className={`text-3xl font-bold mt-2 truncate ${valueColor}`}>{value}</p>
      </div>
      <div className={`${t.bg} p-3 rounded-lg ${t.text} shrink-0`}><Icon size={24} /></div>
    </div>
  );
};
