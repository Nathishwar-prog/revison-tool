import { Knowledge, RevisionHistory } from '@/domain/knowledge/knowledge.model';
import { KnowledgeRepository } from '@/data/repositories/knowledge.repo';
import { RevisionRepository } from '@/data/repositories/revision.repo';
import { detectWeakConcepts, WeakConcept } from './weakConceptDetector';
import { 
  createDailyRevisionPlan, 
  DailyRevisionPlan,
  getUpcomingRevisions,
  getRevisionStreak 
} from './revisionPlanner';
import { 
  analyzeDomainStrengths,
  analyzeTechnologyStrengths,
  analyzeLearningPattern,
  analyzeDecayPatterns,
  DomainStrength,
  TechnologyStrength,
  LearningPattern
} from './learningPatternAnalyzer';

export interface LearningInsights {
  weakConcepts: WeakConcept[];
  dailyPlan: DailyRevisionPlan;
  upcomingRevisions: Knowledge[];
  domainStrengths: DomainStrength[];
  technologyStrengths: TechnologyStrength[];
  learningPattern: LearningPattern;
  decayingConcepts: { knowledgeId: string; title: string; decayRate: number }[];
  revisionStreak: number;
  totalKnowledge: number;
  masteredCount: number;
  averageConfidence: number;
}

export const InsightEngine = {
  async generateInsights(): Promise<LearningInsights> {
    const knowledge = await KnowledgeRepository.getAll();
    const history = await RevisionRepository.getAll();

    return this.computeInsights(knowledge, history);
  },

  computeInsights(
    knowledge: Knowledge[],
    history: RevisionHistory[]
  ): LearningInsights {
    const weakConcepts = detectWeakConcepts(knowledge, history);
    const dailyPlan = createDailyRevisionPlan(knowledge, history);
    const upcomingRevisions = getUpcomingRevisions(knowledge);
    const domainStrengths = analyzeDomainStrengths(knowledge);
    const technologyStrengths = analyzeTechnologyStrengths(knowledge);
    const learningPattern = analyzeLearningPattern(knowledge, history);
    const decayingConcepts = analyzeDecayPatterns(knowledge, history);
    const revisionStreak = getRevisionStreak(history);

    const totalKnowledge = knowledge.length;
    const masteredCount = knowledge.filter(k => k.confidenceLevel >= 4).length;
    const averageConfidence = totalKnowledge > 0
      ? Math.round((knowledge.reduce((sum, k) => sum + k.confidenceLevel, 0) / totalKnowledge) * 10) / 10
      : 0;

    return {
      weakConcepts,
      dailyPlan,
      upcomingRevisions,
      domainStrengths,
      technologyStrengths,
      learningPattern,
      decayingConcepts,
      revisionStreak,
      totalKnowledge,
      masteredCount,
      averageConfidence,
    };
  },

  async getQuickStats(): Promise<{
    totalKnowledge: number;
    dueToday: number;
    weakCount: number;
    masteredCount: number;
  }> {
    const knowledge = await KnowledgeRepository.getAll();
    const dueItems = await KnowledgeRepository.getDueForRevision();
    const weakItems = await KnowledgeRepository.getWeakConcepts();
    const masteredCount = knowledge.filter(k => k.confidenceLevel >= 4).length;

    return {
      totalKnowledge: knowledge.length,
      dueToday: dueItems.length,
      weakCount: weakItems.length,
      masteredCount,
    };
  },
};
