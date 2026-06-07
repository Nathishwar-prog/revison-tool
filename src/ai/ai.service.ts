import { Knowledge, RevisionHistory, LearningMetrics } from '@/domain/knowledge/knowledge.model';
import { KnowledgeRepository } from '@/data/repositories/knowledge.repo';
import { RevisionRepository } from '@/data/repositories/revision.repo';
import { buildSummarizerPrompt, buildSummarizerSystemPrompt } from './summarizer.prompt';
import { buildQuizPrompt, buildQuizSystemPrompt } from './quizGenerator.prompt';
import { buildExplainSimplePrompt, buildExplainSimpleSystemPrompt } from './explainSimple.prompt';
import { buildAIContext, buildDailyPlanContext, AIContext, DailyPlanContext } from './context.builder';
import { buildSummaryPrompt, buildSummarySystemPrompt } from './prompts/summary.prompt';
import { buildQuizPrompt as buildPersonalizedQuizPrompt, buildQuizSystemPrompt as buildPersonalizedQuizSystemPrompt } from './prompts/quiz.prompt';
import { buildExplainWeakPrompt, buildExplainWeakSystemPrompt } from './prompts/explainWeak.prompt';
import { buildDailyPlanPrompt, buildDailyPlanSystemPrompt } from './prompts/dailyPlan.prompt';
import { buildChatSystemPrompt, buildChatUserPrompt } from './prompts/chat.prompt';
import { buildCourseGeneratorPrompt, buildCourseGeneratorSystemPrompt } from './prompts/courseGenerator.prompt';
import { buildGapHunterPrompt, buildGapHunterSystemPrompt } from './prompts/gapHunter.prompt';
import { getAIKeys, AIKeyConfig } from './storage';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { ApiAdapter } from '@/data/adapters/api.adapter';
import { AIPromptConfig, AIResponse, AIProvider, AIFeatureType } from './ai-types';
import { AIRouter } from './providers/ai-router.service';
export type { AIPromptConfig, AIResponse, AIProvider, AIFeatureType }; // Re-export for compatibility

// Types imported from ./ai-types.ts

/* Legacy Fallback Logic Removed - See AIRouter */


export function setAIProvider(provider: AIProvider): void {
}

export const AIService = {
  async getSummaryPrompt(knowledgeId: string): Promise<AIPromptConfig | null> {
    const knowledge = await KnowledgeRepository.getById(knowledgeId);
    if (!knowledge) return null;

    return {
      systemPrompt: buildSummarizerSystemPrompt(),
      userPrompt: buildSummarizerPrompt(knowledge),
    };
  },

  async getQuizPrompt(
    knowledgeId: string,
    questionCount: number = 3
  ): Promise<AIPromptConfig | null> {
    const knowledge = await KnowledgeRepository.getById(knowledgeId);
    if (!knowledge) return null;

    return {
      systemPrompt: buildQuizSystemPrompt(),
      userPrompt: buildQuizPrompt(knowledge, questionCount),
    };
  },

  async getSimpleExplanationPrompt(knowledgeId: string): Promise<AIPromptConfig | null> {
    const knowledge = await KnowledgeRepository.getById(knowledgeId);
    if (!knowledge) return null;

    return {
      systemPrompt: buildExplainSimpleSystemPrompt(),
      userPrompt: buildExplainSimplePrompt(knowledge),
    };
  },

  buildSummaryPromptFromKnowledge(knowledge: Knowledge): AIPromptConfig {
    return {
      systemPrompt: buildSummarizerSystemPrompt(),
      userPrompt: buildSummarizerPrompt(knowledge),
    };
  },

  buildQuizPromptFromKnowledge(
    knowledge: Knowledge,
    questionCount: number = 3
  ): AIPromptConfig {
    return {
      systemPrompt: buildQuizSystemPrompt(),
      userPrompt: buildQuizPrompt(knowledge, questionCount),
    };
  },

  buildSimpleExplanationFromKnowledge(knowledge: Knowledge): AIPromptConfig {
    return {
      systemPrompt: buildExplainSimpleSystemPrompt(),
      userPrompt: buildExplainSimplePrompt(knowledge),
    };
  },

  async getPersonalizedSummary(knowledgeId: string): Promise<AIResponse> {
    try {
      const knowledge = await KnowledgeRepository.getById(knowledgeId);
      if (!knowledge) {
        return { success: false, content: '', error: 'Knowledge not found' };
      }

      const history = await RevisionRepository.getByKnowledgeId(knowledgeId);
      const context = buildAIContext(knowledge, history);

      const config: AIPromptConfig = {
        systemPrompt: buildSummarySystemPrompt(),
        userPrompt: buildSummaryPrompt(context),
      };

      return await AIRouter.getInstance().generate('summary', config);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to generate summary'
      };
    }
  },

  async getPersonalizedQuiz(knowledgeId: string, questionCount: number = 5): Promise<AIResponse> {
    try {
      const knowledge = await KnowledgeRepository.getById(knowledgeId);
      if (!knowledge) {
        return { success: false, content: '', error: 'Knowledge not found' };
      }

      const history = await RevisionRepository.getByKnowledgeId(knowledgeId);
      const context = buildAIContext(knowledge, history);

      const config: AIPromptConfig = {
        systemPrompt: buildPersonalizedQuizSystemPrompt(),
        userPrompt: buildPersonalizedQuizPrompt(context, questionCount),
        format: 'json',
      };

      return await AIRouter.getInstance().generate('quiz', config);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to generate quiz'
      };
    }
  },

  async explainMyWeakness(knowledgeId: string): Promise<AIResponse> {
    try {
      const knowledge = await KnowledgeRepository.getById(knowledgeId);
      if (!knowledge) {
        return { success: false, content: '', error: 'Knowledge not found' };
      }

      const history = await RevisionRepository.getByKnowledgeId(knowledgeId);
      const context = buildAIContext(knowledge, history);

      const config: AIPromptConfig = {
        systemPrompt: buildExplainWeakSystemPrompt(),
        userPrompt: buildExplainWeakPrompt(context),
      };

      return await AIRouter.getInstance().generate('explainWeak', config);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to explain weakness'
      };
    }
  },

  async getDailyLearningPlan(
    sessionLength: 'short' | 'long' = 'short'
  ): Promise<AIResponse> {
    try {
      const allKnowledge = await KnowledgeRepository.getAll();
      const dueKnowledge = await KnowledgeRepository.getDueForRevision();
      const allHistory = await RevisionRepository.getAll();

      const weakKnowledge = await this.getWeakKnowledgeWithMetrics(allKnowledge, allHistory);

      const context = buildDailyPlanContext(
        dueKnowledge,
        weakKnowledge,
        sessionLength,
        allKnowledge.length
      );

      const config: AIPromptConfig = {
        systemPrompt: buildDailyPlanSystemPrompt(),
        userPrompt: buildDailyPlanPrompt(context),
      };

      return await AIRouter.getInstance().generate('dailyPlan', config);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to generate daily plan'
      };
    }
  },

  async getWeakKnowledgeWithMetrics(
    knowledge: Knowledge[],
    history: RevisionHistory[]
  ): Promise<{ knowledge: Knowledge; metrics: LearningMetrics }[]> {
    const { computeLearningMetrics } = await import('@/domain/revision/memoryDecay.model');

    return knowledge
      .map(k => ({
        knowledge: k,
        metrics: computeLearningMetrics(k.id, history)
      }))
      .filter(item => item.knowledge.confidenceLevel <= 2 || item.metrics.forgetRate > 0.3)
      .sort((a, b) => b.metrics.forgetRate - a.metrics.forgetRate);
  },

  buildContextFromKnowledge(knowledge: Knowledge, history: RevisionHistory[]): AIContext {
    return buildAIContext(knowledge, history);
  },

  buildDailyPlanContextFromData(
    dueKnowledge: Knowledge[],
    weakKnowledge: { knowledge: Knowledge; metrics: LearningMetrics }[],
    sessionLength: 'short' | 'long',
    totalKnowledge: number
  ): DailyPlanContext {
    return buildDailyPlanContext(dueKnowledge, weakKnowledge, sessionLength, totalKnowledge);
  },

  async studyBuddyChat(message: string): Promise<AIResponse> {
    try {
      const allKnowledge = await KnowledgeRepository.getAll();
      const allHistory = await RevisionRepository.getAll();

      const config: AIPromptConfig = {
        systemPrompt: buildChatSystemPrompt(),
        userPrompt: buildChatUserPrompt(message, allKnowledge, allHistory),
      };

      return await AIRouter.getInstance().generate('chat', config);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to get chat response'
      };
    }
  },

  async generateQuizForTopics(topics: string[], count: number = 5, keys?: Partial<AIKeyConfig>): Promise<AIResponse> {
    try {
      const { buildTopicQuizPrompt, buildTopicQuizSystemPrompt } = await import('./prompts/topicQuiz.prompt');

      const config: AIPromptConfig = {
        systemPrompt: buildTopicQuizSystemPrompt(),
        userPrompt: buildTopicQuizPrompt(topics, count),
        format: 'json',
      };

      return await AIRouter.getInstance().generate('quiz', config, keys);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to generate quiz'
      };
    }
  },
  async startVivaVoce(knowledgeId: string): Promise<AIResponse> {
    try {
      const { buildVivaVoceSystemPrompt, buildVivaVoceQuestionPrompt } = await import('./prompts/vivaVoce.prompt');
      const knowledge = await KnowledgeRepository.getById(knowledgeId);

      if (!knowledge) {
        return { success: false, content: '', error: 'Knowledge not found' };
      }

      const config: AIPromptConfig = {
        systemPrompt: buildVivaVoceSystemPrompt(),
        userPrompt: buildVivaVoceQuestionPrompt(knowledge),
      };

      return await AIRouter.getInstance().generate('chat', config);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to start Viva Voce'
      };
    }
  },

  async evaluateVivaVoce(knowledgeId: string, question: string, userAnswer: string): Promise<AIResponse> {
    try {
      const { buildVivaVoceSystemPrompt, buildVivaVoceEvaluationPrompt } = await import('./prompts/vivaVoce.prompt');
      const knowledge = await KnowledgeRepository.getById(knowledgeId);

      if (!knowledge) {
        return { success: false, content: '', error: 'Knowledge not found' };
      }

      const config: AIPromptConfig = {
        systemPrompt: buildVivaVoceSystemPrompt(),
        userPrompt: buildVivaVoceEvaluationPrompt(knowledge, question, userAnswer),
        format: 'json',
      };

      return await AIRouter.getInstance().generate('chat', config);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to evaluate answer'
      };
    }
  },

  async generateCourseStructure(content: string): Promise<AIResponse> {
    try {
      const config: AIPromptConfig = {
        systemPrompt: buildCourseGeneratorSystemPrompt(),
        userPrompt: buildCourseGeneratorPrompt(content),
        format: 'json',
      };

      return await AIRouter.getInstance().generate('courseGenerator', config);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to generate course structure'
      };
    }
  },

  async analyzeGaps(ids?: string[]): Promise<AIResponse> {
    try {
      // If ids provided, filter, else get all. For now, let's just get all to find global gaps.
      // In a real app we might limit this.
      const allKnowledge = await KnowledgeRepository.getAll();

      const config: AIPromptConfig = {
        systemPrompt: buildGapHunterSystemPrompt(),
        userPrompt: buildGapHunterPrompt(allKnowledge),
        format: 'json',
      };

      return await AIRouter.getInstance().generate('gapHunter', config);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to analyze gaps'
      };
    }
  },
  async suggestCardDetails(title: string): Promise<AIResponse> {
    try {
      const { buildSuggestCardSystemPrompt, buildSuggestCardPrompt } = await import('./prompts/suggestCard.prompt');
      const config: AIPromptConfig = {
        systemPrompt: buildSuggestCardSystemPrompt(),
        userPrompt: buildSuggestCardPrompt(title),
        format: 'json',
      };
      return await AIRouter.getInstance().generate('suggest_card', config);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to suggest card details'
      };
    }
  },
  async simplifyDefinition(definition: string): Promise<AIResponse> {
    try {
      const { buildSimplifyDefinitionSystemPrompt, buildSimplifyDefinitionPrompt } = await import('./prompts/suggestCard.prompt');
      const config: AIPromptConfig = {
        systemPrompt: buildSimplifyDefinitionSystemPrompt(),
        userPrompt: buildSimplifyDefinitionPrompt(definition),
      };
      return await AIRouter.getInstance().generate('simplify_definition', config);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to simplify definition'
      };
    }
  },
  async evaluateRecall(definition: string, userAnswer: string): Promise<AIResponse> {
    try {
      const { buildEvaluateRecallSystemPrompt, buildEvaluateRecallPrompt } = await import('./prompts/suggestCard.prompt');
      const config: AIPromptConfig = {
        systemPrompt: buildEvaluateRecallSystemPrompt(),
        userPrompt: buildEvaluateRecallPrompt(definition, userAnswer),
        format: 'json',
      };
      return await AIRouter.getInstance().generate('evaluate_recall', config);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to evaluate recall answer'
      };
    }
  },
  async suggestCardFromVoiceNote(note: string): Promise<AIResponse> {
    try {
      const { buildVoiceNoteSystemPrompt, buildVoiceNotePrompt } = await import('./prompts/suggestCard.prompt');
      const config: AIPromptConfig = {
        systemPrompt: buildVoiceNoteSystemPrompt(),
        userPrompt: buildVoiceNotePrompt(note),
        format: 'json',
      };
      return await AIRouter.getInstance().generate('suggest_card', config);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to generate card from voice note'
      };
    }
  },
};


