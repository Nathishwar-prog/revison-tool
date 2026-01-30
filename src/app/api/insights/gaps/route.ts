import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/ai/ai.service';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({})); // Body might be empty
        const { ids } = body;

        const aiResponse = await AIService.analyzeGaps(ids);

        if (!aiResponse.success) {
            return NextResponse.json({ error: aiResponse.error }, { status: 500 });
        }

        let data;
        try {
            data = JSON.parse(aiResponse.content);
        } catch (e) {
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

        return NextResponse.json({ gaps: data.gaps, recommendations: data.recommendations });

    } catch (error) {
        console.error('Gap analysis error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
