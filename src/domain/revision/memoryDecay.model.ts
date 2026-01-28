import { RevisionHistory, LearningMetrics } from '../knowledge/knowledge.model';
import { AppConfig } from '@/config/app.config';

export function calculateForgetRate(history: RevisionHistory[]): number {
  if (history.length < 2) return 0;

  let forgotCount = 0;
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1].confidenceGiven;
    const curr = history[i].confidenceGiven;
    if (curr < prev) {
      forgotCount++;
    }
  }

  return forgotCount / (history.length - 1);
}

export function calculateRevisionConsistency(history: RevisionHistory[]): number {
  if (history.length < 2) return 1;

  const dates = history.map(h => new Date(h.revisedAt).getTime());
  dates.sort((a, b) => a - b);

  const gaps: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    const daysDiff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
    gaps.push(daysDiff);
  }

  if (gaps.length === 0) return 1;

  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
  const stdDev = Math.sqrt(variance);

  const consistency = avgGap > 0 ? 1 / (1 + stdDev / avgGap) : 1;
  
  return Math.min(1, Math.max(0, consistency));
}

export function calculateAverageConfidence(history: RevisionHistory[]): number {
  if (history.length === 0) return 3;

  const sum = history.reduce((acc, h) => acc + h.confidenceGiven, 0);
  return sum / history.length;
}

export function computeLearningMetrics(
  knowledgeId: string,
  history: RevisionHistory[]
): LearningMetrics {
  const relevantHistory = history.filter(h => h.knowledgeId === knowledgeId);

  return {
    knowledgeId,
    avgConfidence: calculateAverageConfidence(relevantHistory),
    forgetRate: calculateForgetRate(relevantHistory),
    revisionConsistency: calculateRevisionConsistency(relevantHistory),
  };
}

export function isMemoryDecaying(metrics: LearningMetrics): boolean {
  return (
    metrics.avgConfidence <= AppConfig.intelligence.weakConceptThreshold &&
    metrics.forgetRate > AppConfig.intelligence.highForgetRateThreshold
  );
}
