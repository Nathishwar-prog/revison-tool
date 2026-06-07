import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/ai/ai.service';
import { db } from '@/lib/db'; // Ensure db is imported
import { knowledge } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
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

        const gaps = data.gaps || [];

        // Persist: Lower confidence for found gaps
        if (gaps.length > 0) {
            // We assume 'gaps' contains objects with 'knowledgeId' or 'title' needed to identify the node.
            // If the AI returns titles but not IDs (which is common if prompts are fussy), we might need to match by title.
            // BUT, analyzeGaps usually takes existing knowledge. The prompt should ask for IDs.

            // Let's assume the prompt returns 'knowledgeId' if it was in the input context.
            // If not, we iterate and try to match.
            // The GapHunter prompt in `ai.service.ts` is fed with `allKnowledge`.

            // Safe approach: Update if we have ID.
            const knowledgeIdsToUpdate = gaps
                .map((g: any) => g.knowledgeId)
                .filter((id: any) => typeof id === 'string');

            if (knowledgeIdsToUpdate.length > 0) {
                await db.update(knowledge)
                    .set({ confidenceLevel: 1 }) // Set to 'Gap' level (Red)
                    .where(inArray(knowledge.id, knowledgeIdsToUpdate));
            }
        }

        return NextResponse.json({ gaps: data.gaps, recommendations: data.recommendations });

    } catch (error) {
        console.error('Gap analysis error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
