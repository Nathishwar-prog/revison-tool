import { AIService, AIResponse, AIFeatureType } from '@/ai/ai.service';
import { selectKnowledgeForAI, selectLearningContext, getAIRecommendationType } from './ai.selectors';

export interface PersonalizationResult {
  feature: AIFeatureType;
  response: AIResponse;
  recommendedNext?: AIFeatureType;
}

export const PersonalizationEngine = {
  async generateSmartSummary(knowledgeId: string): Promise<PersonalizationResult> {
    const response = await AIService.getPersonalizedSummary(knowledgeId);
    const aiData = await selectKnowledgeForAI(knowledgeId);
    
    let recommendedNext: AIFeatureType | undefined;
    if (aiData) {
      const recommendation = getAIRecommendationType(aiData.metrics, aiData.knowledge.confidenceLevel);
      if (recommendation !== 'summary' && recommendation !== 'all') {
        recommendedNext = recommendation;
      }
    }

    return {
      feature: 'summary',
      response,
      recommendedNext,
    };
  },

  async generateQuiz(knowledgeId: string, questionCount: number = 5): Promise<PersonalizationResult> {
    const response = await AIService.getPersonalizedQuiz(knowledgeId, questionCount);
    
    return {
      feature: 'quiz',
      response,
    };
  },

  async explainWeakness(knowledgeId: string): Promise<PersonalizationResult> {
    const response = await AIService.explainMyWeakness(knowledgeId);
    
    return {
      feature: 'explainWeak',
      response,
      recommendedNext: 'quiz',
    };
  },

  async getDailyPlan(sessionLength: 'short' | 'long' = 'short'): Promise<PersonalizationResult> {
    const response = await AIService.getDailyLearningPlan(sessionLength);
    
    return {
      feature: 'dailyPlan',
      response,
    };
  },

  async getContextualRecommendation(knowledgeId: string): Promise<{
    recommended: AIFeatureType;
    reason: string;
  }> {
    const aiData = await selectKnowledgeForAI(knowledgeId);
    
    if (!aiData) {
      return {
        recommended: 'summary',
        reason: 'Start with a summary to understand the concept.',
      };
    }

    const { metrics, knowledge } = aiData;
    const recommendation = getAIRecommendationType(metrics, knowledge.confidenceLevel);

    const reasons: Record<AIFeatureType | 'all', string> = {
      summary: 'Your confidence is low. A detailed summary will help reinforce the fundamentals.',
      quiz: 'You have a high forget rate. Practice with a quiz to strengthen retention.',
      explainWeak: 'You\'re struggling with this concept. Let AI analyze why and suggest improvements.',
      dailyPlan: 'Plan your learning session for maximum efficiency.',
      all: 'You\'re doing well! Choose any feature to continue learning.',
    };

    return {
      recommended: recommendation === 'all' ? 'summary' : recommendation,
      reason: reasons[recommendation],
    };
  },

  async getLearningStats(): Promise<{
    totalKnowledge: number;
    dueCount: number;
    weakCount: number;
    masteredCount: number;
    averageConfidence: number;
    suggestedAction: string;
  }> {
    const context = await selectLearningContext();
    
    let suggestedAction = 'Add more knowledge to your library.';
    
    if (context.dueCount > 0) {
      suggestedAction = `You have ${context.dueCount} concept${context.dueCount > 1 ? 's' : ''} due for revision.`;
    } else if (context.weakCount > 0) {
      suggestedAction = `Focus on strengthening ${context.weakCount} weak concept${context.weakCount > 1 ? 's' : ''}.`;
    } else if (context.averageConfidence < 4) {
      suggestedAction = 'Keep revising to increase your overall confidence.';
    } else {
      suggestedAction = 'Great job! Your knowledge is well-maintained.';
    }

    return {
      ...context,
      suggestedAction,
    };
  },
};
