
import { Center, Trainer, TrainingType, User, ScheduleRule } from "./types";

// --- 1. CENTROS ---
export const MOCK_CENTERS: Center[] = [
  {
    id: 'c_cowork',
    name: 'COWORKGYM',
    address: 'Calle Luis Doreste Silva, 107',
    description: 'Espacio multifuncional con tecnología avanzada.',
    isActive: true,
    // Modern minimalist gym, soft lighting
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'c_bodyplay',
    name: 'BODYPLAY',
    address: 'Arucas',
    description: 'Centro funcional amplio para tu mejor versión.',
    isActive: true,
    // Functional wide space
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'c_cda',
    name: 'CDA',
    address: 'Arucas',
    description: 'Sala moderna con equipamiento premium.',
    isActive: true,
    // Modern equipment, dark tones
    image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'c_nucleo',
    name: 'NÚCLEO',
    address: 'Av. Alcalde José Ramirez Bethencourt, 13',
    description: 'Especialistas en electroestimulación.',
    isActive: true,
    // Clean, tech, bright
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'c_matula',
    name: 'CENTRO MISPORT',
    address: 'La Matula 3B',
    description: 'Gimnasio boutique elegante.',
    isActive: true,
    // Boutique, elegant lines
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800&auto=format&fit=crop',
  }
];

// --- 2. TIPOS DE ENTRENAMIENTO ---
export const MOCK_TRAINING_TYPES: TrainingType[] = [
  {
    id: 't_group',
    name: 'Entrenamiento grupal',
    description: 'Sesiones dinámicas en grupo.',
    durationMinutes: 60,
    capacity: 10,
    requiresTrainer: false, // "Indiferente" logic handled in Wizard
    price: 15
  },
  {
    id: 't_personal',
    name: 'Entrenamiento personal',
    description: 'Atención 100% personalizada para tus objetivos.',
    durationMinutes: 60,
    capacity: 1, // Or 2 as per config, but logic usually checks count < capacity
    requiresTrainer: true,
    price: 40
  },
  {
    id: 't_electro',
    name: 'Electroestimulación',
    description: 'Tecnología EMS para máxima eficiencia en 30 min.',
    durationMinutes: 30,
    capacity: 1,
    requiresTrainer: true,
    price: 35
  }
];

// --- 3. ENTRENADORES ---
// Using dark/silhouette style images.
export const MOCK_TRAINERS: Trainer[] = [
  {
    id: 'tr_misael',
    name: 'Misael',
    centerIds: ['c_cowork', 'c_nucleo'],
    specialties: ['t_electro'],
    isActive: true,
    // Arms crossed, standing, dark
    avatar: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'tr_ruben',
    name: 'Rubén',
    centerIds: ['c_cowork', 'c_matula'],
    specialties: ['t_electro', 't_personal', 't_group'],
    isActive: true,
    // Neutral pose, stylized
    avatar: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'tr_hugo',
    name: 'Hugo',
    centerIds: ['c_cowork', 'c_bodyplay', 'c_cda', 'c_matula'],
    specialties: ['t_electro', 't_personal', 't_group'],
    isActive: true,
    // Firm posture, athletic
    avatar: 'https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=600&auto=format&fit=crop',
  }
];

// --- 4. SCHEDULE RULES ---
export const SCHEDULE_RULES: ScheduleRule[] = [
  // --- CENTRO MISPORT (La Matula) ---
  {
    centerId: 'c_matula',
    trainingTypeId: 't_group',
    trainerId: undefined, // Indiferente
    daysOfWeek: [1, 3], // Lun, Mie
    ranges: [
        { start: '18:00', end: '21:00' } // 18, 19, 20 start times (last session ends 21:00)
    ]
  },
  {
    centerId: 'c_matula',
    trainingTypeId: 't_group',
    trainerId: undefined, 
    daysOfWeek: [2, 4], // Mar, Jue
    ranges: [
        { start: '09:00', end: '10:00' },
        { start: '18:00', end: '21:00' }
    ]
  },
  {
    centerId: 'c_matula',
    trainingTypeId: 't_group',
    trainerId: undefined,
    daysOfWeek: [5], // Vie
    ranges: [
        { start: '19:00', end: '20:00' }
    ]
  },
  // Personal at Matula (Ruben, Hugo) - L-V 10-18
  {
    centerId: 'c_matula',
    trainingTypeId: 't_personal',
    trainerId: 'tr_ruben',
    daysOfWeek: [1, 2, 3, 4, 5],
    ranges: [{ start: '10:00', end: '18:00' }]
  },
  {
    centerId: 'c_matula',
    trainingTypeId: 't_personal',
    trainerId: 'tr_hugo',
    daysOfWeek: [1, 2, 3, 4, 5],
    ranges: [{ start: '10:00', end: '18:00' }]
  },

  // --- COWORKGYM ---
  // Electro Misael
  {
    centerId: 'c_cowork',
    trainingTypeId: 't_electro',
    trainerId: 'tr_misael',
    daysOfWeek: [1, 3], // L, X
    ranges: [{ start: '08:00', end: '12:00' }]
  },
  {
    centerId: 'c_cowork',
    trainingTypeId: 't_electro',
    trainerId: 'tr_misael',
    daysOfWeek: [1, 2, 3, 4], // L-J
    ranges: [{ start: '17:00', end: '20:00' }]
  },
  // Electro Ruben
  {
    centerId: 'c_cowork',
    trainingTypeId: 't_electro',
    trainerId: 'tr_ruben',
    daysOfWeek: [1, 2, 3, 4, 5],
    ranges: [{ start: '09:00', end: '14:00' }]
  },
  // Electro Hugo
  {
    centerId: 'c_cowork',
    trainingTypeId: 't_electro',
    trainerId: 'tr_hugo',
    daysOfWeek: [1, 2, 3, 4, 5],
    ranges: [{ start: '08:00', end: '12:00' }]
  },
  // Personal Ruben & Hugo at Cowork (Assumed same availability as generic or specific needed? 
  // Prompt didn't specify hours for Personal at Cowork, adding placeholder or re-using Logic)
  // *Assumption*: Prompt only detailed Electro hours for Cowork. I will add a generic block for Personal at Cowork for Ruben/Hugo to make it work.
  {
    centerId: 'c_cowork',
    trainingTypeId: 't_personal',
    trainerId: 'tr_ruben',
    daysOfWeek: [1, 3, 5],
    ranges: [{ start: '09:00', end: '13:00' }]
  },
  {
    centerId: 'c_cowork',
    trainingTypeId: 't_personal',
    trainerId: 'tr_hugo',
    daysOfWeek: [2, 4],
    ranges: [{ start: '09:00', end: '13:00' }]
  },

  // --- BODYPLAY ---
  // Electro Hugo
  {
    centerId: 'c_bodyplay',
    trainingTypeId: 't_electro',
    trainerId: 'tr_hugo',
    daysOfWeek: [2], // Martes
    ranges: [
        { start: '08:00', end: '12:00' },
        { start: '16:30', end: '19:30' }
    ]
  },

  // --- CDA ---
  // Electro Hugo
  {
    centerId: 'c_cda',
    trainingTypeId: 't_electro',
    trainerId: 'tr_hugo',
    daysOfWeek: [3], // Miercoles
    ranges: [
        { start: '08:00', end: '12:00' },
        { start: '16:30', end: '19:30' }
    ]
  },

  // --- NUCLEO ---
  // Electro Misael (Assuming same as Cowork? Prompt didn't specify NUCLEO hours explicitly, borrowing standard shift)
  {
    centerId: 'c_nucleo',
    trainingTypeId: 't_electro',
    trainerId: 'tr_misael',
    daysOfWeek: [2, 4], // M, J
    ranges: [{ start: '09:00', end: '13:00' }]
  }
];

export const CURRENT_USER: User = {
  id: 'u_1',
  name: 'Cliente Demo',
  email: 'cliente@misport.com',
  phone: '600123456',
  role: 'CLIENT'
};

export const MOCK_ADMIN: User = {
  id: 'u_admin',
  name: 'Admin MISPORT',
  email: 'admin@misport.com',
  phone: '000000000',
  role: 'ADMIN'
};
