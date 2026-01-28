import { Knowledge, RevisionHistory } from '@/domain/knowledge/knowledge.model';
import { StorageAdapter } from './api.adapter';

const KNOWLEDGE_KEY = 'pks_knowledge';
const REVISION_HISTORY_KEY = 'pks_revision_history';

export class LocalStorageAdapter implements StorageAdapter {
  private getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  async getKnowledge(): Promise<Knowledge[]> {
    return this.getItem<Knowledge[]>(KNOWLEDGE_KEY, []);
  }

  async getKnowledgeById(id: string): Promise<Knowledge | null> {
    const items = await this.getKnowledge();
    return items.find(k => k.id === id) || null;
  }

  async saveKnowledge(data: Knowledge): Promise<Knowledge> {
    const items = await this.getKnowledge();
    items.push(data);
    this.setItem(KNOWLEDGE_KEY, items);
    return data;
  }

  async updateKnowledge(id: string, data: Partial<Knowledge>): Promise<Knowledge> {
    const items = await this.getKnowledge();
    const index = items.findIndex(k => k.id === id);
    if (index === -1) throw new Error('Knowledge not found');
    
    items[index] = { ...items[index], ...data };
    this.setItem(KNOWLEDGE_KEY, items);
    return items[index];
  }

  async deleteKnowledge(id: string): Promise<void> {
    const items = await this.getKnowledge();
    const filtered = items.filter(k => k.id !== id);
    this.setItem(KNOWLEDGE_KEY, filtered);
  }

  async getRevisionHistory(): Promise<RevisionHistory[]> {
    return this.getItem<RevisionHistory[]>(REVISION_HISTORY_KEY, []);
  }

  async getRevisionHistoryByKnowledgeId(knowledgeId: string): Promise<RevisionHistory[]> {
    const history = await this.getRevisionHistory();
    return history.filter(h => h.knowledgeId === knowledgeId);
  }

  async saveRevisionHistory(data: RevisionHistory): Promise<RevisionHistory> {
    const history = await this.getRevisionHistory();
    history.push(data);
    this.setItem(REVISION_HISTORY_KEY, history);
    return data;
  }
}
