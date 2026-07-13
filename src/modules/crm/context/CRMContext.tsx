import React, { createContext, useContext, ReactNode } from 'react';
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
