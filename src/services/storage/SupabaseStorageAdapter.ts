import { IStorageAdapter } from './IStorageAdapter';
import { supabase } from '../supabase';

export class SupabaseStorageAdapter<T extends { id: string }> implements IStorageAdapter<T> {
  constructor(private tableName: string, private initialData?: T[]) {}

  async getAll(): Promise<T[]> {
    if (!supabase) return this.initialData || [];

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error(`[SupabaseStorageAdapter] getAll error in ${this.tableName}:`, error);
      return this.initialData || [];
    }

    // If table is completely empty and initialData exists, seed it
    if ((!data || data.length === 0) && this.initialData && this.initialData.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from(this.tableName)
        .insert(this.initialData)
        .select();

      if (!insertError && inserted) {
        return inserted as T[];
      }
    }

    return (data as T[]) || [];
  }

  async getById(id: string): Promise<T | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`[SupabaseStorageAdapter] getById error in ${this.tableName}:`, error);
      return null;
    }
    return data as T;
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const newItem = {
      ...item,
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    } as T;

    if (!supabase) return newItem;

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(newItem)
      .select()
      .single();

    if (error) {
      console.error(`[SupabaseStorageAdapter] create error in ${this.tableName}:`, error);
      throw error;
    }
    return data as T;
  }

  async update(id: string, partial: Partial<T>): Promise<T> {
    if (!supabase) throw new Error('Supabase client not configured.');

    const { data, error } = await supabase
      .from(this.tableName)
      .update(partial as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`[SupabaseStorageAdapter] update error in ${this.tableName}:`, error);
      throw error;
    }
    return data as T;
  }

  async delete(id: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase.from(this.tableName).delete().eq('id', id);
    if (error) {
      console.error(`[SupabaseStorageAdapter] delete error in ${this.tableName}:`, error);
      throw error;
    }
  }
}
