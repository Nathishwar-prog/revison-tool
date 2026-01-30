
import { AIProvider, AIPromptConfig, AIResponse } from '../ai-types';
import { AI_CONFIG } from '../ai-config';

export class OllamaProvider implements AIProvider {
    name = AI_CONFIG.PROVIDERS.OLLAMA;
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:11434') {
        this.baseUrl = baseUrl;
    }

    async healthCheck(): Promise<boolean> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.TIMEOUTS.OLLAMA_PING);

            const response = await fetch(`${this.baseUrl}/api/tags`, { // Lightweight check similar to 'list models'
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (e) {
            return false;
        }
    }

    async generateResponse(config: AIPromptConfig, modelId?: string): Promise<AIResponse> {
        const model = modelId || AI_CONFIG.MODELS.OLLAMA_CODING; // Default to coding if not specified, but Router should specify

        try {
            console.log(`[OllamaProvider] Generating with model: ${model}`);

            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    prompt: `${config.systemPrompt}\n\n${config.userPrompt}`,
                    format: config.format === 'json' ? 'json' : undefined,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        num_ctx: 4096 // Context window
                    }
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`[OllamaProvider] Error (${response.status}): ${errorBody}`);
                return {
                    success: false,
                    content: '',
                    error: `Ollama Error (${response.status}): ${errorBody || response.statusText}`
                };
            }

            const data = await response.json();
            return {
                success: true,
                content: data.response
            };

        } catch (error) {
            return {
                success: false,
                content: '',
                error: error instanceof Error ? error.message : 'Unknown Ollama error'
            };
        }
    }
}
