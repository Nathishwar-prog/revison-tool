import { Knowledge, RevisionHistory } from '@/domain/knowledge/knowledge.model';
import { computeLearningMetrics } from '@/domain/revision/memoryDecay.model';

export interface DomainStrength {
  domain: string;
  avgConfidence: number;
  totalConcepts: number;
  masteredCount: number;
  weakCount: number;
}

export interface TechnologyStrength {
  technology: string;
  avgConfidence: number;
  totalConcepts: number;
  masteredCount: number;
}

export interface LearningPattern {
  mostActiveDay: string;
  avgRevisionsPerWeek: number;
  preferredDifficulty: string;
  strongestDomain: string;
  weakestDomain: string;
}

export function analyzeDomainStrengths(knowledge: Knowledge[]): DomainStrength[] {
  const domainMap: Record<string, Knowledge[]> = {};

  for (const k of knowledge) {
    if (!domainMap[k.domain]) {
      domainMap[k.domain] = [];
    }
    domainMap[k.domain].push(k);
  }

  return Object.entries(domainMap)
    .map(([domain, items]) => {
      const avgConfidence = items.reduce((sum, k) => sum + k.confidenceLevel, 0) / items.length;
      const masteredCount = items.filter(k => k.confidenceLevel >= 4).length;
      const weakCount = items.filter(k => k.confidenceLevel <= 2).length;

      return {
        domain,
        avgConfidence: Math.round(avgConfidence * 10) / 10,
        totalConcepts: items.length,
        masteredCount,
        weakCount,
      };
    })
    .sort((a, b) => b.avgConfidence - a.avgConfidence);
}

export function analyzeTechnologyStrengths(knowledge: Knowledge[]): TechnologyStrength[] {
  const techMap: Record<string, Knowledge[]> = {};

  for (const k of knowledge) {
    if (!techMap[k.technology]) {
      techMap[k.technology] = [];
    }
    techMap[k.technology].push(k);
  }

  return Object.entries(techMap)
    .map(([technology, items]) => {
      const avgConfidence = items.reduce((sum, k) => sum + k.confidenceLevel, 0) / items.length;
      const masteredCount = items.filter(k => k.confidenceLevel >= 4).length;

      return {
        technology,
        avgConfidence: Math.round(avgConfidence * 10) / 10,
        totalConcepts: items.length,
        masteredCount,
      };
    })
    .sort((a, b) => b.avgConfidence - a.avgConfidence);
}

export function analyzeDecayPatterns(
  knowledge: Knowledge[],
  history: RevisionHistory[]
): { knowledgeId: string; title: string; decayRate: number }[] {
  const decayingConcepts: { knowledgeId: string; title: string; decayRate: number }[] = [];

  for (const k of knowledge) {
    const metrics = computeLearningMetrics(k.id, history);
    if (metrics.forgetRate > 0.3) {
      decayingConcepts.push({
        knowledgeId: k.id,
        title: k.title,
        decayRate: Math.round(metrics.forgetRate * 100),
      });
    }
  }

  return decayingConcepts.sort((a, b) => b.decayRate - a.decayRate);
}

export function analyzeLearningPattern(
  knowledge: Knowledge[],
  history: RevisionHistory[]
): LearningPattern {
  const dayCount: Record<string, number> = {};
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (const h of history) {
    const day = days[new Date(h.revisedAt).getDay()];
    dayCount[day] = (dayCount[day] || 0) + 1;
  }

  const mostActiveDay = Object.entries(dayCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const uniqueWeeks = new Set(
    history.map(h => {
      const d = new Date(h.revisedAt);
      const yearWeek = `${d.getFullYear()}-${Math.ceil((d.getDate() + 6 - d.getDay()) / 7)}`;
      return yearWeek;
    })
  ).size;
  const avgRevisionsPerWeek = uniqueWeeks > 0 
    ? Math.round((history.length / uniqueWeeks) * 10) / 10 
    : 0;

  const difficultyCount: Record<string, number> = {};
  for (const k of knowledge) {
    difficultyCount[k.difficulty] = (difficultyCount[k.difficulty] || 0) + 1;
  }
  const preferredDifficulty = Object.entries(difficultyCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const domainStrengths = analyzeDomainStrengths(knowledge);
  const strongestDomain = domainStrengths[0]?.domain || 'N/A';
  const weakestDomain = domainStrengths[domainStrengths.length - 1]?.domain || 'N/A';

  return {
    mostActiveDay,
    avgRevisionsPerWeek,
    preferredDifficulty,
    strongestDomain,
    weakestDomain,
  };
}
