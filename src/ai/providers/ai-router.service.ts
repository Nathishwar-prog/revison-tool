
import { AIProvider, AIPromptConfig, AIResponse, AIFeatureType } from '../ai-types';
import { OllamaProvider } from './ollama.provider';
import { GeminiProvider } from './gemini.provider';
import { OpenRouterProvider } from './openrouter.provider';
import { AI_CONFIG, FEATURE_MODEL_MAPPING, AIModelCategory } from '../ai-config';
import { getAIKeys } from '../storage';

export class AIRouter {
    private static instance: AIRouter;
    private ollama: OllamaProvider;

    private constructor() {
        this.ollama = new OllamaProvider();
    }

    static getInstance(): AIRouter {
        if (!AIRouter.instance) {
            AIRouter.instance = new AIRouter();
        }
        return AIRouter.instance;
    }

    private getFallbacks(keys: any): AIProvider[] {
        const providers: AIProvider[] = [];

        // Check Client Storage Keys
        if (keys.primaryKey && keys.primaryProvider === 'openrouter') {
            providers.push(new OpenRouterProvider(keys.primaryKey));
        }
        if (keys.fallbackKey && keys.fallbackProvider === 'gemini') {
            providers.push(new GeminiProvider(keys.fallbackKey));
        }

        // Check Env Vars (Server-side or Build-time injection)
        if (providers.length === 0) {
            if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
                // Note: exposing key to client is risky, usually done via proxy, 
                // but for this local-first architecture we might assume local auth or proxy usage.
                // For now, let's assume we instantiate providers that might call a proxy if needed, 
                // OR we rely on the existing 'proxy' logic in ai.service.ts
                // But for a pure Router, we want direct access if possible.
            }
        }

        return providers;
    }

    /**
     * Main entry point for generating AI responses.
     * Routes to Local AI first, then fails over to Cloud AI.
     */
    async generate(
        feature: AIFeatureType | string,
        config: AIPromptConfig,
        keys?: any
    ): Promise<AIResponse> {
        const category = FEATURE_MODEL_MAPPING[feature] || AIModelCategory.REASONING;

        // 1. Try Local AI (Ollama)
        if (AI_CONFIG.LOCAL_AI_ENABLED) {
            const isHealthy = await this.ollama.healthCheck();
            if (isHealthy) {
                // Map category to specific local model
                const modelId = this.getLocalModelForCategory(category);
                console.log(`[AIRouter] 🟢 Routing to Local (Ollama: ${modelId}) for ${feature}`);

                try {
                    const response = await this.ollama.generateResponse(config, modelId);
                    if (response.success) return response;
                    console.warn(`[AIRouter] ⚠️ Local AI failed during generation: ${response.error}`);
                } catch (e) {
                    console.warn(`[AIRouter] ⚠️ Local AI exception:`, e);
                }
            } else {
                console.log(`[AIRouter] 🟡 Local AI unhealthy/offline. Skipping to fallback.`);
            }
        }

        // 2. Failover to Cloud Providers
        console.log(`[AIRouter] 🌩️ engaging Fallback Strategy...`);
        const resolvedKeys = keys || getAIKeys(); // Ensure we have keys
        const fallbacks = this.getFallbacks(resolvedKeys);

        if (fallbacks.length === 0) {
            return {
                success: false,
                content: '',
                error: 'Local AI failed and no fallback providers configured (API Keys missing).'
            };
        }

        for (const provider of fallbacks) {
            console.log(`[AIRouter] Trying fallback: ${provider.name}`);
            try {
                // Fallbacks usually have default models baked in, or we can pass a generic one
                const response = await provider.generateResponse(config);
                if (response.success) {
                    console.log(`[AIRouter] ✅ Success with fallback: ${provider.name}`);
                    return response;
                }
            } catch (e) {
                console.warn(`[AIRouter] Fallback ${provider.name} failed.`);
            }
        }

        return {
            success: false,
            content: '',
            error: 'All AI providers (Local + Fallback) failed.'
        };
    }

    private getLocalModelForCategory(category: AIModelCategory): string {
        switch (category) {
            case AIModelCategory.CODING: return AI_CONFIG.MODELS.OLLAMA_CODING;
            case AIModelCategory.REASONING: return AI_CONFIG.MODELS.OLLAMA_REASONING;
            case AIModelCategory.FAST: return AI_CONFIG.MODELS.OLLAMA_FAST;
            default: return AI_CONFIG.MODELS.OLLAMA_REASONING;
        }
    }
}
