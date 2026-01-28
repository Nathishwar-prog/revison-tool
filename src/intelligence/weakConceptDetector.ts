import { Knowledge, RevisionHistory, LearningMetrics } from '@/domain/knowledge/knowledge.model';
import { computeLearningMetrics } from '@/domain/revision/memoryDecay.model';
import { AppConfig } from '@/config/app.config';

export interface WeakConcept {
  knowledge: Knowledge;
  metrics: LearningMetrics;
  reason: 'low_confidence' | 'high_forget_rate' | 'both';
}

export function detectWeakConcepts(
  knowledge: Knowledge[],
  history: RevisionHistory[]
): WeakConcept[] {
  const weakConcepts: WeakConcept[] = [];
  const { weakConceptThreshold, highForgetRateThreshold } = AppConfig.intelligence;

  for (const k of knowledge) {
    const metrics = computeLearningMetrics(k.id, history);
    const lowConfidence = k.confidenceLevel <= weakConceptThreshold;
    const highForgetRate = metrics.forgetRate > highForgetRateThreshold;

    if (lowConfidence || highForgetRate) {
      let reason: WeakConcept['reason'] = 'low_confidence';
      if (lowConfidence && highForgetRate) {
        reason = 'both';
      } else if (highForgetRate) {
        reason = 'high_forget_rate';
      }

      weakConcepts.push({ knowledge: k, metrics, reason });
    }
  }

  return weakConcepts.sort((a, b) => {
    const scoreA = a.metrics.avgConfidence - a.metrics.forgetRate * 5;
    const scoreB = b.metrics.avgConfidence - b.metrics.forgetRate * 5;
    return scoreA - scoreB;
  });
}

export function getWeakConceptsByDomain(
  knowledge: Knowledge[],
  history: RevisionHistory[]
): Record<string, WeakConcept[]> {
  const weakConcepts = detectWeakConcepts(knowledge, history);
  const byDomain: Record<string, WeakConcept[]> = {};

  for (const wc of weakConcepts) {
    const domain = wc.knowledge.domain;
    if (!byDomain[domain]) {
      byDomain[domain] = [];
    }
    byDomain[domain].push(wc);
  }

  return byDomain;
}

export function getWeakConceptsByTechnology(
  knowledge: Knowledge[],
  history: RevisionHistory[]
): Record<string, WeakConcept[]> {
  const weakConcepts = detectWeakConcepts(knowledge, history);
  const byTech: Record<string, WeakConcept[]> = {};

  for (const wc of weakConcepts) {
    const tech = wc.knowledge.technology;
    if (!byTech[tech]) {
      byTech[tech] = [];
    }
    byTech[tech].push(wc);
  }

  return byTech;
}
