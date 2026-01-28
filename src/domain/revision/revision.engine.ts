import { RevisionData, RevisionHistory, LearningMetrics } from '../knowledge/knowledge.model';
import { defaultRevisionPolicy, clampInterval } from './revision.policy';
import { computeLearningMetrics } from './memoryDecay.model';
import { AppConfig } from '@/config/app.config';

export interface RevisionResult {
  revision: RevisionData;
  intervalUsed: number;
  wasAdaptive: boolean;
}

export function calculateAdaptiveInterval(
  baseInterval: number,
  metrics: LearningMetrics
): number {
  const { consistencyBoost, forgetPenalty } = AppConfig.revision.adaptiveWeights;

  const consistencyFactor = 1 + metrics.revisionConsistency * consistencyBoost;
  const forgetFactor = 1 - metrics.forgetRate * forgetPenalty;

  const adaptiveInterval = baseInterval * consistencyFactor * forgetFactor;

  return clampInterval(adaptiveInterval);
}

export function calculateNextRevisionDate(daysToAdd: number): string {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate.toISOString().split('T')[0];
}

export function processRevisionWithHistory(
  currentRevision: RevisionData,
  confidenceLevel: number,
  history: RevisionHistory[]
): RevisionResult {
  const policy = defaultRevisionPolicy;
  const baseInterval = policy.getBaseInterval(confidenceLevel);
  const today = new Date().toISOString().split('T')[0];
  const newRevisionCount = (currentRevision.revisionCount || 0) + 1;

  let finalInterval = baseInterval;
  let wasAdaptive = false;

  if (policy.shouldApplyAdaptive(newRevisionCount) && history.length > 0) {
    const metrics = computeLearningMetrics(history[0]?.knowledgeId || '', history);
    finalInterval = calculateAdaptiveInterval(baseInterval, metrics);
    wasAdaptive = true;
  }

  return {
    revision: {
      lastRevised: today,
      revisionCount: newRevisionCount,
      nextRevision: calculateNextRevisionDate(finalInterval),
    },
    intervalUsed: finalInterval,
    wasAdaptive,
  };
}

export function processRevision(
  currentRevision: RevisionData,
  confidenceLevel: number
): RevisionData {
  const result = processRevisionWithHistory(currentRevision, confidenceLevel, []);
  return result.revision;
}

export function isDue(nextRevisionDate: string): boolean {
  if (!nextRevisionDate) return true;
  const today = new Date().toISOString().split('T')[0];
  return nextRevisionDate <= today;
}

export function getDaysUntilDue(nextRevisionDate: string): number {
  if (!nextRevisionDate) return 0;
  const today = new Date();
  const dueDate = new Date(nextRevisionDate);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
