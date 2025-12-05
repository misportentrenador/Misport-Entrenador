
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Center, Trainer, TrainingType, User, Reservation, ScheduleRule } from '../types';
import { MOCK_CENTERS, MOCK_TRAINING_TYPES, MOCK_TRAINERS, MOCK_CLIENT_USER, MOCK_ADMIN_USER, SCHEDULE_RULES } from '../constants';

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
  login: (email: string, password?: string) => boolean;
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

  // Initialize from LocalStorage
  useEffect(() => {
    console.log("App Initialized with MISPORT Data");
    const storedUser = localStorage.getItem('misport_user');
    if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Failed to parse user from local storage");
            localStorage.removeItem('misport_user');
        }
    }
  }, []);

  const login = (email: string, password?: string): boolean => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // 1. Check Admin Credentials
    if (normalizedEmail === MOCK_ADMIN_USER.email.toLowerCase() && password === 'Misport123!') {
        setUser(MOCK_ADMIN_USER);
        localStorage.setItem('misport_user', JSON.stringify(MOCK_ADMIN_USER));
        return true;
    } 
    
    // 2. Check Client Demo Credentials
    if (normalizedEmail === MOCK_CLIENT_USER.email.toLowerCase() && password === 'Cliente123!') {
        setUser(MOCK_CLIENT_USER);
        localStorage.setItem('misport_user', JSON.stringify(MOCK_CLIENT_USER));
        return true;
    }

    // 3. Fallback for testing (optional, remove in strict prod)
    // Only allows general format if strict mock creds aren't enforced for generic testing
    // For this request, we return false if not matching specific mocks above.
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('misport_user');
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
