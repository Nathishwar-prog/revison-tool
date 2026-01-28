import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledge, revisionHistory, confidenceHistory } from "@/lib/schema";
import { eq, and, sql, or, isNull } from "drizzle-orm";
import { getUser } from "@/lib/getUser";
import { AppConfig } from "@/config/app.config";

export async function GET() {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const today = new Date().toISOString().split('T')[0];
        
        const dueItems = await db.query.knowledge.findMany({
            where: and(
                eq(knowledge.userId, user.id),
                or(
                    sql`${knowledge.revision} IS NULL`,
                    sql`${knowledge.revision}->>'nextRevision' IS NULL`,
                    sql`(${knowledge.revision}->>'nextRevision')::date <= ${today}::date`
                )
            ),
            orderBy: (knowledge, { asc }) => [
                asc(sql`COALESCE(${knowledge.revision}->>'nextRevision', '1970-01-01')`)
            ],
            limit: 20
        });

        return NextResponse.json(dueItems);
    } catch (error: any) {
        console.error("Get revision queue error:", error);
        return NextResponse.json({ error: "Failed to get revision queue", details: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { knowledgeId, confidenceGiven, revisionData, timeTakenSeconds } = await request.json();

        const result = await db.transaction(async (tx) => {
            const [newHistory] = await tx.insert(revisionHistory).values({
                knowledgeId,
                userId: user.id,
                confidenceGiven,
                timeTakenSeconds: timeTakenSeconds || 0,
            }).returning();

            await tx.insert(confidenceHistory).values({
                knowledgeId,
                userId: user.id,
                confidence: confidenceGiven,
            });

            const [updatedKnowledge] = await tx.update(knowledge)
                .set({
                    revision: revisionData,
                    confidenceLevel: confidenceGiven
                })
                .where(and(
                    eq(knowledge.id, knowledgeId),
                    eq(knowledge.userId, user.id)
                ))
                .returning();

            return { history: newHistory, knowledge: updatedKnowledge };
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Revision transaction failed:", error);
        return NextResponse.json({ error: "Failed to persist revision", details: error.message }, { status: 500 });
    }
}
