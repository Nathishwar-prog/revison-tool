import { Knowledge, RevisionHistory, LearningMetrics } from '@/domain/knowledge/knowledge.model';
import { KnowledgeRepository } from '@/data/repositories/knowledge.repo';
import { RevisionRepository } from '@/data/repositories/revision.repo';
import { computeLearningMetrics } from '@/domain/revision/memoryDecay.model';

export interface AIReadyKnowledge {
  knowledge: Knowledge;
  metrics: LearningMetrics;
  history: RevisionHistory[];
}

export async function selectKnowledgeForAI(knowledgeId: string): Promise<AIReadyKnowledge | null> {
  const knowledge = await KnowledgeRepository.getById(knowledgeId);
  if (!knowledge) return null;

  const history = await RevisionRepository.getByKnowledgeId(knowledgeId);
  const metrics = computeLearningMetrics(knowledgeId, history);

  return { knowledge, metrics, history };
}

export async function selectWeakConceptsForAI(limit: number = 5): Promise<AIReadyKnowledge[]> {
  const allKnowledge = await KnowledgeRepository.getAll();
  const allHistory = await RevisionRepository.getAll();

  const withMetrics = allKnowledge.map(k => {
    const history = allHistory.filter(h => h.knowledgeId === k.id);
    const metrics = computeLearningMetrics(k.id, allHistory);
    return { knowledge: k, metrics, history };
  });

  return withMetrics
    .filter(item => item.knowledge.confidenceLevel <= 2 || item.metrics.forgetRate > 0.3)
    .sort((a, b) => {
      const scoreA = a.knowledge.confidenceLevel - a.metrics.forgetRate * 5;
      const scoreB = b.knowledge.confidenceLevel - b.metrics.forgetRate * 5;
      return scoreA - scoreB;
    })
    .slice(0, limit);
}

export async function selectDueForRevisionWithMetrics(): Promise<AIReadyKnowledge[]> {
  const dueKnowledge = await KnowledgeRepository.getDueForRevision();
  const allHistory = await RevisionRepository.getAll();

  return dueKnowledge.map(k => {
    const history = allHistory.filter(h => h.knowledgeId === k.id);
    const metrics = computeLearningMetrics(k.id, allHistory);
    return { knowledge: k, metrics, history };
  });
}

export async function selectLearningContext(): Promise<{
  totalKnowledge: number;
  dueCount: number;
  weakCount: number;
  masteredCount: number;
  averageConfidence: number;
}> {
  const allKnowledge = await KnowledgeRepository.getAll();
  const dueKnowledge = await KnowledgeRepository.getDueForRevision();
  const weakKnowledge = await KnowledgeRepository.getWeakConcepts();

  const masteredCount = allKnowledge.filter(k => k.confidenceLevel >= 4).length;
  const averageConfidence = allKnowledge.length > 0
    ? allKnowledge.reduce((sum, k) => sum + k.confidenceLevel, 0) / allKnowledge.length
    : 0;

  return {
    totalKnowledge: allKnowledge.length,
    dueCount: dueKnowledge.length,
    weakCount: weakKnowledge.length,
    masteredCount,
    averageConfidence: Math.round(averageConfidence * 10) / 10,
  };
}

export function shouldShowAIExplainWeak(metrics: LearningMetrics, confidenceLevel: number): boolean {
  return confidenceLevel <= 2 || metrics.forgetRate > 0.3;
}

export function getAIRecommendationType(
  metrics: LearningMetrics,
  confidenceLevel: number
): 'summary' | 'quiz' | 'explainWeak' | 'all' {
  if (confidenceLevel <= 2 && metrics.forgetRate > 0.3) {
    return 'explainWeak';
  }
  if (confidenceLevel <= 2) {
    return 'summary';
  }
  if (metrics.forgetRate > 0.3) {
    return 'quiz';
  }
  return 'all';
}
