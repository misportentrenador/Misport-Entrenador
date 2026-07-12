import { useCallback, useEffect, useState } from 'react';
import { Entity, Timestamps } from '../../../core/types';
import { Repository } from '../../../core/data/repository';

type Draft<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Generic list+CRUD binding between a Repository<T> and a React component,
 * shared by all six Catálogo entities instead of writing near-identical
 * load/create/update logic six times.
 *
 * Deliberately does NOT seed here: seeding "if empty" inside a React effect
 * is a check-then-write race — React StrictMode's double-invoke in dev (and
 * any future double-mount) can run two reads before either write lands,
 * seeding twice. Seeding happens once, synchronously, at module load time
 * in data/repositories.ts instead, where it can't race.
 */
export function useCatalogEntity<T extends Entity & Timestamps>(
  repo: Repository<T>,
  idPrefix: string
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setItems(await repo.list());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo]);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  const create = useCallback(async (data: Draft<T>) => {
    const now = new Date().toISOString();
    const newItem = {
      ...data,
      id: `${idPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    } as T;
    await repo.create(newItem);
    await reload();
  }, [repo, reload, idPrefix]);

  const update = useCallback(async (id: string, patch: Partial<T>) => {
    await repo.update(id, { ...patch, updatedAt: new Date().toISOString() } as Partial<T>);
    await reload();
  }, [repo, reload]);

  return { items, loading, create, update, reload };
}
