
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Center, Trainer, TrainingType, User, Reservation, ScheduleRule } from '../types';
import { MOCK_CENTERS, MOCK_TRAINING_TYPES, MOCK_TRAINERS, MOCK_ADMIN_USER, SCHEDULE_RULES } from '../constants';

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
  login: (email: string, password?: string) => { success: boolean; message?: string };
  register: (name: string, email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Static data
  const [centers] = useState<Center[]>(MOCK_CENTERS);
  const [trainingTypes] = useState<TrainingType[]>(MOCK_TRAINING_TYPES);
  const [trainers] = useState<Trainer[]>(MOCK_TRAINERS);
  const [scheduleRules] = useState<ScheduleRule[]>(SCHEDULE_RULES);
  
  // Dynamic data
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Initialize Session
  useEffect(() => {
    // 1. Load active session
    const sessionUser = localStorage.getItem('misport_session');
    if (sessionUser) {
        try {
            setUser(JSON.parse(sessionUser));
        } catch (e) {
            localStorage.removeItem('misport_session');
        }
    }

    // 2. Load reservations (simulating DB persistence)
    const storedReservations = localStorage.getItem('misport_reservations');
    if (storedReservations) {
        try {
            setReservations(JSON.parse(storedReservations));
        } catch (e) {
            console.error("Failed to load reservations");
        }
    }
  }, []);

  // Save reservations on change
  useEffect(() => {
    localStorage.setItem('misport_reservations', JSON.stringify(reservations));
  }, [reservations]);

  // --- AUTH ACTIONS ---

  const login = (email: string, password?: string): { success: boolean; message?: string } => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // 1. Check Hardcoded Admin Credentials
    if (normalizedEmail === MOCK_ADMIN_USER.email.toLowerCase() && password === 'Misport123!') {
        setUser(MOCK_ADMIN_USER);
        localStorage.setItem('misport_session', JSON.stringify(MOCK_ADMIN_USER));
        return { success: true };
    } 

    // 2. Check LocalStorage Users (Clients)
    const storedUsersString = localStorage.getItem('misport_db_users');
    if (storedUsersString) {
        const users: (User & { password: string })[] = JSON.parse(storedUsersString);
        const foundUser = users.find(u => u.email.toLowerCase() === normalizedEmail);

        if (foundUser) {
            if (foundUser.password === password) {
                // Remove password before setting state
                const { password: _, ...safeUser } = foundUser; 
                setUser(safeUser);
                localStorage.setItem('misport_session', JSON.stringify(safeUser));
                return { success: true };
            } else {
                return { success: false, message: 'Contraseña incorrecta.' };
            }
        }
    }

    return { success: false, message: 'Usuario no encontrado.' };
  };

  const register = (name: string, email: string, password: string): { success: boolean; message?: string } => {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists in DB
    const storedUsersString = localStorage.getItem('misport_db_users');
    let users: (User & { password: string })[] = storedUsersString ? JSON.parse(storedUsersString) : [];

    if (users.some(u => u.email.toLowerCase() === normalizedEmail) || normalizedEmail === MOCK_ADMIN_USER.email.toLowerCase()) {
        return { success: false, message: 'Este correo electrónico ya está registrado.' };
    }

    // Create new user
    const newUser: User & { password: string } = {
        id: `u_${Date.now()}`,
        name,
        email: normalizedEmail,
        phone: '', // Optional in register form for now
        role: 'CLIENT',
        password // Storing plaintext for demo requirements (In prod use hashing)
    };

    // Save to "DB"
    users.push(newUser);
    localStorage.setItem('misport_db_users', JSON.stringify(users));

    // Auto Login
    const { password: _, ...safeUser } = newUser;
    setUser(safeUser);
    localStorage.setItem('misport_session', JSON.stringify(safeUser));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('misport_session');
  };

  // --- RESERVATION ACTIONS ---

  const addReservation = async (data: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => {
    const newReservation: Reservation = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      status: 'CONFIRMED'
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
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
      register,
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
