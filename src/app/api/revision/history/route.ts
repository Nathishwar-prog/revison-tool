import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revisionHistory } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import { getUser } from "@/lib/getUser";

export async function GET(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const knowledgeId = searchParams.get("knowledgeId");

        const whereClause = knowledgeId
            ? and(eq(revisionHistory.userId, user.id), eq(revisionHistory.knowledgeId, knowledgeId))
            : eq(revisionHistory.userId, user.id);

        const data = await db.query.revisionHistory.findMany({
            where: whereClause,
            orderBy: [desc(revisionHistory.revisedAt)],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("Get revision history error:", error);
        return NextResponse.json({ error: "Failed to fetch revision history" }, { status: 500 });
    }
}
