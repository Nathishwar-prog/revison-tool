
import { NextResponse } from 'next/server';
import { GeminiProvider } from '@/ai/providers/gemini.provider';
import { OpenRouterProvider } from '@/ai/providers/openrouter.provider';
import { AIPromptConfig, AIResponse } from '@/ai/ai.service';

// Force dynamic to ensure we can read runtime env vars
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const config: AIPromptConfig = await request.json();

        if (!config.userPrompt) {
            return NextResponse.json(
                { success: false, content: '', error: 'Missing prompt' },
                { status: 400 }
            );
        }

        // Check for keys in environment variables
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        console.log('[API Proxy Debug] Checking keys:', {
            hasOpenRouter: !!openRouterKey,
            hasGemini: !!geminiKey
        });

        if (!openRouterKey && !geminiKey) {
            console.error('[API Proxy Error] No keys found in environment variables.');
            return NextResponse.json(
                {
                    success: false,
                    content: '',
                    error: 'No AI keys configured on server'
                },
                { status: 500 }
            );
        }

        let result: AIResponse = { success: false, content: '', error: 'No provider available' };

        // Try OpenRouter first if available
        if (openRouterKey) {
            console.log('[API Proxy Debug] Attempting OpenRouter...');
            const provider = new OpenRouterProvider(openRouterKey);
            result = await provider.generateResponse(config);
            if (result.success) {
                return NextResponse.json(result);
            }
        }

        // Try Gemini if available (and OpenRouter didn't succeed)
        if (geminiKey) {
            console.log('[API Proxy Debug] Attempting Gemini...');
            const provider = new GeminiProvider(geminiKey);
            result = await provider.generateResponse(config);
            if (result.success) {
                return NextResponse.json(result);
            } else {
                console.error('[API Proxy Error] Gemini failed:', result.error);
            }
        }

        // If both failed or only one existed and failed
        console.error('[API Proxy Error] Provider failed. Result:', result);
        return NextResponse.json(result, { status: 500 });

    } catch (error) {
        console.error('AI Proxy Error:', error);
        return NextResponse.json(
            {
                success: false,
                content: '',
                error: error instanceof Error ? error.message : 'Internal Server Error'
            },
            { status: 500 }
        );
    }
}
