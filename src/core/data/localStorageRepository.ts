import { Repository } from './repository';

/** Today's persistence: a Repository<T> backed by a single localStorage key. */
export class LocalStorageRepository<T extends { id: string }> implements Repository<T> {
  constructor(private readonly storageKey: string) {}

  private readAll(): T[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }

  private writeAll(items: T[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  async list(): Promise<T[]> {
    return this.readAll();
  }

  async get(id: string): Promise<T | undefined> {
    return this.readAll().find(item => item.id === id);
  }

  async create(item: T): Promise<T> {
    const items = this.readAll();
    items.push(item);
    this.writeAll(items);
    return item;
  }

  async update(id: string, patch: Partial<T>): Promise<T | undefined> {
    const items = this.readAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    const updated = { ...items[index], ...patch };
    items[index] = updated;
    this.writeAll(items);
    return updated;
  }

  async remove(id: string): Promise<void> {
    this.writeAll(this.readAll().filter(item => item.id !== id));
  }
}
