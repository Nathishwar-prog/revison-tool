import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledge, collectionKnowledge } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/getUser";
import { z } from "zod";
import { calculateNextRevisionDate } from "@/domain/revision/revision.engine";

const knowledgeSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    domain: z.string().min(1, "Domain is required").max(100),
    technology: z.string().min(1, "Technology is required").max(100),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
    type: z.enum(["concept", "pattern", "tool", "theory"]),
    confidenceLevel: z.number().min(1).max(5).default(3),
    tags: z.array(z.string()).optional().default([]),
    content: z.object({
        definition: z.string().min(1, "Definition is required"),
        simpleExplanation: z.string().min(1, "Simple explanation is required"),
        example: z.string().optional().default(""),
        code: z.string().optional().default(""),
        commonMistakes: z.array(z.string()).optional().default([]),
        myConfusion: z.string().optional().default(""),
    }),
    collectionIds: z.array(z.string()).optional(),
});

export async function GET() {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await db.query.knowledge.findMany({
            where: eq(knowledge.userId, user.id),
            with: {
                collections: {
                    with: {
                        collection: true
                    }
                }
            }
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("Get knowledge error:", error);
        return NextResponse.json({ error: "Failed to fetch knowledge" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        
        const validation = knowledgeSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ 
                error: "Validation failed", 
                details: validation.error.flatten().fieldErrors 
            }, { status: 400 });
        }

        const { collectionIds, ...knowledgeData } = validation.data;

        const today = new Date().toISOString().split('T')[0];
        const initialConfidence = knowledgeData.confidenceLevel || 3;
        const initialRevision = {
            lastRevised: null,
            revisionCount: 0,
            nextRevision: today,
        };

        const result = await db.transaction(async (tx) => {
            const [newEntry] = await tx.insert(knowledge).values({
                ...knowledgeData,
                id: `k${Date.now()}`,
                userId: user.id,
                revision: initialRevision,
            }).returning();

            if (collectionIds && Array.isArray(collectionIds)) {
                for (const collectionId of collectionIds) {
                    await tx.insert(collectionKnowledge).values({
                        collectionId,
                        knowledgeId: newEntry.id
                    });
                }
            }

            return newEntry;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Create knowledge error:", error);
        return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
    }
}
