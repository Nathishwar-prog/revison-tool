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
import { getAIKeys } from './storage';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { ApiAdapter } from '@/data/adapters/api.adapter';

export interface AIPromptConfig {
  systemPrompt: string;
  userPrompt: string;
}

export type AIFeatureType = 'summary' | 'quiz' | 'explainWeak' | 'dailyPlan';

export interface AIResponse {
  success: boolean;
  content: string;
  error?: string;
}

export interface AIProvider {
  generateResponse(config: AIPromptConfig): Promise<AIResponse>;
}

class MockAIProvider implements AIProvider {
  async generateResponse(config: AIPromptConfig): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (config.userPrompt.includes('quiz')) {
      return {
        success: true,
        content: JSON.stringify({
          questions: [
            {
              id: 1,
              difficulty: 'easy',
              question: 'This is a sample quiz question based on your knowledge.',
              options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
              correctAnswer: 'A',
              explanation: 'This is a mock response. Connect an AI provider for real personalized quizzes.'
            }
          ]
        })
      };
    }

    return {
      success: true,
      content: `This is a mock AI response. To enable real AI personalization, configure an AI provider (OpenAI, Anthropic, or local LLM) in the environment settings.\n\nThe prompt that would be sent:\n\n---\nSystem: ${config.systemPrompt.slice(0, 200)}...\n\nUser: ${config.userPrompt.slice(0, 300)}...`
    };
  }
}

const mockProvider = new MockAIProvider();

async function getActiveProvider(): Promise<AIProvider> {
  if (typeof window === 'undefined') {
    return mockProvider;
  }

  const keys = getAIKeys();

  if (keys.primaryKey && keys.primaryProvider === 'openrouter') {
    return new OpenRouterProvider(keys.primaryKey);
  }

  if (keys.fallbackKey && keys.fallbackProvider === 'gemini') {
    return new GeminiProvider(keys.fallbackKey);
  }

  return mockProvider;
}

async function generateWithFallback(config: AIPromptConfig): Promise<AIResponse> {
  if (typeof window === 'undefined') {
    return mockProvider.generateResponse(config);
  }

  const keys = getAIKeys();

  if (keys.primaryKey && keys.primaryProvider === 'openrouter') {
    const primaryProvider = new OpenRouterProvider(keys.primaryKey);
    const primaryResult = await primaryProvider.generateResponse(config);

    if (primaryResult.success) {
      return primaryResult;
    }

    if (keys.fallbackKey && keys.fallbackProvider === 'gemini') {
      const fallbackProvider = new GeminiProvider(keys.fallbackKey);
      const fallbackResult = await fallbackProvider.generateResponse(config);

      if (fallbackResult.success) {
        return fallbackResult;
      }
    }
  } else if (keys.fallbackKey && keys.fallbackProvider === 'gemini') {
    const fallbackProvider = new GeminiProvider(keys.fallbackKey);
    const fallbackResult = await fallbackProvider.generateResponse(config);

    if (fallbackResult.success) {
      return fallbackResult;
    }
  }

  // Try Server Proxy (uses .env keys)
  try {
    const proxyResult = await ApiAdapter.post('/ai/proxy', config);

    // Check if the result is valid AIResponse
    if (proxyResult && (proxyResult.success || proxyResult.content)) {
      return proxyResult as AIResponse;
    }
  } catch (e) {
    // Silent fail to fall back to mock
    // console.warn('AI Proxy attempt failed', e);
  }

  return mockProvider.generateResponse(config);
}

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

      return await generateWithFallback(config);
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
      };

      return await generateWithFallback(config);
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

      return await generateWithFallback(config);
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

      return await generateWithFallback(config);
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

      return await generateWithFallback(config);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to get chat response'
      };
    }
  },
  async generateQuizForTopics(topics: string[], count: number = 5): Promise<AIResponse> {
    try {
      const { buildTopicQuizPrompt, buildTopicQuizSystemPrompt } = await import('./prompts/topicQuiz.prompt');

      const config: AIPromptConfig = {
        systemPrompt: buildTopicQuizSystemPrompt(),
        userPrompt: buildTopicQuizPrompt(topics, count),
      };

      return await generateWithFallback(config);
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Failed to generate quiz'
      };
    }
  },
};


