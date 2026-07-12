import React, { createContext, useContext, ReactNode } from 'react';
import { Entity, Timestamps } from '../../../core/types';
import { Center, Trainer, Service, Rate, Bono, Recurso } from '../types';
import { centersRepo, trainersRepo, servicesRepo, ratesRepo, bonosRepo, recursosRepo } from '../data/repositories';
import { useCatalogEntity } from '../data/useCatalogEntity';

type EntityBinding<T extends Entity & Timestamps> = ReturnType<typeof useCatalogEntity<T>>;

interface CatalogContextType {
  centers: EntityBinding<Center>;
  trainers: EntityBinding<Trainer>;
  services: EntityBinding<Service>;
  rates: EntityBinding<Rate>;
  bonos: EntityBinding<Bono>;
  recursos: EntityBinding<Recurso>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const centers = useCatalogEntity(centersRepo, 'ctr');
  const trainers = useCatalogEntity(trainersRepo, 'trn');
  const services = useCatalogEntity(servicesRepo, 'svc');
  const rates = useCatalogEntity(ratesRepo, 'rate');
  const bonos = useCatalogEntity(bonosRepo, 'bono');
  const recursos = useCatalogEntity(recursosRepo, 'rec');

  return (
    <CatalogContext.Provider value={{ centers, trainers, services, rates, bonos, recursos }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
