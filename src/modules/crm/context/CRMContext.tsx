import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Entity, Timestamps } from '../../../core/types';
import {
  RolPersona, PerfilDeportivo, PerfilSanitario, InfoComercial, BonoCliente,
  Incidencia, Mensaje, NotaPersona, PersonaEvento, RelacionPersona,
} from '../types';
import {
  rolPersonaRepo, perfilDeportivoRepo, perfilSanitarioRepo, infoComercialRepo, bonoClienteRepo,
  incidenciaRepo, mensajeRepo, notaPersonaRepo, personaEventoRepo, relacionPersonaRepo,
} from '../data/repositories';
import { useEntityCollection } from '../../../shared/hooks/useEntityCollection';
import { domainEventBus } from '../../../core/events/domainEvents';
import { ASISTENCIA_ESTADO_LABEL } from '../../../shared/lib/reservationLabels';

type EntityBinding<T extends Entity & Timestamps> = ReturnType<typeof useEntityCollection<T>>;

/**
 * CRM — un contexto por dominio, mismo patrón que Catálogo y Datos
 * Maestros (Sprints 2 y 3). Ninguna de estas diez entidades sustituye a
 * Persona; todas la referencian por personaId (documento de diseño "CRM
 * Definitivo", Release 0.3).
 *
 * Descendiente de CatalogProvider, MasterDataProvider, AppProvider y
 * FinanceProvider en el árbol de App.tsx — puede leerlos todos; ninguno de
 * ellos depende de CRM.
 */
interface CRMContextType {
  roles: EntityBinding<RolPersona>;
  perfilesDeportivos: EntityBinding<PerfilDeportivo>;
  perfilesSanitarios: EntityBinding<PerfilSanitario>;
  infoComercial: EntityBinding<InfoComercial>;
  bonosCliente: EntityBinding<BonoCliente>;
  incidencias: EntityBinding<Incidencia>;
  mensajes: EntityBinding<Mensaje>;
  notas: EntityBinding<NotaPersona>;
  eventos: EntityBinding<PersonaEvento>;
  relaciones: EntityBinding<RelacionPersona>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const roles = useEntityCollection(rolPersonaRepo, 'rol');
  const perfilesDeportivos = useEntityCollection(perfilDeportivoRepo, 'pdep');
  const perfilesSanitarios = useEntityCollection(perfilSanitarioRepo, 'psan');
  const infoComercial = useEntityCollection(infoComercialRepo, 'com');
  const bonosCliente = useEntityCollection(bonoClienteRepo, 'boncli');
  const incidencias = useEntityCollection(incidenciaRepo, 'inc');
  const mensajes = useEntityCollection(mensajeRepo, 'msg');
  const notas = useEntityCollection(notaPersonaRepo, 'nota');
  const eventos = useEntityCollection(personaEventoRepo, 'evt');
  const relaciones = useEntityCollection(relacionPersonaRepo, 'rel');

  // Escucha los eventos de dominio que afectan al timeline de la Persona
  // (ReservationRescheduled, Sprint 21; BonoConsumedManually y
  // AttendanceUpdated, Sprint 22-23) — AppContext solo emite el evento,
  // nunca escribe en el repositorio de PersonaEvento directamente, porque
  // AppProvider está por encima de CRMProvider en el árbol y no puede ver
  // este estado. Escribir aquí (con eventos.create, no el repo a pelo)
  // asegura que la Ficha refleje el cambio sin necesitar recargar la
  // página. Los mismos eventos quedan disponibles para que futuros
  // adaptadores (Booksy/Google Calendar) o módulos (KPIs, recordatorios,
  // informes, automatizaciones, IA) se suscriban sin tocar esta lógica.
  useEffect(() => {
    return domainEventBus.subscribe(event => {
      if (event.type === 'ReservationRescheduled' && event.personaId) {
        eventos.create({
          personaId: event.personaId,
          tipo: 'Reprogramación',
          descripcion: `Reserva reprogramada de ${event.previous.date} ${event.previous.startTime} a ${event.next.date} ${event.next.startTime}.`,
          fecha: event.occurredAt,
        });
      } else if (event.type === 'BonoConsumedManually') {
        eventos.create({
          personaId: event.personaId,
          tipo: 'Bono consumido manualmente',
          descripcion: 'Se regularizó manualmente una reserva pendiente, consumiendo una sesión de bono.',
          fecha: event.occurredAt,
        });
      } else if (event.type === 'AttendanceUpdated' && event.personaId) {
        eventos.create({
          personaId: event.personaId,
          tipo: 'Asistencia',
          descripcion: `Asistencia actualizada: ${ASISTENCIA_ESTADO_LABEL[event.previous]} → ${ASISTENCIA_ESTADO_LABEL[event.next]}.`,
          fecha: event.occurredAt,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventos.create]);

  return (
    <CRMContext.Provider value={{
      roles, perfilesDeportivos, perfilesSanitarios, infoComercial, bonosCliente,
      incidencias, mensajes, notas, eventos, relaciones,
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
