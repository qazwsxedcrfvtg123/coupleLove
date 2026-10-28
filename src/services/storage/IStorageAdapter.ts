/**
 * 儲存介質適配器介面 (Storage Adapter Interface)
 * 遵循依賴反轉原則 (DIP)，隔離持久層。
 * 未來可無痛替換為 SupabaseAdapter, FirebaseAdapter, 或 AxiosHttpAdapter。
 */
export interface IStorageAdapter<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string, partial: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
