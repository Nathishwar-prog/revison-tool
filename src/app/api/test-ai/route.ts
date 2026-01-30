
import { NextResponse } from 'next/server';
import { AIRouter } from '@/ai/providers/ai-router.service';
import { AI_CONFIG } from '@/ai/ai-config';

export async function GET() {
    try {
        const response = await AIRouter.getInstance().generate('chat', {
            systemPrompt: 'You are a helpful AI assistant.',
            userPrompt: 'Hello! Are you running locally or in the cloud? Please identify yourself.'
        });

        return NextResponse.json({
            config: {
                localEnabled: AI_CONFIG.LOCAL_AI_ENABLED,
                primaryModel: AI_CONFIG.MODELS.OLLAMA_CODING, // Just checking config
            },
            result: response
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
