import { useState } from 'react';
import { Reservation } from '../types';
import { useApp } from '../context/AppContext';
import { useFinance, financeServiceNameForCatalogServiceId } from '../context/FinanceContext';
import { useCRM } from '../modules/crm/context/CRMContext';
import { useCatalog } from '../modules/catalog/context/CatalogContext';

/**
 * Completar una reserva: consumo automático de bonos (regla oficial,
 * Sprint 11) + registro económico en Finanzas (Sprint 7), siempre
 * independientes entre sí (decisión aprobada, opción 2). Extraído de
 * ReservasPage en el Sprint 15 para que Agenda y Reservas ejecuten
 * exactamente el mismo código — no una copia — sin cambio de
 * comportamiento respecto al Sprint 11.
 */
export function useCompleteReservation() {
  const { centers, trainers, completeReservation } = useApp();
  const { entries, addEntry } = useFinance();
  const { bonosCliente } = useCRM();
  const { bonos } = useCatalog();
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());

  const handleComplete = async (r: Reservation) => {
    if (r.status !== 'CONFIRMED' || completingIds.has(r.id)) return;
    setCompletingIds(prev => new Set(prev).add(r.id));

    let bonoStatus: Reservation['bonoStatus'];
    if (r.personaId) {
      const compatibleBonos = bonosCliente.items
        .filter(b => b.personaId === r.personaId && b.status === 'active' && b.sessionsRemaining > 0)
        .filter(b => bonos.items.find(producto => producto.id === b.bonoId)?.serviceId === r.serviceId)
        .sort((a, b) => {
          if (a.expiryDate && b.expiryDate) return a.expiryDate.localeCompare(b.expiryDate);
          if (a.expiryDate) return -1;
          if (b.expiryDate) return 1;
          return a.purchaseDate.localeCompare(b.purchaseDate);
        });

      const chosen = compatibleBonos[0];
      if (chosen) {
        const remaining = chosen.sessionsRemaining - 1;
        await bonosCliente.update(chosen.id, { sessionsRemaining: remaining, status: remaining === 0 ? 'consumed' : 'active' });
        bonoStatus = 'consumed';
      } else {
        const proceed = window.confirm('Esta persona no tiene saldo de bono suficiente para este servicio. La sesión se completará y quedará marcada como "Pendiente de regularizar". ¿Continuar?');
        if (!proceed) {
          setCompletingIds(prev => { const next = new Set(prev); next.delete(r.id); return next; });
          return;
        }
        bonoStatus = 'pending_regularization';
      }
    }

    completeReservation(r.id, bonoStatus);

    const alreadyRecorded = entries.some(e => e.sourceReservationId === r.id);
    const financeService = financeServiceNameForCatalogServiceId(r.serviceId);
    if (!alreadyRecorded && financeService) {
      const center = centers.find(c => c.id === r.centerId);
      const trainer = trainers.find(t => t.id === r.trainerId);
      addEntry({
        date: r.date,
        trainerName: trainer?.name ?? 'Grupal (sin asignar)',
        centerName: center?.name ?? '',
        service: financeService,
        groupDays: financeService === 'Entrenamiento grupal' ? 1 : undefined,
        quantity: 1,
        sourceReservationId: r.id,
        personaId: r.personaId ?? undefined,
      });
    }
  };

  return { handleComplete, completingIds };
}
