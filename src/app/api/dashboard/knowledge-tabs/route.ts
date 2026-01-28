import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledge, confidenceHistory } from "@/lib/schema";
import { eq, and, sql, desc, lte, or } from "drizzle-orm";
import { getUser } from "@/lib/getUser";

export async function GET() {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const in48HoursStr = in48Hours.toISOString().split('T')[0];

        // 1. Due Soon (within 48 hours or already due, or no revision set)
        const dueSoon = await db.query.knowledge.findMany({
            where: and(
                eq(knowledge.userId, user.id),
                or(
                    sql`${knowledge.revision} IS NULL`,
                    sql`${knowledge.revision}->>'nextRevision' IS NULL`,
                    sql`(${knowledge.revision}->>'nextRevision')::date <= ${in48HoursStr}::date`
                )
            ),
            orderBy: (knowledge, { asc }) => [
                asc(sql`COALESCE(${knowledge.revision}->>'nextRevision', '1970-01-01')`)
            ],
            limit: 20
        });

        // 2. Mastered
        const mastered = await db.query.knowledge.findMany({
            where: and(
                eq(knowledge.userId, user.id),
                eq(knowledge.confidenceLevel, 5)
            ),
            limit: 20
        });

        // 3. Struggling (Logic: Check confidence history for consecutive drops)
        // This is harder with single query. Let's find items with at least 3 confidence records and check them.
        // For MVP, we can find items where confidenceLevel is low OR check last history.
        // Better: Subquery or post-process. Let's post-process for now or use a smart SQL query.
        
        // Actually, let's just find items where the latest confidence is <= 2 as a proxy, 
        // OR implement the consecutive drop logic by fetching recent history.
        
        const strugglingCandidates = await db.query.knowledge.findMany({
            where: and(
                eq(knowledge.userId, user.id),
                lte(knowledge.confidenceLevel, 2)
            ),
            with: {
                confidenceHistory: {
                    orderBy: [desc(confidenceHistory.recordedAt)],
                    limit: 3
                }
            },
            limit: 20
        });

        const struggling = strugglingCandidates.filter(item => {
            const history = item.confidenceHistory;
            const currentConfidence = item.confidenceLevel ?? 0;
            if (history.length < 2) return currentConfidence <= 2;
            
            // Check for a drop in the last record vs the one before
            const last = history[0].confidence;
            const prev = history[1].confidence;
            const prevPrev = history[2]?.confidence;

            const droppedOnce = last < prev;
            const droppedTwice = prevPrev !== undefined ? (last < prev && prev < prevPrev) : droppedOnce;

            return droppedTwice || last <= 1;
        });

        return NextResponse.json({
            dueSoon,
            mastered,
            struggling
        });
    } catch (error: any) {
        console.error("Knowledge tabs API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
