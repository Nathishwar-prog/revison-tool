
import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/ai/ai.service';

export async function POST(req: NextRequest) {
    try {
        const { topics, keys } = await req.json();

        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            return NextResponse.json({ error: 'Topics array is required' }, { status: 400 });
        }

        const aiResponse = await AIService.generateQuizForTopics(topics, 5, keys);

        if (!aiResponse.success) {
            return NextResponse.json({ error: aiResponse.error }, { status: 500 });
        }

        // Clean and Parse JSON
        let content = aiResponse.content.trim();
        // Remove markdown code blocks if present
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');

        try {
            const quizData = JSON.parse(content);
            return NextResponse.json(quizData);
        } catch (e) {
            console.error("Failed to parse AI Quiz JSON:", content);
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

    } catch (error) {
        console.error("Quiz generation error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
