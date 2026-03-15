import type { IStorageProvider } from './interface';
import { InMemoryStorage } from './in-memory';

export type { IStorageProvider } from './interface';
export { InMemoryStorage } from './in-memory';

let instance: IStorageProvider | null = null;

export function getStorage(): IStorageProvider {
  if (!instance) {
    instance = new InMemoryStorage();
  }
  return instance;
}
