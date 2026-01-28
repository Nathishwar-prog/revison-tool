import { Knowledge } from '@/domain/knowledge/knowledge.model';
import { KnowledgeRepository } from '@/data/repositories/knowledge.repo';
import { RevisionRepository } from '@/data/repositories/revision.repo';
import { 
  validateKnowledge, 
  sanitizeKnowledgeInput 
} from '@/domain/knowledge/knowledge.validator';
import { 
  processRevisionWithHistory,
  processRevision 
} from '@/domain/revision/revision.engine';

export const KnowledgeService = {
  async getAll(): Promise<Knowledge[]> {
    return KnowledgeRepository.getAll();
  },

  async getById(id: string): Promise<Knowledge | null> {
    return KnowledgeRepository.getById(id);
  },

  async create(data: Partial<Knowledge>): Promise<Knowledge> {
    const sanitized = sanitizeKnowledgeInput(data);
    const validation = validateKnowledge(sanitized);
    
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    return KnowledgeRepository.create(sanitized);
  },

  async update(id: string, data: Partial<Knowledge>): Promise<Knowledge> {
    const sanitized = sanitizeKnowledgeInput(data);
    return KnowledgeRepository.update(id, sanitized);
  },

  async delete(id: string): Promise<void> {
    return KnowledgeRepository.delete(id);
  },

  async getDueForRevision(): Promise<Knowledge[]> {
    return KnowledgeRepository.getDueForRevision();
  },

  async getWeakConcepts(): Promise<Knowledge[]> {
    return KnowledgeRepository.getWeakConcepts();
  },

  async recordRevision(
    knowledgeId: string,
    confidenceLevel: number,
    timeTakenSeconds: number = 0
  ): Promise<Knowledge> {
    const knowledge = await KnowledgeRepository.getById(knowledgeId);
    if (!knowledge) {
      throw new Error('Knowledge not found');
    }

    const history = await RevisionRepository.getByKnowledgeId(knowledgeId);

    await RevisionRepository.create(knowledgeId, confidenceLevel, timeTakenSeconds);

    const result = processRevisionWithHistory(
      knowledge.revision,
      confidenceLevel,
      history
    );

    return KnowledgeRepository.update(knowledgeId, {
      confidenceLevel,
      revision: result.revision,
    });
  },

  async recordRevisionSimple(
    knowledgeId: string,
    confidenceLevel: number
  ): Promise<Knowledge> {
    const knowledge = await KnowledgeRepository.getById(knowledgeId);
    if (!knowledge) {
      throw new Error('Knowledge not found');
    }

    const revision = processRevision(knowledge.revision, confidenceLevel);

    return KnowledgeRepository.update(knowledgeId, {
      confidenceLevel,
      revision,
    });
  },
};
