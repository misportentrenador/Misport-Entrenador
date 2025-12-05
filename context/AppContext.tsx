
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Center, Trainer, TrainingType, User, Reservation, ScheduleRule } from '../types';
import { MOCK_CENTERS, MOCK_TRAINING_TYPES, MOCK_TRAINERS, CURRENT_USER, MOCK_ADMIN, SCHEDULE_RULES } from '../constants';

interface AppContextType {
  user: User | null;
  centers: Center[];
  trainingTypes: TrainingType[];
  trainers: Trainer[];
  reservations: Reservation[];
  scheduleRules: ScheduleRule[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  cancelReservation: (id: string) => void;
  isAdmin: boolean;
  login: (email: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [centers] = useState<Center[]>(MOCK_CENTERS);
  const [trainingTypes] = useState<TrainingType[]>(MOCK_TRAINING_TYPES);
  const [trainers] = useState<Trainer[]>(MOCK_TRAINERS);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [scheduleRules] = useState<ScheduleRule[]>(SCHEDULE_RULES);

  // Simulate loading initial data or local storage
  useEffect(() => {
    // In a real app, fetch from API
    console.log("App Initialized with MISPORT Data");
  }, []);

  const login = (email: string): boolean => {
    // Simulate Login Check
    if (email.toLowerCase() === MOCK_ADMIN.email.toLowerCase()) {
      setUser(MOCK_ADMIN);
      return true;
    } else if (email.includes('@')) {
      // Allow any other email as client for demo purposes
      setUser({ ...CURRENT_USER, email: email, name: email.split('@')[0] });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const addReservation = async (data: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => {
    const newReservation: Reservation = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      status: 'CONFIRMED'
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setReservations(prev => [...prev, newReservation]);
  };

  const cancelReservation = (id: string) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r));
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AppContext.Provider value={{
      user,
      centers,
      trainingTypes,
      trainers,
      reservations,
      scheduleRules,
      addReservation,
      cancelReservation,
      isAdmin,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
