
export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface Center {
  id: string;
  name: string;
  address: string;
  description: string;
  isActive: boolean;
  image: string;
}

export interface TrainingType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  capacity: number;
  requiresTrainer: boolean;
  price: number;
}

export interface Trainer {
  id: string;
  name: string;
  centerIds: string[]; // Centers where they work
  specialties: string[]; // Training Type IDs they can teach
  isActive: boolean;
  avatar: string;
}

export type ReservationStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Reservation {
  id: string;
  userId: string;
  userName: string; // Added for easier Admin display
  userEmail: string; // Added for easier Admin display
  centerId: string;
  serviceId: string;
  personaId: string | null; // Linked Master Data Persona, if the account has one (Sprint 5)
  trainerId?: string; // Optional if training doesn't require specific trainer
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: ReservationStatus;
  createdAt: number;
}

// Configuration for complex schedules
export interface ScheduleRule {
  centerId: string;
  serviceId: string;
  trainerId?: string; // If undefined/null, applies to the service in general (e.g. Group classes)
  daysOfWeek: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  ranges: { start: string; end: string }[]; // HH:mm format
}

// Flow state for the booking wizard
export interface BookingState {
  step: number;
  centerId: string | null;
  serviceId: string | null;
  trainerId: string | null;
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string | null; // HH:mm
}

// --- FINANCE MODULE (Panel de control económico) ---

export type FinanceServiceName = 'Electroestimulación' | 'Entrenamiento online' | 'Entrenamiento grupal';

export interface ServiceRate {
  price: number;
  trainerPay: number;
  centerPay: number;
}

export interface GroupRate extends ServiceRate {
  days: 1 | 2 | 3;
}

// Fixed/editable parameters, equivalent to the "Modelo" sheet
export interface FinanceParams {
  igic: number; // e.g. 0.07
  profitTax: number; // e.g. 0.2
  electro: ServiceRate;
  online: ServiceRate;
  group: GroupRate[]; // rates by days/week, indexed by `days`
}

// A logged block of sessions, equivalent to one row in the "Registro" sheet
export interface FinanceEntry {
  id: string;
  date: string; // YYYY-MM-DD
  trainerName: string;
  centerName: string;
  service: FinanceServiceName;
  groupDays?: 1 | 2 | 3; // only for 'Entrenamiento grupal'
  quantity: number;
  manualPrice?: number;
  manualTrainerPay?: number;
  manualCenterPay?: number;
  notes?: string;
  createdAt: number;
}

// Computed totals for a single FinanceEntry
export interface FinanceEntryTotals {
  unitPrice: number;
  unitTrainerPay: number;
  unitCenterPay: number;
  billingBase: number;
  trainerTotal: number;
  centerTotal: number;
  margin: number;
  igicAmount: number;
  profitTaxAmount: number;
  netProfit: number;
  totalCharged: number;
}
