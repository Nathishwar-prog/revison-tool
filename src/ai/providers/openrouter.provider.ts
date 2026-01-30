import { AIProvider, AIPromptConfig, AIResponse } from '../ai-types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4o-mini';
const TIMEOUT_MS = 30000;

export class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;
    return true; // Optimistic check
  }

  async generateResponse(config: AIPromptConfig): Promise<AIResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
          'X-Title': 'K-Store AI',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: config.systemPrompt },
            { role: 'user', content: config.userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2048,
          response_format: config.format === 'json' ? { type: 'json_object' } : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `OpenRouter API error: ${response.status}`;
        return {
          success: false,
          content: '',
          error: errorMessage,
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      if (!content) {
        return {
          success: false,
          content: '',
          error: 'No response content from OpenRouter',
        };
      }

      return {
        success: true,
        content,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      console.error('[OpenRouterProvider] Fetch error:', error);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            content: '',
            error: 'Request timed out',
          };
        }
        return {
          success: false,
          content: '',
          error: error.message,
        };
      }

      return {
        success: false,
        content: '',
        error: 'Unknown error occurred',
      };
    }
  }
}
