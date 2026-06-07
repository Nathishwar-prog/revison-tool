
export const AI_CONFIG = {
    // Global Toggle
    LOCAL_AI_ENABLED: process.env.NEXT_PUBLIC_LOCAL_AI_ENABLED !== 'false', // Default to true if not set to 'false'

    // Timeout Settings (ms)
    TIMEOUTS: {
        DEFAULT: 30000,
        LONG: 60000,
        OLLAMA_PING: 2000, // Short timeout for health check
    },

    // Retries
    RETRIES: {
        MAX_ATTEMPTS: 2,
        BACKOFF_MS: 1000,
    },

    // Provider Names
    PROVIDERS: {
        OLLAMA: 'Ollama',
        GEMINI: 'Gemini',
        OPENROUTER: 'OpenRouter',
        OPENAI: 'OpenAI',
    },

    // Model Names
    MODELS: {
        // Local (Ollama)
        OLLAMA_CODING: 'deepseek-coder:6.7b',
        OLLAMA_REASONING: 'qwen3:8b',
        OLLAMA_FAST: 'phi3:latest',
        OLLAMA_EMBEDDING: 'nomic-embed-text:latest',

        // Fallback Models (Cloud)
        // These defaults can be overridden by specific provider configs
        GEMINI_DEFAULT: 'gemini-1.5-flash',
        OPENROUTER_DEFAULT: 'openai/gpt-4o-mini',
    }
};

// Feature to Model Category mapping
// Used by AIRouter to pick the right "class" of model
export enum AIModelCategory {
    CODING = 'coding',       // Code generation, debugging
    REASONING = 'reasoning', // Complex logical tasks, tutoring
    FAST = 'fast',           // Quick summaries, simple chat
    CREATIVE = 'creative',   // Storytelling (optional)
}

export const FEATURE_MODEL_MAPPING: Record<string, AIModelCategory> = {
    // Existing features in ai.service.ts
    'quiz': AIModelCategory.REASONING,
    'summary': AIModelCategory.FAST, // or REASONING if complex
    'explainWeak': AIModelCategory.REASONING,
    'dailyPlan': AIModelCategory.REASONING,
    'chat': AIModelCategory.REASONING, // general chat

    // Potential future features
    'code_generation': AIModelCategory.CODING,
    'code_explanation': AIModelCategory.CODING,
    'suggest_card': AIModelCategory.REASONING,
    'simplify_definition': AIModelCategory.FAST,
    'evaluate_recall': AIModelCategory.FAST,
};
