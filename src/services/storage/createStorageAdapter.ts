import { IStorageAdapter } from './IStorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { SupabaseStorageAdapter } from './SupabaseStorageAdapter';
import { isSupabaseConfigured } from '../supabase';

export function createStorageAdapter<T extends { id: string }>(
  storageKey: string,
  initialData?: T[]
): IStorageAdapter<T> {
  if (isSupabaseConfigured) {
    return new SupabaseStorageAdapter<T>(storageKey, initialData);
  }
  return new LocalStorageAdapter<T>(storageKey, initialData);
}
