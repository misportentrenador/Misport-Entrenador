import { Reservation } from '../types';
import { BonoCliente } from '../modules/crm/types';
import { useApp } from '../context/AppContext';
import { useCRM } from '../modules/crm/context/CRMContext';
import { useCatalog } from '../modules/catalog/context/CatalogContext';

/**
 * Consumir bono manual (Sprint 22) — regulariza una reserva COMPLETED que
 * quedó con bonoStatus 'pending_regularization' porque, al completarla, no
 * había saldo de bono suficiente (useCompleteReservation.ts). Reutiliza
 * exactamente el mismo criterio de compatibilidad y el mismo desempate que
 * el consumo automático (misma regla oficial, ver BonoCliente en
 * crm/types.ts) — la única diferencia es que aquí el bono con saldo llegó
 * *después* de completar la sesión, y es el staff quien elige.
 *
 * El descuento del BonoCliente se hace aquí (vía useCRM().bonosCliente.update,
 * no un repo a pelo) para que la sección Económica de la Ficha se entere sin
 * recargar; marcar la reserva como regularizada vive en AppContext
 * (marcarBonoConsumidoManualmente), que también audita el cambio y emite el
 * evento de dominio que alimenta el Historial de la Ficha.
 */
export function useConsumirBonoManual() {
  const { marcarBonoConsumidoManualmente } = useApp();
  const { bonosCliente } = useCRM();
  const { bonos } = useCatalog();

  const getBonosCompatibles = (reservation: Reservation): BonoCliente[] => {
    if (!reservation.personaId) return [];
    return bonosCliente.items
      .filter(b => b.personaId === reservation.personaId && b.status === 'active' && b.sessionsRemaining > 0)
      .filter(b => bonos.items.find(producto => producto.id === b.bonoId)?.serviceId === reservation.serviceId)
      .sort((a, b) => {
        if (a.expiryDate && b.expiryDate) return a.expiryDate.localeCompare(b.expiryDate);
        if (a.expiryDate) return -1;
        if (b.expiryDate) return 1;
        return a.purchaseDate.localeCompare(b.purchaseDate);
      });
  };

  const handleConsumirBono = async (reservation: Reservation, bonoClienteId: string): Promise<{ success: boolean; message?: string }> => {
    if (reservation.status !== 'COMPLETED' || reservation.bonoStatus !== 'pending_regularization') {
      return { success: false, message: 'Esta reserva no está pendiente de regularizar.' };
    }

    const compatibles = getBonosCompatibles(reservation);
    const chosen = compatibles.find(b => b.id === bonoClienteId);
    if (!chosen) {
      return { success: false, message: 'El bono seleccionado ya no está disponible o no es compatible con este servicio.' };
    }

    const remaining = chosen.sessionsRemaining - 1;
    await bonosCliente.update(chosen.id, { sessionsRemaining: remaining, status: remaining === 0 ? 'consumed' : 'active' });

    return marcarBonoConsumidoManualmente(reservation.id, chosen.id);
  };

  return { getBonosCompatibles, handleConsumirBono };
}
