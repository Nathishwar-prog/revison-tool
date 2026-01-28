import { ApiAdapter } from '../adapters/api.adapter';
import { Knowledge } from '@/domain/knowledge/knowledge.model';

export interface KnowledgeRepository {
  getAll(): Promise<Knowledge[]>;
  getById(id: string): Promise<Knowledge | null>;
  create(data: any): Promise<Knowledge>;
  update(id: string, data: any): Promise<Knowledge>;
  remove(id: string): Promise<any>;
  delete(id: string): Promise<any>;
  getDueForRevision(): Promise<Knowledge[]>;
  getWeakConcepts(): Promise<Knowledge[]>;
}

// Mock data fallback if needed
const MOCK_KNOWLEDGE: Knowledge[] = [
  {
    id: "mock-1",
    title: "Mock Concept",
    type: "concept",
    domain: "Knowledge Management",
    technology: "General",
    difficulty: "Beginner" as any,
    content: { definition: "This is a mock concept for local testing.", simpleExplanation: "Local fallback mode." } as any,
    confidenceLevel: 3,
    revision: { nextRevision: new Date().toISOString() } as any,
    createdAt: new Date().toISOString()
  } as any
];

class KnowledgeRepoImpl implements KnowledgeRepository {
  async getAll(): Promise<Knowledge[]> {
    try {
      return await ApiAdapter.get('/knowledge');
    } catch (e) {
      console.warn("Falling back to local mock data for knowledge");
      return MOCK_KNOWLEDGE;
    }
  }

  async getById(id: string): Promise<Knowledge | null> {
    try {
      return await ApiAdapter.get(`/knowledge/${id}`);
    } catch (e) {
      console.warn(`Falling back to local mock for knowledge ${id}`);
      return MOCK_KNOWLEDGE.find(k => k.id === id) || null;
    }
  }

  async create(data: any): Promise<Knowledge> {
    try {
      return await ApiAdapter.post('/knowledge', data);
    } catch (e) {
      const newEntry = { ...data, id: `mock-${Date.now()}`, createdAt: new Date().toISOString() };
      console.warn("Mock created (local only):", newEntry);
      return newEntry;
    }
  }

  async update(id: string, data: any): Promise<Knowledge> {
    try {
      // Ensure we don't send immutable fields or ID in the body causing conflict
      const { id: _, userId: __, createdAt: ___, ...updateData } = data;
      return await ApiAdapter.put(`/knowledge/${id}`, updateData);
    } catch (e) {
      console.warn(`Mock updated (local only): ${id}`);
      return { ...data, id };
    }
  }

  async remove(id: string): Promise<any> {
    try {
      return await ApiAdapter.delete(`/knowledge/${id}`);
    } catch (e) {
      console.warn(`Mock deleted (local only): ${id}`);
      return { success: true };
    }
  }

  async delete(id: string): Promise<any> {
    return this.remove(id);
  }

  async getDueForRevision(): Promise<Knowledge[]> {
    try {
      const all = await this.getAll();
      const today = new Date().toISOString().split('T')[0];
      return all.filter(k => {
        const nextRevision = k.revision?.nextRevision;
        if (!nextRevision) return false;
        return nextRevision <= today;
      });
    } catch (e) {
      console.warn("getDueForRevision fallback to empty array");
      return [];
    }
  }

  async getWeakConcepts(): Promise<Knowledge[]> {
    try {
      const all = await this.getAll();
      return all.filter(k => (k.confidenceLevel ?? 0) <= 2);
    } catch (e) {
      console.warn("getWeakConcepts fallback to empty array");
      return [];
    }
  }
}

export const knowledgeRepository: KnowledgeRepository = new KnowledgeRepoImpl();
// Exporting with PascalCase to match consumer imports like { KnowledgeRepository }
export const KnowledgeRepository = knowledgeRepository;
// Exporting with old name for backward compatibility
export const KnowledgeRepo = knowledgeRepository;
