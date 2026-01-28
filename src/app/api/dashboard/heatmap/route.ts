import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revisionHistory } from "@/lib/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { getUser } from "@/lib/getUser";

export async function GET() {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        // Group by day and count revisions
        const results = await db
            .select({
                date: sql<string>`DATE(${revisionHistory.revisedAt})`,
                count: sql<number>`COUNT(*)::int`,
            })
            .from(revisionHistory)
            .where(
                and(
                    eq(revisionHistory.userId, user.id),
                    gte(revisionHistory.revisedAt, sixMonthsAgo)
                )
            )
            .groupBy(sql`DATE(${revisionHistory.revisedAt})`)
            .orderBy(sql`DATE(${revisionHistory.revisedAt})`);

        return NextResponse.json(results);
    } catch (error: any) {
        console.error("Heatmap API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
