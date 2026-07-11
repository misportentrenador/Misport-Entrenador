import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type NotificationTone = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  tone: NotificationTone;
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  notify: (message: string, tone?: NotificationTone) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const AUTO_DISMISS_MS = 4000;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback((message: string, tone: NotificationTone = 'info') => {
    const id = `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setNotifications(prev => [...prev, { id, tone, message }]);
    setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
  }, [dismiss]);

  // Memoized so consumers only re-render when notifications actually change,
  // not on every render of whatever ancestor re-renders NotificationProvider.
  const value = useMemo(() => ({ notifications, notify, dismiss }), [notifications, notify, dismiss]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotify = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotify must be used within a NotificationProvider');
  }
  return context;
};
