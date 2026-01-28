import { Knowledge, RevisionHistory } from '@/domain/knowledge/knowledge.model';
import { isDue, getDaysUntilDue } from '@/domain/revision/revision.engine';
import { detectWeakConcepts } from './weakConceptDetector';

export interface RevisionPlanItem {
  knowledge: Knowledge;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  daysOverdue: number;
}

export interface DailyRevisionPlan {
  date: string;
  items: RevisionPlanItem[];
  totalCount: number;
  criticalCount: number;
}

function calculatePriority(
  knowledge: Knowledge,
  isWeak: boolean,
  daysOverdue: number
): RevisionPlanItem['priority'] {
  if (daysOverdue > 7 && isWeak) return 'critical';
  if (daysOverdue > 7 || isWeak) return 'high';
  if (daysOverdue > 0) return 'medium';
  return 'low';
}

function buildReason(
  knowledge: Knowledge,
  isWeak: boolean,
  daysOverdue: number
): string {
  const reasons: string[] = [];
  
  if (daysOverdue > 0) {
    reasons.push(`${daysOverdue} days overdue`);
  }
  
  if (isWeak) {
    reasons.push(`low confidence (${knowledge.confidenceLevel}/5)`);
  }

  return reasons.length > 0 ? reasons.join(', ') : 'scheduled revision';
}

export function createDailyRevisionPlan(
  knowledge: Knowledge[],
  history: RevisionHistory[]
): DailyRevisionPlan {
  const today = new Date().toISOString().split('T')[0];
  const weakConcepts = detectWeakConcepts(knowledge, history);
  const weakIds = new Set(weakConcepts.map(wc => wc.knowledge.id));

  const dueItems = knowledge.filter(k => isDue(k.revision.nextRevision));

  const planItems: RevisionPlanItem[] = dueItems.map(k => {
    const daysOverdue = Math.abs(getDaysUntilDue(k.revision.nextRevision));
    const isWeak = weakIds.has(k.id);

    return {
      knowledge: k,
      priority: calculatePriority(k, isWeak, daysOverdue),
      reason: buildReason(k, isWeak, daysOverdue),
      daysOverdue,
    };
  });

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  planItems.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.daysOverdue - a.daysOverdue;
  });

  return {
    date: today,
    items: planItems,
    totalCount: planItems.length,
    criticalCount: planItems.filter(i => i.priority === 'critical').length,
  };
}

export function getUpcomingRevisions(
  knowledge: Knowledge[],
  daysAhead: number = 7
): Knowledge[] {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + daysAhead);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  return knowledge
    .filter(k => {
      const nextRevision = k.revision.nextRevision;
      return nextRevision > new Date().toISOString().split('T')[0] && nextRevision <= futureDateStr;
    })
    .sort((a, b) => a.revision.nextRevision.localeCompare(b.revision.nextRevision));
}

export function getRevisionStreak(history: RevisionHistory[]): number {
  if (history.length === 0) return 0;

  const sortedDates = [...new Set(history.map(h => h.revisedAt))].sort().reverse();
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    const expectedStr = expectedDate.toISOString().split('T')[0];
    
    if (sortedDates.includes(expectedStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
