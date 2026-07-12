import React, { createContext, useContext, ReactNode } from 'react';
import { Entity, Timestamps } from '../../../core/types';
import { Center, Trainer, Service, Rate, Bono } from '../types';
import { centersRepo, trainersRepo, servicesRepo, ratesRepo, bonosRepo } from '../data/repositories';
import { useEntityCollection } from '../../../shared/hooks/useEntityCollection';

type EntityBinding<T extends Entity & Timestamps> = ReturnType<typeof useEntityCollection<T>>;

interface CatalogContextType {
  centers: EntityBinding<Center>;
  trainers: EntityBinding<Trainer>;
  services: EntityBinding<Service>;
  rates: EntityBinding<Rate>;
  bonos: EntityBinding<Bono>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const centers = useEntityCollection(centersRepo, 'ctr');
  const trainers = useEntityCollection(trainersRepo, 'trn');
  const services = useEntityCollection(servicesRepo, 'svc');
  const rates = useEntityCollection(ratesRepo, 'rate');
  const bonos = useEntityCollection(bonosRepo, 'bono');

  return (
    <CatalogContext.Provider value={{ centers, trainers, services, rates, bonos }}>
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
