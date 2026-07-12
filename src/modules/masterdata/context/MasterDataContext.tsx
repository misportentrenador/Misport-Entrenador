import React, { createContext, useContext, ReactNode } from 'react';
import { Entity, Timestamps } from '../../../core/types';
import { Persona, Organizacion, Contacto, Recurso } from '../types';
import { personasRepo, organizacionesRepo, contactosRepo, recursosRepo } from '../data/repositories';
import { useEntityCollection } from '../../../shared/hooks/useEntityCollection';

type EntityBinding<T extends Entity & Timestamps> = ReturnType<typeof useEntityCollection<T>>;

/**
 * One context for the whole Master Data domain — Persona, Organización,
 * Contacto and Recurso are entities of the same domain, not separate
 * contexts, per the Sprint 3 architectural condition.
 */
interface MasterDataContextType {
  personas: EntityBinding<Persona>;
  organizaciones: EntityBinding<Organizacion>;
  contactos: EntityBinding<Contacto>;
  recursos: EntityBinding<Recurso>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export const MasterDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const personas = useEntityCollection(personasRepo, 'per');
  const organizaciones = useEntityCollection(organizacionesRepo, 'org');
  const contactos = useEntityCollection(contactosRepo, 'con');
  const recursos = useEntityCollection(recursosRepo, 'rec');

  return (
    <MasterDataContext.Provider value={{ personas, organizaciones, contactos, recursos }}>
      {children}
    </MasterDataContext.Provider>
  );
};

export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (!context) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return context;
};
