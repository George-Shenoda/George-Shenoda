import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OutboxItem, OutboxStorage } from '@portfolio/shared';

export function createAsyncStorageStorage(key: string): OutboxStorage {
  return {
    async read(): Promise<OutboxItem[]> {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as OutboxItem[]) : [];
      } catch {
        return [];
      }
    },
    async write(items) {
      await AsyncStorage.setItem(key, JSON.stringify(items));
    },
  };
}
