import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X, LucideIcon } from 'lucide-react';
import { useNotify, NotificationTone } from './NotificationContext';

const TONE_STYLES: Record<NotificationTone, { icon: LucideIcon; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'border-green-900/50 bg-green-950/90 text-green-300' },
  error: { icon: AlertTriangle, classes: 'border-red-900/50 bg-red-950/90 text-red-300' },
  info: { icon: Info, classes: 'border-blue-900/50 bg-blue-950/90 text-blue-200' },
};

/** Renders whatever `useNotify().notify(...)` has queued, anywhere in the app. */
export const ToastViewport: React.FC = () => {
  const { notifications, dismiss } = useNotify();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      {notifications.map(n => {
        const tone = TONE_STYLES[n.tone];
        const Icon = tone.icon;
        return (
          <div key={n.id} className={`flex items-start gap-3 border rounded-lg p-3.5 shadow-lg backdrop-blur pointer-events-auto ${tone.classes}`}>
            <Icon size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm flex-1">{n.message}</p>
            <button onClick={() => dismiss(n.id)} className="opacity-60 hover:opacity-100 shrink-0" aria-label="Cerrar notificación">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
