import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryStorage } from '@/lib/storage/in-memory';
import type { Document, UserSettings } from '@/types';

describe('InMemoryStorage', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  describe('documents', () => {
    const doc: Document = {
      id: 'test-1',
      text: 'Hello world',
      type: 'detection',
      createdAt: new Date().toISOString(),
    };

    it('saveDocument and getDocument round-trip', async () => {
      await storage.saveDocument(doc);
      const retrieved = await storage.getDocument('test-1');
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe('test-1');
      expect(retrieved!.text).toBe('Hello world');
      expect(retrieved!.type).toBe('detection');
    });

    it('getDocuments returns all saved docs', async () => {
      const doc2: Document = {
        id: 'test-2',
        text: 'Second doc',
        type: 'humanization',
        createdAt: new Date().toISOString(),
      };
      await storage.saveDocument(doc);
      await storage.saveDocument(doc2);

      const docs = await storage.getDocuments();
      expect(docs).toHaveLength(2);
      const ids = docs.map((d) => d.id);
      expect(ids).toContain('test-1');
      expect(ids).toContain('test-2');
    });

    it('deleteDocument removes the document', async () => {
      await storage.saveDocument(doc);
      await storage.deleteDocument('test-1');
      const retrieved = await storage.getDocument('test-1');
      expect(retrieved).toBeNull();
    });

    it('getDocument returns null for non-existent id', async () => {
      const retrieved = await storage.getDocument('non-existent');
      expect(retrieved).toBeNull();
    });
  });

  describe('usage', () => {
    it('getUsage returns a valid UsageRecord', async () => {
      const usage = await storage.getUsage();
      expect(usage).toHaveProperty('wordsUsedToday');
      expect(usage).toHaveProperty('wordsLimit');
      expect(usage).toHaveProperty('plan');
      expect(usage).toHaveProperty('resetsAt');
      expect(typeof usage.wordsUsedToday).toBe('number');
      expect(typeof usage.wordsLimit).toBe('number');
    });

    it('updateUsage increments wordsUsedToday', async () => {
      const before = await storage.getUsage();
      await storage.updateUsage(50);
      const after = await storage.getUsage();
      expect(after.wordsUsedToday).toBe(before.wordsUsedToday + 50);
    });

    it('updateUsage accumulates across multiple calls', async () => {
      await storage.updateUsage(30);
      await storage.updateUsage(20);
      const usage = await storage.getUsage();
      expect(usage.wordsUsedToday).toBe(50);
    });
  });

  describe('settings', () => {
    it('getSettings returns default settings', async () => {
      const settings = await storage.getSettings();
      expect(settings).toHaveProperty('theme');
      expect(settings).toHaveProperty('defaultMode');
      expect(settings).toHaveProperty('detectionWeights');
    });

    it('saveSettings and getSettings round-trip', async () => {
      const newSettings: UserSettings = {
        theme: 'light',
        defaultMode: 'academic',
        detectionWeights: { perplexity: 0.5, burstiness: 0.5 },
      };
      await storage.saveSettings(newSettings);
      const retrieved = await storage.getSettings();
      expect(retrieved.theme).toBe('light');
      expect(retrieved.defaultMode).toBe('academic');
      expect(retrieved.detectionWeights.perplexity).toBe(0.5);
    });

    it('saveSettings does not mutate the passed object', async () => {
      const newSettings: UserSettings = {
        theme: 'light',
        defaultMode: 'creative',
        detectionWeights: { perplexity: 0.3 },
      };
      await storage.saveSettings(newSettings);
      newSettings.theme = 'dark';
      const retrieved = await storage.getSettings();
      expect(retrieved.theme).toBe('light');
    });
  });
});
