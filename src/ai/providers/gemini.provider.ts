import { AIProvider, AIPromptConfig, AIResponse } from '../ai.service';

const MODELS_TO_TRY = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.0-pro'
];

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIMEOUT_MS = 60000;

export class GeminiProvider implements AIProvider {
  name = 'Gemini';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(config: AIPromptConfig): Promise<AIResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      let lastError: string = 'No models attempted';

      // Iterate through models until one works
      for (const model of MODELS_TO_TRY) {
        try {
          const modelName = model.startsWith('models/') ? model : `models/${model}`; // Ensure correct format if needed, but API usually accepts short name if base url is correct. Actually base url is /models, so we append just name.
          // However, the list models returned 'models/gemini-2.5-flash'. 
          // If BASE_URL is .../models, we should just append 'gemini-2.5-flash'.

          // Clean model name
          const cleanModel = model.replace('models/', '');

          console.log(`[GeminiProvider] Trying model: ${cleanModel}`);

          const url = `${BASE_URL}/${cleanModel}:generateContent?key=${this.apiKey}`;

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: `${config.systemPrompt}\n\n${config.userPrompt}` }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
              },
            }),
            signal: controller.signal,
          });

          if (response.ok) {
            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            if (content) {
              clearTimeout(timeoutId);
              console.log(`[GeminiProvider] Success with model: ${cleanModel}`);
              return { success: true, content };
            }
          }

          if (response.status === 404 || response.status === 400) {
            const errBody = await response.json().catch(() => ({}));
            console.warn(`[GeminiProvider] Model ${cleanModel} failed (${response.status}). Details:`, JSON.stringify(errBody));
            continue;
          }

          if (response.status === 429) {
            console.warn(`[GeminiProvider] Model ${cleanModel} rate limited. Trying next...`);
            continue;
          }

          // If other error, capture it
          const errorData = await response.json().catch(() => ({}));
          lastError = errorData.error?.message || `Error ${response.status} with ${cleanModel}`;
          console.warn(`[GeminiProvider] Error with ${cleanModel}: ${lastError}`);

        } catch (err) {
          console.warn(`[GeminiProvider] Exception with ${model}:`, err);
          lastError = err instanceof Error ? err.message : 'Unknown error';
        }
      }

      clearTimeout(timeoutId);
      return {
        success: false,
        content: '',
        error: `All Gemini models failed. Last error: ${lastError}. Checked: ${MODELS_TO_TRY.join(', ')}`,
      };

    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown fatal error',
      };
    }
  }
}
