import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revisionHistory, users } from "@/lib/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { getUser } from "@/lib/getUser";

export async function GET() {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get completed today
        const [completedToday] = await db
            .select({
                count: sql<number>`COUNT(*)::int`,
            })
            .from(revisionHistory)
            .where(
                and(
                    eq(revisionHistory.userId, user.id),
                    gte(revisionHistory.revisedAt, today)
                )
            );

        // Get user target
        const [userData] = await db
            .select({
                target: users.dailyRevisionTarget,
            })
            .from(users)
            .where(eq(users.id, user.id));

        return NextResponse.json({
            completed: completedToday?.count || 0,
            target: userData?.target || 10,
        });
    } catch (error: any) {
        console.error("Daily progress API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
