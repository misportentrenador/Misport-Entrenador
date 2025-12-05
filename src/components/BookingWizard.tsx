
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BookingState } from '../types';
import { generateFitnessTip } from '../services/geminiService';
import { 
  MapPin, 
  Dumbbell, 
  User as UserIcon, 
  Calendar, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const STEPS = [
  'Centro',
  'Entrenamiento',
  'Entrenador',
  'Fecha y Hora',
  'Confirmar'
];

export const BookingWizard: React.FC = () => {
  const { centers, trainingTypes, trainers, addReservation, reservations, user, scheduleRules } = useApp();
  
  const [state, setState] = useState<BookingState>({
    step: 1,
    centerId: null,
    trainingTypeId: null,
    trainerId: null,
    selectedDate: new Date().toISOString().split('T')[0],
    selectedTime: null
  });

  const [aiTip, setAiTip] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Derived state
  const selectedCenter = centers.find(c => c.id === state.centerId);
  const selectedType = trainingTypes.find(t => t.id === state.trainingTypeId);
  const selectedTrainer = trainers.find(t => t.id === state.trainerId);

  // Step 1: Filter available centers
  const availableCenters = centers.filter(c => c.isActive);

  // Step 2: Filter training types available AT the selected center
  const availableTrainingTypes = useMemo(() => {
    if (!state.centerId) return [];
    return trainingTypes.filter(type => {
      return scheduleRules.some(rule => 
        rule.centerId === state.centerId && 
        rule.trainingTypeId === type.id
      );
    });
  }, [state.centerId, trainingTypes, scheduleRules]);

  // Step 3: Filter trainers based on Center, Type AND Schedule Existence
  const availableTrainers = useMemo(() => {
    if (!state.centerId || !state.trainingTypeId) return [];
    
    return trainers.filter(t => 
      t.isActive && 
      t.centerIds.includes(state.centerId!) && 
      t.specialties.includes(state.trainingTypeId!) &&
      scheduleRules.some(rule => 
        rule.centerId === state.centerId && 
        rule.trainingTypeId === state.trainingTypeId && 
        rule.trainerId === t.id
      )
    );
  }, [state.centerId, state.trainingTypeId, trainers, scheduleRules]);

  // Determine if we should skip trainer selection
  const shouldSkipTrainerSelection = useMemo(() => {
    if (!selectedType) return false;
    if (!selectedType.requiresTrainer) return true;

    const genericRules = scheduleRules.filter(r => 
        r.centerId === state.centerId && 
        r.trainingTypeId === state.trainingTypeId && 
        !r.trainerId
    );
    const specificRules = scheduleRules.filter(r => 
        r.centerId === state.centerId && 
        r.trainingTypeId === state.trainingTypeId && 
        r.trainerId
    );

    if (genericRules.length > 0 && specificRules.length === 0) return true;
    return false;
  }, [selectedType, state.centerId, state.trainingTypeId, scheduleRules]);

  // Step 4: Generate Time Slots based on SCHEDULE RULES
  const timeSlots = useMemo(() => {
    if (!selectedType || !state.selectedDate || !state.centerId) return [];

    const date = new Date(state.selectedDate);
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon...

    const applicableRules = scheduleRules.filter(rule => {
      const matchCenter = rule.centerId === state.centerId;
      const matchType = rule.trainingTypeId === state.trainingTypeId;
      const matchTrainer = state.trainerId 
        ? rule.trainerId === state.trainerId 
        : !rule.trainerId; 
      
      const matchDay = rule.daysOfWeek.includes(dayOfWeek);
      return matchCenter && matchType && matchTrainer && matchDay;
    });

    const slots: string[] = [];
    const duration = selectedType.durationMinutes;

    applicableRules.forEach(rule => {
      rule.ranges.forEach(range => {
        const [startH, startM] = range.start.split(':').map(Number);
        const [endH, endM] = range.end.split(':').map(Number);
        
        let currentMin = startH * 60 + startM;
        const endMin = endH * 60 + endM;

        while (currentMin + duration <= endMin) {
          const h = Math.floor(currentMin / 60);
          const m = currentMin % 60;
          const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          
          if (checkAvailability(timeString)) {
            if (!slots.includes(timeString)) {
                slots.push(timeString);
            }
          }
          currentMin += duration;
        }
      });
    });

    return slots.sort();
  }, [state.selectedDate, state.centerId, state.trainingTypeId, state.trainerId, selectedType, reservations, scheduleRules]);

  function checkAvailability(time: string): boolean {
    const conflicts = reservations.filter(r => 
      r.date === state.selectedDate &&
      r.startTime === time && 
      r.centerId === state.centerId && 
      r.status !== 'CANCELLED'
    );

    if (state.trainerId) {
      const trainerBusy = conflicts.some(r => r.trainerId === state.trainerId);
      if (trainerBusy) return false;
    }

    const sameServiceConflicts = conflicts.filter(r => r.trainingTypeId === state.trainingTypeId);
    if (selectedType && sameServiceConflicts.length >= selectedType.capacity) {
        return false;
    }

    return true;
  }

  useEffect(() => {
    if (selectedType) {
      generateFitnessTip(selectedType.name).then(setAiTip);
    }
  }, [selectedType]);

  useEffect(() => {
    setState(prev => ({ ...prev, trainingTypeId: null, trainerId: null, selectedTime: null }));
  }, [state.centerId]);

  useEffect(() => {
    setState(prev => ({ ...prev, trainerId: null, selectedTime: null }));
  }, [state.trainingTypeId]);

  const handleNext = () => {
    if (state.step === 2) {
        if (shouldSkipTrainerSelection) {
            setState(prev => ({ ...prev, step: 4 }));
            return;
        }
    }
    setState(prev => ({ ...prev, step: prev.step + 1 }));
  };

  const handleBack = () => {
    if (state.step === 4 && shouldSkipTrainerSelection) {
        setState(prev => ({ ...prev, step: 2 }));
    } else {
        setState(prev => ({ ...prev, step: prev.step - 1 }));
    }
  };

  const handleConfirm = async () => {
    if (!user) return;
    setIsSubmitting(true);
    
    const [h, m] = state.selectedTime!.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + (selectedType?.durationMinutes || 60));
    const endTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    await addReservation({
      userId: user.id,
      centerId: state.centerId!,
      trainingTypeId: state.trainingTypeId!,
      trainerId: state.trainerId || undefined,
      date: state.selectedDate,
      startTime: state.selectedTime!,
      endTime: endTime,
    });
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-white rounded-xl shadow-2xl border border-gray-100 text-center animate-fade-in max-w-2xl mx-auto mt-8">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4 ring-8 ring-green-50/50">
          <CheckCircle size={56} strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-light text-gray-800 tracking-tight">Reserva <span className="font-bold">Confirmada</span></h2>
        <p className="text-gray-500 max-w-md font-light text-lg">
          Tu sesión en <span className="font-semibold text-gray-700">{selectedCenter?.name}</span> está lista.
        </p>
        <div className="bg-gray-50 p-6 rounded-xl w-full border border-gray-100 shadow-inner">
            <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Fecha</p>
                    <p className="text-lg font-medium text-gray-800">{state.selectedDate}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Hora</p>
                    <p className="text-lg font-medium text-primary">{state.selectedTime}</p>
                </div>
                <div className="col-span-2 pt-4 border-t border-gray-200 mt-2">
                     <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Servicio</p>
                     <p className="text-lg font-medium text-gray-800">{selectedType?.name}</p>
                     {selectedTrainer && <p className="text-sm text-gray-500 mt-1">con {selectedTrainer.name}</p>}
                </div>
            </div>
        </div>
        <button 
          onClick={() => {
            setIsSuccess(false);
            setState({ step: 1, centerId: null, trainingTypeId: null, trainerId: null, selectedDate: new Date().toISOString().split('T')[0], selectedTime: null });
          }}
          className="bg-secondary hover:bg-slate-700 text-white px-10 py-4 rounded-lg font-medium tracking-wide transition-colors shadow-lg mt-4"
        >
          Hacer otra reserva
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-white min-h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">
      {/* Elegant Header */}
      <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
        <div>
            <h2 className="text-2xl font-light text-gray-800 tracking-tight">
                {state.step === 1 && "Selecciona tu Centro"}
                {state.step === 2 && "Elige tu Entrenamiento"}
                {state.step === 3 && "Selecciona Entrenador"}
                {state.step === 4 && "Fecha y Hora"}
                {state.step === 5 && "Confirmación"}
            </h2>
            <div className="flex gap-2 mt-2">
                {STEPS.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i + 1 <= state.step ? 'w-8 bg-primary' : 'w-2 bg-gray-200'}`}></div>
                ))}
            </div>
        </div>
        <div className="text-right hidden sm:block">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Paso {state.step}/5</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 p-8 overflow-y-auto bg-gray-50/50">
        
        {/* Step 1: Center Selection (Cinematic Cards) */}
        {state.step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableCenters.map(center => (
              <div 
                key={center.id}
                onClick={() => {
                  setState(prev => ({ ...prev, centerId: center.id }));
                  setTimeout(() => handleNext(), 100); 
                }}
                className={`group relative cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-80 ${state.centerId === center.id ? 'ring-4 ring-primary' : ''}`}
              >
                {/* Full Background Image */}
                <div className="absolute inset-0 bg-gray-900">
                    <img 
                        src={center.image} 
                        alt={center.name} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-500"
                    />
                </div>
                
                {/* Elegant Overlay Rótulo */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <div className="border-l-4 border-primary pl-4 transform group-hover:translate-x-2 transition-transform duration-300">
                        <h3 className="font-bold text-2xl text-white tracking-wide uppercase">{center.name}</h3>
                        <p className="text-gray-300 text-sm font-light mt-1 flex items-center gap-1">
                            <MapPin size={12} /> {center.address}
                        </p>
                    </div>
                </div>
                
                {/* Selected Indicator */}
                {state.centerId === center.id && (
                    <div className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full shadow-lg">
                        <CheckCircle size={24} />
                    </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Type Selection (Clean List) */}
        {state.step === 2 && (
          <div className="space-y-4 max-w-3xl mx-auto">
             {availableTrainingTypes.length === 0 ? (
                <div className="text-center py-20">
                    <AlertCircle className="mx-auto text-gray-300 mb-4" size={48}/>
                    <p className="text-gray-500 text-lg">No hay servicios disponibles en este centro actualmente.</p>
                </div>
             ) : (
                availableTrainingTypes.map(type => (
                <div 
                    key={type.id}
                    onClick={() => {
                        setState(prev => ({ ...prev, trainingTypeId: type.id }));
                        setTimeout(() => handleNext(), 100);
                    }}
                    className={`group p-6 bg-white border border-gray-100 rounded-xl hover:border-primary hover:shadow-xl cursor-pointer transition-all flex justify-between items-center ${state.trainingTypeId === type.id ? 'border-primary shadow-lg ring-1 ring-primary' : ''}`}
                >
                    <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-full text-white transition-colors ${state.trainingTypeId === type.id ? 'bg-primary' : 'bg-gray-800 group-hover:bg-primary'}`}>
                            <Dumbbell size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-gray-800 group-hover:text-primary transition-colors">{type.name}</h3>
                            <p className="text-gray-500 text-sm mt-1 font-light">{type.description}</p>
                            <div className="flex gap-4 mt-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                <span className="flex items-center gap-1"><Clock size={12}/> {type.durationMinutes} min</span>
                                <span className="flex items-center gap-1"><UserIcon size={12}/> {type.capacity === 1 ? 'Personal' : `Grupal (Max ${type.capacity})`}</span>
                            </div>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-primary transform group-hover:translate-x-1 transition-all" size={24} />
                </div>
                ))
            )}
          </div>
        )}

        {/* Step 3: Trainer Selection (Silhouette Cards) */}
        {state.step === 3 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {availableTrainers.length === 0 ? (
                <div className="col-span-3 text-center py-20 text-gray-500 flex flex-col items-center">
                    <AlertCircle className="mb-4 text-gray-300" size={48} />
                    <p>No hay entrenadores disponibles para este servicio aquí.</p>
                </div>
            ) : availableTrainers.map(trainer => (
              <div 
                key={trainer.id}
                onClick={() => {
                  setState(prev => ({ ...prev, trainerId: trainer.id }));
                  setTimeout(() => handleNext(), 100);
                }}
                className={`group relative cursor-pointer rounded-xl overflow-hidden aspect-[4/5] shadow-lg hover:shadow-2xl transition-all duration-300 ${state.trainerId === trainer.id ? 'ring-4 ring-primary' : 'hover:-translate-y-2'}`}
              >
                {/* Silhouette Image Filtered */}
                <img 
                    src={trainer.avatar} 
                    alt={trainer.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter grayscale contrast-125 brightness-75 group-hover:brightness-90" 
                />
                
                {/* Elegant Overlay Label */}
                <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-12 text-center">
                         <h3 className="text-white font-bold text-lg tracking-wider uppercase border-b-2 border-primary inline-block pb-1 mb-1">{trainer.name}</h3>
                         <p className="text-gray-400 text-xs font-light uppercase tracking-widest">Entrenador</p>
                    </div>
                </div>

                {state.trainerId === trainer.id && (
                     <div className="absolute top-3 right-3 bg-primary text-white p-1.5 rounded-full shadow-lg">
                        <CheckCircle size={20} />
                    </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Date & Time */}
        {state.step === 4 && (
          <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
            <div className="w-full lg:w-1/2">
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">1. Selecciona el día</label>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <input 
                        type="date" 
                        value={state.selectedDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setState(prev => ({ ...prev, selectedDate: e.target.value, selectedTime: null }))}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none text-xl text-gray-700 font-medium"
                    />
                </div>
                
                {aiTip && (
                  <div className="mt-8 bg-gradient-to-r from-blue-50 to-white border border-blue-100 p-6 rounded-2xl flex gap-4 items-start shadow-sm animate-fade-in">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">MISPORT Coach Tip</p>
                        <p className="text-lg text-gray-700 font-light italic leading-relaxed">"{aiTip}"</p>
                    </div>
                  </div>
                )}
            </div>
            
            <div className="w-full lg:w-1/2">
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">2. Selecciona la hora</label>
                {timeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {timeSlots.map(time => (
                            <button
                                key={time}
                                onClick={() => setState(prev => ({ ...prev, selectedTime: time }))}
                                className={`py-3 px-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                                    state.selectedTime === time 
                                    ? 'bg-primary text-white shadow-lg transform scale-105' 
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary hover:shadow'
                                }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                        <Calendar size={48} className="mb-4 opacity-30" />
                        <p className="font-medium">Sin disponibilidad</p>
                        <p className="text-sm mt-1">Prueba otro día</p>
                    </div>
                )}
            </div>
          </div>
        )}

        {/* Step 5: Confirm */}
        {state.step === 5 && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mt-4">
            <h3 className="text-2xl font-light text-gray-800 mb-8 border-b pb-4 flex items-center gap-3">
                <span className="bg-primary/10 text-primary p-2 rounded-full">
                    <CheckCircle size={24} />
                </span>
                Resumen de Reserva
            </h3>
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                         {selectedCenter && <img src={selectedCenter.image} alt="" className="w-full h-full object-cover"/>}
                    </div>
                    <div>
                         <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Centro</p>
                         <p className="text-xl font-bold text-gray-800">{selectedCenter?.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 text-gray-400">
                         <Dumbbell size={28}/>
                    </div>
                    <div>
                         <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Entrenamiento</p>
                         <p className="text-xl font-bold text-gray-800">{selectedType?.name}</p>
                    </div>
                </div>

                {selectedTrainer && (
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                            {selectedTrainer && <img src={selectedTrainer.avatar} alt="" className="w-full h-full object-cover filter grayscale contrast-125"/>}
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Entrenador</p>
                            <p className="text-xl font-bold text-gray-800">{selectedTrainer.name}</p>
                        </div>
                    </div>
                )}

                <div className="bg-secondary/5 p-6 rounded-xl border border-secondary/10 mt-4">
                    <div className="flex justify-between items-end">
                        <div>
                             <p className="text-sm text-gray-500 font-medium mb-1">Fecha</p>
                             <p className="text-lg font-bold text-secondary">{new Date(state.selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-gray-500 font-medium mb-1">Hora</p>
                             <p className="text-3xl font-bold text-primary">{state.selectedTime}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
                <button 
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="w-full bg-secondary text-white py-5 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all disabled:opacity-50 flex justify-center items-center shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
                >
                    {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : 'CONFIRMAR RESERVA'}
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">Al confirmar aceptas nuestras políticas de cancelación.</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      {!isSuccess && (
        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
            <button 
                onClick={handleBack}
                disabled={state.step === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    state.step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
                <ChevronLeft size={20} /> Atrás
            </button>

            {state.step < 5 && (
                 <button 
                 onClick={handleNext}
                 disabled={(state.step === 4 && !state.selectedTime) || (state.step === 1 && !state.centerId) || (state.step === 2 && !state.trainingTypeId)}
                 className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all shadow-md ${
                     ((state.step === 4 && !state.selectedTime) || (state.step === 1 && !state.centerId) || (state.step === 2 && !state.trainingTypeId))
                     ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                     : 'bg-primary text-white hover:bg-orange-600 hover:shadow-lg hover:-translate-y-0.5'
                 }`}
             >
                 Siguiente <ChevronRight size={20} />
             </button>
            )}
        </div>
      )}
    </div>
  );
};