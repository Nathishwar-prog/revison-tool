import { Knowledge, RevisionHistory } from '@/domain/knowledge/knowledge.model';

export interface StorageAdapter {
  getKnowledge(): Promise<Knowledge[]>;
  getKnowledgeById(id: string): Promise<Knowledge | null>;
  saveKnowledge(data: Knowledge): Promise<Knowledge>;
  updateKnowledge(id: string, data: Partial<Knowledge>): Promise<Knowledge>;
  deleteKnowledge(id: string): Promise<void>;
  
  getRevisionHistory(): Promise<RevisionHistory[]>;
  getRevisionHistoryByKnowledgeId(knowledgeId: string): Promise<RevisionHistory[]>;
  saveRevisionHistory(data: RevisionHistory): Promise<RevisionHistory>;
}

export class ApiAdapter implements StorageAdapter {
  private basePath: string;

  constructor(basePath: string = '/api') {
    this.basePath = basePath;
  }

  async getKnowledge(): Promise<Knowledge[]> {
    const res = await fetch(`${this.basePath}/knowledge`);
    if (!res.ok) throw new Error('Failed to fetch knowledge');
    return res.json();
  }

  async getKnowledgeById(id: string): Promise<Knowledge | null> {
    const res = await fetch(`${this.basePath}/knowledge/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch knowledge');
    return res.json();
  }

  async saveKnowledge(data: Knowledge): Promise<Knowledge> {
    const res = await fetch(`${this.basePath}/knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save knowledge');
    return res.json();
  }

  async updateKnowledge(id: string, data: Partial<Knowledge>): Promise<Knowledge> {
    const res = await fetch(`${this.basePath}/knowledge/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update knowledge');
    return res.json();
  }

  async deleteKnowledge(id: string): Promise<void> {
    const res = await fetch(`${this.basePath}/knowledge/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete knowledge');
  }

  async getRevisionHistory(): Promise<RevisionHistory[]> {
    const res = await fetch(`${this.basePath}/revision-history`);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error('Failed to fetch revision history');
    return res.json();
  }

  async getRevisionHistoryByKnowledgeId(knowledgeId: string): Promise<RevisionHistory[]> {
    const res = await fetch(`${this.basePath}/revision-history?knowledgeId=${knowledgeId}`);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error('Failed to fetch revision history');
    return res.json();
  }

  async saveRevisionHistory(data: RevisionHistory): Promise<RevisionHistory> {
    const res = await fetch(`${this.basePath}/revision-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save revision history');
    return res.json();
  }
}
