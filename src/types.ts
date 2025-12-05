
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
  centerId: string;
  trainingTypeId: string;
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
  trainingTypeId: string;
  trainerId?: string; // If undefined/null, applies to the service in general (e.g. Group classes)
  daysOfWeek: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  ranges: { start: string; end: string }[]; // HH:mm format
}

// Flow state for the booking wizard
export interface BookingState {
  step: number;
  centerId: string | null;
  trainingTypeId: string | null;
  trainerId: string | null;
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string | null; // HH:mm
}