import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledge } from "@/lib/schema";
import { getUser } from "@/lib/getUser";

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, content, url, tags, technology, domain } = await request.json();

        if (!title || !content) {
            return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
        }

        const id = `k${Date.now()}`;
        
        const [newEntry] = await db.insert(knowledge).values({
            id,
            userId: user.id,
            title,
            type: 'concept', // Default to concept for quick capture
            domain: domain || 'Quick Capture',
            technology: technology || 'Web',
            difficulty: 'Intermediate',
            content: {
                definition: content,
                simpleExplanation: '',
                example: `Captured from: ${url || 'Unknown URL'}`,
                code: '',
                commonMistakes: [],
                myConfusion: ''
            },
            tags: tags || ['quick-capture'],
            confidenceLevel: 3,
            revision: {
                lastRevised: '',
                revisionCount: 0,
                nextRevision: new Date().toISOString().split('T')[0]
            }
        }).returning();

        return NextResponse.json(newEntry, { status: 201 });
    } catch (error: any) {
        console.error("Ingest API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
