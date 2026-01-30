
export interface AIPromptConfig {
    systemPrompt: string;
    userPrompt: string;
    format?: 'json' | 'text';
}

export type AIFeatureType = 'summary' | 'quiz' | 'explainWeak' | 'dailyPlan' | 'chat' | string;

export interface AIResponse {
    success: boolean;
    content: string;
    error?: string;
}

export interface AIProvider {
    name: string;
    generateResponse(config: AIPromptConfig, modelId?: string): Promise<AIResponse>;
    healthCheck?(): Promise<boolean>;
}
