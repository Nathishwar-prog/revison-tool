import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {

    const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;

    return NextResponse.json({
        hasOpenRouter,
        hasGemini
    });
}
