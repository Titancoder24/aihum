import type {
  Document,
  UsageRecord,
  UserSettings,
  IStorageProvider,
} from '@/types';
import { DEFAULT_DETECTION_WEIGHTS } from '@/constants';

const STORAGE_KEYS = {
  documents: 'humanize-elite:documents',
  usage: 'humanize-elite:usage',
  settings: 'humanize-elite:settings',
} as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getEndOfDay(): string {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return end.toISOString();
}

function getDefaultUsage(): UsageRecord {
  return {
    wordsUsedToday: 0,
    wordsLimit: 1000,
    plan: 'free',
    resetsAt: getEndOfDay(),
  };
}

function getDefaultSettings(): UserSettings {
  return {
    theme: 'dark',
    defaultMode: 'standard',
    detectionWeights: { ...DEFAULT_DETECTION_WEIGHTS },
  };
}

export class InMemoryStorage implements IStorageProvider {
  private documents: Map<string, Document>;
  private usage: UsageRecord;
  private settings: UserSettings;
  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.documents = new Map();
    this.usage = getDefaultUsage();
    this.settings = getDefaultSettings();

    if (isBrowser()) {
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const docsRaw = localStorage.getItem(STORAGE_KEYS.documents);
      if (docsRaw) {
        const parsed: Document[] = JSON.parse(docsRaw);
        for (const doc of parsed) {
          this.documents.set(doc.id, doc);
        }
      }

      const usageRaw = localStorage.getItem(STORAGE_KEYS.usage);
      if (usageRaw) {
        const parsed: UsageRecord = JSON.parse(usageRaw);
        // Reset usage if the reset time has passed
        if (new Date(parsed.resetsAt) <= new Date()) {
          this.usage = { ...getDefaultUsage(), plan: parsed.plan, wordsLimit: parsed.wordsLimit };
        } else {
          this.usage = parsed;
        }
      }

      const settingsRaw = localStorage.getItem(STORAGE_KEYS.settings);
      if (settingsRaw) {
        this.settings = JSON.parse(settingsRaw);
      }
    } catch {
      // Silently ignore corrupt localStorage data and keep defaults
    }
  }

  private schedulePersist(): void {
    if (!isBrowser()) return;

    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
    }

    this.persistTimer = setTimeout(() => {
      this.persistToLocalStorage();
      this.persistTimer = null;
    }, 500);
  }

  private persistToLocalStorage(): void {
    try {
      const docs = Array.from(this.documents.values());
      localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(docs));
      localStorage.setItem(STORAGE_KEYS.usage, JSON.stringify(this.usage));
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(this.settings));
    } catch {
      // Silently ignore storage quota errors
    }
  }

  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocument(id: string): Promise<Document | null> {
    return this.documents.get(id) ?? null;
  }

  async saveDocument(doc: Document): Promise<void> {
    this.documents.set(doc.id, doc);
    this.schedulePersist();
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
    this.schedulePersist();
  }

  async getUsage(): Promise<UsageRecord> {
    // Reset usage if the reset time has passed
    if (new Date(this.usage.resetsAt) <= new Date()) {
      this.usage = {
        ...getDefaultUsage(),
        plan: this.usage.plan,
        wordsLimit: this.usage.wordsLimit,
      };
      this.schedulePersist();
    }
    return { ...this.usage };
  }

  async updateUsage(words: number): Promise<void> {
    // Reset if needed before updating
    if (new Date(this.usage.resetsAt) <= new Date()) {
      this.usage = {
        ...getDefaultUsage(),
        plan: this.usage.plan,
        wordsLimit: this.usage.wordsLimit,
      };
    }
    this.usage.wordsUsedToday += words;
    this.schedulePersist();
  }

  async getSettings(): Promise<UserSettings> {
    return { ...this.settings };
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    this.settings = { ...settings };
    this.schedulePersist();
  }
}
