
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Reservation, ScheduleRule } from '../types';
import { Center, Trainer, Service } from '../modules/catalog/types';
import { MOCK_ADMIN_USER, SCHEDULE_RULES } from '../constants';
import { STORAGE_KEYS } from '../config/storageKeys';
import { createEntityId } from '../core/data/entityId';
import { personasRepo } from '../modules/masterdata/data/repositories';
import { useCatalog } from '../modules/catalog/context/CatalogContext';

interface AppContextType {
  user: User | null;
  centers: Center[];
  trainingTypes: Service[];
  trainers: Trainer[];
  reservations: Reservation[];
  scheduleRules: ScheduleRule[];
  clients: User[];
  addReservation: (reservationData: Omit<Reservation, 'id' | 'createdAt' | 'status' | 'userName' | 'userEmail' | 'personaId'>) => Promise<void>;
  cancelReservation: (id: string) => void;
  completeReservation: (id: string) => void;
  getOccupancy: (centerId: string, serviceId: string, trainerId: string | null, date: string, time: string) => number;
  isAdmin: boolean;
  login: (email: string, password?: string) => { success: boolean; message?: string };
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Sourced from the Catálogo Maestro (Sprint 5) instead of a private mock copy.
  const { centers: catalogCenters, trainers: catalogTrainers, services: catalogServices } = useCatalog();
  const centers = catalogCenters.items;
  const trainingTypes = catalogServices.items;
  const trainers = catalogTrainers.items;
  const [scheduleRules] = useState<ScheduleRule[]>(SCHEDULE_RULES);
  
  // Dynamic data
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clients, setClients] = useState<User[]>([]);

  // Reads the registered clients from the "DB" (passwords stripped) so the
  // Admin > Clientes page always reflects who has registered.
  const loadClients = () => {
    const storedUsersString = localStorage.getItem(STORAGE_KEYS.registeredUsers);
    if (!storedUsersString) return;
    try {
        const users: (User & { password: string })[] = JSON.parse(storedUsersString);
        setClients(users.map(({ password, ...safeUser }) => safeUser));
    } catch (e) {
        console.error("Failed to load clients, initializing empty.");
        setClients([]);
    }
  };

  // Initialize Session and Data
  useEffect(() => {
    // 1. Load active session
    const sessionUser = localStorage.getItem(STORAGE_KEYS.session);
    if (sessionUser) {
        try {
            setUser(JSON.parse(sessionUser));
        } catch (e) {
            localStorage.removeItem(STORAGE_KEYS.session);
        }
    }

    // 2. Load reservations from localStorage (misport_reservas)
    const storedReservations = localStorage.getItem(STORAGE_KEYS.reservations);
    if (storedReservations) {
        try {
            setReservations(JSON.parse(storedReservations));
        } catch (e) {
            console.error("Failed to load reservations, initializing empty.");
            setReservations([]);
        }
    }

    // 3. Load registered clients
    loadClients();
  }, []);

  // Persist reservations whenever they change
  useEffect(() => {
    if (reservations.length > 0) {
        localStorage.setItem(STORAGE_KEYS.reservations, JSON.stringify(reservations));
    }
  }, [reservations]);

  // --- AUTH ACTIONS ---

  const login = (email: string, password?: string): { success: boolean; message?: string } => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // 1. Check Hardcoded Admin Credentials
    if (normalizedEmail === MOCK_ADMIN_USER.email.toLowerCase() && password === 'Misport123!') {
        setUser(MOCK_ADMIN_USER);
        localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(MOCK_ADMIN_USER));
        return { success: true };
    }

    // 2. Check LocalStorage Users (Clients)
    const storedUsersString = localStorage.getItem(STORAGE_KEYS.registeredUsers);
    if (storedUsersString) {
        const users: (User & { password: string })[] = JSON.parse(storedUsersString);
        const foundUser = users.find(u => u.email.toLowerCase() === normalizedEmail);

        if (foundUser) {
            if (foundUser.password === password) {
                // Remove password before setting state
                const { password: _, ...safeUser } = foundUser;
                setUser(safeUser);
                localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(safeUser));
                return { success: true };
            } else {
                return { success: false, message: 'Contraseña incorrecta.' };
            }
        }
    }

    return { success: false, message: 'Usuario no encontrado.' };
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists in DB
    const storedUsersString = localStorage.getItem(STORAGE_KEYS.registeredUsers);
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
    localStorage.setItem(STORAGE_KEYS.registeredUsers, JSON.stringify(users));
    loadClients();

    // Every registered client gets a linked Persona in Master Data (Sprint 4
    // bridge). Best-effort: a failure here must not block account creation.
    try {
        const now = new Date().toISOString();
        await personasRepo.create({
            id: createEntityId('per'),
            name,
            email: normalizedEmail,
            phone: '',
            docId: '',
            userId: newUser.id,
            notes: '',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });
    } catch (e) {
        console.error('Failed to create linked Persona for new user', e);
    }

    // Auto Login
    const { password: _, ...safeUser } = newUser;
    setUser(safeUser);
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(safeUser));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.session);
  };

  // --- RESERVATION ACTIONS ---

  const addReservation = async (reservationData: Omit<Reservation, 'id' | 'createdAt' | 'status' | 'userName' | 'userEmail' | 'personaId'>) => {
    if (!user) {
        console.error("Cannot add reservation without an authenticated session");
        return;
    }

    // Resolve the identity of the actual reservee (reservationData.userId) —
    // not necessarily the logged-in session. BookingWizard's self-service
    // flow always passes userId === user.id (zero behavior change there);
    // the CRM ficha (Sprint 10) can pass a different Persona's linked
    // userId to book on their behalf, reusing this same engine.
    let userName = user.name;
    let userEmail = user.email;
    if (reservationData.userId !== user.id) {
        try {
            const storedUsersString = localStorage.getItem(STORAGE_KEYS.registeredUsers);
            const users: User[] = storedUsersString ? JSON.parse(storedUsersString) : [];
            const targetUser = users.find(u => u.id === reservationData.userId);
            if (targetUser) {
                userName = targetUser.name;
                userEmail = targetUser.email;
            }
        } catch (e) {
            console.error('Failed to resolve target user for the reservation', e);
        }
    }

    // Link the reservation to the reservee's Master Data Persona, if one
    // exists. Best-effort: accounts registered before Sprint 4 have no
    // linked Persona.
    let personaId: string | null = null;
    try {
        const personas = await personasRepo.list();
        const linkedPersona = personas.find(p => p.userId === reservationData.userId);
        personaId = linkedPersona ? linkedPersona.id : null;
    } catch (e) {
        console.error('Failed to resolve linked Persona for reservation', e);
    }

    const newReservation: Reservation = {
      ...reservationData,
      id: `r_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userName,
      userEmail,
      personaId,
      createdAt: Date.now(),
      status: 'CONFIRMED'
    };

    // Simulate network delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setReservations(prev => {
        const updated = [...prev, newReservation];
        // Explicitly save to localStorage here as well to ensure sync
        localStorage.setItem(STORAGE_KEYS.reservations, JSON.stringify(updated));
        return updated;
    });
  };

  const cancelReservation = (id: string) => {
    setReservations(prev => {
        const updated = prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' as const } : r);
        localStorage.setItem(STORAGE_KEYS.reservations, JSON.stringify(updated));
        return updated;
    });
  };

  // Terminal, one-way transition (Sprint 7): solo una reserva CONFIRMED puede
  // completarse; una ya CANCELLED o COMPLETED se ignora sin efecto.
  const completeReservation = (id: string) => {
    setReservations(prev => {
        const updated = prev.map(r => r.id === id && r.status === 'CONFIRMED' ? { ...r, status: 'COMPLETED' as const } : r);
        localStorage.setItem(STORAGE_KEYS.reservations, JSON.stringify(updated));
        return updated;
    });
  };

  // --- OCCUPANCY HELPER ---
  const getOccupancy = (centerId: string, serviceId: string, trainerId: string | null, date: string, time: string): number => {
      // 1. Base filter: Active reservations at this center, date, time
      let relevantReservations = reservations.filter(r => 
          r.status === 'CONFIRMED' &&
          r.centerId === centerId &&
          r.date === date &&
          r.startTime === time
      );

      // 2. Trainer Logic
      if (trainerId) {
          // If a specific trainer is selected, count reservations for that trainer.
          // (Usually for Personal Training, capacity is 1)
          relevantReservations = relevantReservations.filter(r => r.trainerId === trainerId);
      } else {
          // If no trainer (Group Training), count reservations for that specific service type.
          relevantReservations = relevantReservations.filter(r => r.serviceId === serviceId);
      }

      return relevantReservations.length;
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
      clients,
      addReservation,
      cancelReservation,
      completeReservation,
      getOccupancy,
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
