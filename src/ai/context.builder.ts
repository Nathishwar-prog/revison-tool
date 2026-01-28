import { Knowledge, RevisionHistory, LearningMetrics } from '@/domain/knowledge/knowledge.model';
import { computeLearningMetrics } from '@/domain/revision/memoryDecay.model';

export interface AIContext {
  title: string;
  definition: string;
  simpleExplanation: string;
  example: string;
  commonMistakes: string[];
  myConfusion: string;
  confidenceLevel: number;
  forgetRate: number;
  revisionCount: number;
  lastRevised: string;
  domain: string;
  technology: string;
  difficulty: string;
}

export interface DailyPlanContext {
  dueRevisions: { title: string; confidenceLevel: number; lastRevised: string }[];
  weakConcepts: { title: string; forgetRate: number; avgConfidence: number }[];
  sessionLength: 'short' | 'long';
  totalKnowledge: number;
}

export function buildAIContext(
  knowledge: Knowledge,
  history: RevisionHistory[]
): AIContext {
  const metrics = computeLearningMetrics(knowledge.id, history);

  return {
    title: knowledge.title,
    definition: knowledge.content.definition,
    simpleExplanation: knowledge.content.simpleExplanation,
    example: knowledge.content.example,
    commonMistakes: knowledge.content.commonMistakes,
    myConfusion: knowledge.content.myConfusion,
    confidenceLevel: knowledge.confidenceLevel,
    forgetRate: Math.round(metrics.forgetRate * 100) / 100,
    revisionCount: knowledge.revision.revisionCount,
    lastRevised: knowledge.revision.lastRevised || 'Never',
    domain: knowledge.domain,
    technology: knowledge.technology,
    difficulty: knowledge.difficulty,
  };
}

export function buildDailyPlanContext(
  dueKnowledge: Knowledge[],
  weakKnowledge: { knowledge: Knowledge; metrics: LearningMetrics }[],
  sessionLength: 'short' | 'long',
  totalKnowledge: number
): DailyPlanContext {
  return {
    dueRevisions: dueKnowledge.slice(0, 10).map(k => ({
      title: k.title,
      confidenceLevel: k.confidenceLevel,
      lastRevised: k.revision.lastRevised || 'Never',
    })),
    weakConcepts: weakKnowledge.slice(0, 5).map(w => ({
      title: w.knowledge.title,
      forgetRate: Math.round(w.metrics.forgetRate * 100) / 100,
      avgConfidence: Math.round(w.metrics.avgConfidence * 10) / 10,
    })),
    sessionLength,
    totalKnowledge,
  };
}

export function contextToString(context: AIContext): string {
  const lines = [
    `**Title:** ${context.title}`,
    `**Domain:** ${context.domain}`,
    `**Technology:** ${context.technology}`,
    `**Difficulty:** ${context.difficulty}`,
    '',
    `**Definition:**`,
    context.definition,
    '',
    `**Simple Explanation:**`,
    context.simpleExplanation,
    '',
    `**Real-World Example:**`,
    context.example || 'Not provided',
    '',
    `**Common Mistakes:**`,
    context.commonMistakes.length > 0
      ? context.commonMistakes.map(m => `- ${m}`).join('\n')
      : 'None documented',
    '',
    `**My Confusion / Personal Notes:**`,
    context.myConfusion || 'None documented',
    '',
    '--- Learning Metrics ---',
    `Confidence Level: ${context.confidenceLevel}/5`,
    `Forget Rate: ${(context.forgetRate * 100).toFixed(0)}%`,
    `Revision Count: ${context.revisionCount}`,
    `Last Revised: ${context.lastRevised}`,
  ];

  return lines.join('\n');
}

export function dailyPlanContextToString(context: DailyPlanContext): string {
  const lines = [
    `**Session Type:** ${context.sessionLength === 'short' ? 'Short (15-20 min)' : 'Long (45-60 min)'}`,
    `**Total Knowledge Items:** ${context.totalKnowledge}`,
    '',
    '--- Due for Revision ---',
    context.dueRevisions.length > 0
      ? context.dueRevisions.map(d => 
          `- ${d.title} (Confidence: ${d.confidenceLevel}, Last: ${d.lastRevised})`
        ).join('\n')
      : 'No items due today',
    '',
    '--- Weak Concepts Needing Attention ---',
    context.weakConcepts.length > 0
      ? context.weakConcepts.map(w =>
          `- ${w.title} (Forget Rate: ${(w.forgetRate * 100).toFixed(0)}%, Avg Confidence: ${w.avgConfidence})`
        ).join('\n')
      : 'No weak concepts identified',
  ];

  return lines.join('\n');
}
