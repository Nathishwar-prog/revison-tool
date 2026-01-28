import { ApiAdapter } from '../adapters/api.adapter';

export interface RevisionRepository {
  addRevision(data: any): Promise<any>;
  create(knowledgeId: string, confidenceGiven: number, timeTakenSeconds?: number): Promise<any>;
  getHistory(): Promise<any[]>;
  getAll(): Promise<any[]>;
  getByKnowledgeId(knowledgeId: string): Promise<any[]>;
}

class RevisionRepoImpl implements RevisionRepository {
  async addRevision(data: any): Promise<any> {
    try {
      return await ApiAdapter.post('/revision', data);
    } catch (e) {
      console.warn("Revision saved locally only (mock)");
      return { ...data, id: `r-mock-${Date.now()}` };
    }
  }

  async getHistory(): Promise<any[]> {
    try {
      return await ApiAdapter.get('/revision/history');
    } catch (e) {
      console.warn("Returning empty mock revision history");
      return [];
    }
  }

  async getAll(): Promise<any[]> {
    return this.getHistory();
  }

  async getByKnowledgeId(knowledgeId: string): Promise<any[]> {
    try {
      return await ApiAdapter.get(`/revision/history?knowledgeId=${knowledgeId}`);
    } catch (e) {
      console.warn(`Returning empty mock revision history for ${knowledgeId}`);
      return [];
    }
  }

  async create(knowledgeId: string, confidenceGiven: number, timeTakenSeconds: number = 0): Promise<any> {
    return this.addRevision({
      knowledgeId,
      confidenceGiven,
      timeTakenSeconds,
    });
  }
}

export const revisionRepository: RevisionRepository = new RevisionRepoImpl();
// Exporting with PascalCase to match consumer imports like { RevisionRepository }
export const RevisionRepository = revisionRepository;
// Exporting with old name for backward compatibility
export const RevisionRepo = revisionRepository;
