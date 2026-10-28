import { IStorageAdapter } from './IStorageAdapter';

export class LocalStorageAdapter<T extends { id: string }> implements IStorageAdapter<T> {
  private readonly storageKey: string;

  constructor(storageKey: string, initialData?: T[]) {
    this.storageKey = `couple_love_${storageKey}`;
    if (initialData && !localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  private read(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`[LocalStorageAdapter] Failed to read key: ${this.storageKey}`, error);
      return [];
    }
  }

  private write(data: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error(`[LocalStorageAdapter] Failed to write key: ${this.storageKey}`, error);
      throw new Error(`Storage quota exceeded or unavailable.`);
    }
  }

  async getAll(): Promise<T[]> {
    return this.read();
  }

  async getById(id: string): Promise<T | null> {
    const list = this.read();
    return list.find((item) => item.id === id) || null;
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const list = this.read();
    const newItem = {
      ...item,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    } as T;

    list.unshift(newItem);
    this.write(list);
    return newItem;
  }

  async update(id: string, partial: Partial<T>): Promise<T> {
    const list = this.read();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Item with id "${id}" not found.`);
    }

    const updatedItem = { ...list[index], ...partial };
    list[index] = updatedItem;
    this.write(list);
    return updatedItem;
  }

  async delete(id: string): Promise<void> {
    const list = this.read();
    const filtered = list.filter((item) => item.id !== id);
    this.write(filtered);
  }
}
